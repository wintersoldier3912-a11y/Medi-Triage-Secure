import React from 'react';
import { ShieldAlert, User, LogOut, Activity, Database } from 'lucide-react';
import { PatientProfile } from '../types';

interface NavbarProps {
  patient?: PatientProfile;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ patient, onLogout }) => {
  return (
    <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">MediTriage Secure</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Clinical Decision Support</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {patient && (
          <div className="hidden md:flex items-center gap-3 bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700 relative overflow-hidden">
            {patient.ehrConnected && (
               <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full m-1.5 animate-pulse"></div>
            )}
            <User className="w-4 h-4 text-slate-300" />
            <span className="text-sm font-medium text-slate-200">{patient.name}</span>
            <span className="text-xs text-slate-500">|</span>
            <span className="text-xs text-slate-400">ID: {patient.id}</span>
            {patient.ehrConnected && (
              <>
                 <span className="text-xs text-slate-600">|</span>
                 <Database className="w-3 h-3 text-emerald-400" />
              </>
            )}
          </div>
        )}
        
        <button 
          onClick={onLogout}
          className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
          title="Secure Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
