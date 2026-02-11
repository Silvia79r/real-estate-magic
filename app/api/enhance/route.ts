import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// --- CONFIGURAZIONE ---
const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;
// 👇 INCOLLA QUI LE TUE CHIAVI (Fondamentali per attivare Viesus)
const CLOUDINARY_CLOUD_NAME = "dfzptsood"; 
const CLOUDINARY_API_KEY = "469877913569186"; 
const CLOUDINARY_API_SECRET = "L1RR-AzlrdZCosB-dSiGJSavxH0"; 

export async function POST(request: Request) {
  try {
    const { image: originalImageUrl } = await request.json();
    if (!originalImageUrl) return NextResponse.json({ error: "Manca l'URL dell'immagine" }, { status: 400 });

    console.log("🚀 Inizio Processo VIESUS (Add-on Attivo)...");

    // Setup Firma (Obbligatoria per usare l'add-on Viesus)
    const crypto = require('crypto');
    const timestamp = Math.round((new Date).getTime() / 1000);
    const urlParts = originalImageUrl.split('/');
    const filename = urlParts.pop();
    const publicId = filename.split('.')[0];
    
    // --- FASE 1: GEOMETRA & LUCI (Viesus) ---
    // e_viesus_correct: Fa tutto lui. Raddrizza, illumina, corregge colori.
    // Non servono altri parametri.
    const transformation = "e_viesus_correct"; 
    
    const signatureStr = `public_id=${publicId}&timestamp=${timestamp}&transformation=${transformation}${CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');
    
    // URL Firmato Sicuro
    const viesusUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformation}/v${timestamp}/${publicId}.jpg?api_key=${CLOUDINARY_API_KEY}&signature=${signature}`;
    
    console.log("✅ Applicazione Viesus:", viesusUrl);

    // Scarichiamo il risultato di Viesus
    // Se Viesus è attivo, qui ci restituirà la foto raddrizzata e migliorata.
    const imageRes = await fetch(viesusUrl);
    
    if (!imageRes.ok) {
         // Se entra qui, c'è un problema con l'account Cloudinary o le chiavi
         const errText = await imageRes.text();
         console.error("Errore Viesus:", errText);
         throw new Error("L'add-on Viesus non ha risposto. Controlla che sia 'Active' nella dashboard Cloudinary.");
    }
    
    // Se siamo qui, Viesus ha funzionato!
    const imageBlob = await imageRes.blob();

    // --- FASE 2: LEONARDO UPSCALER (Solo Qualità HD) ---
    console.log("🎨 FASE 2: Leonardo Upscaler (Creatività Minima)...");

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

    // Upscale (Creatività 1 = Rispetto assoluto della geometria corretta da Viesus)
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
        creativityStrength: 1, // Non inventa nulla, pulisce e basta     
        prompt: "Real estate interior, sharp focus, clean lines, natural lighting"
      }),
    });

    const upData = await upRes.json();
    const generationId = upData.universalUpscaler?.id;
    if (!generationId) throw new Error("Upscale Leonardo non avviato");

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
