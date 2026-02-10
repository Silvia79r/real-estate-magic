import { NextResponse } from "next/server";

// Impedisce a Next.js di salvare risposte vecchie nella cache
export const dynamic = "force-dynamic";

const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;

export async function POST(request: Request) {
  try {
    // Leggiamo "image" perché il tuo frontend manda quello (l'URL di Cloudinary)
    const { image } = await request.json();

    if (!image) return NextResponse.json({ error: "Manca l'URL dell'immagine" }, { status: 400 });
    if (!LEONARDO_API_KEY) return NextResponse.json({ error: "Manca la chiave API di Leonardo nel file .env" }, { status: 500 });

    console.log("🚀 1. Inizio processo Leonardo per:", image);

    // --- FASE 1: Scarichiamo l'immagine originale da Cloudinary ---
    const imageRes = await fetch(image);
    const imageBlob = await imageRes.blob();

    // --- FASE CRITICA: Determinare l'estensione CORRETTA ---
    // Se l'URL è di Cloudinary, spesso non ha .jpg alla fine. Usiamo il MIME Type.
    let fileExtension = 'jpg'; // Default
    if (imageBlob.type === 'image/png') fileExtension = 'png';
    else if (imageBlob.type === 'image/webp') fileExtension = 'webp';
    
    console.log(`📦 Estensione rilevata: ${fileExtension}`);

    // --- FASE 2: Otteniamo l'URL di upload da Leonardo ---
    const initImageRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/init-image", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${LEONARDO_API_KEY}`,
      },
      body: JSON.stringify({ extension: fileExtension }), // Usiamo l'estensione corretta
    });

    const initData = await initImageRes.json();
    
    // CONTROLLO AGGIUNTIVO: Se Leonardo non ci dà l'URL di upload, mostriamo l'errore vero.
    if (!initData.uploadInitImage) {
      console.error("❌ Errore Init Leonardo (Risposta API):", initData);
      throw new Error(initData.error || "Leonardo ha rifiutato l'upload (estensione non supportata?)");
    }

    const { url: uploadUrl, id: imageId, fields } = initData.uploadInitImage;

    // --- FASE 3: Carichiamo fisicamente l'immagine su Leonardo ---
    const formData = new FormData();
    const fieldsParsed = JSON.parse(fields);
    for (const key in fieldsParsed) formData.append(key, fieldsParsed[key]);
    formData.append("file", imageBlob);

    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!uploadRes.ok) {
      console.error("❌ Fallito upload su S3 di Leonardo:", await uploadRes.text());
      throw new Error("Fallito caricamento immagine su server Leonardo");
    }

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
        height: 512,
        width: 768,
        modelId: "b24e16ff-06e3-43eb-8d33-4416c2d75876", // Modello PhotoReal
        prompt: "Award winning interior design photography, vibrant colors, full color photograph, dramatic natural lighting, ultra clean, modern renovation, decluttered, 8k resolution, architectural digest style, bright and airy",
        negative_prompt: "black and white, monochrome, grayscale, dark, shadows, messy, blurry, distortion, low quality, ugly, noise, grain, people",
        init_image_id: imageId,
        init_strength: 0.65, // FORZA: 0.65 = cambiamento netto, ma mantiene i mobili
        photoReal: true,
        photoRealStrength: 0.55,
        num_images: 1
      }),
    });

    const genData = await genRes.json();
    const generationId = genData.sdGenerationJob?.generationId;

    // QUESTO È L'ERRORE CHE VEDI ORA. Se Leonardo non ci dà l'ID, mostriamo cosa ci ha risposto.
    if (!generationId) {
        console.error("❌ Leonardo ha rifiutato la generazione:", genData);
        throw new Error(genData.error || "Generazione non avviata (Nessun ID ricevuto)");
    }

    // --- FASE 5: Polling (Aspettiamo che Leonardo finisca) ---
    console.log("⏳ 5. In attesa del risultato...");
    let finalImageUrl = null;
    let attempts = 0;

    while (!finalImageUrl && attempts < 60) { // Max 120 secondi (aumentato per sicurezza)
      await new Promise((r) => setTimeout(r, 2000));
      attempts++;
      const statusRes = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
        headers: { accept: "application/json", authorization: `Bearer ${LEONARDO_API_KEY}` },
      });
      const statusData = await statusRes.json();
      const job = statusData.generations_by_pk;
      if (job && job.status === "COMPLETE") finalImageUrl = job.generated_images[0].url;
      else if (job && job.status === "FAILED") throw new Error("Leonardo ha fallito la generazione");
    }

    if (!finalImageUrl) throw new Error("Timeout: Leonardo ci sta mettendo troppo");

    console.log("✅ Finito! URL:", finalImageUrl);

    // Rispondiamo al frontend con l'URL vero
    return NextResponse.json({
      enhancedImageUrl: finalImageUrl,
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
