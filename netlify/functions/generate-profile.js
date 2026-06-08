exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { aspects, values } = JSON.parse(event.body);

    // Save to Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    const savePayload = {
      v1: values[0], v2: values[1], v3: values[2], v4: values[3],
      v5: values[4], v6: values[5], v7: values[6], v8: values[7],
      v9: values[8], v10: values[9],
    };

    await fetch(`${supabaseUrl}/rest/v1/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(savePayload),
    });

    // Build scores summary
    const allScores = aspects
      .map((a, i) => `- ${a.question}: ${values[i]} punti`)
      .join('\n');

    // Question 3 (index 2) score
    const q3score = values[2];
    const q3label = aspects[2].question;

    // All aspects with 7+ points (excluding question 3)
    const highScores = aspects
      .map((a, i) => ({ label: a.question, value: values[i], index: i }))
      .filter(a => a.index !== 2 && a.value >= 7);

    const q3Section = q3score >= 5
      ? `La domanda "${q3label}" ha ricevuto ${q3score} punti. Falle i complimenti perché ha capito come la leva più forte di questo gioco sia il coinvolgimento emotivo: sarebbe travolgente per il compagno sapere che lei è con un terzo per il quale prova un'attrazione vera, mentale e non solo fisica. Suggerisci che queste dinamiche vengano svolte non con il marito in presenza ma solo lei e il terzo. Suggerisci che potrebbe iniziare raccontando al marito su quali persone che entrambi conoscono magari ha fantasticato, per testare la sua reazione emotiva.`
      : '';

    const highSection = highScores.length > 0
      ? `Le seguenti caratteristiche hanno ricevuto 7 o più punti e vanno analizzate in dettaglio: ${highScores.map(a => `"${a.label}" (${a.value} punti)`).join(', ')}.`
      : '';

    const prompt = `Sei una psicologa specializzata in relazioni consensualmente non monogame e dinamiche HotWife. Una donna ha completato un test sulle caratteristiche del suo terzo ideale, distribuendo 50 punti tra 10 aspetti (massimo 10 per aspetto).

Ecco i punteggi completi:
${allScores}

Scrivi un'analisi psicologica profonda e intima seguendo questa struttura, in forma di paragrafo fluido senza elenchi:

1. PROFILO DEL TERZO IDEALE: Inizia con 2-3 righe che descrivono il profilo del terzo ideale emerso dalle sue risposte complessive.

${q3Section ? `2. CONNESSIONE EMOTIVA: ${q3Section}` : ''}

${highSection ? `3. ANALISI DELLE PRIORITÀ PRINCIPALI: ${highSection} Per ciascuna di queste caratteristiche:
- Aiutala a riflettere su cosa rivela di lei come donna e come HotWife, quali sono i trigger magari inconsapevoli che le rendono quella caratteristica attraente
- Collega quella scelta al desiderio di accendere nel marito una gelosia intensa — non distruttiva, ma eccitante e rigenerante per la coppia
- Evidenzia come quella caratteristica specifica del terzo sia uno strumento per far perdere al marito il controllo emotivo, spingendolo a volersi riappropriare di lei con una forza e un desiderio che nella routine quotidiana si era attenuato. Spiega perché questo può aiutare la coppia a mantenere viva la passione: nel caso della donna perché necessita biologicamente di risultare attraente a partner multipli, nel caso dell'uomo perché necessita di provare possessività verso una sola donna — cosa che cala nel tempo e che queste dinamiche aiutano a mantenere viva.` : ''}

4. TONO E CHIUSURA: Usa un tono intimo, complice, come una conversazione tra donne consapevoli. Celebra la sua maturità emotiva e fiducia nel rapporto nel saper orchestrare queste dinamiche e nell'aver saputo confessare al marito una dinamica — quella di sentirsi desiderata — comune in tutte le donne ma che in poche riescono a confessare. Chiudi con una frase che le faccia capire che se seguirà questi suoi desideri conquisterà non solo la libertà sessuale che desidera, ma legherà il proprio uomo a sé in modo indissolubile: sarà l'unico suo pensiero, gli darà le farfalle nello stomaco come al primo appuntamento ogni volta che lei sarà con un altro.

Scrivi in forma di paragrafo fluido e coinvolgente, senza elenchi puntati, senza titoli di sezione. Inizia direttamente senza saluti o introduzioni.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1200,
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
