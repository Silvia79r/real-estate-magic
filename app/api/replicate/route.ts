import { NextResponse } from "next/server";

// Impostazioni per Vercel
export const maxDuration = 10; 
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. PULIZIA DELLA CHIAVE (Il Fix Importante)
    let apiKey = process.env.LEONARDO_API_KEY || "";
    
    // Rimuove spazi vuoti e "Bearer " se per sbaglio lo hai copiato
    apiKey = apiKey.trim().replace(/^Bearer\s+/i, "");

    if (!apiKey) {
      console.error("❌ ERRORE: Chiave non trovata.");
      return NextResponse.json({ error: "Chiave API mancante su Vercel." }, { status: 500 });
    }

    const body = await req.json();
    const { image } = body;

    if (!image) return NextResponse.json({ error: "Nessuna immagine ricevuta." }, { status: 400 });

    // 2. RILEVAMENTO FORMATO (JPG o PNG?)
    // Se invii un PNG dicendo che è JPG, Leonardo si blocca. Questo lo risolve.
    let extension = "jpg";
    if (image.startsWith("data:image/png")) extension = "png";
    else if (image.startsWith("data:image/webp")) extension = "webp";

    // Pulizia dati immagine
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imgBuffer = Buffer.from(base64Data, "base64");

    // 3. INIT (Chiediamo il permesso a Leonardo)
    const initRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/init-image", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}` // Qui aggiungiamo noi il Bearer corretto
      },
      body: JSON.stringify({ extension })
    });

    if (!initRes.ok) {
        // Se fallisce qui, è al 100% colpa della chiave o dei crediti finiti
        const errTxt = await initRes.text();
        console.error("❌ Leonardo Init Fallito:", errTxt);
        throw new Error(`Errore Autenticazione Leonardo: ${initRes.status}`);
    }
    
    const initData = await initRes.json();
    const { uploadUrl, id: imageId } = initData.uploadInitImage;

    // 4. UPLOAD (Inviamo la foto)
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      body: imgBuffer,
      headers: { "Content-Type": `image/${extension}` }
    });
    
    if (!uploadRes.ok) throw new Error("Errore durante il caricamento della foto.");

    // 5. UPSCALE (Avviamo la magia)
    const upscaleRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/variations/upscale", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({ arg: { imageId: imageId } })
    });

    if (!upscaleRes.ok) throw new Error("Leonardo non è riuscito ad avviare il lavoro.");

    const upscaleData = await upscaleRes.json();
    const generationId = upscaleData.sdUpscaleJob?.id;

    // 6. ATTESA (Polling veloce)
    // Ho ridotto i tempi per evitare il timeout di Vercel
    let finalImageUrl = null;
    const startTime = Date.now();
    
    while (!finalImageUrl) {
      // Se passano 9 secondi, ci fermiamo per non far crashare il sito
      if (Date.now() - startTime > 9000) {
         throw new Error("TIMEOUT: Il server ci ha messo troppo. Riprova, l'immagine potrebbe essere pronta al prossimo click.");
      }

      await new Promise(r => setTimeout(r, 1000));
      
      const checkRes = await fetch(`https://cloud.leonardo.ai/api/rest/v1/variations/${generationId}`, {
        method: "GET",
        headers: { "authorization": `Bearer ${apiKey}` }
      });

      if (checkRes.ok) {
        const checkData = await checkRes.json();
        const variation = checkData.generated_image_variation_generic?.[0];
        
        if (variation?.status === "COMPLETE") {
            finalImageUrl = variation.url;
        } else if (variation?.status === "FAILED") {
            throw new Error("Leonardo ha fallito la generazione.");
        }
      }
    }

    return NextResponse.json({ output: finalImageUrl });

  } catch (error: any) {
    console.error("❌ ERRORE CRITICO BACKEND:", error);
    return NextResponse.json({ error: String(error.message || "Errore sconosciuto") }, { status: 500 });
  }
}
