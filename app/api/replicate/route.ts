import { NextResponse } from "next/server";

export const maxDuration = 10; // Imposta il limite esplicito per Vercel
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.LEONARDO_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API Key mancante su Vercel" }, { status: 500 });

    const body = await req.json();
    const { image } = body;

    if (!image) return NextResponse.json({ error: "Nessuna immagine ricevuta" }, { status: 400 });

    // Conversione Immagine
    const base64Data = image.includes("base64,") ? image.split("base64,")[1] : image;
    const imgBuffer = Buffer.from(base64Data, "base64");

    // 1. Init Upload (Veloce)
    const initRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/init-image", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({ extension: "jpg" })
    });

    if (!initRes.ok) throw new Error("Errore Init Leonardo");
    const initData = await initRes.json();
    const { uploadUrl, id: imageId } = initData.uploadInitImage;

    // 2. Upload (Veloce se il file è piccolo)
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      body: imgBuffer,
      headers: { "Content-Type": "image/jpeg" }
    });
    
    if (!uploadRes.ok) throw new Error("Errore Upload su Leonardo");

    // 3. Avvia Generazione (Upscale)
    const upscaleRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/variations/upscale", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({ arg: { imageId: imageId } })
    });

    if (!upscaleRes.ok) throw new Error("Errore Avvio Job Leonardo");
    const upscaleData = await upscaleRes.json();
    const generationId = upscaleData.sdUpscaleJob?.id;

    // 4. GARA CONTRO IL TEMPO
    // Aspettiamo il risultato, ma se passano 8 secondi ci fermiamo per non far crashare Vercel
    let finalImageUrl = null;
    const startTime = Date.now();
    
    while (!finalImageUrl) {
      // Se sono passati più di 8 secondi, usciamo dal loop PRIMA che Vercel ci uccida
      if (Date.now() - startTime > 8000) {
        throw new Error("TIMEOUT_SICUREZZA");
      }

      await new Promise(r => setTimeout(r, 1000)); // Aspetta 1 secondo
      
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
    console.error("Backend Error:", error);
    
    // Gestione specifica del Timeout
    if (error.message === "TIMEOUT_SICUREZZA") {
      return NextResponse.json({ 
        error: "Il server ci sta mettendo troppo tempo (limite 10s). Riprova, a volte Leonardo è più veloce." 
      }, { status: 504 });
    }

    const msg = error instanceof Error ? error.message : "Errore generico";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
