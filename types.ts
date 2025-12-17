export interface LabResult {
  test: string;
  value: string;
  date: string;
  flag?: 'High' | 'Low' | 'Normal';
}

export interface VitalSign {
  type: string;
  value: string;
  unit: string;
  timestamp: string;
}

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  history: string[];
  allergies: string[];
  // EHR Fields
  medications?: string[];
  recentLabs?: LabResult[];
  vitals?: VitalSign[];
  ehrConnected?: boolean;
}

export enum RiskLevel {
  LOW = 'Low',
  MODERATE = 'Moderate',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface ClinicalCondition {
  name: string;
  probability: number; // 0-100
  reasoning: string;
}

export interface TriageAssessment {
  riskLevel: RiskLevel;
  primaryCondition: string;
  icd10Code: string;
  differentialDiagnosis: ClinicalCondition[];
  recommendedAction: string;
  explanation: string;
  triageColor: 'green' | 'yellow' | 'orange' | 'red';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export enum AppRoute {
  LOGIN = 'login',
  DASHBOARD = 'dashboard',
  TRIAGE = 'triage',
  HISTORY = 'history'
}