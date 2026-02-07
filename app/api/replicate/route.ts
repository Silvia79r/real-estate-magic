import { NextResponse } from "next/server"; import Replicate from "replicate";

export async function POST(req: Request) { try { const token = process.env.REPLICATE_API_TOKEN;

} catch (error: any) { console.error("Errore Replicate:", error); return NextResponse.json({ error: "Errore: " + error.message }, { status: 500 }); } }
