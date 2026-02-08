import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.LEONARDO_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Chiave Leonardo mancante su Vercel" }, { status: 500 });

    const { image } = await req.json();

    // 1. Ottieni URL presigned per l'upload
    const initRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/init-image", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({ extension: "jpg" })
    });
    
    if (!initRes.ok) throw new Error("Errore Init Leonardo: " + initRes.statusText);
    const initData = await initRes.json();
    const { uploadUrl, id: imageId } = initData.uploadInitImage;

    // 2. Carica l'immagine (blob)
    const imageBlob = await fetch(image).then(res => res.blob());
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      body: imageBlob,
      headers: { "Content-Type": "image/jpeg" }
    });
    if (!uploadRes.ok) throw new Error("Errore Upload Immagine");

    // 3. Avvia l'Upscale
    const upscaleRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/variations/upscale", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({ arg: { imageId: imageId } })
    });

    if (!upscaleRes.ok) throw new Error("Errore Avvio Upscale: " + upscaleRes.statusText);
    const upscaleData = await upscaleRes.json();
    const generationId = upscaleData.sdUpscaleJob?.id;

    if (!generationId) throw new Error("Nessun ID generazione ricevuto da Leonardo");

    // 4. CICLO DI ATTESA (Polling): Aspettiamo che la foto sia pronta
    let finalImageUrl = null;
    let attempts = 0;
    
    // Controlliamo per massimo 30 secondi (15 tentativi da 2 secondi)
    while (attempts < 15 && !finalImageUrl) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Aspetta 2 secondi
      
      const checkRes = await fetch(`https://cloud.leonardo.ai/api/rest/v1/variations/${generationId}`, {
        method: "GET",
        headers: {
          "accept": "application/json",
          "authorization": `Bearer ${apiKey}`
        }
      });

      if (checkRes.ok) {
        const checkData = await checkRes.json();
        const variation = checkData.generated_image_variation_generic[0];
        
        if (variation && variation.status === "COMPLETE") {
          finalImageUrl = variation.url; // TROVATA!
        } else if (variation && variation.status === "FAILED") {
          throw new Error("Leonardo ha fallito la generazione");
        }
      }
      attempts++;
    }

    if (!finalImageUrl) {
      throw new Error("Tempo scaduto: Leonardo ci sta mettendo troppo.");
    }

    // 5. Restituisci l'URL finale pronto per il download
    return NextResponse.json({ output: finalImageUrl });

  } catch (error: any) {
    console.error("Errore completo:", error);
    // Qui mostriamo l'errore VERO, non messaggi generici
    return NextResponse.json({ error: error.message || "Errore sconosciuto" }, { status: 500 });
  }
}
