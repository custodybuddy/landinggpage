// Fix: Refactor the entire AI service to use the @google/genai SDK instead of OpenAI.
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Initialize the Gemini client and export it for use in other parts of the app (e.g., live chat).
// The API key is now correctly sourced from environment variables as per guidelines.
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes case documents using Gemini with multimodal capabilities.
 * @param parts - An array of content parts (text and/or images) for the model.
 * @param systemPrompt - The system instruction for the model.
 * @returns A promise that resolves to the generated text response.
 */
export const analyzeCaseDocuments = async (parts: any[], systemPrompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: {
            systemInstruction: systemPrompt,
        }
    });
    return response.text;
};

/**
 * Analyzes an email for tone, summary, and key demands using Gemini's JSON mode.
 * @param emailContent - The text content of the email to analyze.
 * @param systemPrompt - The system instruction for the model.
 * @returns A promise that resolves to the parsed JSON object.
 */
export const analyzeEmail = async (emailContent: string, systemPrompt: string): Promise<any> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: emailContent,
        config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    tone: { type: Type.STRING, description: "A brief, descriptive label for the overall tone (e.g., Aggressive, Manipulative, Passive-Aggressive, Demanding, Factual, Business-like)." },
                    summary: { type: Type.STRING, description: "A one-sentence summary of the email's main purpose." },
                    key_demands: {
                        type: Type.ARRAY,
                        description: "A list of clear, actionable demands or questions made in the email. Extract these as direct, concise points.",
                        items: { type: Type.STRING }
                    }
                },
                required: ['tone', 'summary', 'key_demands']
            }
        },
    });

    return JSON.parse(response.text);
};

/**
 * Generates a draft email response using Gemini.
 * @param userPrompt - The user's prompt, including the original email and key points.
 * @param systemPrompt - The system instruction for the model (e.g., BIFF or Grey Rock).
 * @returns A promise that resolves to the generated text of the draft email.
 */
export const generateDraftEmail = async (userPrompt: string, systemPrompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
            systemInstruction: systemPrompt,
            temperature: 0.7
        }
    });
    return response.text;
};
