import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// --- CONFIGURAZIONE ---
const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;
// 👇 INCOLLA QUI LE TUE CHIAVI CLOUDINARY
const CLOUDINARY_CLOUD_NAME = "dfzptsood"; 
const CLOUDINARY_API_KEY = "469877913569186"; 
const CLOUDINARY_API_SECRET = "L1RR-AzlrdZCosB-dSiGJSavxH0"; 

export async function POST(request: Request) {
  try {
    const { image: originalImageUrl } = await request.json();
    if (!originalImageUrl) return NextResponse.json({ error: "Manca l'URL dell'immagine" }, { status: 400 });

    console.log("🚀 Inizio Workflow 'Photoshop' (Lente + Raddrizza + Riempimento AI)...");

    // Prepariamo la firma di sicurezza (Obbligatoria per Generative Fill)
    const crypto = require('crypto');
    const timestamp = Math.round((new Date).getTime() / 1000);
    const urlParts = originalImageUrl.split('/');
    const filename = urlParts.pop();
    const publicId = filename.split('.')[0];
    
    // --- FASE 1: IL TRATTAMENTO COMPLETO (Cloudinary) ---
    // Questa è la stringa magica che replica i tuoi passaggi manuali:
    // 1. e_distort:correction -> Toglie l'effetto "Barilotto" (Muri curvi)
    // 2. e_straighten -> Ruota l'immagine per mettere le linee verticali a piombo
    // 3. b_gen_fill -> Riempi i triangoli vuoti che si creano ruotando (Generative Fill)
    // 4. e_improve -> Migliora luci e colori
    
    const transformation = "e_distort:correction,e_straighten,b_gen_fill,e_improve"; 
    
    const signatureStr = `public_id=${publicId}&timestamp=${timestamp}&transformation=${transformation}${CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');
    
    const photoshopUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformation}/v${timestamp}/${publicId}.jpg?api_key=${CLOUDINARY_API_KEY}&signature=${signature}`;
    
    let imageUrlForLeonardo = null;

    // Proviamo ad applicare il trattamento completo
    try {
        const checkRes = await fetch(photoshopUrl);
        if (checkRes.ok) {
            const data = await checkRes.json();
            imageUrlForLeonardo = data.secure_url || photoshopUrl;
            console.log("✅ FASE 1: Geometria e Riempimento riusciti!");
        } else {
            // Se fallisce (magari l'angolo è troppo estremo per l'automatico),
            // PROVIAMO IL PIANO B: Solo correzione lente e luci (senza rotazione forzata che rompe tutto)
            console.warn("⚠️ FASE 1 Fallita (Angolo estremo). Attivo Piano B (Correzione Lente + Luci).");
            
            const fallbackTrans = "e_distort:correction,e_improve,e_sharpen:60";
            imageUrlForLeonardo = originalImageUrl.replace("/upload/", `/upload/${fallbackTrans}/`);
        }
    } catch (e) {
        // Fallback estremo: solo luci
        imageUrlForLeonardo = originalImageUrl.replace("/upload/", "/upload/e_improve,e_sharpen:60/");
    }

    if (!imageUrlForLeonardo) imageUrlForLeonardo = originalImageUrl; // Safety net

    // --- FASE 2: RESTAURO HD (Leonardo Upscaler) ---
    // Ora che la geometria è gestita (bene o male), facciamo l'HD
    console.log("🎨 FASE 2: Upscale HD (Creatività Minima)...");

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
    const { url: uploadUrl, id: imageId, fields } = initData.uploadInitImage;

    const formData = new FormData();
    const fieldsParsed = JSON.parse(fields);
    for (const key in fieldsParsed) formData.append(key, fieldsParsed[key]);
    formData.append("file", imageBlob);

    await fetch(uploadUrl, { method: "POST", body: formData });

    // Upscale con CREATIVITÀ 1 (Minima)
    // Non tocca le forme, pulisce solo i pixel.
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
        creativityStrength: 1, // <--- MINIMO ASSOLUTO (Protegge tapparelle e linee)   
        prompt: "Real estate interior, sharp focus, clean lines"
      }),
    });

    const upData = await upRes.json();
    const generationId = upData.universalUpscaler?.id;
    
    if (!generationId) {
         // Se l'upscaler fallisce, restituiamo almeno l'immagine di Cloudinary (che è già migliorata)
         console.error("Leonardo non partito, uso risultato Cloudinary");
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
         // Fallback su Cloudinary se Leonardo fallisce
         finalImageUrl = imageUrlForLeonardo;
      }
    }

    return NextResponse.json({ enhancedImageUrl: finalImageUrl || imageUrlForLeonardo });

  } catch (error: any) {
    console.error("❌ Errore:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
