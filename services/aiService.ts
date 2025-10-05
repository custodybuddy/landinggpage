// services/aiService.ts

import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { pdfToText } from '../utils/fileUtils';
import { IncidentData, IncidentReport } from "../hooks/useIncidentReporter";
import { Analysis } from "../components/EmailLawBuddy";

// Per guidelines, initialize the Google AI client using an environment variable for the API key.
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a File object to a GenerativePart object for the Gemini API.
 * Handles different file types like images and PDFs.
 * @param file The file to convert.
 * @returns A promise that resolves to a `Part` object.
 */
const fileToGenerativePart = async (file: File): Promise<Part> => {
    if (file.type === 'application/pdf') {
        const text = await pdfToText(file);
        // Wrap document content with markers for the AI to distinguish between files
        return { text: `--- START OF DOCUMENT: ${file.name} ---\n${text}\n--- END OF DOCUMENT: ${file.name} ---` };
    }

    const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            // The result includes the data URL prefix, which needs to be removed.
            const base64Data = result.split(',')[1];
            resolve(base64Data);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });

    const base64Data = await base64EncodedDataPromise;

    return {
        inlineData: {
            mimeType: file.type,
            data: base64Data,
        },
    };
};

/**
 * Prepares an array of content parts from files and pasted text for a multimodal prompt.
 * @param files - An array of File objects to be processed.
 * @param pastedText - A string of text to be included.
 * @returns A promise that resolves to an array of `Part` objects.
 */
export const prepareContentParts = async (files: File[], pastedText: string): Promise<Part[]> => {
    const fileParts = await Promise.all(files.map(fileToGenerativePart));

    const textParts: Part[] = [];
    if (pastedText.trim()) {
        textParts.push({ text: `--- START OF PASTED TEXT ---\n${pastedText}\n--- END OF PASTED TEXT ---` });
    }

    // Combine file parts and text parts for the final prompt
    return [...fileParts, ...textParts];
};

/**
 * Sends content parts to the Gemini model for analysis based on a system prompt.
 * @param contentParts - An array of `Part` objects containing documents and/or text.
 * @param systemInstruction - The system prompt to guide the AI's response.
 * @returns A promise that resolves to the text response from the AI.
 */
export const analyzeCaseDocuments = async (contentParts: Part[], systemInstruction: string): Promise<string> => {
    // Per guidelines, use `ai.models.generateContent` for text generation.
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: contentParts },
        config: {
            systemInstruction: systemInstruction,
        }
    });

    // Per guidelines, extract text directly from the `response.text` property.
    return response.text;
};

/**
 * Sends a user prompt and system instruction to Gemini to generate an email draft.
 * @param userPrompt - The user's prompt, including original email and key points.
 * @param systemInstruction - The system prompt defining the AI's persona and task.
 * @returns A promise that resolves to the generated email draft as a string.
 */
export const generateDraftEmail = async (userPrompt: string, systemInstruction: string): Promise<string> => {
    // Per guidelines, use `ai.models.generateContent` for text generation.
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
            systemInstruction: systemInstruction,
        }
    });
    
    // Per guidelines, extract text directly from the `response.text` property.
    return response.text;
};

/**
 * Analyzes an email using the Gemini API and expects a JSON response.
 * @param email - The email text to analyze.
 * @param systemInstruction - The system prompt instructing the AI to return JSON.
 * @returns A promise that resolves to the parsed `Analysis` object.
 */
export const analyzeEmail = async (email: string, systemInstruction: string): Promise<Analysis> => {
    const prompt = `Here is the email to analyze:\n\n\`\`\`\n${email}\n\`\`\``;

    // Per guidelines, request a JSON response using `responseMimeType`.
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: 'application/json',
        }
    });
    
    // Per guidelines, extract the text and parse it as JSON.
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
};

/**
 * Explains a legal jargon term using the Gemini API, expecting a JSON response.
 * @param term - The legal term to explain.
 * @param context - The context in which the term was used.
 * @returns A promise that resolves to an object with `explanation` and `suggested_question`.
 */
export const explainJargon = async (term: string, context: string): Promise<{ explanation: string; suggested_question: string; }> => {
    const prompt = `Term: "${term}"\nContext: "${context}"`;

    // Per guidelines, request a JSON response using `responseMimeType`.
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: 'application/json',
        }
    });
    
    // Per guidelines, extract the text and parse it as JSON.
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
};

/**
 * Generates a professional incident report from user data using the Gemini API.
 * @param incidentData - The raw data about the incident.
 * @param systemInstruction - The system prompt for generating the report.
 * @returns A promise that resolves to the parsed `IncidentReport` object.
 */
export const generateIncidentReport = async (incidentData: IncidentData, systemInstruction: string): Promise<IncidentReport> => {
    const userPrompt = `
        Date & Time: ${incidentData.dateTime}
        Location: ${incidentData.location}
        Involved Parties: ${incidentData.involvedParties}
        Jurisdiction: ${incidentData.jurisdiction}
        Narrative:
        ${incidentData.narrative}
    `;

    // Note: The system prompt requested a web search, but guidelines prohibit using `googleSearch` with `responseMimeType: 'application/json'`.
    // Since the application requires a structured JSON response, we prioritize the JSON output and omit the search tool.
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: 'application/json',
        }
    });

    // Per guidelines, extract the text and parse it as JSON.
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
};

/**
 * Placeholder function for sending a contact message.
 * In a real application, this would send an email or save to a database.
 * @param formData - The user's contact form data.
 */
export const sendContactMessage = async (formData: { name: string; email: string; message: string; }): Promise<void> => {
    console.log("Sending contact message (simulation):", formData);
    // Simulate network delay and a successful response
    await new Promise(resolve => setTimeout(resolve, 1000));
    return Promise.resolve();
};
