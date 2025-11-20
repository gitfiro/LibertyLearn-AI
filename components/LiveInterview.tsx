
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { getAIInstance } from '../services/geminiService';

interface LiveInterviewProps {
  isPremium: boolean;
  onUpgrade: () => void;
}

// Audio helpers
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

// Robust Audio Decoding for PCM 16-bit (Fixed for Android/Safari)
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  // Ensure even byte length for Int16 and byte alignment
  if (data.length % 2 !== 0) {
    const newData = new Uint8Array(data.length + 1);
    newData.set(data);
    data = newData;
  }

  // Create a copy of the buffer to ensure byte offset alignment
  // Int16Array(buffer, offset) requires offset to be a multiple of 2.
  const bufferCopy = data.slice().buffer;
  const dataInt16 = new Int16Array(bufferCopy);
  
  const frameCount = dataInt16.length / numChannels;
  const audioBuffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Normalize 16-bit integer to float [-1, 1]
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return audioBuffer;
}

const LiveInterview: React.FC<LiveInterviewProps> = ({ isPremium, onUpgrade }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState('Ready to start');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  
  // Refs for audio context and session management
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
    // Stop user media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close audio contexts
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }

    // Disconnect session
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close());
      sessionPromiseRef.current = null;
    }

    // Clear sources
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();

    setIsConnected(false);
    setStatus('Interview ended.');
    setVolumeLevel(0);
  }, []);

  const startInterview = async () => {
    try {
      setStatus('Connecting...');
      
      // Initialize Audio Contexts with user gesture
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // Resume contexts if suspended (common on mobile)
      if (inputAudioContextRef.current.state === 'suspended') await inputAudioContextRef.current.resume();
      if (outputAudioContextRef.current.state === 'suspended') await outputAudioContextRef.current.resume();

      const outputNode = outputAudioContextRef.current.createGain();
      outputNode.connect(outputAudioContextRef.current.destination);

      // Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;

      // Connect to Gemini Live
      sessionPromiseRef.current = aiRef.current.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus('Speaking with Officer');
            setIsConnected(true);

            if (!inputAudioContextRef.current || !streamRef.current) return;

            // Setup Input Stream Processing
            inputSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
            scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              
              // Simple volume visualization logic
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
              const rms = Math.sqrt(sum / inputData.length);
              setVolumeLevel(Math.min(rms * 5, 1)); // Scale for visual

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
                  const audioBuffer = await decodeAudioData(
                    decode(base64EncodedAudioString),
                    ctx,
                    24000,
                    1
                  );

                  const source = ctx.createBufferSource();
                  source.buffer = audioBuffer;
                  source.connect(outputNode);
                  source.addEventListener('ended', () => {
                    sourcesRef.current.delete(source);
                  });

                  source.start(nextStartTimeRef.current);
                  nextStartTimeRef.current += audioBuffer.duration;
                  sourcesRef.current.add(source);
                } catch (err) {
                  console.error("Decoding error:", err);
                }
             }

             const interrupted = message.serverContent?.interrupted;
             if (interrupted) {
               sourcesRef.current.forEach(s => s.stop());
               sourcesRef.current.clear();
               if(outputAudioContextRef.current) {
                   nextStartTimeRef.current = outputAudioContextRef.current.currentTime;
               }
             }
          },
          onclose: () => {
            setStatus('Connection closed.');
            setIsConnected(false);
          },
          onerror: (e) => {
            console.error(e);
            setStatus('Connection error.');
            setIsConnected(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `You are a USCIS Immigration Officer conducting a naturalization interview. 
          Start by greeting the applicant warmly and asking for their name. 
          Then, proceed to ask 5 random civics questions from the 2008 test, one by one. 
          Wait for their answer. Correct them politely if wrong.
          Finally, test their English by asking them to read a simple sentence about US history.
          Keep your tone professional but official.`,
        },
      });

    } catch (e) {
      console.error("Failed to start interview", e);
      setStatus('Microphone access failed.');
    }
  };

  const confirmEndSession = () => {
    stopInterview();
    setShowEndConfirmation(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopInterview();
    };
  }, [stopInterview]);

  if (!isPremium) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12 px-4 sm:px-8 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center transition-colors">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <i className="fas fa-microphone-alt-slash text-3xl sm:text-4xl text-patriot-red"></i>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-3">Live Interview Locked</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-8 max-w-md">
          Practice with our real-time AI Officer to simulate the actual interview experience. 
          This premium feature requires advanced audio processing.
        </p>
        <button
          onClick={onUpgrade}
          className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-full font-bold text-base sm:text-lg shadow-lg hover:scale-105 transition flex items-center justify-center gap-2"
        >
          <i className="fas fa-crown"></i> Unlock Live Interview
        </button>
      </div>
     );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-4xl mx-auto p-4 sm:p-8 bg-patriot-cream dark:bg-gray-800 rounded-xl shadow-inner border border-gray-200 dark:border-gray-700 relative transition-colors">
      
      {/* End Confirmation Modal */}
      {showEndConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-sm w-full p-6 transform transition-all scale-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-2xl text-red-500 dark:text-red-400"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">End Interview Session?</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Are you sure you want to end the current practice session? This will disconnect the AI officer.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndConfirmation(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmEndSession}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 sm:mb-10 text-center w-full">
        <div className="w-20 h-20 sm:w-32 sm:h-32 bg-patriot-blue rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ring-4 ring-blue-100 dark:ring-blue-900">
          <i className={`fas fa-microphone-alt text-3xl sm:text-5xl transition-all duration-300 ${isConnected ? 'text-red-400 animate-pulse scale-110' : 'text-white'}`}></i>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-patriot-blue dark:text-blue-300 mb-3">Mock Interview Simulator</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
          Practice with an AI Officer in real-time. Put on your headset, find a quiet place, and speak naturally.
        </p>
      </div>

      <div className="mb-8 w-full max-w-md bg-white dark:bg-gray-700 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-600 text-center transform transition-all">
        <p className={`font-mono text-xs sm:text-sm font-bold uppercase tracking-wider mb-2 ${isConnected ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
          <i className={`fas fa-circle text-[10px] mr-2 ${isConnected ? 'animate-pulse' : ''}`}></i>
          {status}
        </p>
        <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded-full overflow-hidden w-full ring-1 ring-gray-200 dark:ring-gray-500">
            <div 
                className={`h-full transition-all duration-100 ${isConnected ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gray-300 dark:bg-gray-500'}`}
                style={{ width: `${isConnected ? Math.max(5, volumeLevel * 100) : 0}%`}}
            ></div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        {!isConnected ? (
          <button
            onClick={startInterview}
            className="w-full sm:w-auto bg-patriot-blue hover:bg-blue-900 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
          >
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <i className="fas fa-play text-sm"></i>
            </div>
            Start Interview
          </button>
        ) : (
          <button
            onClick={() => setShowEndConfirmation(true)}
            className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
          >
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center animate-pulse">
                <i className="fas fa-stop text-sm"></i>
            </div>
             End Session
          </button>
        )}
      </div>
      
      <div className="mt-auto pt-8 text-xs text-gray-400 flex flex-col sm:flex-row items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
         <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full font-bold"><i className="fas fa-bolt mr-1"></i> AI POWERED</span>
         <span>Voice processing by Gemini Live API</span>
      </div>
    </div>
  );
};

export default LiveInterview;
