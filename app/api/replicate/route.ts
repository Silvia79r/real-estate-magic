import { NextResponse } from "next/server";
import Replicate from "replicate";

export async function POST(req: Request) {
  try {
    const token = process.env.REPLICATE_API_TOKEN;
    
    if (!token) {
      return NextResponse.json({ error: "Token mancante su Vercel" }, { status: 500 });
    }

    const replicate = new Replicate({
      auth: token,
    });

    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "Nessuna immagine ricevuta" }, { status: 400 });
    }

    // MODELLO TEST GRATUITO (GFPGAN)
    const output = await replicate.run(
      "tencentarc/gfpgan:9283608cc6b7c96b060721fd99956519d77f0bb371e99877f30ba4d15bb26688",
      {
        input: {
          img: image,
          upscale: 2
        }
      }
    );

    return NextResponse.json({ output });
  } catch (error: any) {
    console.error("Errore Replicate:", error);
    return NextResponse.json({ 
      error: "Errore durante l'elaborazione: " + error.message 
    }, { status: 500 });
  }
}
