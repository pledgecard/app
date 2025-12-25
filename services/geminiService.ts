import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // In a real app, ensure this is set safely
let ai: GoogleGenAI | null = null;

try {
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
} catch (e) {
  console.error("Failed to initialize Gemini Client", e);
}

export const generateCampaignDescription = async (title: string, category: string, keyPoints: string): Promise<string> => {
  if (!ai) return "AI Service not configured. Please add API_KEY.";

  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `Write a compelling, emotional, yet professional crowdfunding campaign description for a campaign titled "${title}" in the category "${category}". 
    Key details to include: ${keyPoints}. 
    
    IMPORTANT: Format the output as clean HTML using tags like <h3>, <p>, <ul>, <li>, <strong>, and <blockquote>. 
    Do not use markdown code blocks or backticks. Just return the raw HTML string.
    Keep it under 250 words. Focus on the impact of the donation in Uganda context.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Could not generate description.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "<p>Error generating description. Please try again.</p>";
  }
};