import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { MOCK_DISCLAIMER } from '../constants';

interface DisclaimerModalProps {
  onAccept: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onAccept }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-red-50 p-6 flex items-start gap-4 border-b border-red-100">
           <div className="bg-red-100 p-2 rounded-full shrink-0">
             <AlertTriangle className="w-6 h-6 text-red-600" />
           </div>
           <div>
             <h3 className="text-lg font-bold text-red-900">Critical Clinical Disclaimer</h3>
             <p className="text-red-700 text-sm mt-1">Please read carefully before proceeding.</p>
           </div>
        </div>
        
        <div className="p-6">
          <div className="prose prose-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
            {MOCK_DISCLAIMER.split('\n').map((line, i) => (
              line.trim() && <p key={i} className="mb-2 last:mb-0">{line}</p>
            ))}
          </div>
          
          <button 
            onClick={onAccept}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-colors shadow-lg"
          >
            I Acknowledge & Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;
