import { NextResponse } from "next/server";

// Imposta timeout massimo per Vercel Hobby
export const maxDuration = 10; 
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. VERIFICA CHIAVE
    const apiKey = process.env.LEONARDO_API_KEY;
    
    // Log per debuggare su Vercel (non mostra la chiave intera per sicurezza)
    console.log("Verifica API Key:", apiKey ? `Presente (inizia con ${apiKey.substring(0, 4)}...)` : "ASSENTE - NULL");

    if (!apiKey) {
      return NextResponse.json({ error: "Configurazione Mancante: LEONARDO_API_KEY non trovata nelle Environment Variables di Vercel." }, { status: 500 });
    }

    const body = await req.json();
    const { image } = body;

    if (!image) return NextResponse.json({ error: "Nessuna immagine ricevuta." }, { status: 400 });

    // Pulizia Base64
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imgBuffer = Buffer.from(base64Data, "base64");

    // 2. Init Leonardo
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
        const txt = await initRes.text();
        throw new Error(`Leonardo Init Error (${initRes.status}): ${txt}`);
    }
    
    const initData = await initRes.json();
    const { uploadUrl, id: imageId } = initData.uploadInitImage;

    // 3. Upload
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      body: imgBuffer,
      headers: { "Content-Type": "image/jpeg" }
    });
    
    if (!uploadRes.ok) throw new Error(`Upload Fallito: ${uploadRes.status}`);

    // 4. Avvia Generazione (Upscale)
    const upscaleRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/variations/upscale", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({ arg: { imageId: imageId } })
    });

    if (!upscaleRes.ok) {
        const txt = await upscaleRes.text();
        throw new Error(`Upscale Avvio Fallito (${upscaleRes.status}): ${txt}`);
    }

    const upscaleData = await upscaleRes.json();
    const generationId = upscaleData.sdUpscaleJob?.id;

    // 5. Polling (Con timeout di sicurezza per Vercel)
    let finalImageUrl = null;
    const startTime = Date.now();
    
    while (!finalImageUrl) {
      // STOP se superiamo gli 8 secondi per evitare il crash di Vercel
      if (Date.now() - startTime > 8500) {
         throw new Error("TIMEOUT VERCEL: L'immagine sta venendo creata ma il server gratuito ha chiuso la connessione. Riprova tra poco.");
      }

      await new Promise(r => setTimeout(r, 1000));
      
      const checkRes = await fetch(`https://cloud.leonardo.ai/api/rest/v1/variations/${generationId}`, {
        method: "GET",
        headers: { "authorization": `Bearer ${apiKey}` }
      });

      if (checkRes.ok) {
        const checkData = await checkRes.json();
        const variation = checkData.generated_image_variation_generic?.[0];
        if (variation?.status === "COMPLETE") finalImageUrl = variation.url;
        else if (variation?.status === "FAILED") throw new Error("Leonardo ha fallito la generazione.");
      }
    }

    return NextResponse.json({ output: finalImageUrl });

  } catch (error: any) {
    console.error("Backend Error:", error);
    // Gestione errore sicura
    return NextResponse.json({ error: String(error.message || error) }, { status: 500 });
  }
}
