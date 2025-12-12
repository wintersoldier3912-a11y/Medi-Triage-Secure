import React from 'react';
import { TriageAssessment, RiskLevel, PatientProfile } from '../types';
import RiskChart from './RiskChart';
import { AlertTriangle, Ambulance, Stethoscope, Home, Info, ShieldCheck, Printer, Download } from 'lucide-react';

interface AssessmentPanelProps {
  assessment: TriageAssessment | null;
  patient: PatientProfile;
  isLoading: boolean;
}

const AssessmentPanel: React.FC<AssessmentPanelProps> = ({ assessment, patient, isLoading }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    if (!assessment) return;

    const exportData = {
      patient: {
        id: patient.id,
        name: patient.name,
        age: patient.age,
        gender: patient.gender
      },
      assessment: assessment,
      timestamp: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `triage_assessment_${patient.id}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50 border-l border-slate-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">Analyzing clinical data...</p>
        <p className="text-xs text-slate-400 mt-2">Running risk stratification models</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-50 border-l border-slate-200 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Stethoscope className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700">Ready for Assessment</h3>
        <p className="text-slate-500 text-sm mt-2 max-w-xs">
          Enter patient symptoms to generate a real-time clinical risk score and differential diagnosis.
        </p>
      </div>
    );
  }

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.CRITICAL: return 'bg-red-600 text-white';
      case RiskLevel.HIGH: return 'bg-orange-500 text-white';
      case RiskLevel.MODERATE: return 'bg-yellow-500 text-white';
      case RiskLevel.LOW: return 'bg-green-600 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.CRITICAL: return <Ambulance className="w-6 h-6" />;
      case RiskLevel.HIGH: return <AlertTriangle className="w-6 h-6" />;
      case RiskLevel.MODERATE: return <Stethoscope className="w-6 h-6" />;
      case RiskLevel.LOW: return <Home className="w-6 h-6" />;
      default: return <Info className="w-6 h-6" />;
    }
  };

  return (
    <div id="printable-assessment" className="h-full bg-white flex flex-col overflow-hidden">
      {/* Header - Risk Score */}
      <div className={`${getRiskColor(assessment.riskLevel)} p-6 flex items-center justify-between shadow-sm z-10`}>
        <div>
          {/* Print Only Header Info */}
          <div className="hidden print:block mb-4 text-white/90">
             <h1 className="text-xl font-bold">MediTriage Clinical Report</h1>
             <p className="text-sm">Patient: {patient.name} | ID: {patient.id}</p>
             <p className="text-xs opacity-75">Date: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
          </div>

          <p className="text-xs font-bold uppercase opacity-80 mb-1">Triage Classification</p>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            {assessment.riskLevel.toUpperCase()} RISK
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
             onClick={handleExportJSON}
             className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors print:hidden"
             title="Export JSON"
           >
             <Download className="w-5 h-5" />
           </button>
          <button 
             onClick={handlePrint}
             className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors print:hidden"
             title="Print Assessment"
           >
             <Printer className="w-5 h-5" />
           </button>
          <div className="bg-white/20 p-3 rounded-xl ml-2">
            {getRiskIcon(assessment.riskLevel)}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 clinical-scroll">
        
        {/* Recommended Action */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
             <ShieldCheck className="w-24 h-24 text-blue-600" />
           </div>
           <h3 className="text-blue-900 font-semibold mb-2 relative z-10">Recommended Action</h3>
           <p className="text-blue-800 text-lg relative z-10 font-medium">
             {assessment.recommendedAction}
           </p>
        </div>

        {/* Clinical Summary */}
        <div>
          <h3 className="text-slate-900 font-semibold mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-500" />
            Clinical Reasoning
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
            {assessment.explanation}
          </p>
        </div>

        {/* Primary Condition */}
        <div>
           <h3 className="text-slate-900 font-semibold mb-3">Primary Suspect</h3>
           <div className="p-4 rounded-lg border border-l-4 border-slate-200 border-l-blue-500 bg-white shadow-sm">
             <span className="text-lg font-medium text-slate-800">{assessment.primaryCondition}</span>
           </div>
        </div>

        {/* Differential Chart (Hidden in Print for cleaner table view) */}
        <div className="border border-slate-200 rounded-xl p-4 shadow-sm bg-white print:hidden">
          <RiskChart conditions={assessment.differentialDiagnosis} />
        </div>

        {/* Print-Only Differential Table */}
        <div className="hidden print:block mt-4">
          <h3 className="font-bold text-slate-900 mb-2 border-b border-slate-200 pb-2">Differential Diagnosis Breakdown</h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left py-2 px-2 font-semibold text-slate-700 border border-slate-200">Condition</th>
                <th className="text-center py-2 px-2 font-semibold text-slate-700 border border-slate-200 w-24">Probability</th>
                <th className="text-left py-2 px-2 font-semibold text-slate-700 border border-slate-200">Clinical Reasoning</th>
              </tr>
            </thead>
            <tbody>
              {assessment.differentialDiagnosis.map((c, i) => (
                <tr key={i}>
                  <td className="py-2 px-2 border border-slate-200 font-medium">{c.name}</td>
                  <td className="py-2 px-2 border border-slate-200 text-center">{c.probability}%</td>
                  <td className="py-2 px-2 border border-slate-200 text-slate-600 text-xs">{c.reasoning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Disclaimer Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 italic">
            Generated by Clinical AI (Gemini 2.5 Flash). Review required by licensed personnel.
          </p>
          <div className="hidden print:block mt-2 text-[10px] text-slate-300">
             Report ID: {Math.random().toString(36).substr(2, 9).toUpperCase()} | Secure Print
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPanel;