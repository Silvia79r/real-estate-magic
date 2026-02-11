import { NextResponse } from "next/server";
// Importiamo lo strumento ufficiale (ora funzionerà perché package.json è ok)
import { v2 as cloudinary } from 'cloudinary'; 

export const dynamic = "force-dynamic";

// --- CONFIGURAZIONE ---
const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;

// 👇 👇 👇 INCOLLA QUI I TUOI DATI VERI (Dalla Dashboard Cloudinary) 👇 👇 👇
const CLOUDINARY_CLOUD_NAME = "dfzptsood"; 
const CLOUDINARY_API_KEY = "469877913569186";     // Es: 123456...
const CLOUDINARY_API_SECRET = "L1RR-AzlrdZCosB-dSiGJSavxH0";   // Es: abCde_Fg...

// Configuriamo lo strumento con i tuoi dati
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

    console.log("🚀 Inizio Processo VIESUS (Mode: Ufficiale)...");

    let imageUrlForLeonardo = null;

    // --- FASE 1: RADDRIZZAMENTO (Tentativo Viesus) ---
    try {
        // Estraiamo l'ID dell'immagine in modo intelligente
        // Prende tutto quello che c'è dopo l'ultima barra "/" e toglie ".jpg" o ".png"
        const publicId = originalImageUrl.split('/').pop().split('.')[0];
        console.log("👉 ID Immagine:", publicId);

        // Generiamo il link "Magico" usando lo strumento ufficiale.
        // Questo calcola la firma matematica perfetta al posto nostro.
        const viesusUrl = cloudinary.url(publicId, {
            transformation: [
                { effect: "viesus_correct" } // Chiama l'add-on Viesus
            ],
            sign_url: true, // Firma automatica (Anti-Errore)
            fetch_format: 'jpg' 
        });

        console.log("👉 Tentativo URL Viesus:", viesusUrl);

        // Controlliamo se funziona (Se le chiavi sono giuste, risponderà 200 OK)
        const checkRes = await fetch(viesusUrl);
        
        if (checkRes.ok) {
            imageUrlForLeonardo = viesusUrl;
            console.log("✅ Viesus ATTIVO! Foto raddrizzata.");
        } else {
            console.warn("⚠️ Viesus non ha risposto (Forse chiavi errate o ID non trovato).");
            throw new Error("Viesus Skip");
        }

    } catch (e) {
        // --- PIANO B: RADDRIZZAMENTO NATIVO (Se Viesus fallisce) ---
        console.log("🔄 Attivo Piano B (Solo Correzione Lente + Luci)...");
        // e_distort:correction -> Toglie l'effetto "pancia" (Barilotto)
        // e_improve -> Luci
        // e_sharpen -> Nitidezza
        const fallbackTrans = "e_distort:correction,e_improve:outdoor,e_sharpen:60";
        imageUrlForLeonardo = originalImageUrl.replace("/upload/", `/upload/${fallbackTrans}/`);
    }

    if (!imageUrlForLeonardo) imageUrlForLeonardo = originalImageUrl;

    // --- FASE 2: LEONARDO UPSCALER (Alta Definizione) ---
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

    // Upscale (Creatività 1 = Solo pulizia pixel, non storce le linee)
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
    
    if (!generationId) {
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
        finalImageUrl = imageUrlForLeonardo;
      }
    }

    return NextResponse.json({ enhancedImageUrl: finalImageUrl || imageUrlForLeonardo });

  } catch (error: any) {
    console.error("❌ Errore:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
