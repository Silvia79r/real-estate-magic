import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// --- CONFIGURAZIONE ---
const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;

// 👇 INCOLLA QUI I TUOI DATI CLOUDINARY (Dashboard)
const CLOUDINARY_CLOUD_NAME = "dfzptsood"; 
const CLOUDINARY_API_KEY = "469877913569186"; 
const CLOUDINARY_API_SECRET = "L1RR-AzlrdZCosB-dSiGJSavxH0"; 

export async function POST(request: Request) {
  try {
    const { image: originalImageUrl } = await request.json();

    if (!originalImageUrl) return NextResponse.json({ error: "Manca l'URL dell'immagine" }, { status: 400 });

    console.log("🚀 Inizio Processo Intelligente (Fallback Safe)...");

    // --- FASE 1: GEOMETRA (Con Piano di Riserva) ---
    const crypto = require('crypto');
    const timestamp = Math.round((new Date).getTime() / 1000);
    
    // Prepariamo il tentativo di raddrizzamento
    const urlParts = originalImageUrl.split('/');
    const filename = urlParts.pop();
    const publicId = filename.split('.')[0];
    
    // Tentativo: Raddrizza + Riempi bordi + Migliora
    const transformation = "e_improve,e_straighten,b_gen_fill:ignore-foreground_true"; 
    const signatureStr = `public_id=${publicId}&timestamp=${timestamp}&transformation=${transformation}${CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

    const straightenedUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformation}/v${timestamp}/${publicId}.jpg?api_key=${CLOUDINARY_API_KEY}&signature=${signature}`;
    
    // VERIFICA: Funziona o fallisce?
    let imageUrlForLeonardo = straightenedUrl;
    
    try {
        const checkRes = await fetch(straightenedUrl);
        if (!checkRes.ok) {
            throw new Error("Raddrizzamento fallito");
        }
        // Se siamo qui, ha funzionato! Controlliamo se è un JSON o un'immagine
        const contentType = checkRes.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await checkRes.json();
            imageUrlForLeonardo = data.secure_url;
        }
        console.log("✅ Raddrizzamento riuscito!");
    } catch (err) {
        // PIANO B: Se il raddrizzamento fallisce, NON ci fermiamo.
        console.warn("⚠️ Raddrizzamento impossibile. Attivo Piano B (Solo Luce/Nitidezza).");
        
        // Usiamo l'immagine originale ma applichiamo filtri di pulizia potenti
        // e_improve: Luce e Colore
        // e_sharpen:60: Nitidezza (rimuove il "mosso")
        imageUrlForLeonardo = originalImageUrl.replace("/upload/", "/upload/e_improve,e_sharpen:60/");
    }

    // --- FASE 2: FOTOGRAFO (Leonardo Upscaler) ---
    console.log("🎨 Passaggio a Leonardo per HD...");

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

    // Upscale (Modalità Conservativa - Niente Piante)
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
        creativityStrength: 3, // SICUREZZA: Mantiene i mobili originali     
        prompt: "Real estate interior, sharp focus, bright natural lighting, clear details"
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
