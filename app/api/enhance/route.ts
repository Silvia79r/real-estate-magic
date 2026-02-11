import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// --- CONFIGURAZIONE ---
const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;

// 👇 INCOLLA QUI SOTTO I DATI DI CLOUDINARY (Tra le virgolette!)
const CLOUDINARY_CLOUD_NAME = "dfzptsood"; 
const CLOUDINARY_API_KEY = "469877913569186";     // Es: "1234567890"
const CLOUDINARY_API_SECRET = "L1RR-AzlrdZCosB-dSiGJSavxH0";   // Es: "abcde_12345"

export async function POST(request: Request) {
  try {
    const { image: originalImageUrl } = await request.json();

    if (!originalImageUrl) return NextResponse.json({ error: "Manca l'URL dell'immagine" }, { status: 400 });
    if (!LEONARDO_API_KEY) return NextResponse.json({ error: "Manca la chiave API di Leonardo" }, { status: 500 });

    console.log("🚀 Inizio Pipeline: Raddrizzamento + Upscale");

    // --- FASE 1: IL GEOMETRA (Cloudinary) ---
    // Prendiamo l'URL che ci arriva e aggiungiamo i comandi per raddrizzare e pulire.
    // e_improve: migliora luci e colori automaticamente
    // e_straighten: raddrizza le linee storte
    // q_auto:best: massima qualità jpg
    
    // Trucco: Manipoliamo l'URL per scaricare la versione già corretta
    const splitUrl = originalImageUrl.split("/upload/");
    if (splitUrl.length !== 2) throw new Error("URL Cloudinary non valido");
    
    // Creiamo l'URL "Magico" che raddrizza la foto
    const straightenedUrl = `${splitUrl[0]}/upload/e_improve,e_straighten,q_auto:best/${splitUrl[1]}`;
    
    console.log("📐 1. Geometra (Cloudinary): Foto raddrizzata ->", straightenedUrl);

    // Scarichiamo questa nuova versione "pulita"
    const imageRes = await fetch(straightenedUrl);
    if (!imageRes.ok) throw new Error("Impossibile scaricare l'immagine raddrizzata");
    const imageBlob = await imageRes.blob();
    
    // Definiamo estensione (serve a Leonardo)
    let fileExtension = 'jpg';
    if (imageBlob.type === 'image/png') fileExtension = 'png';


    // --- FASE 2: IL FOTOGRAFO (Leonardo Upscaler) ---
    console.log("🎨 2. Fotografo (Leonardo): Sviluppo alta definizione...");

    // Init Upload su Leonardo
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

    // Upload fisico dell'immagine (quella raddrizzata da Cloudinary)
    const formData = new FormData();
    const fieldsParsed = JSON.parse(fields);
    for (const key in fieldsParsed) formData.append(key, fieldsParsed[key]);
    formData.append("file", imageBlob);

    const uploadRes = await fetch(uploadUrl, { method: "POST", body: formData });
    if (!uploadRes.ok) throw new Error("Fallito upload immagine su Leonardo");

    // Avvio Upscaler
    const upRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/variations/universal-upscaler", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${LEONARDO_API_KEY}`,
      },
      body: JSON.stringify({
        initImageId: imageId,
        upscalerStyle: "CINEMATIC", // Stile realistico
        upscaleMultiplier: 1.5,     // Aumenta definizione
        creativityStrength: 3,      // BASSA: Pulisce ma NON inventa piante
        prompt: "Real estate interior, sharp focus, straight lines, bright natural lighting"
      }),
    });

    const upData = await upRes.json();
    if (upData.error) throw new Error(upData.error);
    
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
      
      // Controllo stato
      const job = statusData.generated_image_variation_generic?.[0];
      if (job && job.status === "COMPLETE") {
        finalImageUrl = job.url;
      } else if (job && job.status === "FAILED") {
        throw new Error("Leonardo Upscaler fallito");
      }
    }

    if (!finalImageUrl) throw new Error("Timeout Leonardo");

    return NextResponse.json({ enhancedImageUrl: finalImageUrl });

  } catch (error: any) {
    console.error("❌ Errore Backend:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
