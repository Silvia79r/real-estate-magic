import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// --- CONFIGURAZIONE ---
const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;

// 👇 INCOLLA LE TUE CHIAVI CLOUDINARY QUI (Servono per la firma di sicurezza base)
const CLOUDINARY_CLOUD_NAME = "dfzptsood"; 
const CLOUDINARY_API_KEY = "469877913569186"; 
const CLOUDINARY_API_SECRET = "L1RR-AzlrdZCosB-dSiGJSavxH0"; 

export async function POST(request: Request) {
  try {
    const { image: originalImageUrl } = await request.json();
    if (!originalImageUrl) return NextResponse.json({ error: "Manca l'URL dell'immagine" }, { status: 400 });

    console.log("🚀 Inizio Processo 'BACK TO BASICS' (Nativo + HD)...");

    const crypto = require('crypto');
    const timestamp = Math.round((new Date).getTime() / 1000);
    
    // Estraiamo l'ID immagine
    const publicId = originalImageUrl.split('/').pop().split('.')[0];
    console.log("👉 ID Immagine:", publicId);

    // --- FASE 1: CORREZIONE NATIVA (Cloudinary) ---
    // Questa è la "ricetta" manuale che forza il cambiamento.
    // e_distort:correction -> Toglie l'effetto curvatura "pancia"
    // e_improve:outdoor:50 -> Schiarisce le ombre in modo deciso
    // e_vibrance:30 -> Rende i colori più vivi
    // e_sharpen:80 -> Nitidezza molto alta
    const transformation = "e_distort:correction,e_improve:outdoor:50,e_vibrance:30,e_sharpen:80";
    
    // Creiamo la firma di sicurezza (necessaria per e_distort)
    const signatureStr = `public_id=${publicId}&timestamp=${timestamp}&transformation=${transformation}${CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');
    
    // URL finale
    const correctedUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformation}/v${timestamp}/${publicId}.jpg?api_key=${CLOUDINARY_API_KEY}&signature=${signature}`;

    console.log("✅ URL Correzione Nativa:", correctedUrl);

    // --- FASE 2: LEONARDO UPSCALER (Solo HD) ---
    console.log("🎨 Passaggio a Leonardo...");

    // Scarichiamo l'immagine già corretta da Cloudinary
    const imageRes = await fetch(correctedUrl);
    if (!imageRes.ok) throw new Error("Errore durante la correzione nativa Cloudinary");
    const imageBlob = await imageRes.blob();

    let fileExtension = 'jpg';
    if (imageBlob.type === 'image/png') fileExtension = 'png';

    // Init Leonardo
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

    // Upload Fisico
    const formData = new FormData();
    const fieldsParsed = JSON.parse(fields);
    for (const key in fieldsParsed) formData.append(key, fieldsParsed[key]);
    formData.append("file", imageBlob);

    await fetch(uploadUrl, { method: "POST", body: formData });

    // Upscale (Creatività 1 = Solo pulizia HD, non tocca la geometria)
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
        prompt: "Real estate interior, sharp focus, clean lines, bright"
      }),
    });

    const upData = await upRes.json();
    const generationId = upData.universalUpscaler?.id;
    
    if (!generationId) {
         // Se Leonardo fallisce, restituiamo almeno quella di Cloudinary
         return NextResponse.json({ enhancedImageUrl: correctedUrl });
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
        finalImageUrl = correctedUrl;
      }
    }

    return NextResponse.json({ enhancedImageUrl: finalImageUrl || correctedUrl });

  } catch (error: any) {
    console.error("❌ Errore:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
