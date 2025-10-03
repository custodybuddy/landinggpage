

import React from 'react';
import { IncidentReport, IncidentData } from '../../hooks/useIncidentReporter';
import DownloadIcon from '../icons/DownloadIcon';
import RotateCwIcon from '../icons/RotateCwIcon';
import Feedback from '../Feedback';
import ExternalLinkIcon from '../icons/ExternalLinkIcon';
import { getISODate } from '../../utils/dateUtils';
import { exportTextFile } from '../../utils/exportUtils';

interface ReportResultProps {
    response: IncidentReport;
    originalData: IncidentData;
    onStartOver: () => void;
}

const ReportResult: React.FC<ReportResultProps> = ({ response, originalData, onStartOver }) => {

    const generateReportText = () => {
        let text = `INCIDENT REPORT\n`;
        text += `========================================\n\n`;
        text += `Date & Time: ${originalData.dateTime}\n`;
        text += `Location: ${originalData.location}\n`;
        text += `Parties Involved: ${originalData.involvedParties}\n`;
        text += `Jurisdiction: ${originalData.jurisdiction}\n\n`;
        text += `----------------------------------------\n`;
        text += `PROFESSIONAL SUMMARY\n`;
        text += `----------------------------------------\n`;
        text += `${response.professionalSummary}\n\n`;
        text += `----------------------------------------\n`;
        text += `OBSERVED IMPACT\n`;
        text += `----------------------------------------\n`;
        response.observedImpact.forEach(item => {
            text += `- ${item}\n`;
        });
        text += `\n`;
        text += `----------------------------------------\n`;
        text += `LEGAL INSIGHTS & STRATEGY (FOR INFORMATIONAL PURPOSES)\n`;
        text += `----------------------------------------\n`;
        response.legalInsights.forEach(item => {
            text += `- Insight: ${item.insight}\n`;
            text += `  Legislation: ${item.legislation}\n`;
            text += `  Source: ${item.sourceUrl}\n\n`;
        });
        text += `\n\n========================================\n`;
        text += `Original Narrative (for reference):\n${originalData.narrative}\n\n`;
        text += `**Disclaimer: This is an AI-generated report and does not constitute legal advice. It is for informational purposes only.**\n`;
        return text;
    };

    const handleExport = () => {
        const reportText = generateReportText();
        const date = getISODate();
        const filename = `CustodyBuddy-Incident-Report-${date}.txt`;
        exportTextFile(reportText, filename);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-amber-400">Generated Incident Report</h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onStartOver}
                        className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                    >
                        <RotateCwIcon className="w-4 h-4" />
                        New Report
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-700 rounded-lg space-y-4">
                <section>
                    <h4 className="font-bold text-lg text-gray-200 mb-2">Professional Summary</h4>
                    <p className="text-gray-300 whitespace-pre-wrap">{response.professionalSummary}</p>
                </section>
                <section>
                    <h4 className="font-bold text-lg text-gray-200 mb-2">Observed Impact</h4>
                    <ul className="list-disc pl-5 space-y-1 text-gray-300">
                        {response.observedImpact.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </section>
                <section>
                    <h4 className="font-bold text-lg text-gray-200 mb-2">Legal Insights &amp; Strategy</h4>
                     <div className="space-y-4">
                        {response.legalInsights.map((item, i) => (
                            <div key={i} className="p-3 bg-slate-800 rounded-md border border-slate-700">
                                <p className="text-gray-300">{item.insight}</p>
                                <div className="mt-2 text-xs">
                                    <span className="font-semibold text-gray-400">Relevant Legislation: </span>
                                    <a 
                                        href={item.sourceUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-amber-400 hover:text-amber-300 hover:underline inline-flex items-center gap-1"
                                    >
                                        {item.legislation}
                                        <ExternalLinkIcon />
                                        <span className="sr-only">(opens in new tab)</span>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                     <p className="text-xs text-gray-500 mt-3">*For informational purposes only. Not legal advice. Verify sources independently.</p>
                </section>
                <Feedback />
            </div>
        </div>
    );
};

export default ReportResult;
