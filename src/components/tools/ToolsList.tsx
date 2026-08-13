import React, { useState } from 'react';
import { ALL_TOOLS } from '../../data/toolsData';
import { ToolCategory, ToolItem } from '../../types';
import { IconHelper } from '../common/IconHelper';
import { Converters } from './Converters';
import { Calculators } from './Calculators';
import { TimeTools } from './TimeTools';
import { FileTools } from './FileTools';
import { TextTools } from './TextTools';
import { DevTools } from './DevTools';
import { EverydayTools } from './EverydayTools';
import { Star, ArrowLeft, Search, Filter } from 'lucide-react';
import { soundEffects } from '../../utils/audio';

interface ToolsListProps {
  selectedToolId: string | null;
  onSelectTool: (toolId: string | null) => void;
  favorites: string[];
  onToggleFavorite: (toolId: string) => void;
  precision: number;
  soundEnabled: boolean;
}

export const ToolsList: React.FC<ToolsListProps> = ({
  selectedToolId,
  onSelectTool,
  favorites,
  onToggleFavorite,
  precision,
  soundEnabled,
}) => {
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all'>('all');
  const [filterQuery, setFilterQuery] = useState('');

  const categories: { id: ToolCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Tools' },
    { id: 'converters', label: 'Converters' },
    { id: 'calculators', label: 'Calculators' },
    { id: 'time', label: 'Time Tools' },
    { id: 'files', label: 'PDF & Files' },
    { id: 'text', label: 'Text Tools' },
    { id: 'dev', label: 'Developer' },
    { id: 'everyday', label: 'Everyday' },
  ];

  const currentTool = ALL_TOOLS.find((t) => t.id === selectedToolId);

  const filteredTools = ALL_TOOLS.filter((tool) => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const q = filterQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.keywords.some((k) => k.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const handleToolClick = (id: string) => {
    soundEffects.playTap(soundEnabled);
    onSelectTool(id);
  };

  // IF A TOOL IS OPEN
  if (currentTool) {
    const isFav = favorites.includes(currentTool.id);

    return (
      <div className="space-y-4 pb-24 animate-fade-in">
        {/* Tool Header Navigation */}
        <div className="flex items-center justify-between frosted-card rounded-2xl p-3 shadow-md">
          <button
            onClick={() => onSelectTool(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/80 border border-white/60 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-slate-100 transition-colors backdrop-blur-md"
          >
            <ArrowLeft size={16} /> All Tools
          </button>

          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <IconHelper name={currentTool.icon} size={18} className="text-indigo-600 dark:text-indigo-400" />
              {currentTool.name}
            </h2>
          </div>

          <button
            onClick={() => onToggleFavorite(currentTool.id)}
            className="p-2 rounded-xl text-amber-400 hover:scale-110 transition-transform"
            title="Toggle favorite"
          >
            <Star size={18} className={isFav ? 'fill-amber-400' : ''} />
          </button>
        </div>

        {/* Dynamic Tool Renderer */}
        {currentTool.category === 'converters' && (
          <Converters toolId={currentTool.id} precision={precision} soundEnabled={soundEnabled} />
        )}
        {currentTool.category === 'calculators' && (
          <Calculators toolId={currentTool.id} precision={precision} soundEnabled={soundEnabled} />
        )}
        {currentTool.category === 'time' && (
          <TimeTools toolId={currentTool.id} soundEnabled={soundEnabled} />
        )}
        {currentTool.category === 'files' && (
          <FileTools toolId={currentTool.id} soundEnabled={soundEnabled} />
        )}
        {currentTool.category === 'text' && (
          <TextTools toolId={currentTool.id} soundEnabled={soundEnabled} />
        )}
        {currentTool.category === 'dev' && (
          <DevTools toolId={currentTool.id} soundEnabled={soundEnabled} />
        )}
        {currentTool.category === 'everyday' && (
          <EverydayTools toolId={currentTool.id} soundEnabled={soundEnabled} />
        )}
      </div>
    );
  }

  // LIST OF TOOLS VIEW
  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* Search & Filter Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search 35+ tools..."
            className="w-full pl-9 pr-4 py-2.5 frosted-subcard rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
        </div>
      </div>

      {/* Category Chips Scrollbar */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                soundEffects.playTap(soundEnabled);
                setActiveCategory(cat.id);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-102'
                  : 'frosted-subcard text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/80'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filteredTools.map((tool: ToolItem) => {
          const isFav = favorites.includes(tool.id);
          return (
            <div
              key={tool.id}
              role="button"
              tabIndex={0}
              onClick={() => handleToolClick(tool.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleToolClick(tool.id);
                }
              }}
              className="frosted-card p-3.5 rounded-2xl shadow-xs hover:shadow-lg hover:border-indigo-400/50 transition-all text-left group flex flex-col justify-between min-h-[100px] cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform backdrop-blur-xs">
                  <IconHelper name={tool.icon} size={20} />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(tool.id);
                  }}
                  className="text-slate-300 dark:text-slate-600 hover:text-amber-400 p-1"
                >
                  <Star size={16} className={isFav ? 'fill-amber-400 text-amber-400' : ''} />
                </button>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mt-2">
                  {tool.name}
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
                  {tool.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTools.length === 0 && (
        <div className="py-12 text-center text-slate-500 dark:text-slate-400 frosted-card rounded-3xl p-6">
          <Filter size={32} className="mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-semibold">No tools found for &quot;{filterQuery}&quot;</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try switching category or clearing your search term</p>
        </div>
      )}
    </div>
  );
};
