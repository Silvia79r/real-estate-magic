import { NextResponse } from "next/server";

// Impedisce a Next.js di salvare risposte vecchie nella cache
export const dynamic = "force-dynamic";

const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;

export async function POST(request: Request) {
  try {
    // Leggiamo "image" perché il tuo frontend manda quello
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "Manca l'URL dell'immagine" }, { status: 400 });
    }

    if (!LEONARDO_API_KEY) {
      return NextResponse.json({ error: "Manca la chiave API di Leonardo nel file .env" }, { status: 500 });
    }

    console.log("🚀 1. Inizio processo Leonardo per:", image);

    // --- FASE 1: Scarichiamo l'immagine originale da Cloudinary ---
    const imageRes = await fetch(image);
    const imageBlob = await imageRes.blob();
    // Cerchiamo di capire l'estensione, se fallisce usiamo jpg
    const fileExtension = image.split('.').pop()?.split('?')[0] || 'jpg';

    // --- FASE 2: Otteniamo l'URL di upload da Leonardo ---
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
    if (!initData.uploadInitImage) {
      console.error("Errore Init Leonardo:", initData);
      throw new Error("Impossibile inizializzare upload su Leonardo");
    }

    const { url: uploadUrl, id: imageId, fields } = initData.uploadInitImage;

    // --- FASE 3: Carichiamo fisicamente l'immagine su Leonardo ---
    const formData = new FormData();
    const fieldsParsed = JSON.parse(fields);
    for (const key in fieldsParsed) {
      formData.append(key, fieldsParsed[key]);
    }
    formData.append("file", imageBlob);

    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!uploadRes.ok) throw new Error("Fallito upload immagine su Leonardo");

    // --- FASE 4: Avviamo la Generazione (MIGLIORA FOTO) ---
    console.log("🎨 4. Avvio generazione AI...");
    const genRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/generations", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${LEONARDO_API_KEY}`,
      },
      body: JSON.stringify({
        height: 512, // Misure standard per velocità/qualità
        width: 768,
        modelId: "b24e16ff-06e3-43eb-8d33-4416c2d75876", // Modello PhotoReal
        prompt: "Award winning interior design photography, dramatic natural lighting, ultra clean, modern renovation, decluttered, 8k resolution, architectural digest style, bright and airy",
        negative_prompt: "dark, shadows, messy, blurry, distortion, low quality, ugly, noise, grain, people",
        init_image_id: imageId,
        init_strength: 0.60, // FORZA: 0.60 cambia abbastanza luci e stile, ma mantiene i mobili
        photoReal: true,
        photoRealStrength: 0.55,
        num_images: 1
      }),
    });

    const genData = await genRes.json();
    const generationId = genData.sdGenerationJob?.generationId;

    if (!generationId) throw new Error("Generazione non avviata (Nessun ID ricevuto)");

    // --- FASE 5: Polling (Aspettiamo che Leonardo finisca) ---
    console.log("⏳ 5. In attesa del risultato...");
    let finalImageUrl = null;
    let attempts = 0;

    while (!finalImageUrl && attempts < 40) { // Max 80 secondi di attesa
      await new Promise((r) => setTimeout(r, 2000)); // Aspetta 2 secondi
      attempts++;

      const statusRes = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
        headers: {
          accept: "application/json",
          authorization: `Bearer ${LEONARDO_API_KEY}`,
        },
      });

      const statusData = await statusRes.json();
      const job = statusData.generations_by_pk;

      if (job && job.status === "COMPLETE") {
        finalImageUrl = job.generated_images[0].url;
      } else if (job && job.status === "FAILED") {
        throw new Error("Leonardo ha fallito la generazione");
      }
    }

    if (!finalImageUrl) throw new Error("Timeout: Leonardo ci sta mettendo troppo");

    console.log("✅ Finito! URL:", finalImageUrl);

    // Rispondiamo al frontend con l'URL vero
    return NextResponse.json({
      enhancedImageUrl: finalImageUrl,
      // Lasciamo i testi placeholder per ora, ci concentriamo sulla foto
      copy: { it: "Ecco la tua nuova foto migliorata con AI." } 
    });

  } catch (error: any) {
    console.error("❌ Errore Backend:", error);
    return NextResponse.json(
      { error: error.message || "Errore sconosciuto durante il processo" },
      { status: 500 }
    );
  }
}
