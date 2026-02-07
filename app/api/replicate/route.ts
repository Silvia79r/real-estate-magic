import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.LEONARDO_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Chiave Leonardo mancante" }, { status: 500 });

    const { image } = await req.json();

    // 1. Chiediamo a Leonardo il permesso di caricare la foto
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
    const { uploadUrl, id: imageId } = initData.uploadInitImage;

    // 2. Trasferiamo fisicamente la foto su Leonardo
    const imageBlob = await fetch(image).then(res => res.blob());
    await fetch(uploadUrl, {
      method: "PUT",
      body: imageBlob,
      headers: { "Content-Type": "image/jpeg" }
    });

    // 3. Lanciamo il miglioramento professionale (Upscale)
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
    
    // Restituiamo l'ID del lavoro. L'app ora mostrerà i tasti di download
    return NextResponse.json({ output: upscaleData.sdUpscaleJob.id });

  } catch (error: any) {
    console.error("Errore:", error);
    return NextResponse.json({ error: "Connessione stabilita. Riprova ora!" }, { status: 500 });
  }
}
