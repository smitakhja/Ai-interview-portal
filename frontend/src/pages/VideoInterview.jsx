import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorPlay, Bot, Loader2, ArrowRight, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api.js";

export default function VideoInterview() {
  const navigate = useNavigate();
  const [stage, setStage] = useState("setup"); // setup | interview | report
  const [stream, setStream] = useState(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);

  // Setup state
  const [targetRole, setTargetRole] = useState("Data Analyst");

  // Phase 4: Recording State
  const mediaRecorderRef = useRef(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [videoUrl, setVideoUrl] = useState(null);

  // Phase 2/3: Speech & Logic State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const currentIndexRef = useRef(-1);
  const [results, setResults] = useState([]);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiText, setAiText] = useState("Welcome to your AI Interview. I am your virtual interviewer. Let's begin.");
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const fullTranscriptRef = useRef("");

  // Setup Camera and Mic
  const requestMedia = async () => {
    setLoading(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStage("interview");
    } catch (err) {
      console.error("Failed to access media devices:", err);
      alert("Please allow camera and microphone access to continue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stream && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, stage]);

  // Clean up media streams and speech on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
      window.speechSynthesis.cancel();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [stream]);

  // Keep ref in sync for closures
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Phase 2: Speech Synthesis (AI Voice)
  const speak = (text) => {
    window.speechSynthesis.cancel();
    setAiText(text);
    setIsAiSpeaking(true);
    
    const utterance = new SpeechSynthesisUtterance(text);
    // Pick a good English voice if available
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha") || v.lang === "en-US");
    if (voice) utterance.voice = voice;
    
    utterance.rate = 0.95; // slightly slower for a professional feel
    
    utterance.onend = () => {
      setIsAiSpeaking(false);
      // If we just finished the intro, go immediately to the first question
      if (currentIndexRef.current === -1) {
        setCurrentIndex(0);
      } else {
        startListening(); // AI finished, start listening to user
      }
    };
    
    window.speechSynthesis.speak(utterance);
  };

  // Phase 2: Speech Recognition (STT)
  const startListening = () => {
    if (!micEnabled) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser.");
      return;
    }
    
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsUserSpeaking(true);
      resetSilenceTimer();
    };
    
    recognition.onresult = (event) => {
      resetSilenceTimer();
      let currentTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
      fullTranscriptRef.current += currentTranscript + " ";
    };
    
    recognition.onend = () => {
      setIsUserSpeaking(false);
    };
    
    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsUserSpeaking(false);
    };
    
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
    setIsUserSpeaking(false);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
  };

  // Process User's Answer
  const handleNextQuestion = async () => {
    if (isProcessingAnswer) return;
    
    stopListening();
    setIsProcessingAnswer(true);
    
    const currentQ = questions[currentIndex];
    
    if (currentIndex >= 0 && currentQ) {
      try {
        const res = await api.post("/video-interview/analyze-answer", {
          question: currentQ.question,
          transcript: fullTranscriptRef.current || transcript || "No answer provided.",
        });
        setResults(prev => [...prev, { ...res.data, question: currentQ.question }]);
      } catch (err) {
        console.error("Failed to analyze answer:", err);
      }
    }
    
    fullTranscriptRef.current = "";
    setTranscript("");
    setIsProcessingAnswer(false);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      endInterview();
    }
  };

  // Silence Detection
  const resetSilenceTimer = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      // 5 seconds of silence detected -> auto advance to next question
      handleNextQuestion();
    }, 5000);
  };

  // Fetch Questions when stage changes to interview
  useEffect(() => {
    if (stage === "interview") {
      api.post("/video-interview/generate-questions", { role: targetRole, count: 5 })
        .then(res => {
          setQuestions(res.data.questions || []);
        })
        .catch(err => console.error("Failed to load questions", err));

      // Start Recording
      if (stream && !mediaRecorderRef.current) {
        const options = { mimeType: 'video/webm;codecs=vp9,opus' };
        try {
          const mediaRecorder = new MediaRecorder(stream, MediaRecorder.isTypeSupported(options.mimeType) ? options : undefined);
          mediaRecorderRef.current = mediaRecorder;
          
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              setRecordedChunks((prev) => [...prev, event.data]);
            }
          };
          
          mediaRecorder.start(1000); // Collect data every second
        } catch (e) {
          console.error("MediaRecorder setup failed:", e);
        }
      }

      // Small delay for UI to render welcome message
      setTimeout(() => {
        speak(aiText);
      }, 1000);
    }
  }, [stage, stream]);

  // Read out the current question whenever currentIndex changes
  useEffect(() => {
    if (currentIndex >= 0 && questions[currentIndex]) {
      speak(questions[currentIndex].question);
    }
  }, [currentIndex, questions]);

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleCam = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCamEnabled(videoTrack.enabled);
      }
    }
  };

  const endInterview = () => {
    // Stop recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    
    // Stop speech
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
    window.speechSynthesis.cancel();

    // Stop streams
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    setStream(null);
    setStage("report");
  };

  // When chunks are finalized, create a Blob URL
  useEffect(() => {
    if (stage === "report" && recordedChunks.length > 0 && !videoUrl) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    }
  }, [stage, recordedChunks, videoUrl]);

  if (stage === "setup") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl shadow-2xl text-center">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/50">
            <MonitorPlay size={32} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">AI Video Interview</h1>
          <p className="text-slate-400 text-sm mb-6">To begin your interview, we need access to your camera and microphone. This ensures the AI can see and hear you clearly.</p>
          
          <div className="mb-8 text-left">
            <label className="block text-sm font-medium text-slate-300 mb-2">Select Target Role</label>
            <select 
              value={targetRole} 
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Data Analyst">Data Analyst</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Product Manager">Product Manager</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
            </select>
          </div>

          <button onClick={requestMedia} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Video size={18} />}
            {loading ? "Connecting..." : "Start Interview (5 Questions)"}
          </button>
          
          <button onClick={() => navigate(-1)} className="w-full mt-3 bg-transparent hover:bg-slate-800 text-slate-300 font-medium py-3 px-6 rounded-xl transition-all text-sm">
            Cancel
          </button>
        </motion.div>
      </div>
    );
  }

  if (stage === "report") {
    const avgScore = results.length > 0 ? Math.round(results.reduce((acc, curr) => acc + (curr.score || 0), 0) / results.length) : 0;
    
    return (
      <div className="min-h-screen bg-[#0F172A] text-white overflow-y-auto p-4 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/60 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Interview Complete</h1>
              <p className="text-slate-400">The AI has analyzed your responses. Here is your final report.</p>
            </div>
            <div className="flex flex-col items-center justify-center p-6 bg-slate-800/50 rounded-2xl border border-slate-700 min-w-[160px]">
              <Trophy size={32} className="text-amber-400 mb-2" />
              <div className="text-4xl font-display font-bold text-amber-400">{avgScore}<span className="text-lg text-slate-400">/100</span></div>
              <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">Overall Score</div>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <h2 className="text-xl font-semibold">Question Breakdown</h2>
              {results.map((r, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="font-medium text-slate-200">Q{i+1}: {r.question}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${r.score >= 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : r.score >= 50 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                      {r.score}/100
                    </span>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-xl text-sm text-slate-300 border border-slate-800/50">
                    <strong className="text-white block mb-1">AI Feedback:</strong>
                    {r.feedback}
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4">
                <h2 className="font-semibold mb-2">Actions</h2>
                {videoUrl && (
                  <a href={videoUrl} download="interview_recording.webm" className="w-full text-center bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-6 rounded-xl transition-all border border-slate-700">
                    Download Recording
                  </a>
                )}
                <button onClick={() => navigate("/dashboard")} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all">
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col font-sans overflow-hidden">
      {/* Top Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-semibold text-sm tracking-wide">REC</span>
          <span className="text-slate-400 text-sm ml-2 border-l border-slate-700 pl-4">00:00</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-slate-800 px-3 py-1 rounded-full text-xs font-medium text-slate-300 border border-slate-700">
            {currentIndex >= 0 ? `Question ${currentIndex + 1} / ${questions.length}` : "Intro"}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 flex flex-col lg:flex-row gap-4 sm:gap-6 max-h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Left Side - AI Avatar */}
        <div className="flex-1 bg-slate-900/40 rounded-3xl border border-slate-800 overflow-hidden relative shadow-2xl flex flex-col items-center justify-center group">
          <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 border border-white/10 z-10">
            <Bot size={14} className="text-blue-400" /> AI Interviewer
          </div>
          
          {/* Pulsing AI Avatar Placeholder */}
          <div className="relative">
            {isAiSpeaking && <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-3xl animate-ping" />}
            <div className={`w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 p-1 shadow-[0_0_40px_rgba(59,130,246,0.3)] relative z-10 transition-transform ${isAiSpeaking ? 'scale-105' : 'scale-100'}`}>
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center overflow-hidden">
                <Bot size={64} className="text-blue-500" />
              </div>
            </div>
            {/* Voice Waves when speaking */}
            {isAiSpeaking && (
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 h-8">
                {[1,2,3,4,5].map(i => (
                  <motion.div key={i} animate={{ height: [8, 32, 8] }} transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }} className="w-1.5 bg-blue-400 rounded-full" />
                ))}
              </div>
            )}
          </div>
          
          {/* Subtitles Area */}
          <div className="absolute bottom-6 left-0 w-full px-8 text-center">
            <AnimatePresence mode="wait">
              {isAiSpeaking ? (
                <motion.div key="ai-text" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="inline-block bg-blue-900/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-blue-500/30 shadow-xl max-w-2xl">
                  <p className="text-sm sm:text-base text-blue-100">{aiText}</p>
                </motion.div>
              ) : transcript ? (
                <motion.div key="user-text" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="inline-block bg-slate-800/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-600 shadow-xl max-w-2xl">
                  <p className="text-sm sm:text-base text-slate-200">"{transcript}"</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side - User Webcam */}
        <div className="lg:w-[400px] xl:w-[500px] shrink-0 flex flex-col gap-4 sm:gap-6">
          <div className="flex-1 bg-black rounded-3xl border border-slate-800 overflow-hidden relative shadow-2xl">
            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 border border-white/10 z-10">
              You
            </div>
            {!camEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-0">
                <VideoOff size={48} className="text-slate-600" />
              </div>
            )}
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover transition-opacity duration-300 ${camEnabled ? 'opacity-100' : 'opacity-0'}`}
              style={{ transform: 'scaleX(-1)' }} // Mirror user camera
            />
          </div>

          {/* Controls Bar */}
          <div className="h-24 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800 p-4 flex items-center justify-center gap-4 sm:gap-6 shadow-2xl shrink-0">
            <button onClick={toggleMic} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${micEnabled ? 'bg-slate-700/50 hover:bg-slate-600 border border-slate-600 text-white' : 'bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30'}`}>
              {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button onClick={endInterview} className="w-16 h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]">
              <PhoneOff size={22} className="text-white" />
            </button>
            <button onClick={toggleCam} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${camEnabled ? 'bg-slate-700/50 hover:bg-slate-600 border border-slate-600 text-white' : 'bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30'}`}>
              {camEnabled ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
            
            {/* Next Question button */}
            <div className="w-px h-8 bg-slate-700 mx-2" />
            
            <button 
              onClick={handleNextQuestion} 
              disabled={isAiSpeaking || isProcessingAnswer}
              className="px-4 h-12 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 flex items-center justify-center gap-2 transition-all font-semibold shadow-lg text-sm"
            >
              {isProcessingAnswer ? <Loader2 size={18} className="animate-spin" /> : "Next"}
              {!isProcessingAnswer && <ArrowRight size={16} />}
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
