import React, { useState } from 'react';
import { soundEffects } from '../../utils/audio';
import { Copy, Check, Type, Sparkles, Code } from 'lucide-react';

interface TextToolsProps {
  toolId: string;
  soundEnabled?: boolean;
}

export const TextTools: React.FC<TextToolsProps> = ({ toolId, soundEnabled = true }) => {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = (contentToCopy: string) => {
    if (!contentToCopy) return;
    soundEffects.playTap(soundEnabled);
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- WORD COUNTER ---
  if (toolId === 'word_counter') {
    const trimmed = text.trim();
    const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
    const charCount = text.length;
    const charNoSpaces = text.replace(/\s+/g, '').length;
    const sentenceCount = trimmed ? (text.match(/[.!?]+/g) || []).length || 1 : 0;
    const paragraphCount = trimmed ? text.split(/\n+/).length : 0;
    const readingTimeMins = Math.ceil(wordCount / 200);

    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <textarea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type text here..."
          className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl text-center border border-indigo-100 dark:border-indigo-900">
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{wordCount}</div>
            <div className="text-xs text-slate-500 font-semibold">Words</div>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl text-center border border-indigo-100 dark:border-indigo-900">
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{charCount}</div>
            <div className="text-xs text-slate-500 font-semibold">Characters</div>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl text-center border border-indigo-100 dark:border-indigo-900">
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{charNoSpaces}</div>
            <div className="text-xs text-slate-500 font-semibold">No Spaces</div>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl text-center border border-indigo-100 dark:border-indigo-900">
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{sentenceCount}</div>
            <div className="text-xs text-slate-500 font-semibold">Sentences</div>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl text-center border border-indigo-100 dark:border-indigo-900">
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{paragraphCount}</div>
            <div className="text-xs text-slate-500 font-semibold">Paragraphs</div>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl text-center border border-indigo-100 dark:border-indigo-900">
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">~{readingTimeMins}m</div>
            <div className="text-xs text-slate-500 font-semibold">Reading Time</div>
          </div>
        </div>
      </div>
    );
  }

  // --- CASE CONVERTER ---
  if (toolId === 'case_converter') {
    const convertCase = (type: string) => {
      soundEffects.playTap(soundEnabled);
      if (type === 'upper') setText(text.toUpperCase());
      if (type === 'lower') setText(text.toLowerCase());
      if (type === 'title') {
        setText(
          text.replace(
            /\w\S*/g,
            (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
          )
        );
      }
      if (type === 'camel') {
        setText(
          text
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
        );
      }
      if (type === 'kebab') {
        setText(
          text
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
        );
      }
    };

    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Type size={18} /> Case Converter
        </h3>

        <textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to format..."
          className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-hidden"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            onClick={() => convertCase('upper')}
            className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            UPPERCASE
          </button>
          <button
            onClick={() => convertCase('lower')}
            className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            lowercase
          </button>
          <button
            onClick={() => convertCase('title')}
            className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            Title Case
          </button>
          <button
            onClick={() => convertCase('camel')}
            className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            camelCase
          </button>
          <button
            onClick={() => convertCase('kebab')}
            className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            kebab-case
          </button>
          <button
            onClick={() => handleCopy(text)}
            className="py-2.5 px-3 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-1"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />} Copy
          </button>
        </div>
      </div>
    );
  }

  // --- TEXT CLEANER & SORTER ---
  if (toolId === 'text_cleaner') {
    const cleanSpaces = () => setText(text.replace(/\s+/g, ' ').trim());
    const reverseText = () => setText(text.split('').reverse().join(''));
    const removeDuplicates = () => {
      const lines = text.split('\n');
      setText([...new Set(lines)].join('\n'));
    };
    const sortLines = () => {
      const lines = text.split('\n');
      setText(lines.sort().join('\n'));
    };

    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles size={18} /> Text Cleaner & Sorter
        </h3>

        <textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste lines or messy text..."
          className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-hidden"
        />

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={cleanSpaces}
            className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            Remove Extra Spaces
          </button>
          <button
            onClick={removeDuplicates}
            className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            Remove Duplicate Lines
          </button>
          <button
            onClick={sortLines}
            className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            Sort Lines A-Z
          </button>
          <button
            onClick={reverseText}
            className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            Reverse Characters
          </button>
        </div>
      </div>
    );
  }

  // --- BASE64 & URL ENCODER/DECODER ---
  if (toolId === 'base64_text') {
    const encodeBase64 = () => {
      try {
        setText(btoa(text));
      } catch {
        // invalid
      }
    };
    const decodeBase64 = () => {
      try {
        setText(atob(text));
      } catch {
        // invalid
      }
    };
    const encodeUrl = () => setText(encodeURIComponent(text));
    const decodeUrl = () => setText(decodeURIComponent(text));

    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Code size={18} /> Base64 & URL Encoder/Decoder
        </h3>

        <textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text or base64 string..."
          className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-mono focus:outline-hidden"
        />

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={encodeBase64}
            className="py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
          >
            Encode Base64
          </button>
          <button
            onClick={decodeBase64}
            className="py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold"
          >
            Decode Base64
          </button>
          <button
            onClick={encodeUrl}
            className="py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold"
          >
            Encode URL
          </button>
          <button
            onClick={decodeUrl}
            className="py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold"
          >
            Decode URL
          </button>
        </div>
      </div>
    );
  }

  return null;
};
