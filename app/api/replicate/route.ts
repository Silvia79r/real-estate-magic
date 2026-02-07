import { NextResponse } from "next/server";
import Replicate from "replicate";

export async function POST(req: Request) {
  try {
    const token = process.env.REPLICATE_API_TOKEN;
    
    // Verifica corretta per Vercel
    if (!token) {
      console.error("ERRORE: REPLICATE_API_TOKEN non trovata nelle variabili di Vercel");
      return NextResponse.json({ error: "Configurazione Server Incompleta" }, { status: 500 });
    }

    const replicate = new Replicate({
      auth: token,
    });

    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "Nessuna immagine ricevuta" }, { status: 400 });
    }

    // Modello specifico per Real Estate (Migliora Luci, Colori e Dettagli)
    const output = await replicate.run(
      "lucataco/real-vis-xl-v4.0:2458a280f21017462001a140f28e20e8b7921ba37719601662580790586e376a",
      { 
        input: { 
          image: image,
          prompt: "Professional real estate photo, bright interior, straight lines, high quality, 8k",
          denoising_strength: 0.5
        } 
      }
    );

    return NextResponse.json({ output });
  } catch (error: any) {
    console.error("Errore Replicate:", error);
    return NextResponse.json({ error: error.message || "Errore durante l'elaborazione" }, { status: 500 });
  }
}
