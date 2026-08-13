import React, { useState } from 'react';
import { soundEffects } from '../../utils/audio';
import { Braces, Copy, Check, KeyRound, Cpu, Regex } from 'lucide-react';

interface DevToolsProps {
  toolId: string;
  soundEnabled?: boolean;
}

export const DevTools: React.FC<DevToolsProps> = ({ toolId, soundEnabled = true }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (contentToCopy: string) => {
    if (!contentToCopy) return;
    soundEffects.playTap(soundEnabled);
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- JSON FORMATTER & VALIDATOR ---
  const [jsonText, setJsonText] = useState('{"name":"ToolBox","version":1,"offline":true}');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const formatJson = (indent: number) => {
    soundEffects.playTap(soundEnabled);
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, indent));
      setJsonError(null);
    } catch (e) {
      setJsonError((e as Error).message);
    }
  };

  // --- REGEX TESTER ---
  const [pattern, setPattern] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [testText, setTestText] = useState('Contact us at hello@example.com or support@toolbox.app');

  const testRegex = () => {
    try {
      const re = new RegExp(pattern, 'g');
      const matches = testText.match(re) || [];
      return matches;
    } catch {
      return [];
    }
  };
  const matches = testRegex();

  // --- NUMBER BASE CONVERTER ---
  const [decVal, setDecVal] = useState('255');

  const getBases = () => {
    const num = parseInt(decVal, 10);
    if (isNaN(num)) return { bin: '', oct: '', hex: '' };
    return {
      bin: num.toString(2),
      oct: num.toString(8),
      hex: num.toString(16).toUpperCase(),
    };
  };
  const bases = getBases();

  // --- UUID & HASH GENERATOR ---
  const [uuid, setUuid] = useState(crypto.randomUUID ? crypto.randomUUID() : '123e4567-e89b-12d3-a456-426614174000');
  const [hashInput, setHashInput] = useState('ToolBox App');
  const [sha256Result, setSha256Result] = useState('');

  const generateUuid = () => {
    soundEffects.playTap(soundEnabled);
    setUuid(crypto.randomUUID());
  };

  const computeSha256 = async () => {
    soundEffects.playTap(soundEnabled);
    const msgUint8 = new TextEncoder().encode(hashInput);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    setSha256Result(hashHex);
  };

  // RENDER BASED ON TOOL ID
  if (toolId === 'json_formatter') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Braces size={18} /> JSON Formatter & Validator
        </h3>

        <textarea
          rows={7}
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            setJsonError(null);
          }}
          placeholder="Paste raw JSON string..."
          className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono focus:outline-hidden"
        />

        {jsonError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/60 rounded-xl border border-red-200 text-red-600 dark:text-red-400 text-xs font-mono">
            ⚠️ Invalid JSON: {jsonError}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => formatJson(2)}
            className="py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
          >
            Pretty Print (2 Space)
          </button>
          <button
            onClick={() => formatJson(0)}
            className="py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold"
          >
            Minify JSON
          </button>
          <button
            onClick={() => handleCopy(jsonText)}
            className="py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center justify-center gap-1"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />} Copy
          </button>
        </div>
      </div>
    );
  }

  if (toolId === 'regex_tester') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Regex size={18} /> Regex Tester
        </h3>

        <div>
          <label className="text-xs font-medium text-slate-500">Regex Pattern</label>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500">Test String</label>
          <textarea
            rows={4}
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
          />
        </div>

        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl border border-indigo-100 dark:border-indigo-900 space-y-2">
          <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            Matches Found ({matches.length})
          </div>
          {matches.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {matches.map((m, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded-md bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100 text-xs font-mono font-bold"
                >
                  {m}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-slate-400">No matches for this pattern</span>
          )}
        </div>
      </div>
    );
  }

  if (toolId === 'number_base_converter') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu size={18} /> Number Base Converter
        </h3>

        <div>
          <label className="text-xs font-medium text-slate-500">Decimal Value (Base 10)</label>
          <input
            type="number"
            value={decVal}
            onChange={(e) => setDecVal(e.target.value)}
            className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
          />
        </div>

        <div className="space-y-2 pt-2">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500">Binary (Base 2)</span>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{bases.bin}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500">Hexadecimal (Base 16)</span>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{bases.hex}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500">Octal (Base 8)</span>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{bases.oct}</span>
          </div>
        </div>
      </div>
    );
  }

  if (toolId === 'uuid_hash_generator') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <KeyRound size={18} /> UUID & Hash Generator
        </h3>

        {/* UUID */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase">v4 UUID</span>
          <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 break-all">{uuid}</div>
          <div className="flex gap-2">
            <button
              onClick={generateUuid}
              className="py-1.5 px-3 rounded-lg bg-indigo-600 text-white text-xs font-bold"
            >
              New UUID
            </button>
            <button
              onClick={() => handleCopy(uuid)}
              className="py-1.5 px-3 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-bold"
            >
              Copy
            </button>
          </div>
        </div>

        {/* SHA-256 HASH */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase">SHA-256 Hash</span>
          <input
            type="text"
            value={hashInput}
            onChange={(e) => setHashInput(e.target.value)}
            className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg text-xs font-mono border border-slate-200 dark:border-slate-700"
          />
          <button
            onClick={computeSha256}
            className="py-1.5 px-3 rounded-lg bg-purple-600 text-white text-xs font-bold"
          >
            Compute SHA-256
          </button>
          {sha256Result && (
            <div className="p-2 bg-purple-50 dark:bg-purple-950/60 rounded-lg text-[11px] font-mono font-bold text-purple-700 dark:text-purple-300 break-all">
              {sha256Result}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};
