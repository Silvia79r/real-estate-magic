import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) return NextResponse.json({ error: "Manca l'URL dell'immagine" }, { status: 400 });
    if (!LEONARDO_API_KEY) return NextResponse.json({ error: "Manca la chiave API di Leonardo" }, { status: 500 });

    console.log("🚀 1. Analisi Immagine:", image);

    // Scarica e prepara l'immagine
    const imageRes = await fetch(image);
    const imageBlob = await imageRes.blob();
    let fileExtension = 'jpg';
    if (imageBlob.type === 'image/png') fileExtension = 'png';
    else if (imageBlob.type === 'image/webp') fileExtension = 'webp';

    // Init Upload
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

    // Upload Fisico
    const formData = new FormData();
    const fieldsParsed = JSON.parse(fields);
    for (const key in fieldsParsed) formData.append(key, fieldsParsed[key]);
    formData.append("file", imageBlob);

    const uploadRes = await fetch(uploadUrl, { method: "POST", body: formData });
    if (!uploadRes.ok) throw new Error("Fallito upload immagine su Leonardo");

    // --- GENERAZIONE CONSERVATIVA E SICURA ---
    console.log("🎨 4. Avvio Miglioramento Sicuro...");
    
    const genRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/generations", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${LEONARDO_API_KEY}`,
      },
      body: JSON.stringify({
        // Prompt che chiede solo pulizia e luce
        prompt: "A high-resolution, professional photograph of this exact scene. Improved lighting, sharp details, vibrant colors, clear sky. The structure and objects are unchanged.",
        
        // Negative prompt per bloccare le invenzioni
        negative_prompt: "altered geometry, new objects, distorted, blurry, low quality, changing structures, moving objects, different composition, deformed, new buildings, villa",
        
        init_image_id: imageId,
        
        // *** IL SEGRETO ***
        // Spegniamo tutto ciò che è "creativo".
        alchemy: false,
        photoReal: false,
        promptMagic: false,

        // FORZA BASSISSIMA: 0.25
        // Sufficiente per togliere il grigio e dare luce, ma non per inventare ville.
        init_strength: 0.25, 
        
        num_images: 1,
        // Usiamo un modello generico e stabile
        modelId: "ac614f96-1082-45bf-be9d-757f2d31c174" // Leonardo Diffusion
      }),
    });

    const genData = await genRes.json();
    if (genData.error) throw new Error(genData.error);
    const generationId = genData.sdGenerationJob?.generationId;
    if (!generationId) throw new Error("Generazione non avviata");

    // Polling
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
      if (job && job.status === "COMPLETE") finalImageUrl = job.generated_images[0].url;
      else if (job && job.status === "FAILED") throw new Error("Leonardo ha fallito la generazione");
    }

    if (!finalImageUrl) throw new Error("Timeout Leonardo");

    return NextResponse.json({
      enhancedImageUrl: finalImageUrl,
    });

  } catch (error: any) {
    console.error("❌ Errore Backend:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
