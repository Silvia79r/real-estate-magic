import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// 👇 👇 👇 INCOLLA QUI LA TUA CHIAVE LEONARDO (TRA LE VIRGOLETTE) 👇 👇 👇
// Esempio: const LEONARDO_API_KEY = "eyJhbGciOiJIUzI1Ni...";
const LEONARDO_API_KEY = "4bb36750-a725-4e79-9002-acda8a48a6e8"; 

export async function POST(request: Request) {
  try {
    const { image: originalImageUrl } = await request.json();
    
    // Controllo di sicurezza per ricordarti di mettere la chiave
    if (!LEONARDO_API_KEY || LEONARDO_API_KEY.includes("INCOLLA_QUI")) {
        return NextResponse.json({ error: "FERMA! Hai dimenticato di incollare la chiave di Leonardo nel codice (riga 8)!" }, { status: 500 });
    }

    console.log("🚀 MODO ARCHITETTO: Ricostruzione totale con Leonardo...");

    // 1. SCARICHIAMO L'IMMAGINE ORIGINALE (Quella storta)
    const imageRes = await fetch(originalImageUrl);
    const imageBlob = await imageRes.blob();
    
    // Gestione formato file
    let fileExtension = 'jpg';
    if (imageBlob.type === 'image/png') fileExtension = 'png';

    // 2. CHIEDIAMO IL PERMESSO A LEONARDO DI CARICARE LA FOTO
    const initImageRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/init-image", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${LEONARDO_API_KEY}`,
      },
      body: JSON.stringify({ extension: fileExtension }),
    });

    const initData = await initImageRes.json();
    if (!initData.uploadInitImage) throw new Error("Errore Connessione Leonardo: " + JSON.stringify(initData));
    const { url: uploadUrl, id: initImageId, fields } = initData.uploadInitImage;

    // 3. CARICHIAMO LA FOTO FISICAMENTE
    const formData = new FormData();
    const fieldsParsed = JSON.parse(fields);
    for (const key in fieldsParsed) formData.append(key, fieldsParsed[key]);
    formData.append("file", imageBlob);

    const uploadRes = await fetch(uploadUrl, { method: "POST", body: formData });
    if (!uploadRes.ok) throw new Error("Errore Upload Immagine su Leonardo");

    console.log("✅ Foto base caricata. Avvio AI Generativa...");

    // 4. GENERIAMO LA NUOVA FOTO (Image to Image)
    // Qui chiediamo a Leonardo di ridisegnare la stanza DRITTA
    const genRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/generations", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${LEONARDO_API_KEY}`,
      },
      body: JSON.stringify({
        height: 768, 
        width: 1024,
        modelId: "b24e16ff-06e3-43eb-8d33-4416c2d75876", // Modello Phoenix (Realistico)
        prompt: "Professional real estate photography, wide angle shot of a bedroom, perfectly straight vertical walls, symmetrical composition, 8k resolution, interior design magazine style, hyperrealistic, bright natural lighting",
        negative_prompt: "distorted, crooked, fish eye, curved lines, blurry, low quality, dark, ugly",
        init_image_id: initImageId, // Usiamo la tua foto come base
        init_strength: 0.55,        // Mantiene i mobili ma raddrizza i muri
        num_images: 1,
        public: false
      }),
    });

    const genData = await genRes.json();
    const generationId = genData.sdGenerationJob?.generationId;

    if (!generationId) {
        console.error("Leonardo Error:", genData);
        throw new Error("Leonardo non ha avviato il lavoro. Controlla i crediti o la chiave.");
    }

    // 5. ASPETTIAMO CHE FINISCA
    let finalImageUrl = null;
    let attempts = 0;
    while (!finalImageUrl && attempts < 60) {
      await new Promise((r) => setTimeout(r, 2000)); // Aspetta 2 secondi
      attempts++;
      
      const statusRes = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
        headers: { accept: "application/json", authorization: `Bearer ${LEONARDO_API_KEY}` },
      });
      
      const statusData = await statusRes.json();
      const job = statusData.generations_by_pk;

      if (job && job.status === "COMPLETE") {
        if (job.generated_images && job.generated_images.length > 0) {
            finalImageUrl = job.generated_images[0].url;
        }
      } else if (job && job.status === "FAILED") {
        throw new Error("Leonardo ha fallito la generazione");
      }
    }

    if (!finalImageUrl) throw new Error("Timeout Generazione");

    console.log("✨ FOTO RICOSTRUITA E DRITTA:", finalImageUrl);
    
    return NextResponse.json({ enhancedImageUrl: finalImageUrl });

  } catch (error: any) {
    console.error("❌ Errore:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
