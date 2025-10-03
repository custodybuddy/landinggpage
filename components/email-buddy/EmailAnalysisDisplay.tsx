import React from 'react';
import SparklesIcon from '../icons/SparklesIcon';
import { Analysis } from '../EmailLawBuddy';

interface EmailAnalysisDisplayProps {
    analysis: Analysis;
}

const EmailAnalysisDisplay: React.FC<EmailAnalysisDisplayProps> = ({ analysis }) => {
    return (
        <div className="p-4 bg-slate-900 border border-slate-700 rounded-lg">
            <h3 className="text-lg font-bold text-amber-400 mb-2 flex items-center gap-2">
               <SparklesIcon />
                AI Analysis
            </h3>
            <div className="text-sm space-y-2">
               <p><strong className="font-semibold text-gray-300">Identified Tone:</strong> <span className="text-gray-400">{analysis.tone}</span></p>
               <p><strong className="font-semibold text-gray-300">Summary:</strong> <span className="text-gray-400">{analysis.summary}</span></p>
            </div>
        </div>
    );
};

export default EmailAnalysisDisplay;