import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.LEONARDO_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Chiave Leonardo mancante" }, { status: 500 });

    const { image } = await req.json();
    
    // Controllo extra: se non c'è l'immagine, fermiamoci subito
    if (!image) return NextResponse.json({ error: "Nessuna immagine inviata" }, { status: 400 });

    // 1. Chiediamo a Leonardo il permesso di upload
    const initRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/init-image", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({ extension: "jpg" })
    });

    if (!initRes.ok) throw new Error(`Errore Init: ${initRes.statusText}`);
    const initData = await initRes.json();
    const { uploadUrl, id: imageId } = initData.uploadInitImage;

    // 2. Carichiamo l'immagine (Metodo Buffer)
    const imgFetch = await fetch(image);
    const imgArrayBuffer = await imgFetch.arrayBuffer();
    const imgBuffer = Buffer.from(imgArrayBuffer);

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      body: imgBuffer,
      headers: { "Content-Type": "image/jpeg" }
    });
    
    if (!uploadRes.ok) throw new Error("Errore Upload Immagine su Leonardo");

    // 3. Avviamo l'Upscale
    const upscaleRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/variations/upscale", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({ arg: { imageId: imageId } })
    });

    if (!upscaleRes.ok) throw new Error("Errore Avvio Job");
    const upscaleData = await upscaleRes.json();
    const generationId = upscaleData.sdUpscaleJob?.id;

    // 4. CICLO DI ATTESA ESTESO (30 Secondi)
    // Modifica cruciale: aumentato da 5 a 15 tentativi
    let finalImageUrl = null;
    let attempts = 0;
    
    while (attempts < 15 && !finalImageUrl) {
      await new Promise(r => setTimeout(r, 2000)); // Aspetta 2 secondi
      
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
      attempts++;
    }

    if (!finalImageUrl) {
      throw new Error("Tempo scaduto: Leonardo è molto carico oggi. Riprova.");
    }

    return NextResponse.json({ output: finalImageUrl });

  } catch (error: any) {
    console.error("Errore Backend:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
