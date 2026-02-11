import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary'; 

export const dynamic = "force-dynamic";

const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;

// 👇 INCOLLA LE TUE CHIAVI
const CLOUDINARY_CLOUD_NAME = "dfzptsood"; 
const CLOUDINARY_API_KEY = "469877913569186"; 
const CLOUDINARY_API_SECRET = "L1RR-AzlrdZCosB-dSiGJSavxH0"; 

// Configurazione Robot
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

    console.log("🚀 Inizio Processo 'SALTA OSTACOLO'...");

    let imageUrlForLeonardo = originalImageUrl; // Partiamo con l'originale come base sicura

    // --- TENTATIVO RADDRIZZAMENTO (Senza blocchi) ---
    try {
        // Estrazione ID sicura
        const parts = originalImageUrl.split('/upload/');
        if (parts.length > 1) {
            // Prendiamo la parte destra e togliamo l'estensione e la versione
            let publicId = parts[1];
            // Rimuove la versione v12345/ se c'è
            publicId = publicId.replace(/^v\d+\//, ''); 
            // Rimuove l'estensione .jpg/.png
            publicId = publicId.substring(0, publicId.lastIndexOf('.'));
            
            console.log("👉 ID estratto:", publicId);

            // Generiamo URL firmato
            const correctedUrl = cloudinary.url(publicId, {
                transformation: [
                    { effect: "distort:correction" }, // Toglie effetto pancia
                    { effect: "improve:outdoor:50" }, // Luce
                    { effect: "sharpen:60" }          // Nitidezza
                ],
                sign_url: true, 
                fetch_format: 'jpg'
            });

            console.log("👉 Tentativo download:", correctedUrl);

            // Proviamo a scaricarla
            const checkRes = await fetch(correctedUrl);
            
            if (checkRes.ok) {
                // SE FUNZIONA: Usiamo questa!
                console.log("✅ Cloudinary ha funzionato!");
                imageUrlForLeonardo = correctedUrl;
            } else {
                // SE FALLISCE: Non diamo errore rosso. Leggiamo il problema solo per i log server.
                const errText = await checkRes.text();
                console.warn("⚠️ Cloudinary ha rifiutato (Ignoro e proseguo):", errText);
                // Non facciamo 'throw', lasciamo che imageUrlForLeonardo resti l'originale
            }
        }
    } catch (e: any) {
        console.warn("⚠️ Errore nel blocco Cloudinary (Ignoro):", e.message);
        // Anche qui, ignoriamo e andiamo avanti
    }

    console.log("📸 Immagine scelta per Leonardo:", imageUrlForLeonardo);

    // --- FASE 2: LEONARDO UPSCALER ---
    console.log("🎨 Passaggio a Leonardo...");

    const imageRes = await fetch(imageUrlForLeonardo);
    const imageBlob = await imageRes.blob();
    
    // Gestione estensione
    let fileExtension = 'jpg';
    if (imageBlob.type === 'image/png') fileExtension = 'png';

    // 1. Init
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
    if (!initData.uploadInitImage) throw new Error("Errore Init Leonardo: " + JSON.stringify(initData));
    const { url: uploadUrl, id: imageId, fields } = initData.uploadInitImage;

    // 2. Upload
    const formData = new FormData();
    const fieldsParsed = JSON.parse(fields);
    for (const key in fieldsParsed) formData.append(key, fieldsParsed[key]);
    formData.append("file", imageBlob);

    const uploadRes = await fetch(uploadUrl, { method: "POST", body: formData });
    if (!uploadRes.ok) throw new Error("Errore Upload su Leonardo");

    // 3. Upscale (Creatività 1 per massima fedeltà)
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
        creativityStrength: 1, // Mantiene le linee il più possibile      
        prompt: "Real estate interior, sharp focus, clean straight lines"
      }),
    });

    const upData = await upRes.json();
    const generationId = upData.universalUpscaler?.id;
    
    // Se Leonardo fallisce l'avvio, restituiamo almeno l'immagine che avevamo
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
    console.error("❌ Errore Totale:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
