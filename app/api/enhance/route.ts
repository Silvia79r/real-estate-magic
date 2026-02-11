import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// --- CONFIGURAZIONE ---
const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;
// 👇 INCOLLA QUI LE TUE CHIAVI
const CLOUDINARY_CLOUD_NAME = "dfzptsood"; 
const CLOUDINARY_API_KEY = "469877913569186"; 
const CLOUDINARY_API_SECRET = "L1RR-AzlrdZCosB-dSiGJSavxH0"; 

export async function POST(request: Request) {
  try {
    const { image: originalImageUrl } = await request.json();
    if (!originalImageUrl) return NextResponse.json({ error: "Manca l'URL dell'immagine" }, { status: 400 });

    console.log("🚀 Inizio Pipeline: Priorità Raddrizzamento...");

    // Setup Cloudinary Signature
    const crypto = require('crypto');
    const timestamp = Math.round((new Date).getTime() / 1000);
    const urlParts = originalImageUrl.split('/');
    const filename = urlParts.pop();
    const publicId = filename.split('.')[0];
    
    // --- FASE 1: GEOMETRA (Tentativo Viesus) ---
    // Viesus è l'unico che corregge la distorsione a barilotto (linee curve)
    console.log("📐 FASE 1: Tentativo correzione geometrica avanzata...");
    
    const transformation1 = "e_viesus_correct"; 
    const signatureStr1 = `public_id=${publicId}&timestamp=${timestamp}&transformation=${transformation1}${CLOUDINARY_API_SECRET}`;
    const signature1 = crypto.createHash('sha1').update(signatureStr1).digest('hex');
    const viesusUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformation1}/v${timestamp}/${publicId}.jpg?api_key=${CLOUDINARY_API_KEY}&signature=${signature1}`;
    
    let imageUrlForPhase2 = null;

    // Verifica FASE 1
    try {
        const res1 = await fetch(viesusUrl);
        if (res1.ok) {
            const data = await res1.json();
            imageUrlForPhase2 = data.secure_url || viesusUrl;
            console.log("✅ FASE 1 Riuscita: Geometria corretta.");
        }
    } catch (e) { console.log("⚠️ FASE 1 Fallita."); }

    // --- FASE 1-BIS: FALLBACK AGGRESSIVO (Se Viesus fallisce) ---
    if (!imageUrlForPhase2) {
        console.log("⚠️ FASE 1 Fallita. Attivo Raddrizzamento Forzato (Nativo)...");
        // e_improve: migliora contrasto per aiutare il rilevamento bordi
        // e_straighten: raddrizza
        // b_gen_fill: riempie i bordi
        const transformation2 = "e_improve,e_straighten,b_gen_fill:ignore-foreground_true";
        const signatureStr2 = `public_id=${publicId}&timestamp=${timestamp}&transformation=${transformation2}${CLOUDINARY_API_SECRET}`;
        const signature2 = crypto.createHash('sha1').update(signatureStr2).digest('hex');
        
        const fallbackUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformation2}/v${timestamp}/${publicId}.jpg?api_key=${CLOUDINARY_API_KEY}&signature=${signature2}`;
        
        // Se anche questo fallisce, lanciamo errore. Niente foto storte.
        const res2 = await fetch(fallbackUrl);
        if (!res2.ok) {
            throw new Error("Impossibile raddrizzare la foto automaticamente. L'angolazione è troppo estrema.");
        }
        // Se arriviamo qui, ha funzionato (o almeno ci ha provato nativamente)
        // Gestione risposta JSON o immagine diretta
        const contentType = res2.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await res2.json();
            imageUrlForPhase2 = data.secure_url;
        } else {
            imageUrlForPhase2 = fallbackUrl;
        }
        console.log("✅ FASE 1-BIS Riuscita: Raddrizzamento nativo applicato.");
    }

    // --- FASE 2: LUCI E COLORI (Cloudinary) ---
    // Ora che è dritta, sistemiamo la luce PRIMA di mandarla a Leonardo
    console.log("💡 FASE 2: Ottimizzazione Luci Pro...");
    const imageUrlForLeonardo = imageUrlForPhase2.replace(
        "/upload/", 
        "/upload/e_improve:outdoor:60,e_vibrance:40,e_contrast:20,q_auto:best/"
    );

    // --- FASE 3: RESTAURO HD (Leonardo Upscaler) ---
    console.log("🎨 FASE 3: Upscale HD (Creatività Minima)...");

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
    // Questo è fondamentale: a 1 pulisce solo i pixel e NON deforma le linee.
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
    if (!generationId) throw new Error("Upscale non avviato");

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
    // Qui restituiamo l'errore al frontend, così sai se il raddrizzamento è fallito
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
