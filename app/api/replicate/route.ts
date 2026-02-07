import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.LEONARDO_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Chiave Leonardo mancante" }, { status: 500 });

    const { image } = await req.json();

    // STEP 1: Chiediamo a Leonardo un permesso per caricare l'immagine
    const getUploadUrl = await fetch("https://cloud.leonardo.ai/api/rest/v1/init-image", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({ extension: "jpg" })
    });

    const uploadData = await getUploadUrl.json();
    const imageId = uploadData.uploadInitImage.id;

    // STEP 2: Usiamo l'intelligenza di Leonardo per migliorare la foto (Upscale)
    const upscaleResponse = await fetch("https://cloud.leonardo.ai/api/rest/v1/variations/upscale", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({ arg: { imageId: imageId } })
    });

    const upscaleData = await upscaleResponse.json();
    
    // Inviamo il link finale all'app
    return NextResponse.json({ output: upscaleData.sdUpscaleJob.id });

  } catch (error: any) {
    console.error("Errore Leonardo:", error);
    return NextResponse.json({ error: "Errore durante l'elaborazione con Leonardo" }, { status: 500 });
  }
}
