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

    // MODELLO GRATUITO TOPAZ LABS (Dalla collezione Try-for-free)
    // Questo modello serve per pulire l'immagine e aumentarne la nitidezza
    const output = await replicate.run(
      "topazlabs/image-upscale:89d5828d570530b62e4975514f777c59c5d10526e0e676a086055d0cf880816a",
      {
        input: {
          image: image,
          upscale_factor: 2
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
