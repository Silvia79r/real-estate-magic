import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Controllo Chiave
    const apiKey = process.env.LEONARDO_API_KEY;
    if (!apiKey) {
      console.error("API Key Leonardo mancante");
      return NextResponse.json({ error: "Errore Configurazione: Manca API Key su Vercel." }, { status: 500 });
    }

    // 2. Controllo Body e Immagine
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "Immagine troppo grande o dati non validi." }, { status: 400 });
    }

    const { image } = body;
    if (!image) {
      return NextResponse.json({ error: "Nessuna immagine ricevuta dal client." }, { status: 400 });
    }

    // 3. Conversione SICURA (Base64 -> Buffer)
    // Questo metodo evita l'errore "toString" che avevi prima
    const base64Data = image.includes("base64,") ? image.split("base64,")[1] : image;
    const imgBuffer = Buffer.from(base64Data, "base64");

    // 4. Init Upload su Leonardo
    const initRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/init-image", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({ extension: "jpg" })
    });

    if (!initRes.ok) {
      const errText = await initRes.text();
      throw new Error(`Leonardo Init Error: ${initRes.status} - ${errText}`);
    }
    
    const initData = await initRes.json();
    if (!initData.uploadInitImage) {
        throw new Error("Risposta Leonardo imprevista (uploadInitImage mancante)");
    }
    const { uploadUrl, id: imageId } = initData.uploadInitImage;

    // 5. Upload Immagine su S3
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      body: imgBuffer,
      headers: { "Content-Type": "image/jpeg" }
    });
    
    if (!uploadRes.ok) {
        throw new Error(`Errore Upload Immagine: ${uploadRes.status}`);
    }

    // 6. Avvia Generazione (Upscale)
    const upscaleRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/variations/upscale", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({ arg: { imageId: imageId } })
    });

    if (!upscaleRes.ok) throw new Error("Errore avvio Leonardo Upscale");
    
    const upscaleData = await upscaleRes.json();
    const generationId = upscaleData.sdUpscaleJob?.id;

    if (!generationId) throw new Error("ID Generazione mancante.");

    // 7. Attesa Risultato (Polling)
    let finalImageUrl = null;
    let attempts = 0;
    
    // Proviamo per 10 cicli (circa 20 secondi)
    while (attempts < 10 && !finalImageUrl) {
      await new Promise(r => setTimeout(r, 2000));
      
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

    if (!finalImageUrl) throw new Error("Timeout: Leonardo ci sta mettendo troppo tempo.");

    return NextResponse.json({ output: finalImageUrl });

  } catch (error: any) {
    console.error("CRITICAL BACKEND ERROR:", error);
    // Gestione errore sicura per evitare crash
    let msg = "Errore interno del server";
    if (error instanceof Error) msg = error.message;
    else if (typeof error === "string") msg = error;
    
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
