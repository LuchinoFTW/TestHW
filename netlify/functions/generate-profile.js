exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { aspects, values } = JSON.parse(event.body);

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    await fetch(`${supabaseUrl}/rest/v1/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        v1: values[0], v2: values[1], v3: values[2], v4: values[3],
        v5: values[4], v6: values[5], v7: values[6], v8: values[7],
        v9: values[8], v10: values[9],
      }),
    });

    const PRIORITY = [
      { id: 'dimensioni',  indices: [4, 5] },
      { id: 'pensieri',    indices: [0] },
      { id: 'segno',       indices: [6] },
      { id: 'bacio',       indices: [7] },
      { id: 'estetica',    indices: [1] },
      { id: 'dominante',   indices: [3] },
      { id: 'orale',       indices: [8] },
      { id: 'penetrativo', indices: [9] },
    ];

    const q3score = values[2];

    const top2 = [];
    for (const p of PRIORITY) {
      if (top2.length >= 2) break;
      const score = Math.max(...p.indices.map(i => values[i]));
      if (score >= 7) top2.push({ ...p, score });
    }

    const categoryText = {
      dimensioni:  `Ha dedicato ${values[4]} punti alla lunghezza e ${values[5]} punti alla larghezza — trattale come un'unica riflessione. Questa preferenza può rivelare un desiderio di vivere un'esperienza fisica molto intensa e appagante, diversa da quella a cui è abituata. Rifletti su come questa scelta parli di un bisogno profondo di sentirsi completamente appagata e su come questa consapevolezza, una volta vissuta, possa riaccendere nel partner il desiderio di riconquistarla.`,
      pensieri:    `Ha dedicato ${values[0]} punti alla frequenza con cui pensa a questa fantasia. Questo rivela quanto il desiderio sia già presente e radicato nella sua mente — non è una curiosità passeggera. Falla riflettere su questo aspetto e invitala a riflettere su come si sentirebbe se fosse improvvisamente in una relazione "chiusa" dove il partner non condivide le sue fantasie di apertura sessuale: rinuncerebbe o sarebbe portata a tradire per soddisfare il suo desiderio di essere apprezzata da tanti uomini?`,
      segno:       `Ha dedicato ${values[6]} punti all'importanza di un segno evidente da condividere con il marito. Questo desiderio parla di trasparenza e di voler includere il partner in modo tangibile nell'esperienza — è un atto di fiducia profonda che rafforza il legame, trasformando qualcosa di intimo in un momento condiviso capace di riaccendere la connessione emotiva tra loro.`,
      bacio:       `Ha dedicato ${values[7]} punti all'importanza del bacio. Come per l'attrazione emotiva, questa scelta rivela che lei non cerca solo un'esperienza fisica ma vuole sentirsi coinvolta anche a livello sensoriale e intimo. Il bacio è una delle forme di connessione più personali — il fatto che lo cerchi anche in questo contesto dice molto sulla sua profondità emotiva.`,
      estetica:    `Ha dedicato ${values[1]} punti all'aspetto estetico. Questo rivela il desiderio di sentirsi scelta e desiderata da qualcuno che incarna un ideale di bellezza — non è superficialità, ma il bisogno di sentirsi all'altezza di qualcuno che molti desidererebbero. È una forma di autostima e consapevolezza del proprio valore.`,
      dominante:   `Ha dedicato ${values[3]} punti al carattere dominante. Questa preferenza parla del desiderio di abbandonarsi completamente, di lasciare il controllo e di essere desiderata con una forza e una decisione che nella quotidianità spesso manca. Vivere questa esperienza può aiutarla a riconnettersi con una parte di sé che ama sentirsi al centro di un desiderio travolgente.`,
      orale:       `Ha dedicato ${values[8]} punti all'abilità nel sesso orale. Questa scelta rivela il desiderio di ricevere piacere pieno e dedicato, di essere messa al centro dell'attenzione senza riserve.`,
      penetrativo: `Ha dedicato ${values[9]} punti all'esperienza penetrativa completa. Questo parla del desiderio di vivere l'esperienza nella sua totalità, senza mezze misure — è la voglia di sentirsi completamente presente e appagata in ogni sua dimensione.`,
    };

    const q3text = '';

    const top2text = top2.map(p => categoryText[p.id] || '').filter(Boolean).join(' ');

    const prompt = `Sei una psicologa specializzata in relazioni consensualmente non monogame. Una donna ha completato un test distribuendo fino a 50 punti tra 10 caratteristiche del suo terzo ideale.

Scrivi un'analisi psicologica profonda, intima e rispettosa in forma di paragrafo fluido continuo, senza titoli o elenchi.

PRIMA: 2-3 righe che descrivono il profilo del terzo ideale emerso dai suoi punteggi, evidenziando cosa dice di lei come donna e di ciò che desidera.

${q3text ? `POI: ${q3text}` : ''}

${top2text ? `POI ANALIZZA: ${top2text} Per ciascuna di queste caratteristiche, rifletti su come questa preferenza si colleghi al desiderio di riaccendere l'intensità emotiva nella coppia — non attraverso conflitto ma attraverso la consapevolezza che il desiderio si rinnova quando entrambi i partner si sentono coinvolti, presenti, necessari l'uno all'altra. Esplora come queste dinamiche, vissute con consapevolezza e comunicazione aperta, possano aiutare entrambi a riscoprire l'attrazione che il tempo tende ad attenuare.` : ''}

CHIUDI: Con tono caldo e complice, celebra la sua consapevolezza emotiva e il coraggio di esplorare i propri desideri. Falle sentire che seguire questi desideri con maturità e onestà può portarla non solo alla libertà che cerca, ma anche a un legame più profondo e autentico con il suo partner — uno in cui entrambi si scelgono ogni giorno con rinnovata intensità.

Scrivi in italiano, tono intimo e non giudicante, paragrafo fluido, massimo 450 parole. Inizia direttamente senza saluti.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    console.log('Anthropic status:', response.status);
    const text = data.content?.find(b => b.type === 'text')?.text || '';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result: text }),
    };
  } catch (err) {
    console.error('Error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
