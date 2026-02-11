import { NextResponse } from "next/server";
// Importiamo lo strumento ufficiale (ora funzionerà perché lo hai aggiunto al package.json)
import { v2 as cloudinary } from 'cloudinary'; 

export const dynamic = "force-dynamic";

// --- CONFIGURAZIONE ---
const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;

// 👇 INCOLLA LE TUE CHIAVI CLOUDINARY QUI
const CLOUDINARY_CLOUD_NAME = "dfzptsood"; 
const CLOUDINARY_API_KEY = "469877913569186"; 
const CLOUDINARY_API_SECRET = "L1RR-AzlrdZCosB-dSiGJSavxH0"; 

// Configuriamo lo strumento ufficiale
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

    console.log("🚀 Inizio Processo VIESUS UFFICIALE...");

    let imageUrlForLeonardo = null;

    // --- TENTATIVO 1: VIESUS (Via Strumento Ufficiale) ---
    try {
        // Estraiamo l'ID dell'immagine dall'URL in modo sicuro
        // Esempio URL: https://res.cloudinary.com/.../upload/v12345/cartella/foto.jpg
        const regex = /\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/;
        const match = originalImageUrl.match(regex);
        
        // Se la regex fallisce, proviamo uno split manuale
        const publicId = match && match[1] ? match[1] : originalImageUrl.split('/').pop().split('.')[0];
        
        console.log("👉 ID estratto per Viesus:", publicId);

        // Generiamo l'URL firmato usando lo strumento ufficiale.
        // Questo calcola la firma matematica perfetta al posto nostro.
        const viesusUrl = cloudinary.url(publicId, {
            transformation: [
                { effect: "viesus_correct" } // Chiama l'add-on Viesus
            ],
            sign_url: true, // Firma automatica
            fetch_format: 'jpg' // Forza jpg
        });

        console.log("👉 URL Viesus generato:", viesusUrl);

        // Verifichiamo se funziona
        const checkRes = await fetch(viesusUrl);
        if (checkRes.ok) {
            imageUrlForLeonardo = viesusUrl;
            console.log("✅ Viesus applicato con successo!");
        } else {
            console.warn("⚠️ Viesus fallito, passo al piano B.");
            throw new Error("Viesus Skip");
        }
    } catch (e) {
        // --- TENTATIVO 2: PIANO B (Nativo) ---
        console.log("🔄 Attivazione Piano B (Correzione Nativa)...");
        // e_distort:correction -> Toglie pancia muri
        // e_improve -> Luci
        // e_sharpen -> Nitidezza
        const fallbackTrans = "e_distort:correction,e_improve:outdoor,e_sharpen:60";
        imageUrlForLeonardo = originalImageUrl.replace("/upload/", `/upload/${fallbackTrans}/`);
    }

    if (!imageUrlForLeonardo) imageUrlForLeonardo = originalImageUrl;

    // --- FASE 3: LEONARDO UPSCALER ---
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
