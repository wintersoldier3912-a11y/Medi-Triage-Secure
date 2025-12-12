import React from 'react';
import { X, Activity, Pill, FlaskConical, FileText, Database } from 'lucide-react';
import { PatientProfile } from '../types';

interface EHRModalProps {
  patient: PatientProfile;
  onClose: () => void;
}

const EHRModal: React.FC<EHRModalProps> = ({ patient, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
             <div className="bg-emerald-500 p-2 rounded-lg">
                <Database className="w-5 h-5 text-white" />
             </div>
             <div>
               <h2 className="text-lg font-bold">Electronic Health Record</h2>
               <p className="text-xs text-slate-300 flex items-center gap-1">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                 Secure Connection Active
               </p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 bg-slate-50 clinical-scroll">
          
          {/* Vitals Section */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800">Most Recent Vitals</h3>
                <span className="text-xs text-slate-400 ml-auto">{patient.vitals?.[0]?.timestamp}</span>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {patient.vitals?.map((v, i) => (
                  <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                    <p className="text-xs text-slate-500 uppercase font-semibold">{v.type}</p>
                    <p className="text-lg font-bold text-slate-900">{v.value} <span className="text-xs font-normal text-slate-500">{v.unit}</span></p>
                  </div>
                ))}
             </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Meds */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                 <Pill className="w-5 h-5 text-purple-600" />
                 <h3 className="font-bold text-slate-800">Active Medications</h3>
              </div>
              <ul className="space-y-3">
                 {patient.medications?.map((med, i) => (
                   <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                     <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                     {med}
                   </li>
                 ))}
              </ul>
            </div>

            {/* Labs */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                 <FlaskConical className="w-5 h-5 text-amber-600" />
                 <h3 className="font-bold text-slate-800">Lab Results</h3>
              </div>
              <div className="space-y-3">
                 {patient.recentLabs?.map((lab, i) => (
                   <div key={i} className="flex items-center justify-between text-sm">
                     <span className="text-slate-600 font-medium">{lab.test}</span>
                     <div className="flex items-center gap-2">
                       <span className={`font-mono font-bold ${
                         lab.flag === 'High' ? 'text-red-600' : 
                         lab.flag === 'Low' ? 'text-blue-600' : 'text-slate-700'
                       }`}>
                         {lab.value}
                       </span>
                       {lab.flag && lab.flag !== 'Normal' && (
                         <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold">{lab.flag}</span>
                       )}
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>

          {/* History Note */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-800">Provider Notes</h3>
             </div>
             <p className="text-xs text-slate-500 leading-relaxed">
               Patient has a history of non-compliance with anti-hypertensives. Last admission 2018 for orthopedic surgery. Allergies verified at check-in.
             </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close Record
          </button>
        </div>
      </div>
    </div>
  );
};

export default EHRModal;
