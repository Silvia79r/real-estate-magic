import { NextResponse } from "next/server";
import Replicate from "replicate";

export async function POST(req: Request) {
  try {
    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) return NextResponse.json({ error: "Token mancante" }, { status: 500 });

    const replicate = new Replicate({ auth: token });
    const { image } = await req.json();

    // VERSIONE AGGIORNATA E PUBBLICA
    const output = await replicate.run(
      "lucataco/real-vis-xl-v4.0:2458a280f21017462001a140f28e20e8b7921ba37719601662580790586e376a",
      {
        input: {
          image: image,
          prompt: "Professional real estate photography, high dynamic range, balanced lighting, cinematic, 8k",
        }
      }
    );

    return NextResponse.json({ output });
  } catch (error: any) {
    console.error("Errore Replicate:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
