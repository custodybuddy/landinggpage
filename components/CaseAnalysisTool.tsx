
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

// A more robust markdown to HTML converter for the expected AI response format.
const formatMarkdown = (text: string): string => {
    // Split the text into lines
    const lines = text.split('\n');
    let html = '';
    let inList = false;

    for (const line of lines) {
        // Trim the line to handle whitespace
        const trimmedLine = line.trim();

        // Check for bullet points (lines starting with *)
        if (trimmedLine.startsWith('* ')) {
            const listItemText = trimmedLine.substring(2);
            if (!inList) {
                // Start a new list
                html += '<ul class="list-disc pl-6 space-y-1">';
                inList = true;
            }
            // Add the list item, formatting for bold text inside
            html += `<li>${listItemText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`;
        } else {
            // This line is not a list item. It could be a paragraph or a blank line.
            if (trimmedLine) {
                // It's a paragraph. If we were in a list, close it first.
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                // Now, add the paragraph.
                html += `<p>${trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
            }
            // If trimmedLine is empty, we do nothing. This preserves `inList` state
            // across blank lines, allowing a single list to have empty lines between items.
        }
    }

    // If the text ends while inside a list, close the list tag
    if (inList) {
        html += '</ul>';
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
            console.error(err);
            setError('An error occurred while analyzing your document. Please check the text and try again.');
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