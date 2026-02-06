import { NextResponse } from "next/server";
import Replicate from "replicate";

export async function POST(req: Request) {
  try {
    const token = process.env.REPLICATE_API_TOKEN;
    
    if (!token) {
      return NextResponse.json({ error: "Chiave API mancante su Netlify" }, { status: 500 });
    }

    const replicate = new Replicate({
      auth: token,
    });

    const { image } = await req.json();

    // Usiamo un modello super veloce per il test
    const output = await replicate.run(
      "lucataco/real-esrgan:da6c52f07ef4664c3",
      { input: { image: image } }
    );

    return NextResponse.json({ output });
  } catch (error: any) {
    console.error("Errore Dettagliato:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
