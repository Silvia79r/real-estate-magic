import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary'; 

export const dynamic = "force-dynamic";

// 👇 INSERISCI LE TUE CHIAVI
const CLOUDINARY_CLOUD_NAME = "dfzptsood"; 
const CLOUDINARY_API_KEY = "469877913569186"; 
const CLOUDINARY_API_SECRET = "L1RR-AzlrdZCosB-dSiGJSavxH0"; 

// Configurazione
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true
});

export async function POST(request: Request) {
  try {
    const { image: originalImageUrl } = await request.json();
    
    console.log("🚀 MODO EXPLICIT: Forzo la trasformazione sul server...");

    // 1. ESTRAZIONE CHIRURGICA DELL'ID
    // Dobbiamo trovare l'ID esatto (es. "folder/immagine") pulendo tutto il resto.
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/;
    const match = originalImageUrl.match(regex);
    
    if (!match || !match[1]) {
        throw new Error("Non riesco a trovare l'ID dell'immagine. URL strano.");
    }
    
    const publicId = match[1];
    console.log("👉 ID Trovato:", publicId);

    // 2. IL COMANDO "EXPLICIT" (L'unico che conta i crediti sul serio)
    // Questo obbliga Cloudinary a processare l'immagine ORA e salvarla.
    const result = await cloudinary.uploader.explicit(publicId, {
        type: "upload",
        eager: [
            { effect: "viesus_correct" } // Applica Viesus
        ]
    });

    console.log("✅ Cloudinary ha risposto!");

    // 3. RECUPERO URL
    // result.eager contiene l'immagine trasformata.
    if (result.eager && result.eager.length > 0) {
        const finalUrl = result.eager[0].secure_url;
        console.log("🔥 URL Viesus Definitivo:", finalUrl);
        return NextResponse.json({ enhancedImageUrl: finalUrl });
    } else {
        console.warn("⚠️ Viesus non applicato (nessun output eager).");
        // Fallback estremo se Viesus non parte
        return NextResponse.json({ enhancedImageUrl: originalImageUrl });
    }

  } catch (error: any) {
    console.error("❌ Errore:", error.message);
    // Se fallisce, restituiamo l'originale per non bloccare l'app, ma logghiamo l'errore
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
