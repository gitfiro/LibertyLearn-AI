
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { getAIInstance } from '../services/geminiService';

interface LiveInterviewProps {
  isPremium: boolean;
  onUpgrade: () => void;
  onExit: () => void;
}

// Audio helpers... (Keeping existing helpers)
function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  let binary = '';
  const bytes = new Uint8Array(int16.buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return {
    data: btoa(binary),
    mimeType: 'audio/pcm;rate=16000',
  };
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  if (data.length % 2 !== 0) {
    const newData = new Uint8Array(data.length + 1);
    newData.set(data);
    data = newData;
  }
  const bufferCopy = data.slice().buffer;
  const dataInt16 = new Int16Array(bufferCopy);
  const frameCount = dataInt16.length / numChannels;
  const audioBuffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return audioBuffer;
}

const LiveInterview: React.FC<LiveInterviewProps> = ({ isPremium, onUpgrade, onExit }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState('Tap mic to start');
  const [transcript, setTranscript] = useState("Here your ear a meider e or blats inee served anw mer as enaseciooo is like Commuict Parry!");
  
  const aiRef = useRef(getAIInstance());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const stopInterview = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close());
      sessionPromiseRef.current = null;
    }
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
    setIsConnected(false);
    setStatus('Tap mic to restart');
  }, []);

  const startInterview = async () => {
    try {
      setStatus('Connecting...');
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      if (inputAudioContextRef.current.state === 'suspended') await inputAudioContextRef.current.resume();
      if (outputAudioContextRef.current.state === 'suspended') await outputAudioContextRef.current.resume();

      const outputNode = outputAudioContextRef.current.createGain();
      outputNode.connect(outputAudioContextRef.current.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      streamRef.current = stream;

      sessionPromiseRef.current = aiRef.current.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus('Listening...');
            setIsConnected(true);
            setTranscript("Hello! I am Officer Miller. Let's begin your interview.");
            if (!inputAudioContextRef.current || !streamRef.current) return;
            inputSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
            scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            inputSourceRef.current.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
             const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
             if (base64EncodedAudioString && outputAudioContextRef.current) {
                const ctx = outputAudioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                try {
                  const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), ctx, 24000, 1);
                  const source = ctx.createBufferSource();
                  source.buffer = audioBuffer;
                  source.connect(outputNode);
                  source.addEventListener('ended', () => { sourcesRef.current.delete(source); });
                  source.start(nextStartTimeRef.current);
                  nextStartTimeRef.current += audioBuffer.duration;
                  sourcesRef.current.add(source);
                } catch (err) { console.error("Decoding error:", err); }
             }
             if (message.serverContent?.interrupted) {
               sourcesRef.current.forEach(s => s.stop());
               sourcesRef.current.clear();
               if(outputAudioContextRef.current) nextStartTimeRef.current = outputAudioContextRef.current.currentTime;
             }
          },
          onclose: () => { setStatus('Connection closed.'); setIsConnected(false); },
          onerror: (e) => { console.error(e); setStatus('Error connecting.'); setIsConnected(false); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: `You are a USCIS Immigration Officer conducting a naturalization interview. Start by greeting the applicant warmly. Ask random civics questions. Keep it professional.`,
        },
      });

    } catch (e) {
      console.error("Failed to start interview", e);
      setStatus('Microphone access failed.');
    }
  };

  useEffect(() => { return () => stopInterview(); }, [stopInterview]);

  if (!isPremium) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center bg-[#1a237e] text-white m-0 animate-fade-in">
        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6">
          <i className="fas fa-lock text-4xl"></i>
        </div>
        <h2 className="text-2xl font-bold mb-4">Interview Simulator Locked</h2>
        <p className="mb-8 opacity-80 max-w-md">Upgrade to Premium to unlock real-time voice practice with our AI Officer.</p>
        <div className="flex gap-4">
            <button onClick={onExit} className="bg-white/10 px-8 py-3 rounded-full font-bold hover:bg-white/20 transition">Go Back</button>
            <button onClick={onUpgrade} className="bg-red-500 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-red-600 transition">Unlock Premium</button>
        </div>
      </div>
     );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#1a237e] text-white pb-20 animate-fade-in">
      {/* Header */}
      <div className="px-6 py-4 flex items-center pt-4">
         <button onClick={onExit} className="mr-4 text-white/80 hover:text-white transition p-2" aria-label="Go Back">
            <i className="fas fa-chevron-left"></i>
         </button>
         <h1 className="font-bold text-lg text-center flex-1 pr-8">Interview Simulator</h1>
      </div>

      <div className="flex-1 px-6 pb-8 flex flex-col items-center justify-start mt-4">
         
         {/* Avatar Card */}
         <div className="bg-white rounded-[2rem] p-6 shadow-2xl w-full max-w-sm mb-6 flex flex-col items-center relative">
            {/* Speech Bubble */}
            <div className="bg-gray-100 p-4 rounded-2xl rounded-bl-none w-full text-sm text-gray-800 relative mb-4 leading-relaxed font-medium">
               {transcript}
            </div>

            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 bg-[#fce4ec] mb-2 relative">
               {/* Simple Vector Avatar */}
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="w-full h-full">
                  <rect width="200" height="200" fill="#fce4ec"/>
                  <path d="M50 60 Q100 0 150 60 L150 140 Q100 180 50 140 Z" fill="#3e2723"/> {/* Hair Back */}
                  <circle cx="100" cy="90" r="50" fill="#f5d0b5"/> {/* Face */}
                  <path d="M100 140 Q140 140 140 200 L60 200 Q60 140 100 140" fill="#283593"/> {/* Shirt */}
                  <path d="M50 60 Q100 20 150 60 L150 90 L50 90 Z" fill="#3e2723"/> {/* Hair Front */}
                  <circle cx="85" cy="90" r="4" fill="#333"/>
                  <circle cx="115" cy="90" r="4" fill="#333"/>
                  <path d="M90 110 Q100 115 110 110" fill="none" stroke="#c98a70" strokeWidth="3"/>
               </svg>
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase mt-2">Officer Miller</p>
         </div>

         {/* Visualizer / Mic Section */}
         <div className="flex flex-col items-center justify-center gap-6 mt-2 w-full max-w-sm">
            <div className="w-full flex items-center justify-center gap-2">
                 <div className="w-24 h-24 rounded-full border-[3px] border-blue-400/30 flex items-center justify-center relative">
                     <button
                        onClick={isConnected ? stopInterview : startInterview}
                        className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-xl transition-all transform active:scale-95 ${
                            isConnected 
                            ? 'bg-red-500 text-white animate-pulse' 
                            : 'bg-[#3949ab] text-white hover:bg-[#303f9f]'
                        }`}
                        aria-label={isConnected ? "Stop Interview" : "Start Interview"}
                     >
                        <i className={`fas ${isConnected ? 'fa-stop' : 'fa-microphone'}`}></i>
                     </button>
                 </div>
            </div>
            
            <p className="text-blue-200 font-medium text-sm animate-pulse">{status}</p>

            {/* Red Feedback Box */}
            <div className="w-full bg-[#ef5350] rounded-2xl p-5 mt-2 shadow-lg text-white">
                 <h3 className="font-bold text-sm mb-1 flex items-center">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    Tip: Speak clearly
                 </h3>
                 <p className="text-xs text-white/90 leading-relaxed pl-6">
                    Wait for Officer Miller to finish speaking before answering. Keep answers concise.
                 </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default LiveInterview;
