import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary'; 

export const dynamic = "force-dynamic";

const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;

// 👇 INCOLLA LE TUE CHIAVI
const CLOUDINARY_CLOUD_NAME = "dfzptsood"; 
const CLOUDINARY_API_KEY = "469877913569186"; 
const CLOUDINARY_API_SECRET = "L1RR-AzlrdZCosB-dSiGJSavxH0"; 

// Configurazione
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true
});

export async function POST(request: Request) {
  try {
    const { image: originalImageUrl } = await request.json();
    if (!originalImageUrl) return NextResponse.json({ error: "Manca l'URL dell'immagine" }, { status: 400 });

    console.log("🚀 Inizio Processo: UPLOAD + CORREZIONE DIRETTA...");

    let imageUrlForLeonardo = null;

    // --- FASE 1: CLOUDINARY UPLOAD (Metodo Infallibile) ---
    // Invece di modificare l'URL, ricarichiamo la foto chiedendo a Cloudinary di aggiustarla subito.
    try {
        const uploadResult = await cloudinary.uploader.upload(originalImageUrl, {
            // Queste sono le istruzioni di correzione che verranno applicate ORA
            transformation: [
                { effect: "distort:correction" }, // Toglie la pancia ai muri (Barilotto)
                { effect: "improve:outdoor:50" }, // Illumina le ombre
                { effect: "sharpen:80" }          // Aumenta nitidezza
            ]
        });

        // Se siamo qui, Cloudinary ha finito e ci da il NUOVO link
        imageUrlForLeonardo = uploadResult.secure_url;
        console.log("✅ Cloudinary Upload completato:", imageUrlForLeonardo);

    } catch (cloudError: any) {
        console.error("❌ Errore Cloudinary Upload:", cloudError);
        // Se fallisce l'upload, dobbiamo fermarci e capire perché (vedrai l'errore nei log)
        // Ma per non bloccarti l'app, usiamo l'originale come disperazione
        imageUrlForLeonardo = originalImageUrl;
    }

    // --- FASE 2: LEONARDO UPSCALER ---
    console.log("🎨 Passaggio a Leonardo...");

    const imageRes = await fetch(imageUrlForLeonardo);
    const imageBlob = await imageRes.blob();
    
    let fileExtension = 'jpg';
    if (imageBlob.type === 'image/png') fileExtension = 'png';

    // 1. Init Leonardo
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

    // 2. Upload su Leonardo
    const formData = new FormData();
    const fieldsParsed = JSON.parse(fields);
    for (const key in fieldsParsed) formData.append(key, fieldsParsed[key]);
    formData.append("file", imageBlob);

    await fetch(uploadUrl, { method: "POST", body: formData });

    // 3. Upscale (Creatività 1)
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
        prompt: "Real estate interior, sharp focus"
      }),
    });

    const upData = await upRes.json();
    const generationId = upData.universalUpscaler?.id;
    
    if (!generationId) return NextResponse.json({ enhancedImageUrl: imageUrlForLeonardo });

    // 4. Polling
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

      if (job && job.status === "COMPLETE") finalImageUrl = job.url;
      else if (job && job.status === "FAILED") finalImageUrl = imageUrlForLeonardo;
    }

    return NextResponse.json({ enhancedImageUrl: finalImageUrl || imageUrlForLeonardo });

  } catch (error: any) {
    console.error("❌ Errore:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
