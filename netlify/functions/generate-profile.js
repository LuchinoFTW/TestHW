exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { values, profileName } = JSON.parse(event.body);

  const prompt = `Sei un esperto di psicologia dei fan Disney. Una persona ha distribuito 100 punti tra 3 aspetti di Topolino:
- Avventure e storie: ${values[0]} punti
- Estetica e merchandise: ${values[1]} punti
- Parchi e magia: ${values[2]} punti

Il profilo assegnato è: "${profileName}".

Scrivi un'analisi del profilo in 3-4 frasi: cosa la caratterizza come fan, cosa la spinge emotivamente, e un consiglio concreto su come approfondire la sua passione. Tono caldo, coinvolgente, un po' poetico. Inizia direttamente con l'analisi senza saluti o introduzioni.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  const text = data.content?.find(b => b.type === 'text')?.text || '';

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ result: text }),
  };
};
