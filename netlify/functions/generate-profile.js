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

    // Build Claude prompt
    const top3 = aspects
      .map((a, i) => ({ label: a.question, value: values[i] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .filter(a => a.value > 0);

    const allScores = aspects
      .map((a, i) => `- ${a.question}: ${values[i]} punti`)
      .join('\n');

    const prompt = `Sei una psicologa specializzata in relazioni consensualmente non monogame e dinamiche HotWife. Una donna ha completato un test sulle caratteristiche del suo terzo ideale, distribuendo 50 punti tra 10 aspetti (massimo 10 per aspetto).

Ecco i punteggi completi:
${allScores}

Le sue priorità principali sono: ${top3.map(t => `"${t.label}" (${t.value} punti)`).join(', ')}.

Scrivi un'analisi psicologica profonda e intima di 5-6 frasi. Per ogni categoria con almeno 7 punti assegnati.
- Aiutala a riflettere su cosa rivela di lei come donna e come HotWife, quali sono i trigger magari inconsapevoli che giela rendono attraente
- Collega quella scelta al desiderio di accendere nel marito una gelosia intensa — non distruttiva, ma eccitante e rigenerante per la coppia
- Evidenzia come quella caratteristica specifica del terzo sia uno strumento per far perdere al marito il controllo emotivo, spingendolo a volersi riappropriare di lei con una forza e un desiderio che nella routine quotidiana si era attenuato. Specifica perché questo può aiutare la coppia a mantenere viva la passione che nel caso della donna necessita biologicamente di risultare attraente a partner multipli mentre nel caso dell'uomo necessita di provare possessività verso una sola donna (cosa che però cala nel corso del tempo e che queste dinamiche aiutano a mantenere viva).
- Usa un tono intimo, complice, come una conversazione tra donne consapevoli — celebra la sua intelligenza nel saper orchestrare queste dinamiche e nell'aver saputo confessare al marito una dinamica (quella di sentirsi desiderata) comune in tutte le donne ma che in poche riescono a confessare.
- Chiudi con una frase che valorizzi il fatto che lei sa esattamente cosa vuole e perchè e di come questo sue scelte nel test siano quelle più comuni e spesso anche quelle più efficaci per mantenere la passione nella coppia.

Scrivi in forma di paragrafo fluido e coinvolgente, senza elenchi puntati. Inizia direttamente senza saluti o introduzioni.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
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
