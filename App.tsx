import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import TriageDashboard from './pages/TriageDashboard';
import DisclaimerModal from './components/DisclaimerModal';
import { MOCK_PATIENT } from './constants';
import { AppRoute, PatientProfile } from './types';

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.LOGIN);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<PatientProfile>(MOCK_PATIENT);

  const handleLogin = () => {
    setRoute(AppRoute.DASHBOARD);
  };

  const handleLogout = () => {
    setRoute(AppRoute.LOGIN);
    setDisclaimerAccepted(false);
    // Reset patient on logout
    setCurrentPatient(MOCK_PATIENT);
  };

  // Render Logic
  if (route === AppRoute.LOGIN) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Disclaimer Check - must clear before seeing dashboard */}
      {!disclaimerAccepted && (
        <DisclaimerModal onAccept={() => setDisclaimerAccepted(true)} />
      )}

      {/* Main App Layout */}
      <Navbar patient={currentPatient} onLogout={handleLogout} />
      
      <main>
         {route === AppRoute.DASHBOARD && (
           <TriageDashboard 
             patient={currentPatient} 
             onUpdatePatient={setCurrentPatient} 
           />
         )}
      </main>
    </div>
  );
};

export default App;
