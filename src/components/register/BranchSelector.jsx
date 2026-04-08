import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronRight, Search, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const BRANCHES = [
  {
    id: 1,
    name: 'Monterrey Centro',
    address: 'Padre Mier Poniente #185, Col. Centro',
    services: ['Laboratorio', 'Papanicolaou', 'Ultrasonido', 'Rayos X', 'Electrocardiograma', 'Densitometría', 'Nutrición', 'Mastografía', 'Lentes'],
  },
  {
    id: 2,
    name: 'San Nicolás (Universidad)',
    address: 'Av. Universidad #602, Col. Chapultepec',
    services: ['Laboratorio', 'Papanicolaou', 'Ultrasonido', 'Rayos X', 'Resonancia Magnética', 'Tomografía', 'Electrocardiograma', 'Densitometría', 'Nutrición', 'Mastografía', 'Lentes'],
  },
  {
    id: 3,
    name: 'Apodaca (Plaza Citadina)',
    address: 'Av. Concordia #801, Col. Misión San José',
    services: ['Laboratorio', 'Papanicolaou', 'Ultrasonido', 'Rayos X', 'Resonancia Magnética', 'Tomografía', 'Electrocardiograma', 'Densitometría', 'Nutrición', 'Mastografía', 'Lentes'],
  },
  {
    id: 4,
    name: 'Apodaca (Huinalá)',
    address: 'Av. Julián Treviño Elizondo #100, Col. La Noria',
    services: ['Laboratorio', 'Papanicolaou', 'Ultrasonido', 'Rayos X', 'Resonancia Magnética', 'Tomografía', 'Electrocardiograma', 'Densitometría', 'Nutrición', 'Mastografía', 'Lentes'],
  },
  {
    id: 5,
    name: 'Guadalupe (Eloy Cavazos)',
    address: 'Av. Eloy Cavazos #5415, Col. Residencial Santa Fe',
    services: ['Laboratorio', 'Papanicolaou', 'Ultrasonido', 'Rayos X', 'Electrocardiograma', 'Densitometría', 'Nutrición', 'Mastografía', 'Lentes'],
  },
  {
    id: 6,
    name: 'Monterrey Lincoln',
    address: 'Av. Abraham Lincoln #3809, Col. Mitras Norte',
    services: ['Laboratorio', 'Papanicolaou', 'Ultrasonido', 'Rayos X', 'Electrocardiograma', 'Densitometría', 'Nutrición', 'Mastografía', 'Lentes'],
  },
  {
    id: 7,
    name: 'Monterrey Lázaro Cárdenas (Las Brisas)',
    address: 'Av. Lázaro Cárdenas #4429, Col. Las Brisas',
    services: ['Laboratorio', 'Papanicolaou', 'Ultrasonido (incluye 4D)', 'Electrocardiograma', 'Nutrición', 'Lentes'],
  },
  {
    id: 8,
    name: 'Monterrey San Bernabé',
    address: 'Av. Aztlán #8940, Col. San Bernabé',
    services: ['Laboratorio', 'Papanicolaou', 'Ultrasonido', 'Electrocardiograma', 'Nutrición', 'Lentes'],
  },
  {
    id: 9,
    name: 'Escobedo (Sendero)',
    address: 'Av. Sendero Divisorio #130, Col. Valle del Canadá',
    services: ['Laboratorio', 'Papanicolaou', 'Ultrasonido', 'Rayos X', 'Electrocardiograma', 'Densitometría', 'Nutrición', 'Mastografía', 'Lentes'],
  },
  {
    id: 10,
    name: 'Santa Catarina',
    address: 'Av. Manuel Ordóñez #620, Col. Centro',
    services: ['Laboratorio', 'Papanicolaou', 'Ultrasonido', 'Rayos X', 'Electrocardiograma', 'Densitometría', 'Mastografía', 'Lentes'],
  },
  {
    id: 11,
    name: 'Juárez',
    address: 'Carr. Libre Monterrey-Reynosa (Plaza Paseo Juárez)',
    services: ['Laboratorio', 'Papanicolaou', 'Ultrasonido', 'Rayos X', 'Electrocardiograma', 'Nutrición', 'Lentes'],
  },
];

export default function BranchSelector({ onSelect }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = BRANCHES.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.address.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirm = () => {
    if (selected) onSelect(selected);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-6 pt-14 pb-6"
        style={{ background: 'linear-gradient(160deg, #f0faf0 0%, #ffffff 100%)' }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7ED957, #3dba1e)' }}
          >
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1
              className="text-xl font-bold text-gray-900"
              style={{ fontFamily: '-apple-system, SF Pro Display, sans-serif' }}
            >
              ¿A qué sucursal vas?
            </h1>
            <p className="text-xs text-gray-400">Selecciona para ver los servicios disponibles</p>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="px-6 pb-4"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o colonia…"
            className="pl-9 rounded-2xl border-gray-200 bg-gray-50"
          />
        </div>
      </motion.div>

      {/* Branch list */}
      <div className="flex-1 overflow-y-auto px-6 pb-36 space-y-2.5">
        <AnimatePresence>
          {filtered.map((branch, i) => {
            const isSelected = selected?.id === branch.id;
            return (
              <motion.button
                key={branch.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                onClick={() => setSelected(isSelected ? null : branch)}
                className="w-full text-left rounded-2xl border p-4 transition-all relative overflow-hidden"
                style={{
                  borderColor: isSelected ? 'rgba(126,217,87,0.5)' : 'rgba(0,0,0,0.08)',
                  background: isSelected ? 'rgba(126,217,87,0.05)' : 'white',
                  boxShadow: isSelected ? '0 4px 20px rgba(126,217,87,0.15)' : '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                {isSelected && (
                  <motion.div
                    className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ background: '#7ED957' }}
                  >
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </motion.div>
                )}

                <p
                  className="font-semibold text-sm text-gray-900 mb-1 pr-8"
                  style={{ fontFamily: '-apple-system, SF Pro Display, sans-serif' }}
                >
                  {branch.name}
                </p>
                <p className="text-[11px] text-gray-400 mb-2">{branch.address}</p>

                {/* Services pills */}
                <div className="flex flex-wrap gap-1">
                  {branch.services.slice(0, isSelected ? 999 : 4).map(s => (
                    <span
                      key={s}
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: isSelected ? 'rgba(126,217,87,0.12)' : 'rgba(0,0,0,0.05)',
                        color: isSelected ? '#3dba1e' : '#888',
                      }}
                    >
                      {s}
                    </span>
                  ))}
                  {!isSelected && branch.services.length > 4 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full text-gray-400" style={{ background: 'rgba(0,0,0,0.04)' }}>
                      +{branch.services.length - 4} más
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Confirm CTA */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="fixed bottom-0 left-0 right-0 p-6 pb-8"
            style={{ background: 'linear-gradient(to top, white 70%, transparent)' }}
          >
            <button
              onClick={handleConfirm}
              className="w-full h-14 rounded-2xl text-base font-bold text-white flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #7ED957, #3dba1e)',
                boxShadow: '0 8px 30px rgba(126,217,87,0.45)',
              }}
            >
              Continuar con {selected.name.split(' ')[0]}
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}