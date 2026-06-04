import { useState } from "react";

const ASPECTS = [
  { key: "avventure", label: "Avventure e storie", emoji: "🎬", desc: "Quanto ami le avventure di Topolino nei fumetti e film" },
  { key: "estetica", label: "Estetica e merchandise", emoji: "🎨", desc: "Quanto ti attraggono le orecchie, i gadget, il look iconico" },
  { key: "parchi", label: "Parchi e magia", emoji: "🏰", desc: "Quanto è importante l'esperienza Disney nei parchi" },
];

const PROFILES = [
  { name: "Il Narratore", emoji: "📖", condition: (v) => v[0] >= 50 },
  { name: "Il Collezionista", emoji: "✨", condition: (v) => v[1] >= 50 },
  { name: "Il Sognatore", emoji: "🏰", condition: (v) => v[2] >= 50 },
];

function getProfile(values) {
  for (const p of PROFILES) if (p.condition(values)) return p;
  const maxIdx = values.indexOf(Math.max(...values));
  return PROFILES[maxIdx] || PROFILES[0];
}

export default function App() {
  const [screen, setScreen] = useState("intro");
  const [values, setValues] = useState([0, 0, 0]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const remaining = 100 - values.reduce((a, b) => a + b, 0);

  function handleSlider(idx, raw) {
    const newVal = Math.min(parseInt(raw), 100 - values.reduce((a, b, i) => i !== idx ? a + b : a, 0));
    const next = values.map((v, i) => (i === idx ? newVal : v));
    setValues(next);
  }

  async function handleSubmit() {
    setLoading(true);
    setScreen("loading");
    setError("");
    const profile = getProfile(values);
    try {
      const res = await fetch("/.netlify/functions/generate-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values, profileName: `${profile.emoji} ${profile.name}` }),
      });
      const data = await res.json();
      setResult({ profile, text: data.result });
      setScreen("result");
    } catch {
      setError("Errore nella generazione del profilo. Riprova.");
      setScreen("quiz");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setValues([0, 0, 0]);
    setResult(null);
    setError("");
    setScreen("intro");
  }

  return (
    <div className="container">
      {screen === "intro" && (
        <div className="screen">
          <div className="intro-icon">🐭</div>
          <h1>Che tipo di fan di Topolino sei?</h1>
          <p className="subtitle">
            Distribuisci 100 punti tra 3 aspetti del mondo Disney in base a quanto ti stanno a cuore.
            L'AI analizzerà il tuo profilo unico.
          </p>
          <button className="btn primary" onClick={() => setScreen("quiz")}>
            Inizia il quiz →
          </button>
        </div>
      )}

      {screen === "quiz" && (
        <div className="screen">
          <h1>Distribuisci i tuoi 100 punti</h1>
          <p className="subtitle">Sposta i cursori in base all'importanza di ciascun aspetto</p>

          <div className={`budget-box ${remaining === 0 ? "done" : remaining < 0 ? "over" : ""}`}>
            <span className="budget-num">{remaining}</span>
            <span className="budget-label">punti rimanenti</span>
          </div>

          {ASPECTS.map((a, i) => (
            <div key={a.key} className="aspect-card">
              <div className="aspect-header">
                <div>
                  <div className="aspect-name">{a.emoji} {a.label}</div>
                  <div className="aspect-desc">{a.desc}</div>
                </div>
                <div className="aspect-value">{values[i]}</div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={values[i]}
                onChange={(e) => handleSlider(i, e.target.value)}
              />
            </div>
          ))}

          {error && <p className="error-msg">{error}</p>}
          {remaining > 0 && (
            <p className="hint-msg">Hai ancora {remaining} punti da distribuire</p>
          )}

          <button
            className="btn primary"
            onClick={handleSubmit}
            disabled={remaining !== 0}
          >
            Scopri il tuo profilo →
          </button>
        </div>
      )}

      {screen === "loading" && (
        <div className="screen center">
          <div className="intro-icon">🐭</div>
          <h1>Analizziamo le tue risposte...</h1>
          <p className="subtitle">L'AI sta elaborando il tuo profilo</p>
          <div className="dots">
            <span /><span /><span />
          </div>
        </div>
      )}

      {screen === "result" && result && (
        <div className="screen">
          <h1>Il tuo profilo</h1>

          <div className="score-grid">
            {ASPECTS.map((a, i) => (
              <div key={a.key} className="score-pill">
                <div className="score-emoji">{a.emoji}</div>
                <div className="score-val">{values[i]}</div>
                <div className="score-label">{a.label}</div>
              </div>
            ))}
          </div>

          <div className="result-card">
            <div className="profile-name">
              {result.profile.emoji} {result.profile.name}
            </div>
            <div className="result-text">
              {result.text.split("\n").filter(l => l.trim()).map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>

          <button className="btn" onClick={reset}>← Rifai il quiz</button>
        </div>
      )}
    </div>
  );
}
