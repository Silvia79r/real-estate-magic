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

    // --- GENERAZIONE (IL SEGRETO È QUI) ---
    console.log("🎨 4. Applicazione filtro 'Sunny Day Real Estate'...");
    
    const genRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/generations", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${LEONARDO_API_KEY}`,
      },
      body: JSON.stringify({
        // PROMPT SPECIFICO PER IMMOBILIARE:
        // - "sunny day, clear blue sky": Forza il bel tempo
        // - "straight vertical lines": Raddrizza la prospettiva
        // - "interior design magazine": Alza la qualità
        prompt: "Professional real estate photography, sunny day, clear blue sky, perfect vertical lines, wide angle lens, warm sunlight, vibrant colors, hdr, high dynamic range, sharp focus, clean, cozy, luxury living, 8k resolution",
        
        // NEGATIVE PROMPT (COSA EVITARE):
        // Evitiamo pioggia, cielo grigio, distorsioni e muri storti
        negative_prompt: "rain, overcast, gray sky, crooked lines, slanted walls, lens distortion, fish eye, messy, blur, noise, dark shadows, low quality, black and white",
        
        init_image_id: imageId,
        
        // FORZA: 0.55
        // Abbastanza alta da cambiare il cielo (da grigio a blu).
        // Abbastanza bassa da non inventare finestre che non esistono.
        init_strength: 0.55, 
        
        alchemy: true,     // Motore Alta Qualità
        photoReal: true,   // Realismo
        photoRealStrength: 0.50, // Bilanciamento realismo
        num_images: 1,
        presetStyle: "DYNAMIC" // Stile vivido e luminoso
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
