import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, CheckCircle2, AlertCircle, QrCode, Square } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { QRCodeSVG } from 'qrcode.react';
import { useVoice } from '@/lib/VoiceContext';
import { Button } from '@/components/ui/button';

const STUDY_ALIASES = {
  'análisis': 'Análisis de Sangre',
  'sangre': 'Análisis de Sangre',
  'radiografía': 'Radiografía de Tórax',
  'rayos': 'Radiografía de Tórax',
  'x': 'Radiografía de Tórax',
  'ultrasonido': 'Ultrasonido Abdominal',
  'ecografía': 'Ultrasonido Abdominal',
  'electrocardiograma': 'Electrocardiograma',
  'corazón': 'Electrocardiograma',
  'vista': 'Examen de Vista',
  'ojo': 'Examen de Vista',
  'vacuna': 'Vacunación',
  'vacunación': 'Vacunación',
};

export default function VoiceRegistrationFlow() {
  const { speak, isListening, startRecordingVoiceNote, stopRecordingVoiceNote } = useVoice();
  const [step, setStep] = useState('start');
  const [registrationData, setRegistrationData] = useState({ name: '', phone: '', studies: [] });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');
  const [nextAction, setNextAction] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Start registration flow
  useEffect(() => {
    if (step === 'start') {
      initializeFlow();
    }
  }, []);



  const initializeFlow = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('voiceRegistrationFlow', {
        action: 'start'
      });
      const fullMessage = `${res.data.message}. Mantén presionado el micrófono para grabar tu respuesta.`;
      setMessage(fullMessage);
      speak(fullMessage);
      setStep('ask_name');
      setNextAction('process_name');
      setLoading(false);
    } catch (err) {
      setMessage('Error al iniciar el flujo');
      setLoading(false);
    }
  };

  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
    } catch (err) {
      const errorMsg = 'No se pudo acceder al micrófono. Verifica los permisos.';
      setMessage(errorMsg);
      speak(errorMsg);
    }
  };

  const stopRecording = async (action) => {
    if (!mediaRecorderRef.current) return;
    
    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      await processAudio(audioBlob, action);
    };
    mediaRecorderRef.current.stop();
  };

  const processAudio = async (audioBlob, action) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      formData.append('action', action);
      formData.append('currentData', JSON.stringify(registrationData));

      const res = await base44.functions.invoke('transcribeVoiceNote', {
        audioBase64: await blobToBase64(audioBlob),
        action,
        currentData: registrationData
      });

      const transcript = res.data.transcript || '';

      if (!transcript.trim()) {
        const retryMsg = 'No entendí tu respuesta. Intenta de nuevo.';
        setMessage(retryMsg);
        speak(retryMsg);
        setLoading(false);
        return;
      }

      const flowRes = await base44.functions.invoke('voiceRegistrationFlow', {
        action: action,
        currentData: registrationData,
        transcript: transcript
      });

      if (flowRes.data.error) {
        const confirmMessage = `Escuché: ${transcript}. ${flowRes.data.error}. Intenta de nuevo.`;
        setMessage(confirmMessage);
        speak(confirmMessage);
        setLoading(false);
        return;
      }

      const nextMsg = flowRes.data.nextStep === 'complete' 
        ? flowRes.data.message 
        : `Escuché: ${transcript}. ${flowRes.data.message}. Mantén presionado el micrófono para continuar.`;
      
      setMessage(nextMsg);
      speak(nextMsg);
      setRegistrationData(flowRes.data.data || registrationData);
      setLoading(false);

      if (flowRes.data.nextStep === 'confirm') {
        setStep('confirm');
        setNextAction('complete_registration');
      } else if (flowRes.data.nextStep === 'ask_studies_more') {
        setStep('ask_studies');
        setNextAction('process_studies');
      } else if (flowRes.data.nextStep === 'complete') {
        setResult(flowRes.data.registrationData);
        setStep('complete');
      } else if (flowRes.data.nextStep === 'ask_phone') {
        setStep('ask_phone');
        setNextAction('process_phone');
      } else if (flowRes.data.nextStep === 'ask_studies') {
        setStep('ask_studies');
        setNextAction('process_studies');
      }
    } catch (err) {
      const errorMsg = 'Hubo un error procesando tu respuesta. Intenta de nuevo.';
      setMessage(errorMsg);
      speak(errorMsg);
      setLoading(false);
    }
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(blob);
    });
  };

  if (step === 'complete' && result) {
    const patientUrl = `${window.location.origin}/patient/view?token=${result.qrToken}`;

    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xs text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(0,143,76,0.1)' }}
          >
            <CheckCircle2 className="w-10 h-10" style={{ color: '#008F4C' }} />
          </motion.div>

          <h2 className="font-heading text-2xl font-bold mb-1">¡Registro completado!</h2>
          <p className="text-sm mb-6" style={{ color: '#888' }}>
            {result.patientName} • ETA: {result.totalEta} min
          </p>

          <div className="flex flex-col items-center mb-6">
            <div className="p-4 bg-white rounded-3xl border shadow-sm inline-block mb-3">
              <QRCodeSVG value={patientUrl} size={180} level="H" />
            </div>
          </div>

          <a
            href={patientUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-12 rounded-xl text-sm font-semibold text-white mb-3"
            style={{ background: 'linear-gradient(135deg, #4B0082, #7B00CC)' }}
          >
            <QrCode className="w-4 h-4" /> Ver mi trayecto
          </a>

          <button
            onClick={() => window.location.href = '/register'}
            className="w-full h-10 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
          >
            Nuevo registro
          </button>
        </motion.div>
      </div>
    );
  }

  const handleMicMouseDown = () => {
    if (!loading) {
      startRecording();
    }
  };

  const handleMicMouseUp = () => {
    if (mediaRecorderRef.current) {
      stopRecording(nextAction);
    }
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-[#4B0082]/5 to-[#008F4C]/5 flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#4B0082]/10 flex items-center justify-center mx-auto mb-3">
            <Mic className="w-7 h-7 text-[#4B0082]" />
          </div>
          <h1 className="font-heading text-2xl font-bold mb-1">Registro por Voz</h1>
          <p className="text-sm text-gray-500">Salud Digna NX Accesible</p>
        </div>

        {/* Message bubble */}
        <motion.div
          key={message}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl mb-6 border"
          style={{
            background: 'rgba(75, 0, 130, 0.08)',
            borderColor: 'rgba(75, 0, 130, 0.2)',
          }}
        >
          <p className="text-sm leading-relaxed text-gray-900">{message}</p>
        </motion.div>



        {/* Current data display */}
        {(registrationData.name || registrationData.phone || registrationData.studies.length > 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-xl bg-green-50 border border-green-200 mb-4 space-y-2"
          >
            {registrationData.name && (
              <p className="text-xs text-green-900">
                <span className="font-semibold">Nombre:</span> {registrationData.name}
              </p>
            )}
            {registrationData.phone && (
              <p className="text-xs text-green-900">
                <span className="font-semibold">Teléfono:</span> {registrationData.phone}
              </p>
            )}
            {registrationData.studies.length > 0 && (
              <p className="text-xs text-green-900">
                <span className="font-semibold">Estudios:</span> {registrationData.studies.join(', ')}
              </p>
            )}
          </motion.div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center mb-6">
            <div className="w-8 h-8 border-2 border-[#4B0082]/20 border-t-[#4B0082] rounded-full animate-spin" />
          </div>
        )}

        {/* Mic button */}
        <motion.button
          onMouseDown={handleMicMouseDown}
          onMouseUp={handleMicMouseUp}
          onTouchStart={handleMicMouseDown}
          onTouchEnd={handleMicMouseUp}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mt-8 transition-all"
          style={{
            background: isListening ? '#D32F2F' : '#4B0082',
            boxShadow: isListening ? '0 0 40px rgba(211,47,47,0.4)' : '0 8px 24px rgba(75,0,130,0.3)',
          }}
          animate={isListening ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.6, repeat: Infinity }}
          disabled={loading}
        >
          {isListening ? (
            <Square className="w-8 h-8 text-white" fill="white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
        </motion.button>

        <p className="text-center mt-4 text-xs text-gray-500">
          {isListening ? 'Grabando...' : 'Mantén presionado para grabar'}
        </p>
      </motion.div>
    </div>
  );
}