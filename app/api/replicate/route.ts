import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.LEONARDO_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Chiave Leonardo mancante" }, { status: 500 });

    const { image } = await req.json();

    // 1. Carichiamo l'immagine su Leonardo per l'elaborazione
    const initRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/init-image", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({ extension: "jpg" })
    });

    const initData = await initRes.json();
    const imageId = initData.uploadInitImage.id;

    // 2. Chiediamo il miglioramento (Upscale)
    const upscaleRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/variations/upscale", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({ arg: { imageId: imageId } })
    });

    const upscaleData = await upscaleRes.json();
    
    // Leonardo lavora in differita, quindi restituiamo l'ID del lavoro
    // L'app userà questo ID per scaricare la foto finale
    return NextResponse.json({ output: upscaleData.sdUpscaleJob.id });

  } catch (error: any) {
    console.error("Errore Leonardo:", error);
    return NextResponse.json({ error: "Errore tecnico Leonardo" }, { status: 500 });
  }
}
