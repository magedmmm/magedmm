import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function generateAutoReply(customerMessage: string, context: string = "") {
  try {
    const model = "gemini-3-flash-preview";
    const systemInstruction = `
      You are an AI customer support agent for AnyChat, a multi-channel communication platform.
      Your goal is to provide helpful, professional, and concise responses to customer inquiries.
      
      Context about the business:
      ${context}
      
      Guidelines:
      - Be polite and empathetic.
      - If you don't know the answer, ask the customer to wait for a human agent.
      - Keep responses short and to the point.
      - Use the same language as the customer (English or Arabic).
    `;

    const response = await ai.models.generateContent({
      model,
      contents: customerMessage,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error generating AI reply:", error);
    return null;
  }
}
