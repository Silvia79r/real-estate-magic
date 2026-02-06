import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  const { image } = await req.json();

  // Questo è il "modello" che raddrizza le foto e migliora la qualità
  const output = await replicate.run(
    "lucataco/real-esrgan:da6c52f07ef4664c3", 
    { input: { image: image } }
  );

  return NextResponse.json({ output });
}
