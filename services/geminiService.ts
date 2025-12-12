import { GoogleGenAI, Type } from "@google/genai";
import { PatientProfile, TriageAssessment, RiskLevel } from "../types";

// In a real production app, this would be a backend call to a secured FastAPI service.
// For this demo, we call Gemini directly from the frontend.

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please set the API_KEY environment variable.");
  }
  return new GoogleGenAI({ apiKey });
};

export const assessSymptoms = async (
  symptoms: string,
  profile: PatientProfile
): Promise<TriageAssessment> => {
  const ai = getClient();
  
  const systemInstruction = `
    You are an advanced Clinical Triage AI Assistant. 
    Your role is to analyze patient symptoms in the context of their demographic and medical history, including EHR data if available.
    
    PATIENT CONTEXT:
    Age: ${profile.age}
    Gender: ${profile.gender}
    Medical History: ${profile.history.join(", ")}
    Allergies: ${profile.allergies.join(", ")}
    ${profile.ehrConnected ? `
    --- EHR DATA ---
    Current Medications: ${profile.medications?.join(", ") || "None"}
    Recent Vitals: ${profile.vitals?.map(v => `${v.type}: ${v.value} ${v.unit}`).join(", ") || "None"}
    Recent Labs: ${profile.recentLabs?.map(l => `${l.test}: ${l.value} (${l.flag || 'Normal'})`).join(", ") || "None"}
    ----------------
    ` : ""}

    TASK:
    1. Analyze the reported symptoms: "${symptoms}"
    2. Cross-reference with history, meds, and vitals (e.g., if BP is high and symptoms match hypertension crisis).
    3. Determine the clinical risk level (Low, Moderate, High, Critical).
    4. Identify the most likely primary condition.
    5. Provide a differential diagnosis with estimated probabilities.
    6. Recommend a clear course of action (e.g., "Call 911", "Go to ER", "Schedule PCP appointment", "Home care").
    
    RULES:
    - Be conservative and safety-prioritizing.
    - If symptoms suggest heart attack, stroke, or severe trauma, mark as Critical.
    - Output MUST be valid JSON matching the schema.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: symptoms,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.1, // Low temperature for consistent, analytical responses
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          riskLevel: {
            type: Type.STRING,
            enum: [RiskLevel.LOW, RiskLevel.MODERATE, RiskLevel.HIGH, RiskLevel.CRITICAL]
          },
          primaryCondition: { type: Type.STRING },
          differentialDiagnosis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                probability: { type: Type.NUMBER, description: "Percentage likelihood 0-100" },
                reasoning: { type: Type.STRING }
              }
            }
          },
          recommendedAction: { type: Type.STRING },
          explanation: { type: Type.STRING },
          triageColor: { type: Type.STRING, enum: ["green", "yellow", "orange", "red"] }
        },
        required: ["riskLevel", "primaryCondition", "differentialDiagnosis", "recommendedAction", "explanation", "triageColor"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");

  return JSON.parse(text) as TriageAssessment;
};
