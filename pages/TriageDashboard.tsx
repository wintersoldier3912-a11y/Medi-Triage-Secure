import React, { useState, useRef, useEffect } from 'react';
import { Send, UserCircle, Bot, Paperclip, Mic, AlertCircle, Database, Check, Loader2, FileText, Sparkles, Thermometer, X } from 'lucide-react';
import { MOCK_EHR_DATA, MOCK_DISCLAIMER } from '../constants';
import { assessSymptoms } from '../services/geminiService';
import { TriageAssessment, ChatMessage, PatientProfile } from '../types';
import AssessmentPanel from '../components/AssessmentPanel';
import EHRModal from '../components/EHRModal';

// Add type definition for Web Speech API to avoid TS errors
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface TriageDashboardProps {
  patient: PatientProfile;
  onUpdatePatient: (patient: PatientProfile) => void;
}

const SYMPTOM_SUGGESTIONS: Record<string, string[]> = {
  "fever": ["High grade (>103°F)", "With chills", "Night sweats", "Responding to meds"],
  "cough": ["Dry", "Productive (phlegm)", "Barking", "Blood-tinged"],
  "headache": ["Throbbing", "Light sensitive", "With nausea", "Sudden onset"],
  "pain": ["Sharp", "Dull", "Radiating", "Constant", "Intermittent"],
  "chest": ["Crushing pressure", "Radiating to arm", "Worse breathing", "Palpitations"],
  "breath": ["At rest", "With exertion", "Wheezing", "Cannot lie flat"],
  "stomach": ["Upper right", "Lower right", "Nausea", "Bloating", "After eating"],
  "abdominal": ["Upper right", "Lower right", "Nausea", "Bloating", "After eating"],
  "dizzy": ["Room spinning", "Lightheaded", "On standing", "Passing out"]
};

const TriageDashboard: React.FC<TriageDashboardProps> = ({ patient, onUpdatePatient }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'system',
      content: MOCK_DISCLAIMER.trim(),
      timestamp: new Date()
    },
    {
      id: '1',
      role: 'assistant',
      content: `Hello. I am the MediTriage Assistant. I see you are accessing the profile for **${patient.name}** (${patient.age} ${patient.gender}). \n\nPlease describe the patient's current symptoms in detail, including onset, severity, and any alleviating factors.`,
      timestamp: new Date()
    }
  ]);
  const [assessment, setAssessment] = useState<TriageAssessment | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConnectingEHR, setIsConnectingEHR] = useState(false);
  const [showEHRModal, setShowEHRModal] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [severity, setSeverity] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [showDisclaimerToast, setShowDisclaimerToast] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Suggestion Logic
  useEffect(() => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }
    
    const lowerInput = input.toLowerCase();
    const newSuggestions = new Set<string>();
    
    Object.entries(SYMPTOM_SUGGESTIONS).forEach(([key, values]) => {
      if (lowerInput.includes(key)) {
        values.forEach(v => newSuggestions.add(v));
      }
    });

    const filtered = Array.from(newSuggestions).filter(s => !lowerInput.includes(s.toLowerCase()));
    setSuggestions(filtered.slice(0, 5));
  }, [input]);

  const addSuggestion = (text: string) => {
    const lastChar = input.trim().slice(-1);
    let prefix = "";
    if (input.trim().length > 0 && !/[.,;?!]/.test(lastChar)) {
      prefix = ", ";
    } else if (input.trim().length > 0) {
      prefix = " ";
    }
    
    const newValue = input.trim() + prefix + text;
    setInput(newValue);
    textareaRef.current?.focus();
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const systemMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'system',
        content: "Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMsg]);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => {
        const trimmed = prev.trim();
        return trimmed ? `${trimmed} ${transcript}` : transcript;
      });
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleConnectEHR = () => {
    if (patient.ehrConnected) {
      setShowEHRModal(true);
      return;
    }

    setIsConnectingEHR(true);
    // Simulate API Latency
    setTimeout(() => {
      const updatedPatient: PatientProfile = {
        ...patient,
        ...MOCK_EHR_DATA,
        ehrConnected: true
      };
      onUpdatePatient(updatedPatient);
      setIsConnectingEHR(false);
      setShowEHRModal(true);
      
      // Notify via chat
      const systemMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'system',
        content: "EHR Sync Successful. Clinical context updated with recent vitals, labs, and medications.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMsg]);
    }, 1500);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Check interaction count for disclaimer reminder
    const newCount = messageCount + 1;
    setMessageCount(newCount);
    if (newCount > 0 && newCount % 3 === 0) {
      setShowDisclaimerToast(true);
    }

    // Append severity context if selected
    const contentWithSeverity = severity 
      ? `${input} (Severity: ${severity})`
      : input;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: contentWithSeverity,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSeverity(null); // Reset severity selection
    setIsAnalyzing(true);

    try {
      // Aggregate context for the AI including the new message with severity
      const fullContext = messages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .join(' ') + ' ' + contentWithSeverity;

      const result = await assessSymptoms(fullContext, patient);
      
      setAssessment(result);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I've analyzed the clinical presentation. Please review the assessment panel on the right for risk stratification and recommendations.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
         id: (Date.now() + 1).toString(),
         role: 'system',
         content: "Error connecting to clinical analysis engine. Please try again or switch to manual protocol.",
         timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] mt-16 bg-slate-100 overflow-hidden relative">
      {/* EHR Modal */}
      {showEHRModal && (
        <EHRModal patient={patient} onClose={() => setShowEHRModal(false)} />
      )}

      {/* Left: Chat Interface */}
      <div className="w-full md:w-1/2 lg:w-5/12 flex flex-col border-r border-slate-200 bg-white relative">
        
        {/* Patient Context Banner */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between shadow-sm z-10 relative">
           <div>
             <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
               Patient: {patient.name}
               {patient.ehrConnected && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] rounded-md font-bold uppercase tracking-wide">EHR Linked</span>}
             </h2>
             <p className="text-xs text-slate-500 max-w-[200px] truncate">
               History: {patient.history.join(', ')}
             </p>
           </div>
           
           <button 
             onClick={handleConnectEHR}
             disabled={isConnectingEHR}
             className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
               patient.ehrConnected 
                ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200' 
                : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-blue-600'
             }`}
           >
             {isConnectingEHR ? (
               <>
                 <Loader2 className="w-3 h-3 animate-spin" />
                 Connecting...
               </>
             ) : patient.ehrConnected ? (
               <>
                 <FileText className="w-3 h-3" />
                 View Records
               </>
             ) : (
               <>
                 <Database className="w-3 h-3" />
                 Connect EHR
               </>
             )}
           </button>
        </div>

        {/* Disclaimer Reminder Toast */}
        {showDisclaimerToast && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 w-3/4 max-w-sm animate-in fade-in slide-in-from-top-4 duration-300">
             <div className="bg-amber-50/95 backdrop-blur border border-amber-200 text-amber-900 px-4 py-3 rounded-lg shadow-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide mb-1 text-amber-700">Safety Reminder</p>
                  <p className="text-xs leading-relaxed opacity-90">
                    This AI assistant is for demonstration only. <span className="font-bold">Do not use for real medical emergencies.</span>
                  </p>
                </div>
                <button 
                  onClick={() => setShowDisclaimerToast(false)} 
                  className="text-amber-500 hover:text-amber-800 transition-colors p-1"
                >
                   <X className="w-4 h-4" />
                </button>
             </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 clinical-scroll" ref={scrollRef}>
          {messages.map((msg) => {
            // Check if this is the EHR sync system message to render a special alert
            const isEHRAlert = msg.role === 'system' && msg.content.includes("EHR Sync Successful");
            
            if (isEHRAlert) {
              return (
                <div key={msg.id} className="flex justify-center my-4 animate-in fade-in zoom-in-95 duration-500">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3 shadow-sm max-w-sm">
                    <div className="bg-emerald-100 p-2 rounded-full shrink-0">
                      <Check className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">System Alert</p>
                      <p className="text-sm text-emerald-700 font-medium">EHR Data Successfully Loaded</p>
                      <p className="text-[10px] text-emerald-600 mt-0.5 opacity-80">AI context refreshed with Vitals & Labs</p>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-blue-600' : msg.role === 'system' ? 'bg-amber-100' : 'bg-slate-200'
                  }`}>
                    {msg.role === 'user' ? <UserCircle className="w-5 h-5 text-white" /> : 
                    msg.role === 'system' ? <AlertCircle className="w-4 h-4 text-amber-600" /> :
                    <Bot className="w-5 h-5 text-slate-600" />}
                  </div>
                  
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : msg.role === 'system'
                      ? 'bg-amber-50 text-amber-800 border border-amber-100'
                      : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                  }`}>
                    {msg.content.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                    ))}
                    <span className={`text-[10px] block mt-2 opacity-70 ${msg.role === 'user' ? 'text-blue-100' : msg.role === 'system' ? 'text-amber-600' : 'text-slate-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {isAnalyzing && (
             <div className="flex items-center gap-2 text-slate-400 text-xs ml-12">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></div>
                <span className="ml-2 font-medium">Processing clinical data...</span>
             </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-200 bg-white transition-all duration-300">
          
          {/* Quick Suggestions */}
          {suggestions.length > 0 && (
            <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar animate-in slide-in-from-bottom-2 fade-in duration-300">
              <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md shrink-0 select-none">
                <Sparkles className="w-3 h-3" />
                <span>Suggestions</span>
              </div>
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => addSuggestion(s)}
                  className="text-xs text-slate-600 bg-slate-50 border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-full transition-all whitespace-nowrap active:scale-95"
                >
                  + {s}
                </button>
              ))}
            </div>
          )}

          {/* Severity Selector - Segmented Control */}
          <div className="mb-2 flex items-center justify-between animate-in fade-in slide-in-from-bottom-1 duration-300">
             <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
               <Thermometer className="w-3 h-3" />
               <span>Severity Assessment</span>
             </div>
             
             <div className="inline-flex rounded-lg shadow-sm isolate" role="group">
               {(['Mild', 'Moderate', 'Severe', 'Critical'] as const).map((level, index, arr) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSeverity(severity === level ? null : level)}
                    className={`
                      px-3 py-1 text-xs font-medium transition-all border border-slate-200 
                      ${index === 0 ? 'rounded-l-lg' : '-ml-px'}
                      ${index === arr.length - 1 ? 'rounded-r-lg' : ''}
                      ${
                        severity === level 
                          ? level === 'Critical' ? 'bg-red-600 border-red-600 text-white z-10'
                          : level === 'Severe' ? 'bg-orange-500 border-orange-500 text-white z-10'
                          : level === 'Moderate' ? 'bg-amber-400 border-amber-400 text-white z-10'
                          : 'bg-emerald-500 border-emerald-500 text-white z-10'
                          : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 hover:z-10'
                      }
                    `}
                  >
                    {level}
                  </button>
               ))}
             </div>
          </div>

          <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-300 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all shadow-sm">
             <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors" title="Attach media (Simulated)">
               <Paperclip className="w-5 h-5" />
             </button>
             <textarea 
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe symptoms..."
                className="w-full bg-transparent border-none focus:ring-0 text-slate-800 text-sm max-h-32 resize-none py-2"
                rows={1}
             />
             <button 
                onClick={toggleRecording}
                className={`p-2 transition-colors rounded-full ${isRecording ? 'text-red-600 bg-red-100 animate-pulse' : 'text-slate-400 hover:text-slate-600'}`} 
                title={isRecording ? "Stop Recording" : "Voice Input"}
             >
               <Mic className={`w-5 h-5 ${isRecording ? 'fill-current' : ''}`} />
             </button>
             <button 
                onClick={handleSend}
                disabled={!input.trim() || isAnalyzing}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
             >
               <Send className="w-5 h-5" />
             </button>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-2">
            Secure connection. Data encrypted at rest and in transit.
          </p>
        </div>
      </div>

      {/* Right: Clinical Assessment Panel */}
      <div className="hidden md:block md:w-1/2 lg:w-7/12 h-full bg-slate-50">
        <AssessmentPanel assessment={assessment} patient={patient} isLoading={isAnalyzing} />
      </div>
    </div>
  );
};

export default TriageDashboard;