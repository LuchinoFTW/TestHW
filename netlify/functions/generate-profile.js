exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { aspects, values } = JSON.parse(event.body);

    // Save to Supabase
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

    // Priority list — dimensioni è una voce unica che copre indici 4 e 5
    // Index: 0=quanto ci pensa, 1=esteticamente bello, 2=attrazione emotiva (gestita a parte),
    //        3=dominante, 4=lunghezza, 5=larghezza, 6=segno evidente,
    //        7=bacio, 8=sesso orale, 9=sesso penetrativo
    const PRIORITY = [
      { id: 'dimensioni', indices: [4, 5], label: 'Dimensioni' },
      { id: 'pensieri',   indices: [0],    label: 'Frequenza dei pensieri' },
      { id: 'segno',      indices: [6],    label: 'Segno evidente' },
      { id: 'bacio',      indices: [7],    label: 'Il bacio' },
      { id: 'estetica',   indices: [1],    label: 'Aspetto estetico' },
      { id: 'dominante',  indices: [3],    label: 'Carattere dominante' },
      { id: 'orale',      indices: [8],    label: 'Sesso orale' },
      { id: 'penetrativo',indices: [9],    label: 'Sesso penetrativo' },
    ];

    const q3score = values[2];

    // Pick top 2 slots: each entry in PRIORITY counts as 1 slot regardless of how many indices it covers
    const top2 = [];
    for (const p of PRIORITY) {
      if (top2.length >= 2) break;
      const score = Math.max(...p.indices.map(i => values[i]));
      if (score >= 7) top2.push({ ...p, score });
    }

    // Category text builders
    const categoryText = {
      dimensioni: `Ha assegnato ${values[4]} punti alla lunghezza e ${values[5]} punti alla larghezza. Unisci le due dimensioni in un'unica riflessione: se cerca questa caratteristica, forse inconsapevolmente il suo corpo avverte una mancanza nel marito. Scegliere un terzo molto dotato crea un forte impatto emotivo e un senso di urgenza di riappropriarsi nel marito.`,
      pensieri: `Ha assegnato ${values[0]} punti alla frequenza con cui pensa a fare sesso con un altro uomo. Questo rivela quanto questa fantasia sia già presente e viva nella sua mente — non è una curiosità occasionale, è un desiderio radicato. Falla riflettere su quanto tempo ha già trascorso a immaginare questo scenario e su cosa significhi per lei finalmente agire.`,
      segno: `Ha assegnato ${values[6]} punti all'importanza di un segno evidente da mostrare al marito. Falla riflettere sul perché voglia mostrare al marito il segno evidente del piacere del terzo sul suo corpo, e quanto sia importante per lei che lui la accetti anche così — è un atto di fiducia estrema e al tempo stesso un potente innesco di gelosia e riappropriazione.`,
      bacio: `Ha assegnato ${values[7]} punti all'importanza del bacio. Come l'attrazione emotiva, il bacio rivela che lei vuole sentirsi coinvolta anche emotivamente. Falla riflettere su quanto questa dimensione intima — normalmente riservata al partner — diventi ancora più carica di significato in questo contesto.`,
      estetica: `Ha assegnato ${values[1]} punti all'aspetto estetico. Falla riflettere su cosa significa desiderare un terzo bello da guardare — è il desiderio di sentirsi scelta da qualcuno che anche gli altri desiderano, e di mostrare al marito che lei può attirare uomini che molte donne vorrebbero.`,
      dominante: `Ha assegnato ${values[3]} punti al carattere dominante. Falla riflettere sul perché voglia sentirsi dominata da un altro uomo — spesso indica il desiderio di abbandonarsi completamente, di essere semplicemente desiderata con una forza che non lascia spazio a dubbi. Questo contrasto con la vita quotidiana è esattamente ciò che fa impazzire il marito.`,
      orale: `Ha assegnato ${values[8]} punti all'abilità nel sesso orale. Falla riflettere su quanto questa preferenza riveli il desiderio di essere messa al centro, di ricevere piacere puro dedicato solo a lei.`,
      penetrativo: `Ha assegnato ${values[9]} punti al sesso penetrativo completo. Questo è il desiderio dell'esperienza totale — non una fantasia parziale ma il desiderio di viverla completamente, con tutto quello che comporta emotivamente e fisicamente.`,
    };

    const q3text = q3score >= 5
      ? `Hai assegnato ${q3score} punti all'attrazione emotiva verso qualcuno che già conosci. Questo è un segnale molto significativo: hai capito che la leva più forte di questo gioco non è fisica ma emotiva. Sarebbe travolgente per il tuo compagno sapere che sei con un terzo per il quale provi un'attrazione vera, mentale e non solo fisica. Potresti iniziare raccontando al marito su quali persone che entrambi conoscete hai fantasticato, per testare la sua reazione emotiva.`
      : '';

    const top2text = top2.map(p => categoryText[p.id] || '').filter(Boolean).join(' ');

    const prompt = `Sei una psicologa specializzata in relazioni consensualmente non monogame e dinamiche HotWife. Una donna ha completato un test distribuendo 50 punti tra 10 caratteristiche del suo terzo ideale.

Scrivi un'analisi psicologica profonda e intima in forma di paragrafo fluido continuo senza titoli o elenchi:

PRIMA: Una descrizione di 2-3 righe del profilo del terzo ideale emerso dai suoi punteggi complessivi.

${q3text ? `POI: ${q3text}` : ''}

${top2text ? `POI ANALIZZA IN DETTAGLIO: ${top2text} Per ciascuna di queste caratteristiche, collega la scelta al desiderio di accendere nel marito una gelosia intensa — eccitante e rigenerante. Evidenzia come quella caratteristica sia uno strumento per far perdere al marito il controllo emotivo, spingendolo a volersi riappropriare di lei con una forza che nella routine si era attenuata. Spiega il meccanismo biologico: la donna necessita di sentirsi attraente per partner multipli, l'uomo necessita di possessività verso una sola donna — entrambe queste spinte calano nel tempo e queste dinamiche le riaccendono.` : ''}

CHIUDI: Con tono intimo e complice, celebra la sua maturità emotiva. Falle capire che seguendo questi desideri conquisterà la libertà sessuale che vuole e legherà il proprio uomo a sé in modo indissolubile — lui penserà solo a lei, sentirà le farfalle allo stomaco ogni volta che lei sarà con un altro, si riapproprierà di lei con una passione che credeva perduta.

Scrivi in italiano, tono caldo e complice, paragrafo fluido, massimo 450 parole. Inizia direttamente senza saluti.`;

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
