import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const newsSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The headline of the news article." },
      summary: { type: Type.STRING, description: "A one-paragraph summary of the article." },
      date: { type: Type.STRING, description: "The publication date in 'Month Day, Year' format." },
      imageUrl: { type: Type.STRING, description: "A URL for a relevant stock photo." },
    },
    required: ["title", "summary", "date", "imageUrl"],
  },
};

export const getRealEstateNews = async () => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Generate a list of 4 real estate news articles relevant to the Massachusetts market, relevant to the current market and within the last 30 days.',
      config: {
        responseMimeType: "application/json",
        responseSchema: newsSchema,
      },
    });
    
    const responseText = response.text;
    if (!responseText) {
        throw new Error('No response text from Gemini API');
    }
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to fetch news from Gemini API');
  }
};