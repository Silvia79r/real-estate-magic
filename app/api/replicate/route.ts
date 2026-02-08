import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.LEONARDO_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Chiave Leonardo mancante" }, { status: 500 });

    const { image } = await req.json();
    if (!image) return NextResponse.json({ error: "Nessuna immagine ricevuta" }, { status: 400 });

    // 1. Ottieni URL di upload da Leonardo
    const initRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/init-image", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({ extension: "jpg" })
    });

    if (!initRes.ok) throw new Error(`Errore Init Leonardo: ${initRes.status} ${initRes.statusText}`);
    const initData = await initRes.json();
    const { uploadUrl, id: imageId } = initData.uploadInitImage;

    // 2. Conversione Diretta (FIX per l'errore 'toString' e 'fetch')
    // Invece di usare fetch(image), convertiamo la stringa base64 direttamente in Buffer.
    // È molto più robusto e non dipende dalla connessione del server.
    const base64Data = image.includes("base64,") ? image.split("base64,")[1] : image;
    const imgBuffer = Buffer.from(base64Data, 'base64');

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      body: imgBuffer,
      headers: { "Content-Type": "image/jpeg" }
    });
    
    if (!uploadRes.ok) throw new Error("Errore durante il caricamento dell'immagine sui server Leonardo");

    // 3. Avvia la magia (Upscale)
    const upscaleRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/variations/upscale", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({ arg: { imageId: imageId } })
    });

    if (!upscaleRes.ok) throw new Error("Errore avvio elaborazione");
    const upscaleData = await upscaleRes.json();
    const generationId = upscaleData.sdUpscaleJob?.id;

    // 4. Attesa del risultato (30 secondi max)
    let finalImageUrl = null;
    let attempts = 0;
    
    while (attempts < 15 && !finalImageUrl) {
      await new Promise(r => setTimeout(r, 2000)); // Pausa 2 secondi
      
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
          throw new Error("Leonardo non è riuscito a elaborare questa specifica foto.");
        }
      }
      attempts++;
    }

    if (!finalImageUrl) {
      throw new Error("Il server è lento, ma la foto sta arrivando. Riprova tra poco.");
    }

    return NextResponse.json({ output: finalImageUrl });

  } catch (error: any) {
    console.error("Errore API:", error);
    // Protezione contro l'errore 'toString'
    const errMessage = (error && error.message) ? error.message : "Errore sconosciuto durante l'elaborazione";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
