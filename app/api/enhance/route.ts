import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary'; 

// QUESTA È UN'OPERAZIONE DI DEBUG CRITICO.
// SE QUESTO NON FUNZIONA, IL PROBLEMA SONO LE CHIAVI O L'ACCOUNT CLOUDINARY.

// 👇 👇 👇 INCOLLA QUI I TUOI DATI VERI. NON LASCIARE SPAZI. 👇 👇 👇
const CLOUDINARY_CLOUD_NAME = "dfzptsood"; 
const CLOUDINARY_API_KEY = "469877913569186"; 
const CLOUDINARY_API_SECRET = "L1RR-AzlrdZCosB-dSiGJSavxH0"; 

// Configuriamo il robot con i dati scritti a mano qui sopra.
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true
});

export async function POST(request: Request) {
  console.log("🔥 INIZIO TEST NUCLEARE CLOUDINARY 🔥");
  console.log("Configurazione usata (Cloud Name):", CLOUDINARY_CLOUD_NAME);
  // Non logghiamo key e secret per sicurezza, ma sappiamo che sono quelli sopra.

  const { image: originalImageUrl } = await request.json();
  if (!originalImageUrl) throw new Error("Manca l'immagine!");

  console.log("📸 Immagine originale:", originalImageUrl);

  // --- IL TEST ---
  // Chiediamo a Cloudinary di prendere l'immagine originale,
  // applicare la correzione lente, migliorare la luce, e ridarcela.
  // USIAMO IL METODO UPLOADER.UPLOAD CHE È IL PIÙ DIRETTO.
  
  const result = await cloudinary.uploader.upload(originalImageUrl, {
      // Queste sono le trasformazioni che VOGLIAMO vedere
      transformation: [
          { effect: "distort:correction" }, // Toglie la "pancia" ai muri
          { effect: "improve:outdoor:60" }, // Luce forte
          { effect: "sharpen:100" }         // Nitidezza massima
      ],
      // Questo dice a Cloudinary di non salvare una copia nuova ma di sovrascrivere
      // temporaneamente per farci vedere il risultato.
      overwrite: true, 
      folder: "test_debug" 
  });

  console.log("✅ RISULTATO CLOUDINARY:", result);

  // Se arriviamo qui, ha funzionato e ha consumato un credito.
  // Restituiamo direttamente l'immagine di Cloudinary. Niente Leonardo per ora.
  return NextResponse.json({ enhancedImageUrl: result.secure_url });
}
