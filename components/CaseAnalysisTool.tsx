
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

// A robust markdown-to-HTML converter for the expected AI response format.
const formatMarkdown = (text: string): string => {
    // This helper for inline formatting handles bold, italic, and code.
    const processInlineFormatting = (str: string): string => {
        // Process in order of complexity to avoid conflicts (e.g., ** before *)
        return str
            .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>') // Bold + Italic
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')       // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>')         // Italic
            .replace(/_([^_]+)_/g, '<em>$1</em>')       // Italic (underscore)
            .replace(/`([^`]+)`/g, '<code class="bg-slate-700 text-amber-300 px-1 py-0.5 rounded text-sm font-mono">$1</code>'); // Inline code
    };

    const lines = text.split('\n');
    let html = '';
    let inList = false;
    let inCodeBlock = false;
    let codeBlockContent = '';

    for (const line of lines) {
        // --- 1. Handle Code Blocks ---
        // They are self-contained and override other formatting.
        if (line.trim().startsWith('```')) {
            if (inCodeBlock) { // Closing fence
                const escapedCode = codeBlockContent.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                html += `<pre class="bg-slate-950 p-4 rounded-md overflow-x-auto"><code class="text-white text-sm font-mono">${escapedCode.trim()}</code></pre>`;
                inCodeBlock = false;
                codeBlockContent = '';
            } else { // Opening fence
                if (inList) { // If a list was open, close it first.
                    html += '</ul>';
                    inList = false;
                }
                inCodeBlock = true;
            }
            continue; // Move to next line
        }

        if (inCodeBlock) {
            codeBlockContent += line + '\n';
            continue;
        }

        // --- 2. Handle List Items ---
        if (line.trim().startsWith('* ')) {
            if (!inList) {
                html += '<ul class="list-disc pl-6 space-y-2">';
                inList = true;
            }
            // Add the list item, processing inline formats on its content
            html += `<li>${processInlineFormatting(line.trim().substring(2))}</li>`;
        } 
        // --- 3. Handle Paragraphs and Other Lines ---
        else {
            if (inList) {
                // Any non-list-item line will terminate the current list.
                html += '</ul>';
                inList = false;
            }
            if (line.trim()) {
                // If the line has content, wrap it in a paragraph tag.
                html += `<p>${processInlineFormatting(line)}</p>`;
            }
            // Blank lines effectively just add a separation by closing the list.
        }
    }

    // --- 4. Cleanup ---
    // Ensure any open tags are closed at the end of the text.
    if (inList) {
        html += '</ul>';
    }
    if (inCodeBlock) { // Failsafe for unclosed code block
        const escapedCode = codeBlockContent.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        html += `<pre class="bg-slate-950 p-4 rounded-md overflow-x-auto"><code class="text-white text-sm font-mono">${escapedCode.trim()}</code></pre>`;
    }

    return html;
};


const EXAMPLE_INPUT = `Clause 7.2 from Separation Agreement:

"The parties shall share parenting time with the child, Lily Chen, on a week-on/week-off basis, with exchanges taking place on Fridays at 6:00 PM at the Starbucks located at 123 Main Street. The receiving parent shall be responsible for transportation from the exchange point. Any proposed changes to the schedule must be communicated in writing via email at least 14 days in advance and mutually agreed upon."`;

const EXAMPLE_RESPONSE_MARKDOWN = `**Document Type:** Separation Agreement Clause

**Plain English Summary:** This clause sets out the weekly custody schedule for your child, Lily. It specifies when and where you will exchange her with the other parent and who is responsible for pickup. It also explains how to request changes to this schedule.

**Key Clauses & Obligations:**
* **Schedule:** You have a "week-on/week-off" schedule.
* **Exchange Time & Place:** Exchanges are every Friday at 6:00 PM at the Starbucks on 123 Main Street.
* **Transportation:** The parent who is starting their week with Lily is responsible for picking her up from Starbucks.
* **Changes:** To change the schedule, you must email the other parent at least 2 weeks (14 days) beforehand, and you both must agree to the change in writing.

**Potential Discrepancies & Flags:**
* **Ambiguity:** The term "week-on/week-off" is clear, but it doesn't specify a start date. Make sure this is defined elsewhere in the agreement.
* **Flexibility:** The 14-day notice period for changes is quite strict and might not be practical for unexpected events.
* **Conflict Point:** A public place like Starbucks can be busy and potentially stressful for a child during an exchange.

**Suggested Next Steps:**
* **Clarify Start Date:** If not already defined, confirm the official start date for the week-on/week-off schedule with the other parent via email.
* **Document Everything:** Keep a written record of every exchange time and date. If the other parent is late, note that down.
* **Propose Alternatives:** You might consider suggesting a more neutral or private exchange location in the future if Starbucks proves difficult.

Disclaimer: This is an AI-generated analysis and does not constitute legal advice. It is for informational purposes only. You should consult with a qualified legal professional for advice on your specific situation.`;


const CaseAnalysisTool: React.FC = () => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isShowingExample, setIsShowingExample] = useState(false);

    const handleAnalyze = async () => {
        if (!query.trim()) {
            setError('Please paste the text of a document to analyze.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResponse('');
        setIsShowingExample(false);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const fullPrompt = `
**SYSTEM INSTRUCTION:**
You are an AI legal document analysis tool for CustodyBuddy.com, designed for self-represented parents in Canada involved in high-conflict family law cases. Your primary function is to analyze legal and quasi-legal documents (like court orders, separation agreements, or difficult emails) and provide informational breakdowns. You must not provide legal advice.

**TASK:**
Analyze the document text provided by the user. Structure your response using markdown for clarity (e.g., **bolding**, * bullet points). Provide the following sections:

1.  **Document Type:** Identify the likely type of document (e.g., "Email Correspondence," "Court Order," "Separation Agreement Clause").
2.  **Plain English Summary:** Briefly explain what the document is about and its main purpose in simple, easy-to-understand language.
3.  **Key Clauses & Obligations:** Extract and list the most important points, clauses, or obligations mentioned. For each point, explain what it means for the user (e.g., "You are required to...", "The other parent must..."). Use bullet points for lists.
4.  **Potential Discrepancies & Flags:** Carefully review the text for any potential issues. This could include:
    *   Vague or ambiguous language that could be misinterpreted.
    *   Contradictory statements within the document.
    *   Clauses that seem unusual or potentially unfair (without declaring them legally unenforceable).
    *   Action items or deadlines that require attention.
5.  **Suggested Next Steps:** Based on the analysis, suggest general, actionable steps. For example:
    *   "Consider seeking clarification on clause [X] in writing."
    *   "Make a note of the deadline on [Date]."
    *   "Document all communication related to this issue."
6.  **IMPORTANT DISCLAIMER:** You must conclude your entire response with the following exact, unmodified text: "Disclaimer: This is an AI-generated analysis and does not constitute legal advice. It is for informational purposes only. You should consult with a qualified legal professional for advice on your specific situation."

**USER'S DOCUMENT/QUERY:**
${query}
`;
            
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
            });
            
            setResponse(result.text);

        } catch (err) {
            console.error("Analysis Error:", err);
            
            // Default error message
            let friendlyErrorMessage = 'An error occurred while analyzing your document. Please try again later.';

            if (err instanceof Error) {
                const message = err.message.toLowerCase();
                
                if (message.includes('api key')) {
                    // This is a developer/configuration error, not a user error.
                    // Don't expose "API key" to the user.
                    friendlyErrorMessage = 'The analysis service is currently unavailable due to a configuration issue. Please contact support.';
                } else if (message.includes('fetch') || err.name === 'TypeError') {
                    // Network-related error
                    friendlyErrorMessage = 'A network error occurred. Please check your internet connection and try again.';
                } else if (message.includes('safety') || message.includes('blocked')) {
                    // Content moderation-related error from the API
                    friendlyErrorMessage = 'The document could not be analyzed due to content restrictions. Please ensure the text does not contain sensitive personal information or inappropriate material.';
                }
            }
            
            setError(friendlyErrorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setQuery(e.target.value);
        if (isShowingExample) {
            setResponse('');
            setIsShowingExample(false);
        }
    };

    const showExample = () => {
        setIsShowingExample(true);
        setQuery(EXAMPLE_INPUT);
        setResponse(EXAMPLE_RESPONSE_MARKDOWN);
        setError(null);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center gap-4">
                <p className="text-gray-300 text-sm sm:text-base">
                    Paste text from a court order or email below. Our AI will highlight key clauses and suggest next steps.
                </p>
                <button 
                    onClick={showExample}
                    className="text-sm text-amber-400 hover:text-amber-300 font-semibold transition-colors whitespace-nowrap"
                    aria-label="Show an example analysis"
                >
                    See Example
                </button>
            </div>
            <textarea
                value={query}
                onChange={handleQueryChange}
                placeholder="Paste the full text of your legal document or an email from your ex here for analysis..."
                className="w-full h-64 p-4 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none transition-shadow"
                aria-label="Case document text input"
                disabled={isLoading}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
                onClick={handleAnalyze}
                disabled={isLoading || !query.trim()}
                className="bg-amber-400 text-black font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                    </>
                ) : (
                    'Analyze Document'
                )}
            </button>

            {response && (
                <div className="mt-4 p-6 bg-slate-900 border border-slate-700 rounded-lg animate-fade-in">
                    <h3 className="text-xl font-bold mb-4 text-amber-400">AI Analysis</h3>
                    <div 
                        className="text-gray-300 leading-relaxed prose prose-invert prose-p:my-2 prose-ul:my-2 prose-strong:text-amber-400 max-w-none"
                        dangerouslySetInnerHTML={{ __html: formatMarkdown(response) }}
                    />
                </div>
            )}
        </div>
    );
};

export default CaseAnalysisTool;
