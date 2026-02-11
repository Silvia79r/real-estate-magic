import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// --- CONFIGURAZIONE ---
const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;

// 👇 I TUOI DATI CLOUDINARY
const CLOUDINARY_CLOUD_NAME = "dfzptsood"; 
const CLOUDINARY_API_KEY = "469877913569186"; // Sostituisci se non è questa
const CLOUDINARY_API_SECRET = "L1RR-AzlrdZCosB-dSiGJSavxH0"; // <--- RIMETTI IL SECRET QUI!!!

export async function POST(request: Request) {
  try {
    const { image: originalImageUrl } = await request.json();

    if (!originalImageUrl) return NextResponse.json({ error: "Manca l'URL dell'immagine" }, { status: 400 });

    console.log("🚀 Inizio Processo: RADDRIZZAMENTO FORZATO...");

    // --- FASE 1: RADDRIZZAMENTO AGGRESSIVO (Nativo Cloudinary) ---
    const crypto = require('crypto');
    const timestamp = Math.round((new Date).getTime() / 1000);
    
    // Estrazione ID
    const urlParts = originalImageUrl.split('/');
    const filename = urlParts.pop();
    const publicId = filename.split('.')[0];
    
    // *** CAMBIAMENTO CRUCIALE ***
    // Non usiamo più Viesus. Usiamo i comandi nativi geometrici.
    // e_straighten: cerca le linee e raddrizza
    // b_gen_fill: riempie i bordi vuoti con l'AI (perché raddrizzando si perde margine)
    // e_improve: sistema luci
    const transformation = "e_improve,e_straighten,b_gen_fill:ignore-foreground_true"; 

    // Firma di sicurezza (Obbligatoria per e_straighten)
    const signatureStr = `public_id=${publicId}&timestamp=${timestamp}&transformation=${transformation}${CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

    // URL Cloudinary Firmato
    const straightenedUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformation}/v${timestamp}/${publicId}.jpg?api_key=${CLOUDINARY_API_KEY}&signature=${signature}`;
    
    console.log("📐 Tentativo raddrizzamento:", straightenedUrl);

    // Verifica BLOCCANTE. Se non la raddrizza, ci fermiamo.
    const checkRes = await fetch(straightenedUrl);
    if (!checkRes.ok) {
        const errText = await checkRes.text();
        console.error("Errore Cloudinary:", errText);
        throw new Error("Cloudinary non è riuscito a raddrizzare la foto. Riprova con un'altra angolazione.");
    }
    
    // Se siamo qui, l'immagine è stata elaborata. La prendiamo.
    // Cloudinary a volte restituisce il file, a volte un JSON. Gestiamo entrambi.
    let imageUrlForLeonardo = straightenedUrl;
    const contentType = checkRes.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        const data = await checkRes.json();
        imageUrlForLeonardo = data.secure_url;
    }

    // --- FASE 2: LEONARDO UPSCALER (Solo Qualità) ---
    console.log("🎨 Passaggio a Leonardo...");

    const imageRes = await fetch(imageUrlForLeonardo);
    const imageBlob = await imageRes.blob();
    
    // Init Upload Leonardo
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
    const { url: uploadUrl, id: imageId, fields } = initData.uploadInitImage;

    // Upload Fisico
    const formData = new FormData();
    const fieldsParsed = JSON.parse(fields);
    for (const key in fieldsParsed) formData.append(key, fieldsParsed[key]);
    formData.append("file", imageBlob);

    await fetch(uploadUrl, { method: "POST", body: formData });

    // Upscale
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
        creativityStrength: 3, // Bassa per non fare danni     
        prompt: "Real estate interior, sharp focus, straight lines"
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
