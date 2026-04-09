import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Zone layout matching the sketch:
// Left column: Consultorio 1 (bottom), 2 (mid), 3 (top)
// Top center: Consultorio 4
// Right column: Consultorio 5 (top), 6 (mid), 7 (bottom)
// Center: Sala de Espera
//
// SVG canvas: 860 x 600
// Layout (SVG x,y = top-left of each room rect):
//   Left col  x=30,  widths=200
//   Right col x=630, widths=200
//   Center    x=270, width=320
//   Rows top=30, mid=210, bot=390 (height ~160 each)
//   Sala de Espera center: x=310 y=220 w=240 h=200

const ROOM_RADIUS = 14;

// Map area names → room slots
export const ZONES = {
  'Laboratorio':    { slot: 'C1', label: 'Laboratorio',   emoji: '🧪', color: '#3B9EFF', light: '#dbeafe' },
  'Cardiología':    { slot: 'C2', label: 'Cardiología',   emoji: '❤️', color: '#FF6B6B', light: '#fee2e2' },
  'Rayos X':        { slot: 'C3', label: 'Rayos X',       emoji: '🔬', color: '#A78BFA', light: '#ede9fe' },
  'Tomografía':     { slot: 'C4', label: 'Tomografía',    emoji: '🔍', color: '#FB923C', light: '#ffedd5' },
  'Ultrasonido':    { slot: 'C5', label: 'Ultrasonido',   emoji: '🫀', color: '#7ED957', light: '#dcfce7' },
  'Resonancia':     { slot: 'C6', label: 'Resonancia',    emoji: '🧲', color: '#F472B6', light: '#fce7f3' },
  'Ginecología':    { slot: 'C7', label: 'Ginecología',   emoji: '🌸', color: '#34D399', light: '#d1fae5' },
  'Sala de Espera': { slot: 'SE', label: 'Sala de Espera',emoji: '🪑', color: '#94A3B8', light: '#f1f5f9' },
  // Extras map to nearest slot
  'Densitometría':  { slot: 'C2', label: 'Densitometría', emoji: '🦴', color: '#FF6B6B', light: '#fee2e2' },
  'Nutrición':      { slot: 'C6', label: 'Nutrición',     emoji: '🥗', color: '#F472B6', light: '#fce7f3' },
  'Mastografía':    { slot: 'C3', label: 'Mastografía',   emoji: '🎗️', color: '#A78BFA', light: '#ede9fe' },
  'Oftalmología':   { slot: 'C7', label: 'Oftalmología',  emoji: '👁️', color: '#34D399', light: '#d1fae5' },
};

// Physical positions for each slot (center x,y for characters)
const SLOT_POS = {
  C1: { x: 130, y: 490, rx: 30, ry: 390, rw: 200, rh: 160, label: 'Consultorio 1' },
  C2: { x: 130, y: 300, rx: 30, ry: 210, rw: 200, rh: 160, label: 'Consultorio 2' },
  C3: { x: 130, y: 110, rx: 30, ry: 30,  rw: 200, rh: 160, label: 'Consultorio 3' },
  C4: { x: 430, y: 110, rx: 270, ry: 30, rw: 320, rh: 160, label: 'Consultorio 4' },
  C5: { x: 730, y: 110, rx: 630, ry: 30, rw: 200, rh: 160, label: 'Consultorio 5' },
  C6: { x: 730, y: 300, rx: 630, ry: 210, rw: 200, rh: 160, label: 'Consultorio 6' },
  C7: { x: 730, y: 490, rx: 630, ry: 390, rw: 200, rh: 160, label: 'Consultorio 7' },
  SE: { x: 430, y: 390, rx: 295, ry: 230, rw: 270, rh: 200, label: 'Sala de Espera' },
};

// Character offsets to avoid overlap (up to 10 per room)
const OFFSETS = [
  [0, 0], [-22, 10], [22, 10], [-11, -14], [11, -14],
  [-30, -2], [30, -2], [0, 20], [-22, -24], [22, -24],
];

const CHAR_COLORS = {
  green:  ['#7ED957', '#3dba1e', '#fff'],
  yellow: ['#FFB347', '#c47800', '#fff'],
  red:    ['#FF6B6B', '#cc2222', '#fff'],
  auto:   ['#3B9EFF', '#1a7de0', '#fff'],
};

function getCharColor(journey) {
  return CHAR_COLORS[journey.priority_color] || CHAR_COLORS.auto;
}

function getInitials(name) {
  return (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export function getCurrentZone(journey) {
  const s = (journey.studies || []).find(s => s.status === 'in_progress');
  if (s) return s.area;
  const allDone = (journey.studies || []).every(s => s.status === 'completed');
  if (allDone) return 'Sala de Espera';
  return 'Sala de Espera';
}

function getSlotPos(zoneName) {
  const zone = ZONES[zoneName];
  if (!zone) return SLOT_POS.SE;
  return SLOT_POS[zone.slot] || SLOT_POS.SE;
}

// ── Room rectangle ───────────────────────────────────────────────────
function Room({ slot, count, onClick }) {
  const pos = SLOT_POS[slot];
  // Find zone info for this slot
  const zoneEntry = Object.values(ZONES).find(z => z.slot === slot);
  const color = zoneEntry?.color || '#94A3B8';
  const light = zoneEntry?.light || '#f1f5f9';
  const emoji = zoneEntry?.emoji || '🏥';
  const isWaiting = slot === 'SE';

  return (
    <g style={{ cursor: 'default' }}>
      {/* Room bg */}
      <rect
        x={pos.rx} y={pos.ry} width={pos.rw} height={pos.rh}
        rx={ROOM_RADIUS} ry={ROOM_RADIUS}
        fill={light}
        stroke={color}
        strokeWidth={count > 0 ? 2 : 1}
        opacity={0.92}
      />
      {/* Top accent bar */}
      <rect
        x={pos.rx} y={pos.ry} width={pos.rw} height={6}
        rx={ROOM_RADIUS} ry={ROOM_RADIUS}
        fill={color}
        opacity={0.7}
      />
      {/* Emoji */}
      <text x={pos.rx + pos.rw / 2} y={pos.ry + 38} textAnchor="middle" fontSize={isWaiting ? 26 : 22} style={{ userSelect: 'none' }}>
        {emoji}
      </text>
      {/* Label */}
      <text x={pos.rx + pos.rw / 2} y={pos.ry + 60} textAnchor="middle" fontSize={9.5} fill={color} fontWeight="700" style={{ userSelect: 'none' }}>
        {pos.label.toUpperCase()}
      </text>
      {/* Area name */}
      {zoneEntry && (
        <text x={pos.rx + pos.rw / 2} y={pos.ry + 74} textAnchor="middle" fontSize={8} fill="#888" style={{ userSelect: 'none' }}>
          {zoneEntry.label}
        </text>
      )}
      {/* Count badge */}
      {count > 0 && (
        <>
          <circle cx={pos.rx + pos.rw - 14} cy={pos.ry + 14} r={11} fill={color} />
          <text x={pos.rx + pos.rw - 14} y={pos.ry + 18} textAnchor="middle" fontSize={9} fill="white" fontWeight="bold" style={{ userSelect: 'none' }}>
            {count}
          </text>
        </>
      )}
    </g>
  );
}

// ── Pixel character ──────────────────────────────────────────────────
function HabboChar({ journey, cx, cy, onClick, selected }) {
  const colors = getCharColor(journey);
  const initials = getInitials(journey.patient_name);
  const isRed = journey.priority_color === 'red';

  return (
    <motion.g
      style={{ cursor: 'pointer' }}
      onClick={() => onClick(journey)}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {selected && (
        <circle cx={cx} cy={cy + 4} r={18} fill="none" stroke={colors[0]} strokeWidth={2.5} strokeDasharray="4,2" opacity={0.85} />
      )}
      {isRed && (
        <motion.circle cx={cx} cy={cy + 4} r={18} fill="none" stroke="#FF6B6B" strokeWidth={2}
          animate={{ r: [18, 26], opacity: [0.8, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
      {/* Shadow */}
      <ellipse cx={cx} cy={cy + 22} rx={10} ry={4} fill="rgba(0,0,0,0.10)" />
      {/* Legs */}
      <rect x={cx - 5} y={cy + 12} width={4} height={8} rx={2} fill={colors[1]} />
      <rect x={cx + 1} y={cy + 12} width={4} height={8} rx={2} fill={colors[1]} />
      {/* Torso */}
      <rect x={cx - 7} y={cy + 2} width={14} height={12} rx={3} fill={colors[0]} />
      {/* Arms */}
      <rect x={cx - 11} y={cy + 4} width={5} height={7} rx={2} fill={colors[0]} />
      <rect x={cx + 6} y={cy + 4} width={5} height={7} rx={2} fill={colors[0]} />
      {/* Head */}
      <circle cx={cx} cy={cy - 2} r={9} fill="#FDBCB4" stroke={colors[1]} strokeWidth={1.5} />
      {/* Initials */}
      <text x={cx} y={cy + 2} textAnchor="middle" fontSize={6} fill={colors[1]} fontWeight="bold" style={{ userSelect: 'none' }}>
        {initials}
      </text>
      {/* Name tag */}
      <rect x={cx - 22} y={cy - 26} width={44} height={12} rx={6} fill="rgba(0,0,0,0.72)" />
      <text x={cx} y={cy - 17} textAnchor="middle" fontSize={6.5} fill="white" fontWeight="600" style={{ userSelect: 'none' }}>
        {journey.patient_name.split(' ')[0]}
      </text>
    </motion.g>
  );
}

// ── Hallway corridors (connecting rooms visually) ─────────────────────
function Corridors() {
  return (
    <g opacity={0.18}>
      {/* Left column connector */}
      <rect x={50} y={185} width={160} height={30} rx={8} fill="#94A3B8" />
      <rect x={50} y={365} width={160} height={30} rx={8} fill="#94A3B8" />
      {/* Right column connector */}
      <rect x={650} y={185} width={160} height={30} rx={8} fill="#94A3B8" />
      <rect x={650} y={365} width={160} height={30} rx={8} fill="#94A3B8" />
      {/* Top horizontal — C3 to C4 */}
      <rect x={228} y={50} width={44} height={100} rx={8} fill="#94A3B8" />
      {/* Top horizontal — C4 to C5 */}
      <rect x={588} y={50} width={44} height={100} rx={8} fill="#94A3B8" />
    </g>
  );
}

// ── Main export ──────────────────────────────────────────────────────
export default function HabboClinic({ journeys, onSelectJourney, selectedId }) {
  // Group by slot
  const slotGroups = {};
  journeys.forEach(j => {
    const zoneName = getCurrentZone(j);
    const pos = getSlotPos(zoneName);
    const slot = Object.keys(SLOT_POS).find(k => SLOT_POS[k] === pos) || 'SE';
    if (!slotGroups[slot]) slotGroups[slot] = [];
    slotGroups[slot].push(j);
  });

  return (
    <div
      className="w-full overflow-auto rounded-3xl"
      style={{
        background: 'linear-gradient(160deg, #e8f0fe 0%, #f0fdf4 100%)',
        minHeight: 580,
      }}
    >
      <svg
        viewBox="0 0 860 600"
        style={{ width: '100%', minWidth: 700, minHeight: 560 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Floor */}
        <rect width={860} height={600} fill="url(#floorGrad)" rx={20} />
        <defs>
          <linearGradient id="floorGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#dbeafe" />
            <stop offset="100%" stopColor="#dcfce7" />
          </linearGradient>
        </defs>

        {/* Subtle grid */}
        {[...Array(8)].map((_, i) => (
          <line key={`h${i}`} x1={0} y1={60 + i * 70} x2={860} y2={60 + i * 70} stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
        ))}
        {[...Array(11)].map((_, i) => (
          <line key={`v${i}`} x1={60 + i * 78} y1={0} x2={60 + i * 78} y2={600} stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
        ))}

        {/* Corridors */}
        <Corridors />

        {/* Rooms */}
        {Object.keys(SLOT_POS).map(slot => (
          <Room key={slot} slot={slot} count={slotGroups[slot]?.length || 0} />
        ))}

        {/* Title badge */}
        <rect x={320} y={555} width={220} height={26} rx={13} fill="rgba(0,0,0,0.55)" />
        <text x={430} y={573} textAnchor="middle" fontSize={11} fill="white" fontWeight="700" style={{ userSelect: 'none' }}>
          🏥 Salud Digna NX — En Vivo
        </text>

        {/* Characters */}
        <AnimatePresence>
          {Object.entries(slotGroups).map(([slot, group]) =>
            group.map((journey, idx) => {
              const pos = SLOT_POS[slot];
              if (!pos) return null;
              const [ox, oy] = OFFSETS[idx % OFFSETS.length];
              return (
                <HabboChar
                  key={journey.id}
                  journey={journey}
                  cx={pos.x + ox}
                  cy={pos.y + oy - 30}
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