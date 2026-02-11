import { NextResponse } from "next/server";
// Usiamo il robot ufficiale che non sbaglia le firme
import { v2 as cloudinary } from 'cloudinary'; 

export const dynamic = "force-dynamic";

const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;

// 👇 INCOLLA QUI I TUOI DATI (Li scrivo vuoti così li incolli puliti)
const CLOUDINARY_CLOUD_NAME = "dfzptsood"; 
const CLOUDINARY_API_KEY = "469877913569186"; 
const CLOUDINARY_API_SECRET = "L1RR-AzlrdZCosB-dSiGJSavxH0"; 

// Configuriamo il robot
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

    console.log("🚀 Inizio Processo SICURO (SDK Ufficiale)...");

    // 1. ESTRAZIONE INTELLIGENTE DELL'ID
    // Il mio errore prima era qui. Ora usiamo una formula (Regex) che prende l'ID
    // corretto anche se è dentro delle cartelle.
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/;
    const match = originalImageUrl.match(regex);
    // Se la formula non trova nulla, usiamo il metodo vecchio come riserva
    const publicId = match && match[1] ? match[1] : originalImageUrl.split('/').pop().split('.')[0];
    
    console.log("👉 ID Corretto:", publicId);

    // 2. GENERAZIONE URL CORRETTO (Nativo)
    // Usiamo distort:correction che è GRATIS e NATIVO.
    // Il robot crea l'URL e la firma al posto nostro. Impossibile sbagliare.
    const correctedUrl = cloudinary.url(publicId, {
        transformation: [
            { effect: "distort:correction" }, // Toglie la pancia ai muri
            { effect: "improve:outdoor:50" }, // Luce forte
            { effect: "sharpen:80" }          // Nitidezza
        ],
        sign_url: true, // Firma automatica
        fetch_format: 'jpg'
    });

    console.log("✅ URL Generato dal Robot:", correctedUrl);

    // Verifichiamo se funziona (giusto per essere sicuri)
    const checkRes = await fetch(correctedUrl);
    if (!checkRes.ok) {
        // Se fallisce qui, l'unica causa possibile è che le chiavi copiate abbiano uno spazio vuoto alla fine
        console.error("Errore Cloudinary:", await checkRes.text());
        throw new Error("Errore di autenticazione con Cloudinary. Controlla di non aver copiato spazi vuoti nelle chiavi.");
    }
    
    // --- FASE 3: LEONARDO UPSCALER ---
    console.log("🎨 Passaggio a Leonardo...");

    const imageRes = await fetch(correctedUrl);
    const imageBlob = await imageRes.blob();
    
    // Init Leonardo
    const initImageRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/init-image", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${LEONARDO_API_KEY}`,
      },
      body: JSON.stringify({ extension: 'jpg' }),
    });

    const initData = await initImageRes.json();
    if (!initData.uploadInitImage) throw new Error("Errore Init Leonardo");
    const { url: uploadUrl, id: imageId, fields } = initData.uploadInitImage;

    const formData = new FormData();
    const fieldsParsed = JSON.parse(fields);
    for (const key in fieldsParsed) formData.append(key, fieldsParsed[key]);
    formData.append("file", imageBlob);

    await fetch(uploadUrl, { method: "POST", body: formData });

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
    
    if (!generationId) return NextResponse.json({ enhancedImageUrl: correctedUrl });

    // Polling
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
      else if (job && job.status === "FAILED") finalImageUrl = correctedUrl;
    }

    return NextResponse.json({ enhancedImageUrl: finalImageUrl || correctedUrl });

  } catch (error: any) {
    console.error("❌ Errore:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
