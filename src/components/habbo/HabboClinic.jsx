import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Room layout: isometric tile grid ────────────────────────────────
// Each ZONE corresponds to a clinical area. Positions are in isometric space.
export const ZONES = {
  'Laboratorio':   { x: 120,  y: 80,  color: '#3B9EFF', emoji: '🧪', label: 'Lab',       tile: '#b8d4ff' },
  'Rayos X':       { x: 320,  y: 80,  color: '#FF6B6B', emoji: '🔬', label: 'Rayos X',   tile: '#ffd4d4' },
  'Ultrasonido':   { x: 520,  y: 80,  color: '#7ED957', emoji: '🫀', label: 'Ultrasonido',tile: '#d4f7b8' },
  'Cardiología':   { x: 120,  y: 230, color: '#FF6B6B', emoji: '❤️', label: 'Cardio',    tile: '#ffd4d4' },
  'Resonancia':    { x: 320,  y: 230, color: '#A78BFA', emoji: '🧲', label: 'Resonancia', tile: '#e8d4ff' },
  'Tomografía':    { x: 520,  y: 230, color: '#FFB347', emoji: '🔍', label: 'Tomografía', tile: '#ffeab8' },
  'Ginecología':   { x: 120,  y: 380, color: '#FF9EBC', emoji: '🌸', label: 'Gineco',     tile: '#ffd4e8' },
  'Densitometría': { x: 320,  y: 380, color: '#4ECDC4', emoji: '🦴', label: 'Densito',    tile: '#c4f0ee' },
  'Nutrición':     { x: 520,  y: 380, color: '#96CEB4', emoji: '🥗', label: 'Nutrición',  tile: '#d4f0e0' },
  'Oftalmología':  { x: 680,  y: 230, color: '#FFC0CB', emoji: '👁️', label: 'Optometría', tile: '#ffe0e8' },
  'Mastografía':   { x: 680,  y: 380, color: '#DDA0DD', emoji: '🎗️', label: 'Masto',      tile: '#f0d4f0' },
  'Sala de Espera':{ x: 320,  y: 520, color: '#B0C4DE', emoji: '🪑', label: 'Sala Espera',tile: '#dde8f5' },
};

// Pixel-art style character avatars with different colors per priority
const CHAR_COLORS = {
  green:  ['#7ED957','#5cca38','#fff'],
  yellow: ['#FFB347','#e08d00','#fff'],
  red:    ['#FF6B6B','#cc2222','#fff'],
  auto:   ['#3B9EFF','#1a7de0','#fff'],
};

function getCharColor(journey) {
  const p = journey.priority_color || 'auto';
  return CHAR_COLORS[p] || CHAR_COLORS.auto;
}

function getInitials(name) {
  return (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function getCurrentZone(journey) {
  const s = (journey.studies || []).find(s => s.status === 'in_progress');
  if (s) return s.area;
  const allDone = (journey.studies || []).every(s => s.status === 'completed');
  if (allDone) return 'Sala de Espera';
  return 'Sala de Espera';
}

// ── Isometric tile (zone room) ───────────────────────────────────────
function IsoRoom({ zone, name, count }) {
  const W = 100, H = 56;
  return (
    <g>
      {/* Top face */}
      <polygon
        points={`${zone.x},${zone.y - H / 2} ${zone.x + W / 2},${zone.y} ${zone.x},${zone.y + H / 2} ${zone.x - W / 2},${zone.y}`}
        fill={zone.tile}
        stroke="rgba(0,0,0,0.12)"
        strokeWidth="1"
      />
      {/* Left face */}
      <polygon
        points={`${zone.x - W / 2},${zone.y} ${zone.x},${zone.y + H / 2} ${zone.x},${zone.y + H / 2 + 28} ${zone.x - W / 2},${zone.y + 28}`}
        fill={shadeColor(zone.tile, -20)}
        stroke="rgba(0,0,0,0.12)"
        strokeWidth="1"
      />
      {/* Right face */}
      <polygon
        points={`${zone.x + W / 2},${zone.y} ${zone.x},${zone.y + H / 2} ${zone.x},${zone.y + H / 2 + 28} ${zone.x + W / 2},${zone.y + 28}`}
        fill={shadeColor(zone.tile, -35)}
        stroke="rgba(0,0,0,0.12)"
        strokeWidth="1"
      />
      {/* Zone emoji */}
      <text x={zone.x} y={zone.y + 6} textAnchor="middle" fontSize="18" style={{ userSelect: 'none' }}>
        {zone.emoji}
      </text>
      {/* Label */}
      <text x={zone.x} y={zone.y - H / 2 - 6} textAnchor="middle" fontSize="9" fill="#555" fontWeight="600" style={{ userSelect: 'none' }}>
        {zone.label}
      </text>
      {/* Patient count badge */}
      {count > 0 && (
        <>
          <circle cx={zone.x + 38} cy={zone.y - H / 2 - 2} r="10" fill={zone.color} />
          <text x={zone.x + 38} y={zone.y - H / 2 + 2} textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">
            {count}
          </text>
        </>
      )}
    </g>
  );
}

function shadeColor(hex, amount) {
  try {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
    return `rgb(${r},${g},${b})`;
  } catch { return hex; }
}

// ── Pixel character ──────────────────────────────────────────────────
function HabboChar({ journey, zone, offsetX = 0, offsetY = 0, onClick, selected }) {
  const [colors] = useState(() => getCharColor(journey));
  const initials = getInitials(journey.patient_name);
  const cx = zone.x + offsetX;
  const cy = zone.y + offsetY - 18;
  const isRed = (journey.priority_color === 'red');

  return (
    <motion.g
      style={{ cursor: 'pointer' }}
      onClick={() => onClick(journey)}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Selection ring */}
      {selected && (
        <circle cx={cx} cy={cy + 4} r="18" fill="none" stroke={colors[0]} strokeWidth="2.5" strokeDasharray="4,2" opacity="0.8" />
      )}

      {/* Urgency pulse for red */}
      {isRed && (
        <motion.circle
          cx={cx} cy={cy + 4} r="18"
          fill="none" stroke="#FF6B6B" strokeWidth="2"
          animate={{ r: [18, 26], opacity: [0.8, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}

      {/* Shadow */}
      <ellipse cx={cx} cy={cy + 22} rx="10" ry="4" fill="rgba(0,0,0,0.12)" />

      {/* Body — pixel style legs */}
      <rect x={cx - 5} y={cy + 12} width="4" height="8" rx="2" fill={colors[1]} />
      <rect x={cx + 1} y={cy + 12} width="4" height="8" rx="2" fill={colors[1]} />

      {/* Torso */}
      <rect x={cx - 7} y={cy + 2} width="14" height="12" rx="3" fill={colors[0]} />

      {/* Arms */}
      <rect x={cx - 11} y={cy + 4} width="5" height="7" rx="2" fill={colors[0]} />
      <rect x={cx + 6} y={cy + 4} width="5" height="7" rx="2" fill={colors[0]} />

      {/* Head */}
      <circle cx={cx} cy={cy - 2} r="9" fill="#FDBCB4" stroke={colors[1]} strokeWidth="1.5" />

      {/* Face initials */}
      <text x={cx} y={cy + 2} textAnchor="middle" fontSize="6" fill={colors[1]} fontWeight="bold" style={{ userSelect: 'none' }}>
        {initials}
      </text>

      {/* Name tag */}
      <rect x={cx - 22} y={cy - 26} width="44" height="12" rx="6" fill="rgba(0,0,0,0.75)" />
      <text x={cx} y={cy - 17} textAnchor="middle" fontSize="6.5" fill="white" fontWeight="600" style={{ userSelect: 'none' }}>
        {journey.patient_name.split(' ')[0]}
      </text>

      {/* Status bubble */}
      {isRed && (
        <>
          <rect x={cx + 8} y={cy - 16} width="14" height="10" rx="5" fill="#FF6B6B" />
          <text x={cx + 15} y={cy - 8} textAnchor="middle" fontSize="7" style={{ userSelect: 'none' }}>🚨</text>
        </>
      )}
    </motion.g>
  );
}

// ── Main isometric clinic view ───────────────────────────────────────
export default function HabboClinic({ journeys, onSelectJourney, selectedId }) {
  // Count patients per zone & assign offsets to avoid overlap
  const zoneGroups = {};
  journeys.forEach(j => {
    const zone = getCurrentZone(j);
    if (!zoneGroups[zone]) zoneGroups[zone] = [];
    zoneGroups[zone].push(j);
  });

  const OFFSETS = [
    [0, 0], [-18, 8], [18, 8], [-9, -10], [9, -10],
    [-24, -2], [24, -2], [0, 14], [-18, -18], [18, -18],
  ];

  return (
    <div className="w-full overflow-auto rounded-3xl" style={{ background: 'linear-gradient(160deg, #c8e6ff 0%, #e8f5e9 100%)', minHeight: 580 }}>
      <svg
        viewBox="0 0 830 620"
        style={{ width: '100%', minWidth: 700, minHeight: 560 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background floor */}
        <rect width="830" height="620" fill="url(#floorGrad)" rx="20" />
        <defs>
          <linearGradient id="floorGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d4edff" />
            <stop offset="100%" stopColor="#e8f5e9" />
          </linearGradient>
        </defs>

        {/* Grid lines subtle */}
        {[...Array(8)].map((_, i) => (
          <line key={`h${i}`} x1="0" y1={60 + i * 72} x2="830" y2={60 + i * 72} stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
        ))}
        {[...Array(10)].map((_, i) => (
          <line key={`v${i}`} x1={60 + i * 80} y1="0" x2={60 + i * 80} y2="620" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
        ))}

        {/* Title */}
        <rect x="10" y="10" width="200" height="28" rx="14" fill="rgba(0,0,0,0.55)" />
        <text x="110" y="29" textAnchor="middle" fontSize="12" fill="white" fontWeight="700" style={{ userSelect: 'none' }}>
          🏥 Salud Digna NX — En Vivo
        </text>

        {/* Render rooms */}
        {Object.entries(ZONES).map(([name, zone]) => (
          <IsoRoom key={name} zone={zone} name={name} count={zoneGroups[name]?.length || 0} />
        ))}

        {/* Render characters */}
        <AnimatePresence>
          {Object.entries(zoneGroups).map(([zoneName, group]) =>
            group.map((journey, idx) => {
              const zone = ZONES[zoneName];
              if (!zone) return null;
              const [ox, oy] = OFFSETS[idx % OFFSETS.length];
              return (
                <HabboChar
                  key={journey.id}
                  journey={journey}
                  zone={zone}
                  offsetX={ox}
                  offsetY={oy}
                  onClick={onSelectJourney}
                  selected={selectedId === journey.id}
                />
              );
            })
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}