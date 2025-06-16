export const classifyClothingItem = async (imageUrl) => {
  try {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a fashion expert. Analyze the clothing item in the image and fill out the following fields in English:
{
  "name": "string", // include the color in the name
  "type": "string",
  "styles": ["..."],
  "occasions": ["..."],
  "color": "string",
  "material": "string",
  "brand": "string",
  "season": "string",
  "fit": "string",
  "notes": "string",
  "description": "string"
}
Use only the following values for type, styles, and occasions:
Types: top, bottom, shoes, accessory
Styles: casual, formal, business, party, sporty, streetwear, elegant, romantic, edgy, retro, minimalist
Occasions: work, interview, wedding, date, gym, school, beach, holiday, party, funeral, everyday, chill at home.`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze and classify this clothing item:" },
              {
                type: "image_url",
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 400,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    console.log('OpenAI raw response:', content);
    const jsonString = extractJsonFromString(content);
    const classification = JSON.parse(jsonString);

    return {
      success: true,
      name: classification.name,
      type: classification.type,
      styles: classification.styles,
      occasions: classification.occasions,
      color: classification.color,
      material: classification.material,
      brand: classification.brand,
      season: classification.season,
      fit: classification.fit,
      notes: classification.notes,
      description: classification.description,
    };
  } catch (error) {
    console.error('Error in AI classification:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

function extractJsonFromString(str) {
  const match = str.match(/{[\s\S]*}/);
  if (match) {
    return match[0];
  }
  throw new Error('No JSON object found in response');
} 