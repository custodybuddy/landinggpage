import React, { useState, useEffect } from 'react';
import { useEmailBuddy } from '../hooks/useEmailBuddy';
import EmailAnalysisDisplay from './email-buddy/EmailAnalysisDisplay';
import DraftingStation from './email-buddy/DraftingStation';
import AlertTriangleIcon from './icons/AlertTriangleIcon';
import XIcon from './icons/XIcon';
import RotateCwIcon from './icons/RotateCwIcon';

// Define and export types for child components
export interface Analysis {
    tone: string;
    summary: string;
    key_demands: string[];
    key_points_suggestion: string;
}
export type ToneOption = 'BIFF' | 'Grey Rock';

// Example data
const exampleReceivedEmail = `Subject: URGENT - Weekend Schedule

You were 15 minutes late for pickup last Friday. This is unacceptable and a violation of our agreement. The kids were upset.

I'm taking them to a birthday party on Saturday at 2 PM, so I need you to drop them off at my house at 1 PM instead of the usual 6 PM. This is non-negotiable as I've already RSVP'd.

Also, you still haven't paid me for the dentist appointment from two weeks ago. I need that money by tomorrow.`;

const exampleAnalysis: Analysis = {
    tone: "Demanding and Accusatory",
    summary: "The sender is making accusations about tardiness, unilaterally changing the weekend schedule, and demanding payment.",
    key_demands: [
        "Drop kids off at 1 PM on Saturday instead of 6 PM.",
        "Pay for the dentist appointment by tomorrow."
    ],
    key_points_suggestion: `- Respond to the demand: "Drop kids off at 1 PM on Saturday instead of 6 PM."\n- Respond to the demand: "Pay for the dentist appointment by tomorrow."`
};

const exampleKeyPoints = `1. I will adhere to the court-ordered exchange time of Saturday at 6 PM. I cannot accommodate the 1 PM change.
2. The dentist payment was sent via e-transfer this morning. Please check your email.
3. I was 10 minutes late, not 15, due to unexpected traffic. I texted you that I was running late.`;

const exampleDrafts = {
    'BIFF': `Subject: Re: URGENT - Weekend Schedule

Hi [Co-Parent's Name],

Thanks for the update.

Per our court order, I will be dropping the children off at the regular time of 6 PM on Saturday. I'm not able to change the time this weekend.

Regarding the dentist payment, the e-transfer was sent this morning. The confirmation number is #12345.

Best,
[Your Name]`,
    'Grey Rock': `Subject: Re: URGENT - Weekend Schedule

Noted. I will see you at 6 PM on Saturday as per the schedule. The payment was sent.`,
};

const EmailLawBuddy: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
    const { 
        receivedEmail, 
        setReceivedEmail, 
        analysis, 
        isLoading, 
        error, 
        handleAnalyzeEmail, 
        reset,
        setError 
    } = useEmailBuddy();

    const [isShowingExample, setIsShowingExample] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            // Delay reset to allow for modal close animation
            setTimeout(() => {
                reset();
                setIsShowingExample(false);
            }, 300);
        }
    }, [isOpen, reset]);

    const handleShowExample = () => {
        setIsShowingExample(true);
        setReceivedEmail(exampleReceivedEmail);
    };

    const handleStartOver = () => {
        reset();
        setIsShowingExample(false);
    };

    const currentAnalysis = isShowingExample ? exampleAnalysis : analysis;
    const currentKeyPoints = isShowingExample ? exampleKeyPoints : (currentAnalysis?.key_points_suggestion || '');

    return (
        <div className="space-y-6">
            <p className="text-gray-400 text-sm">
                Paste a high-conflict email below. Our AI will analyze the tone, identify demands, and help you draft a professional, court-ready response using proven de-escalation techniques like BIFF or Grey Rock.
            </p>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label htmlFor="received-email" className="block text-sm font-medium text-gray-300">
                        Email You Received
                    </label>
                    <button onClick={handleShowExample} className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors">
                        Show Example
                    </button>
                </div>
                <textarea
                    id="received-email"
                    value={isShowingExample ? exampleReceivedEmail : receivedEmail}
                    onChange={(e) => {
                        setIsShowingExample(false);
                        setReceivedEmail(e.target.value);
                    }}
                    placeholder="Paste the full email here..."
                    className="w-full h-40 p-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none transition-shadow duration-200 disabled:opacity-50"
                    disabled={isLoading}
                />
            </div>
            
            {error && (
                 <div className="bg-red-900/20 border border-red-500/50 text-red-400 text-sm rounded-lg p-3 flex items-center gap-3 animate-fade-in-up-fast" role="alert">
                    <AlertTriangleIcon className="w-5 h-5 flex-shrink-0" />
                    <p className="flex-grow">{error}</p>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-white" aria-label="Dismiss error message"><XIcon className="w-5 h-5" /></button>
                </div>
            )}

            {!currentAnalysis && (
                <div className="flex justify-end pt-4 border-t border-slate-700">
                     <button
                        onClick={handleAnalyzeEmail}
                        disabled={isLoading || (!receivedEmail.trim() && !isShowingExample)}
                        className="inline-flex items-center justify-center bg-amber-400 text-black font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-200 ease-out motion-safe:hover:scale-105 motion-safe:active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                         {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Analyzing...
                            </>
                        ) : 'Analyze Email'}
                    </button>
                </div>
            )}
            
            {currentAnalysis && (
                <div className="space-y-6 animate-fade-in-up pt-4 border-t border-slate-700">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-200">Step 2: Draft Your Response</h3>
                        <button
                            onClick={handleStartOver}
                            disabled={isLoading}
                            className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 font-semibold transition-colors disabled:opacity-50"
                        >
                            <RotateCwIcon className="w-4 h-4" />
                            Start Over
                        </button>
                    </div>
                    <EmailAnalysisDisplay analysis={currentAnalysis} />
                    <DraftingStation 
                        receivedEmail={isShowingExample ? exampleReceivedEmail : receivedEmail}
                        initialKeyPoints={currentKeyPoints}
                        isShowingExample={isShowingExample}
                        exampleKeyPoints={exampleKeyPoints}
                        exampleDrafts={exampleDrafts}
                    />
                </div>
            )}
        </div>
    );
};

export default EmailLawBuddy;
