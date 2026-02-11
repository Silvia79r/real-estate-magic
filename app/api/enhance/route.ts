import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// 👇 TUA CHIAVE (Già inserita)
const LEONARDO_API_KEY = "4bb36750-a725-4e79-9002-acda8a48a6e8"; 

export async function POST(request: Request) {
  try {
    const { image: originalImageUrl } = await request.json();
    
    if (!LEONARDO_API_KEY || LEONARDO_API_KEY.includes("INCOLLA_QUI")) {
        return NextResponse.json({ error: "Chiave mancante!" }, { status: 500 });
    }

    console.log("🚀 MODO ARCHITETTO V3: Equilibrio tra Realtà e Geometria...");

    // 1. SCARICA IMMAGINE
    const imageRes = await fetch(originalImageUrl);
    const imageBlob = await imageRes.blob();
    let fileExtension = 'jpg';
    if (imageBlob.type === 'image/png') fileExtension = 'png';

    // 2. INIT LEONARDO
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
    const { url: uploadUrl, id: initImageId, fields } = initData.uploadInitImage;

    // 3. UPLOAD
    const formData = new FormData();
    const fieldsParsed = JSON.parse(fields);
    for (const key in fieldsParsed) formData.append(key, fieldsParsed[key]);
    formData.append("file", imageBlob);

    const uploadRes = await fetch(uploadUrl, { method: "POST", body: formData });
    if (!uploadRes.ok) throw new Error("Errore Upload");

    console.log("✅ Foto caricata. Rigenerazione mirata...");

    // 4. GENERAZIONE (DESCRIZIONE SPECIFICA DELLA TUA STANZA)
    const genRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/generations", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${LEONARDO_API_KEY}`,
      },
      body: JSON.stringify({
        height: 768, 
        width: 1024,
        modelId: "b24e16ff-06e3-43eb-8d33-4416c2d75876", // Phoenix Model
        
        // 👇 QUI DESCRIVIAMO LA TUA STANZA PER NON FARGLIELA INVENTARE 👇
        prompt: "Bedroom interior, double bed with blue and green patterned quilt, wooden shelving unit with tv, french door with sheer blue curtains, terracotta tile floor, white walls. Architectural photography, perfectly straight vertical lines, perspective correction, 8k resolution, photorealistic, bright natural light",
        
        // 👇 VIETIAMO DI CAMBIARE TROPPO 👇
        negative_prompt: "changing furniture style, different bedspread, distorted perspective, curved walls, fish eye, dark, blurry, low quality",
        
        init_image_id: initImageId,
        
        // 👇 IL NUMERO DELL'EQUILIBRIO 👇
        // 0.30 = Casa nuova (Sbagliato)
        // 0.60 = Casa storta (Sbagliato)
        // 0.45 = Raddrizza i muri ma tiene i mobili (Giusto)
        init_strength: 0.45,        
        num_images: 1,
        public: false
      }),
    });

    const genData = await genRes.json();
    const generationId = genData.sdGenerationJob?.generationId;

    if (!generationId) throw new Error("Leonardo non è partito.");

    // 5. POLLING
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
        if (job.generated_images && job.generated_images.length > 0) {
            finalImageUrl = job.generated_images[0].url;
        }
      } else if (job && job.status === "FAILED") {
        throw new Error("Leonardo Failed");
      }
    }

    if (!finalImageUrl) throw new Error("Timeout");

    return NextResponse.json({ enhancedImageUrl: finalImageUrl });

  } catch (error: any) {
    console.error("❌ Errore:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
