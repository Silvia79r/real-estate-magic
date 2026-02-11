import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// --- CONFIGURAZIONE ---
const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;
// 👇 INCOLLA LE TUE CHIAVI CLOUDINARY QUI
const CLOUDINARY_CLOUD_NAME = "dfzptsood"; 
const CLOUDINARY_API_KEY = "469877913569186"; 
const CLOUDINARY_API_SECRET = "L1RR-AzlrdZCosB-dSiGJSavxH0"; 

export async function POST(request: Request) {
  try {
    const { image: originalImageUrl } = await request.json();
    if (!originalImageUrl) return NextResponse.json({ error: "Manca l'URL dell'immagine" }, { status: 400 });

    console.log("🚀 Inizio Processo Fail-Safe...");

    let imageUrlForLeonardo = null;

    // --- TENTATIVO 1: VIESUS (Proviamo, ma se fallisce pazienza) ---
    try {
        const crypto = require('crypto');
        const timestamp = Math.round((new Date).getTime() / 1000);
        
        // Estrazione ID più robusta
        // Cerchiamo la parte dopo /upload/v.../
        // Esempio: .../upload/v123456/cartella/immagine.jpg -> cartella/immagine
        const parts = originalImageUrl.split(/\/upload\/(?:v\d+\/)?/);
        if (parts.length < 2) throw new Error("URL non valido");
        const publicIdWithExt = parts[1]; 
        const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));

        console.log("👉 ID estratto per Viesus:", publicId);

        const transformation = "e_viesus_correct"; 
        const signatureStr = `public_id=${publicId}&timestamp=${timestamp}&transformation=${transformation}${CLOUDINARY_API_SECRET}`;
        const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');
        
        const viesusUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformation}/v${timestamp}/${publicId}.jpg?api_key=${CLOUDINARY_API_KEY}&signature=${signature}`;
        
        const checkRes = await fetch(viesusUrl);
        if (checkRes.ok) {
            const data = await checkRes.json();
            imageUrlForLeonardo = data.secure_url || viesusUrl;
            console.log("✅ Viesus applicato con successo!");
        } else {
            // Se fallisce, leggiamo l'errore ma non blocchiamo l'app
            const err = await checkRes.text();
            console.warn("⚠️ Viesus non applicato (Errore firma o API):", err);
            throw new Error("Viesus Skip");
        }
    } catch (e) {
        // --- TENTATIVO 2: PIANO B (Nativo) ---
        console.log("🔄 Attivazione Piano B (Correzione Nativa)...");
        
        // e_distort:correction -> Toglie l'effetto barilotto (muri curvi)
        // e_improve:outdoor -> Luci
        // e_sharpen:60 -> Nitidezza
        // a_auto -> Raddrizzamento automatico base (se possibile)
        const fallbackTrans = "e_distort:correction,e_improve:outdoor,e_sharpen:60";
        
        // Applichiamo la trasformazione nativa (non richiede firma complessa)
        imageUrlForLeonardo = originalImageUrl.replace("/upload/", `/upload/${fallbackTrans}/`);
    }

    // Rete di sicurezza finale
    if (!imageUrlForLeonardo) imageUrlForLeonardo = originalImageUrl;
    
    console.log("📸 Immagine pronta per Leonardo:", imageUrlForLeonardo);

    // --- FASE 3: LEONARDO UPSCALER (Solo Qualità HD) ---
    console.log("🎨 Passaggio a Leonardo...");

    const imageRes = await fetch(imageUrlForLeonardo);
    const imageBlob = await imageRes.blob();
    let fileExtension = 'jpg';
    if (imageBlob.type === 'image/png') fileExtension = 'png';

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

    const formData = new FormData();
    const fieldsParsed = JSON.parse(fields);
    for (const key in fieldsParsed) formData.append(key, fieldsParsed[key]);
    formData.append("file", imageBlob);

    await fetch(uploadUrl, { method: "POST", body: formData });

    // Upscale (Creatività 1 - Solo pulizia)
    const upRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/variations/universal-upscaler", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${LEONARDO_API_KEY}`,
      },
      body: JSON.stringify({
        initImageId: imageId,
        upscalerStyle: "CINEMATIC", 
        upscaleMultiplier: 1.5,     
        creativityStrength: 1,      
        prompt: "Real estate interior, sharp focus, clean lines"
      }),
    });

    const upData = await upRes.json();
    const generationId = upData.universalUpscaler?.id;
    
    if (!generationId) {
        // Se Leonardo fallisce, restituiamo almeno quella di Cloudinary
        return NextResponse.json({ enhancedImageUrl: imageUrlForLeonardo });
    }

    let finalImageUrl = null;
    let attempts = 0;
    while (!finalImageUrl && attempts < 60) {
      await new Promise((r) => setTimeout(r, 2000));
      attempts++;
      const statusRes = await fetch(`https://cloud.leonardo.ai/api/rest/v1/variations/${generationId}`, {
        headers: { accept: "application/json", authorization: `Bearer ${LEONARDO_API_KEY}` },
      });
      const statusData = await statusRes.json();
      const job = statusData.generated_image_variation_generic?.[0];

      if (job && job.status === "COMPLETE") {
        finalImageUrl = job.url;
      } else if (job && job.status === "FAILED") {
        finalImageUrl = imageUrlForLeonardo; // Fallback
      }
    }

    return NextResponse.json({ enhancedImageUrl: finalImageUrl || imageUrlForLeonardo });

  } catch (error: any) {
    console.error("❌ Errore:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
