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
      "nightmareai/real-esrgan:42fed1c4974146d7d24172ad2aa908285744133423b497184281363653f86e92",
      { 
        input: { 
          image: image,
          upscale: 2,
          face_enhance: false
        } 
      }
    );

    return NextResponse.json({ output });
  } catch (error: any) {
    console.error("Errore Replicate:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
