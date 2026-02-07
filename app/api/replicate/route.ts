import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.LEONARDO_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Chiave Leonardo mancante" }, { status: 500 });

    const { image } = await req.json();

    // 1. Chiediamo a Leonardo di migliorare l'immagine (Upscale)
    const response = await fetch("https://cloud.leonardo.ai/api/rest/v1/variations/upscale", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({ arg: { imageId: image } }) 
    });

    const data = await response.json();
    
    // Leonardo restituisce l'immagine migliorata
    return NextResponse.json({ output: data.sdUpscaleJob.generatedImageId });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
