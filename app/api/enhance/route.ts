import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) return NextResponse.json({ error: "Manca l'URL dell'immagine" }, { status: 400 });
    if (!LEONARDO_API_KEY) return NextResponse.json({ error: "Manca la chiave API di Leonardo" }, { status: 500 });

    console.log("🚀 1. Avvio Universal Upscaler (Restauro Fedele):", image);

    // --- FASE 1: Scarica immagine ---
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
    if (!initData.uploadInitImage) throw new Error("Errore Init Leonardo");
    const { url: uploadUrl, id: imageId, fields } = initData.uploadInitImage;

    // --- FASE 3: Upload fisico ---
    const formData = new FormData();
    const fieldsParsed = JSON.parse(fields);
    for (const key in fieldsParsed) formData.append(key, fieldsParsed[key]);
    formData.append("file", imageBlob);

    const uploadRes = await fetch(uploadUrl, { method: "POST", body: formData });
    if (!uploadRes.ok) throw new Error("Fallito upload immagine su Leonardo");

    // --- FASE 4: Chiamata UNIVERSAL UPSCALER ---
    // Questo endpoint è specifico per migliorare senza inventare.
    console.log("🎨 4. Applicazione Upscaler...");
    
    const upRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/variations/universal-upscaler", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${LEONARDO_API_KEY}`,
      },
      body: JSON.stringify({
        init_image_id: imageId,
        generated_image_style: "PHOTOGRAPHY", // Stile fotografico
        upscale_multiplier: 1.5, // Aumenta leggermente la risoluzione per pulire i dettagli
        
        // CREATIVITY STRENGTH (Da 1 a 10)
        // Mettiamo 3. Basso abbastanza da non inventare, 
        // alto abbastanza da correggere la luce.
        creativity_strength: 3, 
        
        // Prompt opzionale per guidare il "restauro"
        prompt: "Professional real estate photography, clear, sharp focus, vibrant colors, natural lighting"
      }),
    });

    const upData = await upRes.json();
    
    if (upData.error) {
        console.error("❌ Leonardo Upscaler Error:", upData.error);
        throw new Error(upData.error);
    }
    
    const generationId = upData.universalUpscalerJob?.id;
    if (!generationId) throw new Error("Upscale non avviato: ID mancante");

    // --- FASE 5: Polling ---
    // Attenzione: L'upscaler usa un endpoint diverso per il controllo stato
    let finalImageUrl = null;
    let attempts = 0;

    while (!finalImageUrl && attempts < 60) {
      await new Promise((r) => setTimeout(r, 2000));
      attempts++;
      
      const statusRes = await fetch(`https://cloud.leonardo.ai/api/rest/v1/variations/universal-upscaler/${generationId}`, {
        headers: { accept: "application/json", authorization: `Bearer ${LEONARDO_API_KEY}` },
      });
      
      const statusData = await statusRes.json();
      const job = statusData.universalUpscalerJob; // Struttura diversa rispetto a "generations"
      
      if (job && job.status === "COMPLETE") {
        finalImageUrl = job.generated_image.url; // Percorso diverso
      } else if (job && job.status === "FAILED") {
        throw new Error("Leonardo Upscaler fallito");
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
