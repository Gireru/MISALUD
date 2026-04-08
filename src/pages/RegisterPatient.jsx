import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { QrCode, UserPlus, CheckCircle2, Copy, Phone, AlertCircle, Mic, MapPin, ChevronLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import SplashScreen from '@/components/register/SplashScreen';
import BranchSelector from '@/components/register/BranchSelector';

// ── All possible studies with metadata ─────────────────────────────
const ALL_STUDIES = [
  { name: 'Análisis de Sangre',    service: 'Laboratorio',         area: 'Laboratorio',   minutes: 15, prep: 'Requiere ayuno de 8 horas' },
  { name: 'Papanicolaou',          service: 'Papanicolaou',        area: 'Ginecología',   minutes: 15, prep: '' },
  { name: 'Ultrasonido Abdominal', service: 'Ultrasonido',         area: 'Ultrasonido',   minutes: 20, prep: 'Vejiga llena recomendada' },
  { name: 'Ultrasonido 4D',        service: 'Ultrasonido (incluye 4D)', area: 'Ultrasonido', minutes: 25, prep: 'Vejiga llena recomendada' },
  { name: 'Radiografía de Tórax',  service: 'Rayos X',             area: 'Rayos X',       minutes: 10, prep: '' },
  { name: 'Resonancia Magnética',  service: 'Resonancia Magnética',area: 'Resonancia',    minutes: 40, prep: 'No portar objetos metálicos' },
  { name: 'Tomografía',            service: 'Tomografía',          area: 'Tomografía',    minutes: 30, prep: '' },
  { name: 'Electrocardiograma',    service: 'Electrocardiograma',  area: 'Cardiología',   minutes: 12, prep: 'Evitar cafeína 2 horas antes' },
  { name: 'Densitometría',         service: 'Densitometría',       area: 'Densitometría', minutes: 20, prep: '' },
  { name: 'Nutrición',             service: 'Nutrición',           area: 'Nutrición',     minutes: 30, prep: '' },
  { name: 'Mastografía',           service: 'Mastografía',         area: 'Mastografía',   minutes: 15, prep: 'No usar desodorante el día del estudio' },
  { name: 'Examen de Vista',       service: 'Lentes',              area: 'Oftalmología',  minutes: 15, prep: '' },
];

function getStudiesForBranch(branch) {
  return ALL_STUDIES.filter(study =>
    branch.services.some(svc =>
      svc === study.service || svc.startsWith(study.service.split(' ')[0])
    )
  );
}

export default function RegisterPatient() {
  const [showSplash, setShowSplash] = useState(true);
  const [branch, setBranch] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedStudies, setSelectedStudies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const availableStudies = branch ? getStudiesForBranch(branch) : [];

  // Confetti on success
  useEffect(() => {
    if (!result) return;
    const end = Date.now() + 2000;
    const colors = ['#7ED957', '#5cca38', '#008F4C', '#fff'];
    const frame = () => {
      confetti({ particleCount: 6, angle: 60,  spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [result]);

  const toggleStudy = (studyName) => {
    setSelectedStudies(prev =>
      prev.includes(studyName) ? prev.filter(s => s !== studyName) : [...prev, studyName]
    );
  };

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || selectedStudies.length === 0) {
      setError('Ingresa nombre, teléfono y selecciona al menos un estudio.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const studiesData = availableStudies.filter(s => selectedStudies.includes(s.name));
      const response = await base44.functions.invoke('registerPatient', {
        name: name.trim(),
        phone: phone.trim(),
        selectedStudies,
        availableStudies: studiesData,
        branchName: branch?.name,
      });

      const data = response.data;
      if (data.error) { setError(data.error); setLoading(false); return; }

      const patientUrl = `${window.location.origin}/patient/view?token=${data.qrToken}`;
      setResult({ ...data, patientUrl });
      setName('');
      setPhone('');
      setSelectedStudies([]);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // ── SPLASH ──────────────────────────────────────────────────────
  if (showSplash) {
    return (
      <AnimatePresence>
        <SplashScreen onDone={() => setShowSplash(false)} />
      </AnimatePresence>
    );
  }

  // ── BRANCH SELECTOR ─────────────────────────────────────────────
  if (!branch) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <BranchSelector onSelect={(b) => { setBranch(b); setSelectedStudies([]); }} />
      </motion.div>
    );
  }

  // ── SUCCESS SCREEN ───────────────────────────────────────────────
  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 18, stiffness: 220 }}
          className="w-full max-w-xs text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 300, delay: 0.1 }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(0,143,76,0.1)' }}
          >
            <CheckCircle2 className="w-10 h-10" style={{ color: '#008F4C' }} />
          </motion.div>

          <h2 className="font-heading text-2xl font-bold mb-1">¡Registro exitoso!</h2>
          <p className="text-sm mb-1" style={{ color: '#888' }}>
            {result.patientName} · ETA: {result.totalEta} min
          </p>
          <p className="text-xs mb-7 flex items-center justify-center gap-1" style={{ color: '#7ED957' }}>
            <MapPin className="w-3 h-3" /> {branch.name}
          </p>

          <div className="flex flex-col items-center mb-5">
            <div className="p-5 bg-white rounded-3xl border shadow-sm inline-block mb-3">
              <QRCodeSVG value={result.patientUrl} size={200} level="H" />
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(result.patientUrl)}
              className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" /> Copiar enlace del QR
            </button>
          </div>

          <a
            href={result.patientUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-14 rounded-2xl text-base font-semibold text-white mb-3"
            style={{ background: 'linear-gradient(135deg, #7ED957, #5cca38)', boxShadow: '0 8px 24px rgba(126,217,87,0.35)' }}
          >
            <QrCode className="w-5 h-5" /> Ver mi trayecto
          </a>

          <button
            onClick={() => { setResult(null); setBranch(null); }}
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors mb-2"
          >
            <UserPlus className="w-4 h-4" /> Nuevo registro
          </button>
          <a
            href="/mis-trayectos"
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors mb-2"
          >
            <Phone className="w-4 h-4" /> Mis trayectos
          </a>
          <a
            href="/voice-register"
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-green-300 text-sm text-green-700 hover:bg-green-50 transition-colors"
          >
            <Mic className="w-4 h-4" /> Registro por voz
          </a>
        </motion.div>
      </div>
    );
  }

  // ── FORM SCREEN ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 max-w-lg mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Branch badge + back button */}
          <button
            onClick={() => { setBranch(null); setSelectedStudies([]); }}
            className="flex items-center gap-1.5 text-xs text-gray-400 mb-4 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Cambiar sucursal
          </button>

          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
            style={{ background: 'rgba(126,217,87,0.1)', border: '1px solid rgba(126,217,87,0.25)' }}
          >
            <MapPin className="w-3.5 h-3.5" style={{ color: '#7ED957' }} />
            <span className="text-xs font-semibold" style={{ color: '#3dba1e' }}>{branch.name}</span>
          </div>

          <h1 className="font-heading text-2xl font-bold">Registro de Paciente</h1>
          <p className="text-sm text-muted-foreground mt-1">Completa los datos para generar tu trayecto</p>
          <a
            href="/voice-register"
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-green-300 text-sm text-green-700 hover:bg-green-50 transition-colors"
          >
            <Mic className="w-4 h-4" /> O usa registro por voz
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border rounded-2xl p-5 space-y-5 shadow-sm"
        >
          {/* Name */}
          <div>
            <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nombre completo</Label>
            <Input
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="Ej. María García López"
            />
          </div>

          {/* Phone */}
          <div>
            <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">Teléfono</Label>
            <Input
              value={phone}
              onChange={e => { setPhone(e.target.value); setError(''); }}
              placeholder="Ej. 55 1234 5678"
              type="tel"
            />
            <p className="text-[11px] text-muted-foreground mt-1">📲 Por este número podrás consultar tus resultados.</p>
          </div>

          {/* Studies filtered by branch */}
          <div>
            <Label className="text-xs font-semibold text-gray-600 mb-3 block">
              Estudios disponibles en {branch.name.split(' ')[0]}
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableStudies.map(study => {
                const sel = selectedStudies.includes(study.name);
                return (
                  <div
                    key={study.name}
                    role="button"
                    tabIndex={0}
                    onClick={() => { toggleStudy(study.name); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && toggleStudy(study.name)}
                    className="flex items-center gap-3 rounded-xl border p-3 cursor-pointer select-none transition-all"
                    style={{
                      borderColor: sel ? 'rgba(126,217,87,0.3)' : undefined,
                      background: sel ? 'rgba(126,217,87,0.05)' : undefined,
                    }}
                  >
                    <Checkbox checked={sel} className="pointer-events-none shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{study.name}</p>
                      <p className="text-[11px] text-muted-foreground">{study.area} · ~{study.minutes} min</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleRegister}
            disabled={loading || !name.trim() || !phone.trim() || selectedStudies.length === 0}
            className="w-full h-12 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #7ED957, #5cca38)' }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><QrCode className="w-4 h-4" /> Registrar y generar trayecto</>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}