import { NextResponse } from "next/server";

// Impedisce a Next.js di salvare risposte vecchie nella cache
export const dynamic = "force-dynamic";

const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) return NextResponse.json({ error: "Manca l'URL dell'immagine" }, { status: 400 });
    if (!LEONARDO_API_KEY) return NextResponse.json({ error: "Manca la chiave API di Leonardo nel file .env" }, { status: 500 });

    console.log("🚀 1. Inizio processo Leonardo per:", image);

    // --- FASE 1: Scarica immagine originale ---
    const imageRes = await fetch(image);
    const imageBlob = await imageRes.blob();
    
    // Rilevamento estensione
    let fileExtension = 'jpg';
    if (imageBlob.type === 'image/png') fileExtension = 'png';
    else if (imageBlob.type === 'image/webp') fileExtension = 'webp';

    // --- FASE 2: Init Upload ---
    const initImageRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/init-image", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${LEONARDO_API_KEY}`,
      },
      body: JSON.stringify({ extension: fileExtension }),
    });

    const initData = await initImageRes.json();
    if (!initData.uploadInitImage) throw new Error(initData.error || "Errore Init Leonardo");
    const { url: uploadUrl, id: imageId, fields } = initData.uploadInitImage;

    // --- FASE 3: Upload fisico ---
    const formData = new FormData();
    const fieldsParsed = JSON.parse(fields);
    for (const key in fieldsParsed) formData.append(key, fieldsParsed[key]);
    formData.append("file", imageBlob);

    const uploadRes = await fetch(uploadUrl, { method: "POST", body: formData });
    if (!uploadRes.ok) throw new Error("Fallito upload immagine su Leonardo");

    // --- FASE 4: Generazione (MIGLIORA FOTO) ---
    console.log("🎨 4. Avvio generazione AI...");
    
    const genRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/generations", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${LEONARDO_API_KEY}`,
      },
      body: JSON.stringify({
        height: 512,
        width: 768,
        // modelId è rimosso perché photoReal sceglie il modello da solo
        prompt: "Award winning interior design photography, vibrant colors, full color photograph, dramatic natural lighting, ultra clean, modern renovation, decluttered, 8k resolution, architectural digest style, bright and airy",
        negative_prompt: "black and white, monochrome, grayscale, dark, shadows, messy, blurry, distortion, low quality, ugly, noise, grain, people",
        init_image_id: imageId,
        init_strength: 0.60, 
        
        // *** LA CORREZIONE È QUI ***
        alchemy: true,     // Attiviamo Alchemy...
        photoReal: true,   // ...per poter usare PhotoReal
        photoRealStrength: 0.55,
        num_images: 1
      }),
    });

    const genData = await genRes.json();
    
    // Controllo errori più robusto
    if (genData.error) {
        console.error("❌ Leonardo API Error:", genData.error);
        throw new Error(genData.error);
    }

    const generationId = genData.sdGenerationJob?.generationId;

    if (!generationId) {
        console.error("❌ Leonardo No Generation ID:", genData);
        throw new Error("Generazione non avviata: ID mancante");
    }

    // --- FASE 5: Polling ---
    console.log("⏳ 5. In attesa del risultato...");
    let finalImageUrl = null;
    let attempts = 0;

    while (!finalImageUrl && attempts < 60) {
      await new Promise((r) => setTimeout(r, 2000));
      attempts++;
      const statusRes = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
        headers: { accept: "application/json", authorization: `Bearer ${LEONARDO_API_KEY}` },
      });
      const statusData = await statusRes.json();
      const job = statusData.generations_by_pk;
      
      if (job && job.status === "COMPLETE") {
        finalImageUrl = job.generated_images[0].url;
      } else if (job && job.status === "FAILED") {
        throw new Error("Leonardo ha fallito la generazione");
      }
    }

    if (!finalImageUrl) throw new Error("Timeout Leonardo");

    return NextResponse.json({
      enhancedImageUrl: finalImageUrl,
      copy: { it: "Ecco la tua nuova foto migliorata con AI." } 
    });

  } catch (error: any) {
    console.error("❌ Errore Backend:", error.message);
    // Restituiamo l'errore esatto al frontend così lo vedi nel box rosso
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
