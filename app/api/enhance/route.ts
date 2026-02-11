import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) return NextResponse.json({ error: "Manca l'URL dell'immagine" }, { status: 400 });
    if (!LEONARDO_API_KEY) return NextResponse.json({ error: "Manca la chiave API di Leonardo" }, { status: 500 });

    console.log("🚀 1. Inizio processo Phoenix per:", image);

    // --- FASE 1: Scarica immagine originale ---
    const imageRes = await fetch(image);
    const imageBlob = await imageRes.blob();
    
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

    // --- FASE 4: Generazione con PHOENIX (Il modello stabile) ---
    console.log("🎨 4. Avvio generazione Phoenix...");
    
    const genRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/generations", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${LEONARDO_API_KEY}`,
      },
      body: JSON.stringify({
        // Prompt specifico per illuminazione (non struttura)
        prompt: "Professional real estate photography, sunny day, bright natural lighting, clear blue sky, vibrant colors, sharp focus, 8k, architectural digest style",
        
        // Negative prompt per bloccare le allucinazioni
        negative_prompt: "structure change, new walls, distorted, low quality, dark, blurry, different furniture, artifacts, illustration, painting",
        
        init_image_id: imageId,
        
        // ID del modello LEONARDO PHOENIX (Stabile e fedele)
        modelId: "6b645e3a-d64f-4341-a6d8-7a3690fbf042",
        
        // FORZA: 0.40
        // Phoenix regge meglio la forza. A 0.40 illumina bene senza inventare.
        init_strength: 0.40, 
        
        // Disattiviamo PhotoReal e Alchemy per avere controllo totale
        alchemy: false,
        photoReal: false,
        
        num_images: 1,
        width: 1024, // Standardizziamo per evitare errori, Phoenix adatta l'aspect ratio
        height: 768
      }),
    });

    const genData = await genRes.json();
    
    if (genData.error) {
        console.error("❌ Leonardo Error:", genData.error);
        throw new Error(genData.error);
    }
    
    const generationId = genData.sdGenerationJob?.generationId;
    if (!generationId) throw new Error("Generazione non avviata: ID mancante");

    // --- FASE 5: Polling ---
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
    });

  } catch (error: any) {
    console.error("❌ Errore Backend:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
