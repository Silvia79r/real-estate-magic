import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// --- CONFIGURAZIONE ---
const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;

// 👇 RIMETTI I TUOI DATI CLOUDINARY QUI (li trovi nella dashboard)
const CLOUDINARY_CLOUD_NAME = "dfzptsood"; 
const CLOUDINARY_API_KEY = "469877913569186"; 
const CLOUDINARY_API_SECRET = "L1RR-AzlrdZCosB-dSiGJSavxH0"; 

export async function POST(request: Request) {
  try {
    const { image: originalImageUrl } = await request.json();

    if (!originalImageUrl) return NextResponse.json({ error: "Manca l'URL dell'immagine" }, { status: 400 });

    console.log("🚀 Inizio Processo Professionale (Geometra + Fotografo)...");

    // --- FASE 1: IL GEOMETRA (Cloudinary Viesus) ---
    // Questo passaggio ora funzionerà se hai attivato l'Add-on "Viesus" (Free tier)
    console.log("📐 1. Raddrizzamento prospettiva...");
    
    // Creiamo un URL firmato per usare l'add-on in sicurezza
    const crypto = require('crypto');
    const timestamp = Math.round((new Date).getTime() / 1000);
    
    // Estraiamo il public_id
    const urlParts = originalImageUrl.split('/');
    const filename = urlParts.pop();
    const publicId = filename.split('.')[0];
    
    // Parametri per Viesus: correzione occhi rossi, luce e soprattutto PROSPETTIVA
    const transformation = "e_viesus_correct"; 

    // Generiamo la firma corretta per l'add-on
    const signatureStr = `public_id=${publicId}&timestamp=${timestamp}&transformation=${transformation}${CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

    // Costruiamo l'URL finale
    const straightenedUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformation}/v${timestamp}/${publicId}.jpg?api_key=${CLOUDINARY_API_KEY}&signature=${signature}`;
    
    // Verifichiamo se funziona (se l'add-on è attivo, risponde 200 OK)
    const checkRes = await fetch(straightenedUrl);
    
    let imageUrlForLeonardo = originalImageUrl; // Fallback: se fallisce, usiamo l'originale
    
    if (checkRes.ok) {
        // Se Viesus ha funzionato, usiamo l'immagine raddrizzata!
        // Nota: Viesus restituisce un JSON con l'url
        const data = await checkRes.json();
        imageUrlForLeonardo = data.secure_url || straightenedUrl;
        console.log("✅ Immagine raddrizzata con successo!");
    } else {
        console.warn("⚠️ Add-on Viesus non attivo o errore firma. Procedo con raddrizzamento base.");
        // Riprova con un raddrizzamento standard (meno potente ma non richiede add-on)
        imageUrlForLeonardo = originalImageUrl.replace("/upload/", "/upload/a_auto,e_improve,e_sharpen:50/");
    }

    // --- FASE 2: IL FOTOGRAFO (Leonardo Upscaler) ---
    // Ora passiamo l'immagine (sperabilmente dritta) a Leonardo per la qualità HD
    console.log("🎨 2. Sviluppo HD (Upscaler)...");

    const imageRes = await fetch(imageUrlForLeonardo);
    const imageBlob = await imageRes.blob();
    let fileExtension = 'jpg';
    if (imageBlob.type === 'image/png') fileExtension = 'png';

    // Init Upload
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

    // Upload
    const formData = new FormData();
    const fieldsParsed = JSON.parse(fields);
    for (const key in fieldsParsed) formData.append(key, fieldsParsed[key]);
    formData.append("file", imageBlob);

    await fetch(uploadUrl, { method: "POST", body: formData });

    // Upscale SICURO (Creativity 3 = Niente Piante)
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
        creativityStrength: 3, // Blocca le allucinazioni     
        prompt: "Real estate interior, straight lines, sharp focus, natural lighting"
      }),
    });

    const upData = await upRes.json();
    const generationId = upData.universalUpscaler?.id;
    
    if (!generationId) throw new Error("Upscale non avviato");

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

      if (job && job.status === "COMPLETE") {
        finalImageUrl = job.url;
      } else if (job && job.status === "FAILED") throw new Error("Leonardo Failed");
    }

    return NextResponse.json({ enhancedImageUrl: finalImageUrl });

  } catch (error: any) {
    console.error("❌ Errore:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
