import { NextResponse } from "next/server";
import Replicate from "replicate";

export async function POST(req: Request) {
  try {
    // 1. Recupero del token dalle variabili d'ambiente di Vercel
    const token = process.env.REPLICATE_API_TOKEN;
    
    // 2. Controllo critico: se manca il token, lo segnaliamo nei log
    if (!token) {
      console.error("ERRORE: Variabile REPLICATE_API_TOKEN non trovata nel sistema.");
      return NextResponse.json({ error: "Configurazione Server Incompleta (Manca Token)" }, { status: 500 });
    }

    const replicate = new Replicate({
      auth: token,
    });

    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "Nessuna immagine fornita" }, { status: 400 });
    }

    // 3. Esecuzione del modello professionale per Real Estate
    const output = await replicate.run(
      "lucataco/real-vis-xl-v4.0:2458a280f21017462001a140f28e20e8b7921ba37719601662580790586e376a",
      { 
        input: { 
          image: image,
          prompt: "Professional real estate photography, high quality, balanced lighting, cinematic, 8k",
        } 
      }
    );

    return NextResponse.json({ output });
  } catch (error: any) {
    console.error("Errore Dettagliato Replicate:", error);
    // Restituiamo l'errore specifico per capire se è un problema di soldi, token o formato
    return NextResponse.json({ error: error.message || "Errore di connessione con l'AI" }, { status: 500 });
  }
}
