import { PatientProfile } from './types';

export const MOCK_PATIENT: PatientProfile = {
  id: "PT-88392",
  name: "Alex Doe",
  age: 45,
  gender: "Male",
  history: ["Hypertension", "Previous ACL repair (2018)", "Mild Asthma"],
  allergies: ["Penicillin", "Shellfish"],
  ehrConnected: false
};

export const MOCK_EHR_DATA = {
  medications: [
    "Lisinopril 10mg PO Daily",
    "Albuterol HFA 90mcg 2 Puffs q4h PRN",
    "Atorvastatin 20mg PO Daily"
  ],
  recentLabs: [
    { test: "WBC", value: "11.5", date: "2023-10-25", flag: "High" as const },
    { test: "Creatinine", value: "1.1", date: "2023-10-25", flag: "Normal" as const },
    { test: "Glucose (Random)", value: "145", date: "2023-10-25", flag: "High" as const },
    { test: "Troponin I", value: "<0.03", date: "2023-10-25", flag: "Normal" as const }
  ],
  vitals: [
    { type: "BP", value: "158/96", unit: "mmHg", timestamp: "Today 09:15" },
    { type: "HR", value: "102", unit: "bpm", timestamp: "Today 09:15" },
    { type: "Temp", value: "99.4", unit: "F", timestamp: "Today 09:15" },
    { type: "SpO2", value: "96", unit: "%", timestamp: "Today 09:15" }
  ]
};

export const MOCK_DISCLAIMER = `
This application is a DEMONSTRATION of AI capabilities in clinical triage. 
It utilizes the Google Gemini API to simulate clinical reasoning.

1. DO NOT use this for real medical emergencies. Call 911 or your local emergency number immediately.
2. The advice generated is NOT a substitute for professional medical judgment.
3. No real patient data is stored or transmitted to a HIPAA-compliant backend in this demo version.
`;
