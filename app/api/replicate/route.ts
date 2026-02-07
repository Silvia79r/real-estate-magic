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

    // MODELLO ULTRA-STABILE E SOLITAMENTE GRATUITO
    const output = await replicate.run(
      "sczhou/codeformer:7de2ea4a3562d28d11c6d1d7fa571ec9034cfc7833b45e6f0adef54999c63fe1",
      {
        input: {
          image: image,
          upscale: 2,
          face_upsample: false,
          background_enhance: true,
          codeformer_fidelity: 0.7
        }
      }
    );

    return NextResponse.json({ output });
  } catch (error: any) {
    console.error("Errore Replicate:", error);
    return NextResponse.json({ 
      error: "Riprova tra un minuto: " + error.message 
    }, { status: 500 });
  }
}
