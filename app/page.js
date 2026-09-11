"use client";

import { useState } from "react";

export default function NusantaraEngineHome() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [category, setCategory] = useState("Wayang & Dewa Nusantara");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);

  const categories = [
    "Wayang & Dewa Nusantara",
    "Motif Batik & Tekstil Kuno",
    "Ukiran & Arsitektur Candi",
    "Senjata Pusaka & Keris",
    "Mitologi & Makhluk Mistis Nusantara"
  ];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setErrorMsg(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Pilih atau unggah gambar aset seni terlebih dahulu!");

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("category", category);
    formData.append("customPrompt", customPrompt);

    try {
      const res = await fetch("/api/generate-and-analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Gagal menganalisis aset budaya.");
      }

      setResult(data);
    } catch (err) {
      setErrorMsg(err.message || "Koneksi terganggu. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const getRarityBadgeColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case "mythic": return "bg-rose-500 text-white border-rose-400";
      case "legendary": return "bg-amber-500 text-slate-950 border-amber-300 font-extrabold";
      case "epic": return "bg-purple-600 text-white border-purple-400";
      case "rare": return "bg-blue-600 text-white border-blue-400";
      default: return "bg-slate-700 text-slate-200 border-slate-600";
    }
  };

  const getFormattedSummaryText = () => {
    if (!result) return "";
    let text = `🏛️ NUSANTARA AI CULTURAL ART & RARITY EVALUATION 🏛️\n`;
    text += `📛 Karya: ${result.asset_name || "Aset Budaya"}\n`;
    text += `🆔 ID Aset: ${result.asset_id}\n`;
    text += `🏷️ Kategori: ${result.category}\n`;
    text += `💎 Rarity Tier: ${result.rarity?.tier} (Score: ${result.rarity?.score}/100)\n\n`;

    if (result.elements) {
      Object.entries(result.elements).forEach(([key, val]) => {
        if (val) {
          text += `🔹 [${key.replace('_', ' ').toUpperCase()}]\n`;
          if (val.visual_features) text += `• Visual: ${val.visual_features}\n`;
          if (val.filosofi_nusantara) text += `• Filosofi: ${val.filosofi_nusantara}\n`;
          if (val.fengshui_energy) text += `• Energi/Fengshui: ${val.fengshui_energy}\n\n`;
        }
      });
    }

    if (result.disclaimer) {
      text += `📌 ${result.disclaimer}`;
    }
    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFormattedSummaryText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    const text = getFormattedSummaryText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Nusantara AI Art: ${result?.asset_name}`,
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share canceled", err);
      }
    } else {
      handleCopy();
      alert("Teks ringkasan telah disalin ke clipboard!");
    }
  };

  const shareToX = () => {
    const text = encodeURIComponent(`Lihat analisis Rarity & Filosofi Aset Seni Budaya Nusantara ini (${result?.asset_name}):\n${window.location.href}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const shareToFB = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 max-w-2xl mx-auto font-sans pb-24">
      {/* Header */}
      <header className="text-center my-6">
        <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
          Nusantara AI Academy & Engine
        </span>
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-400 to-amber-500 mt-2">
          Cultural Art & Rarity Engine
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Preservasi Budaya Nusantara, Evaluasi Rarity NFT, & Analisis Semiotika AI
        </p>
      </header>

      {/* Form Upload & Parameter */}
      <form onSubmit={handleSubmit} className="bg-slate-900/90 p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl backdrop-blur">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            1. Pilih Kategori Seni Budaya:
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl p-3 border border-slate-800 focus:outline-none focus:border-amber-500"
          >
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            2. Catatan / Konsep Kreator (Opsional):
          </label>
          <input
            type="text"
            placeholder="Contoh: Dewa Antareja bertema neon cyber-wayang..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl p-3 border border-slate-800 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            3. Unggah Gambar Karya Seni Budaya:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-xs text-slate-400 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gradient-to-r file:from-amber-500 file:to-orange-500 file:text-slate-950 cursor-pointer"
          />
        </div>

        {preview && (
          <div className="flex justify-center my-3">
            <img
              src={preview}
              alt="Preview Aset"
              className="max-h-64 rounded-xl border border-slate-700 object-contain shadow-lg"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-sm transition shadow-lg tracking-wide uppercase"
        >
          {loading ? "Menganalisis Rarity & Semiotika..." : "🚀 Analisis Rarity & Budaya"}
        </button>
      </form>

      {/* Error Message */}
      {errorMsg && (
        <div className="mt-6 p-4 bg-red-950/80 border border-red-800 rounded-xl text-red-200 text-xs">
          <p className="font-bold mb-1">Gagal Memproses:</p>
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Hasil Evaluasi */}
      {result && (
        <section className="mt-8 space-y-6">
          {/* Rarity & Identity Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl border border-amber-500/30 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-start gap-3">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                  {result.category}
                </span>
                <h2 className="text-xl font-extrabold text-white mt-0.5">
                  {result.asset_name || "Aset Budaya"}
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {result.asset_id}</p>
              </div>

              {/* Rarity Badge */}
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs border font-black uppercase tracking-wider shadow ${getRarityBadgeColor(result.rarity?.tier)}`}>
                  {result.rarity?.tier || "Common"}
                </span>
                <p className="text-[11px] text-slate-300 mt-1 font-semibold">
                  Score: <span className="text-amber-400 font-bold">{result.rarity?.score}</span>/100
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-800">
              <button
                onClick={handleCopy}
                className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 border border-slate-700 transition"
              >
                {copied ? "✓ Tersalin!" : "📋 Salin Ringkasan"}
              </button>
              
              <button
                onClick={handleNativeShare}
                className="flex-1 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-xs font-bold rounded-lg text-slate-950 transition shadow"
              >
                📲 Berbagi
              </button>

              <button
                onClick={() => setShowMetadata(!showMetadata)}
                className="w-full sm:w-auto px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-indigo-300 border border-indigo-900/50 transition"
              >
                {showMetadata ? "Sembunyikan Metadata JSON" : "📦 View NFT Metadata JSON"}
              </button>
            </div>
          </div>

          {/* Direct Social Share */}
          <div className="flex items-center justify-between bg-slate-900/60 px-4 py-2.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px]">Bagikan Langsung:</span>
            <div className="flex gap-2">
              <button onClick={shareToX} className="px-2.5 py-1 bg-black text-slate-200 hover:bg-slate-900 rounded-md border border-slate-700 text-[11px]">
                𝕏 / Twitter
              </button>
              <button onClick={shareToFB} className="px-2.5 py-1 bg-blue-600 text-white hover:bg-blue-500 rounded-md text-[11px]">
                Facebook
              </button>
              <button onClick={handleNativeShare} className="px-2.5 py-1 bg-pink-600 text-white hover:bg-pink-500 rounded-md text-[11px]">
                Medsos Lain
              </button>
            </div>
          </div>

          {/* JSON Metadata Viewer */}
          {showMetadata && result.nft_metadata && (
            <div className="bg-slate-950 p-4 rounded-xl border border-indigo-900/60">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-indigo-400">ERC-721 Standard Metadata JSON:</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(result.nft_metadata, null, 2));
                    alert("Metadata JSON tersalin!");
                  }}
                  className="text-[10px] bg-indigo-900/50 hover:bg-indigo-800 text-indigo-200 px-2 py-1 rounded border border-indigo-700"
                >
                  Salin JSON
                </button>
              </div>
              <pre className="text-[10px] text-emerald-400 font-mono bg-slate-900 p-3 rounded-lg overflow-x-auto max-h-48 border border-slate-800">
                {JSON.stringify(result.nft_metadata, null, 2)}
              </pre>
            </div>
          )}

          {/* Detail Semiotika & Filosofi */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Detail Semiotika, Filosofi, & Energi Visual:
            </h3>
            
            {result.elements && Object.entries(result.elements).map(([key, item]) => {
              if (!item) return null;
              return (
                <div key={key} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2 shadow-md">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-1">
                    Elemen: {key.replace('_', ' ')}
                  </h4>

                  {item.visual_features && (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong className="text-slate-100">Fitur Visual:</strong> {item.visual_features}
                    </p>
                  )}

                  {item.filosofi_nusantara && (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong className="text-amber-200/90">Filosofi Nusantara:</strong> {item.filosofi_nusantara}
                    </p>
                  )}

                  {item.fengshui_energy && (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong className="text-slate-100">Energi Visual:</strong> {item.fengshui_energy}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Disclaimer */}
          {result.disclaimer && (
            <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/80 mt-6">
              <p className="text-[11px] text-slate-400 italic leading-relaxed">
                {result.disclaimer}
              </p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
