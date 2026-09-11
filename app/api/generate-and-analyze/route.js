import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const image = formData.get("image");
    const category = formData.get("category") || "Wayang & Dewa Nusantara";
    const customPrompt = formData.get("customPrompt") || "";

    if (!image) {
      return NextResponse.json(
        { error: "Gambar aset budaya wajib diunggah." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY belum dikonfigurasi di Vercel." },
        { status: 500 }
      );
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    const prompt = `
    Kamu adalah pakar Kebudayaan Nusantara, Semiotika Seni Tradisional, Fengshui Visual, dan NFT Metadata Evaluator.
    Analisis gambar karya seni bertema "${category}" ini. Keterangan tambahan dari kreator: "${customPrompt}".

    INSTRUKSI UTAMA:
    1. Deteksi atau hasilkan "asset_name" (Nama Karakter/Karya) dan "asset_id" (misal: "NUSA-#"+angka acak 6 digit atau baca dari gambar jika ada).
    2. Evaluasi tingkat kelangkaan (Rarity Evaluation):
       - "rarity_score": Angka dari 1 hingga 100 berdasarkan keunikan visual, ornamentasi, dan aura filosofis.
       - "rarity_tier": Pilih salah satu: "Common", "Rare", "Epic", "Legendary", "Mythic".
    3. Bedah elemen visual utama (Bentuk, Ornamen, Mahkota/Hiasan, Senjata/Pusaka, Warna Aura, Latar Belakang).
    4. Untuk setiap elemen berikan "visual_features", "filosofi_nusantara", dan "fengshui_energy".
    5. Hasilkan JSON Metadata NFT standar ERC-721/OpenSea di field "nft_metadata".
    6. DI AKHIR (field "disclaimer"), WAJIB cantumkan:
       "Analisis filosofi, fengshui visual, dan kalkulasi kelangkaan ini merupakan hasil intepretasi sistem AI Nusantara Engine. Hasil bersifat edukatif, apresiatif terhadap seni budaya, dan tidak wajib diyakini secara mutlak."

    Kembalikan Jawaban HANYA berupa JSON valid sesuai skema berikut:
    {
      "asset_name": "Nama Karya / Karakter",
      "asset_id": "Kode/ID Unik Aset",
      "category": "${category}",
      "rarity": {
        "score": 95,
        "tier": "Legendary"
      },
      "elements": {
        "mahkota_hiasan": { "visual_features": "...", "filosofi_nusantara": "...", "fengshui_energy": "..." },
        "pakaian_ornamen": { "visual_features": "...", "filosofi_nusantara": "...", "fengshui_energy": "..." },
        "pusaka_senjata": { "visual_features": "...", "filosofi_nusantara": "...", "fengshui_energy": "..." },
        "aura_warna": { "visual_features": "...", "filosofi_nusantara": "...", "fengshui_energy": "..." },
        "background": { "visual_features": "...", "filosofi_nusantara": "...", "fengshui_energy": "..." }
      },
      "nft_metadata": {
        "name": "...",
        "description": "...",
        "attributes": [
          { "trait_type": "Category", "value": "..." },
          { "trait_type": "Rarity Tier", "value": "..." },
          { "trait_type": "Rarity Score", "value": 95 }
        ]
      },
      "disclaimer": "Analisis filosofi, fengshui visual, dan kalkulasi kelangkaan ini merupakan hasil intepretasi sistem AI Nusantara Engine. Hasil bersifat edukatif, apresiatif terhadap seni budaya, dan tidak wajib diyakini secara mutlak."
    }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: image.type || "image/png",
        },
      },
    ]);

    let responseText = result.response.text();
    responseText = responseText.replace(/```json|```/g, "").trim();

    const parsedData = JSON.parse(responseText);
    return NextResponse.json(parsedData);

  } catch (error) {
    console.error("Nusantara Engine Error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memproses analisis seni budaya." },
      { status: 500 }
    );
  }
}
