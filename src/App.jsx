import { useState, useEffect } from "react";

const ASPECTS = [
  { emoji: "🌀", question: "Quanto spesso ti capita di pensare all'idea di fare sesso con un altro uomo? (1 = mai, 10 = tutti i giorni)" },
  { emoji: "😍", question: "Quanto conta che sia esteticamente bello?" },
  { emoji: "🔮", question: "Quanto ti piacerebbe che fosse qualcuno che già conosci, per cui provi un'attrazione mai messa in pratica?" },
  { emoji: "👑", question: "Quanto vuoi che sia dominante e fisico durante il rapporto, anche a costo di lasciarti segni?" },
  { emoji: "📏", question: "Quanto conta la lunghezza della sua dotazione?" },
  { emoji: "⭕", question: "Quanto conta lo spessore della sua dotazione?" },
  { emoji: "💦", question: "Quanto è importante che possa lasciare un segno molto evidente da mostrare a tuo marito?" },
  { emoji: "👄", question: "Quanto è importante che ti faccia sentire persa tra le sue labbra?" },
  { emoji: "👅", question: "Quanto conta l'abilità con la lingua?" },
  { emoji: "🔥", question: "Quanto è importante che sappia muoversi con sensualità e vigore in tutte le posizioni, durando per tutto il tempo necessario?" },
];

const MAX_TOTAL = 50;
const MAX_PER = 10;

function SliderCard({ aspect, index, value, onChange }) {
  const pct = (value / MAX_PER) * 100;

  useEffect(() => {
    const el = document.getElementById(`slider-${index}`);
    if (el) el.style.setProperty('--pct', `${pct}%`);
  }, [value, pct, index]);

  return (
    <div className="aspect-card">
      <div className="aspect-top">
        <span className="aspect-emoji">{aspect.emoji}</span>
        <div className="aspect-question">{aspect.question}</div>
        <div className={`aspect-val ${value === MAX_PER ? 'maxed' : ''}`}>{value}</div>
      </div>
      <input
        id={`slider-${index}`}
        type="range"
        min="0"
        max="10"
        step="1"
        value={value}
        style={{ '--pct': `${pct}%` }}
        onChange={(e) => onChange(index, parseInt(e.target.value))}
      />
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("intro");
  const [values, setValues] = useState(Array(10).fill(0));
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const total = values.reduce((a, b) => a + b, 0);
  const remaining = MAX_TOTAL - total;

  function handleSlider(idx, newVal) {
    const otherSum = values.reduce((a, b, i) => i !== idx ? a + b : a, 0);
    const clamped = Math.min(newVal, MAX_TOTAL - otherSum);
    setValues(v => v.map((val, i) => i === idx ? clamped : val));
  }

  async function handleSubmit() {
    setError("");
    setScreen("loading");
    try {
      const res = await fetch("/.netlify/functions/generate-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aspects: ASPECTS, values }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.result);
      setScreen("result");
    } catch (e) {
      setError("Errore nella generazione del profilo. Riprova.");
      setScreen("quiz");
    }
  }

  function reset() {
    setValues(Array(10).fill(0));
    setResult("");
    setError("");
    setScreen("intro");
  }

  const Header = () => (
    <header className="site-header">
      <div className="logo-mark">HWA</div>
      <div className="logo-main">HotWife <span>Awakening</span></div>
      <div className="logo-tagline">Quiz Psicologico</div>
    </header>
  );

  const Footer = () => (
    <footer className="site-footer">
      <div className="site-footer-logo">HW<span>A</span></div>
    </footer>
  );

  return (
    <>
      <div className="bg-layer" />
      <div className="container">
        <Header />

        {screen === "intro" && (
          <div className="screen active">
            <div className="intro-badge">Quiz esclusivo</div>
            <h1 className="intro-title">
              Cosa cerchi <em>veramente</em><br />nel terzo di coppia?
            </h1>
            <p className="intro-text">
              Lo sapevi che le caratteristiche che sogni nel terzo per i tuoi giochi possono rivelarti tanti aspetti che magari non avevi mai considerato su cosa inconsciamente ti eccita nel tuo ruolo di HotWife?
            </p>
            <p className="intro-text">
              Distribuisci 50 punti totali tra le 10 caratteristiche che vedi di seguito e la nostra AI addestrata con oltre 1.000 libri e 2.000 siti sulle relazioni non monogame ti farà veramente capire chi sei.
            </p>
            <div className="intro-divider" />
            <button className="btn btn-primary" onClick={() => setScreen("quiz")}>
              Inizia il quiz →
            </button>
          </div>
        )}

        {screen === "quiz" && (
          <div className="screen active">
            <div className="section-label">Il tuo profilo</div>
            <div className="section-title">Distribuisci 50 punti — massimo 10 per caratteristica</div>

            <div className="budget-box">
              <div className={`budget-number ${remaining === 0 ? 'done' : ''}`}>{remaining}</div>
              <div className="budget-right">
                <div className="budget-sublabel">Punti rimasti</div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${(total / MAX_TOTAL) * 100}%` }} />
                </div>
                <div className="budget-fraction">{total} / {MAX_TOTAL}</div>
              </div>
            </div>

            {ASPECTS.map((a, i) => (
              <SliderCard
                key={i}
                aspect={a}
                index={i}
                value={values[i]}
                onChange={handleSlider}
              />
            ))}

            {error && <p className="hint-msg" style={{ color: '#c0392b' }}>{error}</p>}
            {remaining > 0 && (
              <p className="hint-msg">Hai ancora {remaining} punti da assegnare</p>
            )}

            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={remaining !== 0}
              style={{ marginTop: '1.5rem' }}
            >
              Scopri il tuo profilo →
            </button>
            <button className="btn btn-ghost" onClick={reset}>← Ricomincia</button>
          </div>
        )}

        {screen === "loading" && (
          <div className="screen active">
            <div className="loading-screen">
              <div className="loading-title">Stiamo analizzando i tuoi desideri...</div>
              <div className="loading-sub">elaborazione in corso</div>
              <div className="dots"><span /><span /><span /></div>
            </div>
          </div>
        )}

        {screen === "result" && (
          <div className="screen active">
            <div className="result-intro">
              <div className="section-label">La tua analisi</div>
              <div className="section-title">Ecco cosa rivela di te</div>
            </div>

            <div className="score-grid">
              {ASPECTS.map((a, i) => (
                <div key={i} className="score-cell">
                  <span className="score-cell-emoji">{a.emoji}</span>
                  <span className={`score-cell-val ${values[i] >= 8 ? 'high' : ''}`}>{values[i]}</span>
                </div>
              ))}
            </div>

            <div className="result-card">
              <div className="result-card-label">La tua psicologia</div>
              <div className="result-body">
                {result.split("\n").filter(l => l.trim()).map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>

            <div className="result-sep">
              <div className="result-sep-line" />
              <div className="result-sep-text">Analisi generata da AI</div>
              <div className="result-sep-line" />
            </div>

            <button className="btn btn-ghost" onClick={reset}>← Rifai il quiz</button>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}
