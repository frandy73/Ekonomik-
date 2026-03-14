import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, X, RotateCcw, Trophy, Wallet, Plus, Trash2, History, 
  ArrowDownRight, ArrowUpRight, CalendarDays, Plane, Home, 
  Smartphone, Car, GraduationCap, Heart, ShoppingBag, Gift, Palmtree,
  Flame, Download
} from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Types & Interfaces ---

interface Cell {
  id: number;
  value: number;
  crossed: boolean;
}

interface HistoryEntry {
  id: string;
  timestamp: number;
  amount: number;
  type: 'deposit' | 'withdraw';
}

interface Box {
  id: string;
  name: string;
  goal: number;
  currency: string;
  numCells: number;
  color: string;
  icon: string;
  grid: Cell[];
  history: HistoryEntry[];
  celebrated50?: boolean;
  celebrated100?: boolean;
}

// --- Constants & Maps ---

const ICONS: Record<string, React.ElementType> = {
  Wallet, Plane, Home, Smartphone, Car, GraduationCap, Heart, ShoppingBag, Gift, Palmtree
};

const THEMES: Record<string, any> = {
  emerald: {
    bg: 'bg-emerald-600',
    bgHover: 'hover:bg-emerald-700',
    text: 'text-emerald-600',
    lightBg: 'bg-emerald-50',
    border: 'border-emerald-200',
    tabActive: 'bg-emerald-600 text-white shadow-sm',
    cellUncrossed: 'bg-emerald-100/80 text-emerald-900 hover:bg-emerald-200 shadow-sm border border-emerald-200/60',
    headerIconBg: 'bg-emerald-800/50 border-emerald-500/30',
    headerIconText: 'text-emerald-100',
    sectionBg: 'bg-emerald-50 border-emerald-200/60',
    sectionTitle: 'text-emerald-900',
    sectionIcon: 'text-emerald-700'
  },
  blue: {
    bg: 'bg-blue-600',
    bgHover: 'hover:bg-blue-700',
    text: 'text-blue-600',
    lightBg: 'bg-blue-50',
    border: 'border-blue-200',
    tabActive: 'bg-blue-600 text-white shadow-sm',
    cellUncrossed: 'bg-blue-100/80 text-blue-900 hover:bg-blue-200 shadow-sm border border-blue-200/60',
    headerIconBg: 'bg-blue-800/50 border-blue-500/30',
    headerIconText: 'text-blue-100',
    sectionBg: 'bg-blue-50 border-blue-200/60',
    sectionTitle: 'text-blue-900',
    sectionIcon: 'text-blue-700'
  },
  purple: {
    bg: 'bg-purple-600',
    bgHover: 'hover:bg-purple-700',
    text: 'text-purple-600',
    lightBg: 'bg-purple-50',
    border: 'border-purple-200',
    tabActive: 'bg-purple-600 text-white shadow-sm',
    cellUncrossed: 'bg-purple-100/80 text-purple-900 hover:bg-purple-200 shadow-sm border border-purple-200/60',
    headerIconBg: 'bg-purple-800/50 border-purple-500/30',
    headerIconText: 'text-purple-100',
    sectionBg: 'bg-purple-50 border-purple-200/60',
    sectionTitle: 'text-purple-900',
    sectionIcon: 'text-purple-700'
  },
  rose: {
    bg: 'bg-rose-600',
    bgHover: 'hover:bg-rose-700',
    text: 'text-rose-600',
    lightBg: 'bg-rose-50',
    border: 'border-rose-200',
    tabActive: 'bg-rose-600 text-white shadow-sm',
    cellUncrossed: 'bg-rose-100/80 text-rose-900 hover:bg-rose-200 shadow-sm border border-rose-200/60',
    headerIconBg: 'bg-rose-800/50 border-rose-500/30',
    headerIconText: 'text-rose-100',
    sectionBg: 'bg-rose-50 border-rose-200/60',
    sectionTitle: 'text-rose-900',
    sectionIcon: 'text-rose-700'
  },
  amber: {
    bg: 'bg-amber-600',
    bgHover: 'hover:bg-amber-700',
    text: 'text-amber-600',
    lightBg: 'bg-amber-50',
    border: 'border-amber-200',
    tabActive: 'bg-amber-600 text-white shadow-sm',
    cellUncrossed: 'bg-amber-100/80 text-amber-900 hover:bg-amber-200 shadow-sm border border-amber-200/60',
    headerIconBg: 'bg-amber-800/50 border-amber-500/30',
    headerIconText: 'text-amber-100',
    sectionBg: 'bg-amber-50 border-amber-200/60',
    sectionTitle: 'text-amber-900',
    sectionIcon: 'text-amber-700'
  }
};

const COLOR_OPTIONS = [
  { id: 'emerald', hex: '#059669' },
  { id: 'blue', hex: '#2563eb' },
  { id: 'purple', hex: '#7c3aed' },
  { id: 'rose', hex: '#e11d48' },
  { id: 'amber', hex: '#d97706' }
];

// --- Utilities ---

const playSound = (type: 'deposit' | 'withdraw' | 'cheer' | 'halfway') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;
    
    if (type === 'deposit') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'withdraw') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'halfway') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(600, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'cheer') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(500, now + 0.1);
      osc.frequency.setValueAtTime(600, now + 0.2);
      osc.frequency.setValueAtTime(800, now + 0.3);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    }
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

const generateRoundGrid = (goal: number, numCells: number = 150): Cell[] => {
  const values = Array(numCells).fill(0);
  let remaining = goal;
  
  let denoms = [1000, 500, 200, 100, 50, 20, 10, 5];
  if (goal >= 100000) denoms = [10000, 5000, 2000, 1000, 500, 200, 100];
  else if (goal >= 50000) denoms = [5000, 2000, 1000, 500, 200, 100, 50];
  else if (goal >= 10000) denoms = [1000, 500, 200, 100, 50, 20, 10, 5];
  else if (goal >= 5000) denoms = [500, 200, 100, 50, 20, 10, 5];
  else if (goal >= 1000) denoms = [100, 50, 20, 10, 5, 2, 1];
  else denoms = [50, 20, 10, 5, 2, 1];

  const minDenom = denoms[denoms.length - 1];
  
  if (goal < numCells) {
    for (let i = 0; i < goal; i++) values[i] = 1;
    remaining = 0;
  } else {
    for (let i = 0; i < numCells; i++) {
      values[i] = minDenom;
      remaining -= minDenom;
    }
  }
  
  let attempts = 0;
  while (remaining > 0 && attempts < 20000) {
    attempts++;
    const idx = Math.floor(Math.random() * numCells);
    const currentVal = values[idx];
    const nextDenom = denoms.slice().reverse().find(d => d > currentVal);
    if (nextDenom) {
      const diff = nextDenom - currentVal;
      if (diff <= remaining) {
        values[idx] = nextDenom;
        remaining -= diff;
      }
    }
  }
  
  while (remaining > 0) {
    const idx = Math.floor(Math.random() * numCells);
    const validDenoms = denoms.filter(d => d <= remaining);
    if (validDenoms.length > 0) {
      const d = validDenoms[0];
      values[idx] += d;
      remaining -= d;
    } else {
      values[idx] += remaining;
      remaining = 0;
    }
  }

  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }

  return values.map((val, index) => ({
    id: index,
    value: val,
    crossed: false
  }));
};

const formatCurrency = (amount: number, currency: string) => {
  const formatted = new Intl.NumberFormat('en-US').format(amount);
  switch (currency) {
    case 'HTG': return `${formatted} Gdes`;
    case 'USD': return `$${formatted}`;
    case 'EUR': return `€${formatted}`;
    case 'DOP': return `RD$${formatted}`;
    default: return `${formatted} ${currency}`;
  }
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('fr-FR', { 
    day: 'numeric', month: 'short', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  }).format(date);
};

const calculateStreak = (history: HistoryEntry[]) => {
  if (!history || history.length === 0) return 0;
  
  const deposits = history.filter(h => h.type === 'deposit');
  if (deposits.length === 0) return 0;

  // Get unique dates in YYYY-MM-DD format
  const dates = Array.from(new Set(deposits.map(h => {
    const d = new Date(h.timestamp);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }))).sort((a, b) => b.localeCompare(a)); // Sort descending (newest first)

  if (dates.length === 0) return 0;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  // If the most recent deposit is not today and not yesterday, streak is broken
  if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let currentDate = new Date(dates[0]); // Start from the latest deposit date

  for (const dateStr of dates) {
    const expectedStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    
    if (dateStr === expectedStr) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1); // Go back one day
    } else {
      break;
    }
  }

  return streak;
};

// --- Modals ---

interface CreateBoxModalProps {
  onClose: () => void;
  onCreate: (name: string, goal: number, currency: string, numCells: number, color: string, icon: string) => void;
}

const CreateBoxModal: React.FC<CreateBoxModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('10000');
  const [currency, setCurrency] = useState('HTG');
  const [numCells, setNumCells] = useState('150');
  const [color, setColor] = useState('emerald');
  const [icon, setIcon] = useState('Wallet');

  const handleCreate = () => {
    const parsedGoal = parseInt(goal, 10);
    const parsedNumCells = parseInt(numCells, 10);
    
    if (!name.trim()) {
      alert("Tanpri bay bwat la yon non.");
      return;
    }
    if (isNaN(parsedNumCells) || parsedNumCells < 10 || parsedNumCells > 1000) {
      alert("Tanpri antre yon kantite kaz ant 10 ak 1000.");
      return;
    }
    if (isNaN(parsedGoal) || parsedGoal < parsedNumCells) {
      alert(`Tanpri antre yon objektif ki pi gran oswa egal ak ${parsedNumCells} (omwen 1 pou chak kaz).`);
      return;
    }
    onCreate(name.trim(), parsedGoal, currency, parsedNumCells, color, icon);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-stone-100 shrink-0">
          <h3 className="text-lg font-bold text-stone-800">Kreye yon nouvo Bwat</h3>
          <button onClick={onClose} className="p-2 text-stone-400 hover:bg-stone-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-5 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Non Bwat la (Egz: Pou achte telefòn)
            </label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Antre non pwojè a..."
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Objektif (Konbyen kòb ou vle ranmase?)
            </label>
            <input 
              type="number" 
              value={goal}
              onChange={e => setGoal(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Lajan (Deviz)
              </label>
              <select 
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                <option value="HTG">Goud (HTG)</option>
                <option value="USD">Dola (USD)</option>
                <option value="EUR">Ewo (EUR)</option>
                <option value="DOP">Pezos (DOP)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Kantite Kaz
              </label>
              <select 
                value={numCells}
                onChange={e => setNumCells(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                <option value="50">50 Kaz (Kout)</option>
                <option value="100">100 Kaz</option>
                <option value="150">150 Kaz (Nòmal)</option>
                <option value="365">365 Kaz (1 Ane)</option>
              </select>
            </div>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Chwazi yon Ikon
            </label>
            <div className="grid grid-cols-5 gap-2">
              {Object.keys(ICONS).map(iconName => {
                const IconComponent = ICONS[iconName];
                return (
                  <button
                    key={iconName}
                    onClick={() => setIcon(iconName)}
                    className={`p-3 rounded-xl flex items-center justify-center transition-colors ${
                      icon === iconName 
                        ? 'bg-stone-800 text-white' 
                        : 'bg-stone-50 text-stone-500 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Chwazi yon Koulè
            </label>
            <div className="flex items-center gap-3">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${
                    color === c.id ? 'scale-110 ring-2 ring-offset-2 ring-stone-800' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-200 rounded-xl transition-colors"
          >
            Anile
          </button>
          <button 
            onClick={handleCreate}
            className="px-5 py-2.5 text-sm font-medium text-white bg-stone-800 hover:bg-stone-900 rounded-xl shadow-sm transition-colors"
          >
            Kreye Bwat la
          </button>
        </div>
      </motion.div>
    </div>
  );
};

interface SettingsModalProps {
  onClose: () => void;
  box: Box;
  canDelete: boolean;
  onSave: (name: string, goal: number, currency: string, numCells: number, color: string, icon: string) => void;
  onReset: () => void;
  onDelete: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, box, canDelete, onSave, onReset, onDelete }) => {
  const [tempName, setTempName] = useState(box.name);
  const [tempGoal, setTempGoal] = useState(box.goal.toString());
  const [tempCurrency, setTempCurrency] = useState(box.currency);
  const [tempNumCells, setTempNumCells] = useState(box.numCells?.toString() || '150');
  const [tempColor, setTempColor] = useState(box.color || 'emerald');
  const [tempIcon, setTempIcon] = useState(box.icon || 'Wallet');

  const handleSave = () => {
    const parsedGoal = parseInt(tempGoal, 10);
    const parsedNumCells = parseInt(tempNumCells, 10);

    if (!tempName.trim()) {
      alert("Tanpri bay bwat la yon non.");
      return;
    }
    if (isNaN(parsedNumCells) || parsedNumCells < 10 || parsedNumCells > 1000) {
      alert("Tanpri antre yon kantite kaz ant 10 ak 1000.");
      return;
    }
    if (isNaN(parsedGoal) || parsedGoal < parsedNumCells) {
      alert(`Tanpri antre yon objektif ki pi gran oswa egal ak ${parsedNumCells} (omwen 1 pou chak kaz).`);
      return;
    }
    onSave(tempName.trim(), parsedGoal, tempCurrency, parsedNumCells, tempColor, tempIcon);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-stone-100 shrink-0">
          <h3 className="text-lg font-bold text-stone-800">Paramèt Bwat la</h3>
          <button onClick={onClose} className="p-2 text-stone-400 hover:bg-stone-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Non Bwat la
            </label>
            <input 
              type="text" 
              value={tempName}
              onChange={e => setTempName(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Objektif (Konbyen kòb ou vle ranmase?)
            </label>
            <input 
              type="number" 
              value={tempGoal}
              onChange={e => setTempGoal(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent transition-all"
            />
            <p className="text-xs text-stone-500 mt-2">
              Si w chanje objektif la oswa kantite kaz yo, tablo a ak istorik la ap rekòmanse a zewo.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Lajan (Deviz)
              </label>
              <select 
                value={tempCurrency}
                onChange={e => setTempCurrency(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent transition-all"
              >
                <option value="HTG">Goud (HTG)</option>
                <option value="USD">Dola (USD)</option>
                <option value="EUR">Ewo (EUR)</option>
                <option value="DOP">Pezos (DOP)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Kantite Kaz
              </label>
              <select 
                value={tempNumCells}
                onChange={e => setTempNumCells(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent transition-all"
              >
                <option value="50">50 Kaz</option>
                <option value="100">100 Kaz</option>
                <option value="150">150 Kaz</option>
                <option value="365">365 Kaz (1 Ane)</option>
              </select>
            </div>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Chwazi yon Ikon
            </label>
            <div className="grid grid-cols-5 gap-2">
              {Object.keys(ICONS).map(iconName => {
                const IconComponent = ICONS[iconName];
                return (
                  <button
                    key={iconName}
                    onClick={() => setTempIcon(iconName)}
                    className={`p-3 rounded-xl flex items-center justify-center transition-colors ${
                      tempIcon === iconName 
                        ? 'bg-stone-800 text-white' 
                        : 'bg-stone-50 text-stone-500 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Chwazi yon Koulè
            </label>
            <div className="flex items-center gap-3">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setTempColor(c.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${
                    tempColor === c.id ? 'scale-110 ring-2 ring-offset-2 ring-stone-800' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 space-y-3">
            <button 
              onClick={onReset}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Rekòmanse Tablo a ak Istorik la
            </button>
            
            {canDelete && (
              <button 
                onClick={() => {
                  if (window.confirm("Ou sèten ou vle efase bwat sa a nèt? Ou pap ka jwenn li ankò.")) {
                    onDelete();
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Efase Bwat sa a
              </button>
            )}
          </div>
        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-200 rounded-xl transition-colors"
          >
            Anile
          </button>
          <button 
            onClick={handleSave}
            className="px-5 py-2.5 text-sm font-medium text-white bg-stone-800 hover:bg-stone-900 rounded-xl shadow-sm transition-colors"
          >
            Sove Chanjman yo
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [activeBoxId, setActiveBoxId] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('bwatSekreState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.boxes && Array.isArray(parsed.boxes) && parsed.boxes.length > 0) {
          const loadedBoxes = parsed.boxes.map((b: any) => ({
            ...b,
            numCells: b.numCells || b.grid?.length || 150,
            color: b.color || 'emerald',
            icon: b.icon || 'Wallet',
            history: b.history || [],
            celebrated50: b.celebrated50 || false,
            celebrated100: b.celebrated100 || false
          }));
          setBoxes(loadedBoxes);
          setActiveBoxId(parsed.activeBoxId || loadedBoxes[0].id);
        } else {
          const defaultBox: Box = {
            id: 'default-1',
            name: 'Bwat Prensipal',
            goal: parsed.goal || 10000,
            currency: parsed.currency || 'HTG',
            numCells: 150,
            color: 'emerald',
            icon: 'Wallet',
            grid: parsed.grid || generateRoundGrid(10000, 150),
            history: [],
            celebrated50: false,
            celebrated100: false
          };
          setBoxes([defaultBox]);
          setActiveBoxId(defaultBox.id);
        }
      } catch (e) {
        const defaultBox: Box = {
          id: Date.now().toString(),
          name: 'Bwat Prensipal',
          goal: 10000,
          currency: 'HTG',
          numCells: 150,
          color: 'emerald',
          icon: 'Wallet',
          grid: generateRoundGrid(10000, 150),
          history: [],
          celebrated50: false,
          celebrated100: false
        };
        setBoxes([defaultBox]);
        setActiveBoxId(defaultBox.id);
      }
    } else {
      const defaultBox: Box = {
        id: Date.now().toString(),
        name: 'Bwat Prensipal',
        goal: 10000,
        currency: 'HTG',
        numCells: 150,
        color: 'emerald',
        icon: 'Wallet',
        grid: generateRoundGrid(10000, 150),
        history: [],
        celebrated50: false,
        celebrated100: false
      };
      setBoxes([defaultBox]);
      setActiveBoxId(defaultBox.id);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('bwatSekreState', JSON.stringify({ boxes, activeBoxId }));
    }
  }, [boxes, activeBoxId, isLoaded]);

  const activeBox = boxes.find(b => b.id === activeBoxId) || boxes[0];

  const totalSaved = useMemo(() => {
    if (!activeBox) return 0;
    return activeBox.grid.filter(c => c.crossed).reduce((sum, c) => sum + c.value, 0);
  }, [activeBox]);

  const progressPercentage = activeBox && activeBox.goal > 0 
    ? Math.min((totalSaved / activeBox.goal) * 100, 100) 
    : 0;

  const streak = useMemo(() => {
    if (!activeBox) return 0;
    return calculateStreak(activeBox.history);
  }, [activeBox?.history]);

  // Check for celebrations
  useEffect(() => {
    if (!isLoaded || !activeBox) return;

    let updated = false;
    let newBox = { ...activeBox };

    if (progressPercentage >= 100 && !activeBox.celebrated100) {
      playSound('cheer');
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#10B981', '#F59E0B', '#3B82F6', '#EF4444'],
        zIndex: 100
      });
      newBox.celebrated100 = true;
      updated = true;
    } else if (progressPercentage >= 50 && progressPercentage < 100 && !activeBox.celebrated50) {
      playSound('halfway');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981'],
        zIndex: 100
      });
      newBox.celebrated50 = true;
      updated = true;
    }

    if (updated) {
      setBoxes(prev => prev.map(b => b.id === activeBoxId ? newBox : b));
    }
  }, [progressPercentage, activeBox, isLoaded, activeBoxId]);

  const toggleCell = (cellId: number) => {
    setBoxes(prev => prev.map(box => {
      if (box.id === activeBoxId) {
        const cell = box.grid.find(c => c.id === cellId);
        if (!cell) return box;

        const isDepositing = !cell.crossed;
        playSound(isDepositing ? 'deposit' : 'withdraw');

        const newHistoryEntry: HistoryEntry = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          timestamp: Date.now(),
          amount: cell.value,
          type: isDepositing ? 'deposit' : 'withdraw'
        };

        let newCelebrated50 = box.celebrated50;
        let newCelebrated100 = box.celebrated100;
        
        const newTotalSaved = box.grid.map(c => c.id === cellId ? { ...c, crossed: !c.crossed } : c)
                                      .filter(c => c.crossed)
                                      .reduce((sum, c) => sum + c.value, 0);
        const newProgress = Math.min((newTotalSaved / box.goal) * 100, 100);

        if (newProgress < 100) newCelebrated100 = false;
        if (newProgress < 50) newCelebrated50 = false;

        return {
          ...box,
          grid: box.grid.map(c => c.id === cellId ? { ...c, crossed: !c.crossed } : c),
          history: [newHistoryEntry, ...(box.history || [])],
          celebrated50: newCelebrated50,
          celebrated100: newCelebrated100
        };
      }
      return box;
    }));
  };

  const handleCreateBox = (name: string, goal: number, currency: string, numCells: number, color: string, icon: string) => {
    const newBox: Box = {
      id: Date.now().toString(),
      name,
      goal,
      currency,
      numCells,
      color,
      icon,
      grid: generateRoundGrid(goal, numCells),
      history: [],
      celebrated50: false,
      celebrated100: false
    };
    setBoxes(prev => [...prev, newBox]);
    setActiveBoxId(newBox.id);
    setIsCreateOpen(false);
  };

  const handleUpdateBox = (name: string, goal: number, currency: string, numCells: number, color: string, icon: string) => {
    setBoxes(prev => prev.map(box => {
      if (box.id === activeBoxId) {
        const needsNewGrid = box.goal !== goal || box.numCells !== numCells;
        return {
          ...box,
          name,
          goal,
          currency,
          numCells,
          color,
          icon,
          grid: needsNewGrid ? generateRoundGrid(goal, numCells) : box.grid,
          history: needsNewGrid ? [] : box.history,
          celebrated50: needsNewGrid ? false : box.celebrated50,
          celebrated100: needsNewGrid ? false : box.celebrated100
        };
      }
      return box;
    }));
    setIsSettingsOpen(false);
  };

  const handleResetBox = () => {
    if (window.confirm("Ou sèten ou vle rekòmanse? Tout sa w te make nan bwat sa ap efase.")) {
      setBoxes(prev => prev.map(box => {
        if (box.id === activeBoxId) {
          return { 
            ...box, 
            grid: generateRoundGrid(box.goal, box.numCells), 
            history: [],
            celebrated50: false,
            celebrated100: false
          };
        }
        return box;
      }));
      setIsSettingsOpen(false);
    }
  };

  const handleDeleteBox = () => {
    const newBoxes = boxes.filter(b => b.id !== activeBoxId);
    setBoxes(newBoxes);
    setActiveBoxId(newBoxes[0].id);
    setIsSettingsOpen(false);
  };

  if (!isLoaded || !activeBox) return null;

  const theme = THEMES[activeBox.color] || THEMES.emerald;
  const ActiveIcon = ICONS[activeBox.icon] || Wallet;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans pb-20">
      {/* Header */}
      <header className={`${theme.bg} border-b border-black/10 sticky top-0 z-10 shadow-md transition-colors duration-300`}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner border ${theme.headerIconBg}`}>
              <ActiveIcon className={`w-5 h-5 ${theme.headerIconText}`} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">{activeBox.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            {deferredPrompt && (
              <button 
                onClick={handleInstall}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Enstale</span>
              </button>
            )}
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-white/80 hover:bg-black/10 rounded-full transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Tabs for multiple boxes */}
      <div className="bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {boxes.map(box => {
              const boxTheme = THEMES[box.color] || THEMES.emerald;
              const BoxIcon = ICONS[box.icon] || Wallet;
              const isActive = activeBoxId === box.id;
              
              return (
                <button
                  key={box.id}
                  onClick={() => setActiveBoxId(box.id)}
                  className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive 
                      ? boxTheme.tabActive 
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  <BoxIcon className="w-4 h-4" />
                  {box.name}
                </button>
              );
            })}
            <button
              onClick={() => setIsCreateOpen(true)}
              className="whitespace-nowrap flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouvo Bwat
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Success Banner */}
        <AnimatePresence>
          {totalSaved >= activeBox.goal && (
            <motion.div 
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className={`${theme.bg} text-white rounded-2xl p-6 shadow-md flex items-center gap-4 overflow-hidden`}
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Felisitasyon! 🎉</h2>
                <p className="text-white/90">Ou atenn objektif ou te fikse pou "{activeBox.name}". Ou se yon chanpyon!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Section */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <p className="text-sm font-medium text-stone-500 uppercase tracking-wider">Kòb ou Ranmase</p>
                {streak > 0 && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-1 bg-orange-100 text-orange-600 px-2.5 py-0.5 rounded-full text-xs font-bold"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    {streak} jou afile!
                  </motion.div>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-stone-900">
                  {formatCurrency(totalSaved, activeBox.currency)}
                </span>
                <span className="text-lg font-medium text-stone-400">
                  / {formatCurrency(activeBox.goal, activeBox.currency)}
                </span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm font-medium text-stone-500 mb-1">Pousantaj</p>
              <p className={`text-2xl font-bold ${theme.text}`}>{progressPercentage.toFixed(1)}%</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-4 bg-stone-100 rounded-full overflow-hidden shadow-inner relative">
            <motion.div 
              className={`h-full ${theme.bg}`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            {/* 50% Marker */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-stone-300/50 z-10" />
          </div>
        </section>

        {/* Grid Section */}
        <section className={`rounded-2xl p-4 sm:p-6 shadow-sm border ${theme.sectionBg}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CalendarDays className={`w-5 h-5 ${theme.sectionIcon}`} />
              <h2 className={`text-lg font-bold ${theme.sectionTitle}`}>Tablo Ekonomi ({activeBox.numCells} Kaz)</h2>
            </div>
            <p className={`text-sm ${theme.sectionIcon} opacity-80`}>Klike sou yon nonm pou make l</p>
          </div>
          
          <div className="grid grid-cols-10 sm:grid-cols-15 gap-1 sm:gap-2">
            {activeBox.grid.map(cell => (
              <motion.button
                key={cell.id}
                whileTap={{ scale: 0.85 }}
                onClick={() => toggleCell(cell.id)}
                className={`
                  relative flex items-center justify-center 
                  h-8 sm:h-10 md:h-12 rounded md:rounded-md text-[10px] sm:text-xs md:text-sm font-bold transition-colors select-none overflow-hidden
                  ${cell.crossed 
                    ? 'bg-stone-800 text-stone-400 shadow-inner border border-stone-900' 
                    : theme.cellUncrossed}
                `}
              >
                <span className="relative z-10 font-mono tracking-tighter">{cell.value}</span>
                {cell.crossed && (
                  <motion.div 
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <svg className="w-full h-full text-black opacity-50" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <line x1="15" y1="85" x2="85" y2="15" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </section>

        {/* History Section */}
        <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-stone-200">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-stone-500" />
            <h2 className="text-lg font-bold text-stone-800">Istorik Depo</h2>
          </div>
          
          {(!activeBox.history || activeBox.history.length === 0) ? (
            <p className="text-stone-500 text-sm italic text-center py-8">Ou poko fè okenn depo nan bwat sa a.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
              <AnimatePresence initial={false}>
                {activeBox.history.map(entry => (
                  <motion.div 
                    key={entry.id}
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${entry.type === 'deposit' ? theme.lightBg + ' ' + theme.text : 'bg-red-100 text-red-600'}`}>
                        {entry.type === 'deposit' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-800">
                          {entry.type === 'deposit' ? 'Depo' : 'Retrè / Anile'}
                        </p>
                        <p className="text-xs text-stone-500">{formatDate(entry.timestamp)}</p>
                      </div>
                    </div>
                    <span className={`font-bold ${entry.type === 'deposit' ? theme.text : 'text-red-600'}`}>
                      {entry.type === 'deposit' ? '+' : '-'}{formatCurrency(entry.amount, activeBox.currency)}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>

      {/* Create Box Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <CreateBoxModal 
            onClose={() => setIsCreateOpen(false)}
            onCreate={handleCreateBox}
          />
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal 
            onClose={() => setIsSettingsOpen(false)} 
            box={activeBox}
            canDelete={boxes.length > 1}
            onSave={handleUpdateBox}
            onReset={handleResetBox}
            onDelete={handleDeleteBox}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
