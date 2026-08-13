import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Copy, Check, RotateCcw } from 'lucide-react';
import { soundEffects } from '../../utils/audio';

interface UnitDefinition {
  id: string;
  name: string;
  ratioToBase: number; // multiplier to base unit
  offsetToBase?: number; // for temperature formula (Kelvin/Fahrenheit)
}

interface ConverterCategory {
  id: string;
  title: string;
  baseUnit: string;
  units: UnitDefinition[];
}

const CONVERTER_DATA: Record<string, ConverterCategory> = {
  length_converter: {
    id: 'length_converter',
    title: 'Length Converter',
    baseUnit: 'm',
    units: [
      { id: 'km', name: 'Kilometer (km)', ratioToBase: 1000 },
      { id: 'm', name: 'Meter (m)', ratioToBase: 1 },
      { id: 'cm', name: 'Centimeter (cm)', ratioToBase: 0.01 },
      { id: 'mm', name: 'Millimeter (mm)', ratioToBase: 0.001 },
      { id: 'mi', name: 'Mile (mi)', ratioToBase: 1609.344 },
      { id: 'yd', name: 'Yard (yd)', ratioToBase: 0.9144 },
      { id: 'ft', name: 'Foot (ft)', ratioToBase: 0.3048 },
      { id: 'in', name: 'Inch (in)', ratioToBase: 0.0254 },
    ],
  },
  weight_converter: {
    id: 'weight_converter',
    title: 'Weight / Mass Converter',
    baseUnit: 'kg',
    units: [
      { id: 'kg', name: 'Kilogram (kg)', ratioToBase: 1 },
      { id: 'g', name: 'Gram (g)', ratioToBase: 0.001 },
      { id: 'mg', name: 'Milligram (mg)', ratioToBase: 0.000001 },
      { id: 'lb', name: 'Pound (lb)', ratioToBase: 0.45359237 },
      { id: 'oz', name: 'Ounce (oz)', ratioToBase: 0.028349523125 },
      { id: 'ton', name: 'Metric Ton (t)', ratioToBase: 1000 },
    ],
  },
  temperature_converter: {
    id: 'temperature_converter',
    title: 'Temperature Converter',
    baseUnit: 'c',
    units: [
      { id: 'c', name: 'Celsius (°C)', ratioToBase: 1 },
      { id: 'f', name: 'Fahrenheit (°F)', ratioToBase: 1 },
      { id: 'k', name: 'Kelvin (K)', ratioToBase: 1 },
    ],
  },
  area_converter: {
    id: 'area_converter',
    title: 'Area Converter',
    baseUnit: 'sqm',
    units: [
      { id: 'sqm', name: 'Square Meter (m²)', ratioToBase: 1 },
      { id: 'sqkm', name: 'Square Km (km²)', ratioToBase: 1000000 },
      { id: 'sqft', name: 'Square Feet (ft²)', ratioToBase: 0.092903 },
      { id: 'acre', name: 'Acre (ac)', ratioToBase: 4046.86 },
      { id: 'hectare', name: 'Hectare (ha)', ratioToBase: 10000 },
    ],
  },
  volume_converter: {
    id: 'volume_converter',
    title: 'Volume Converter',
    baseUnit: 'l',
    units: [
      { id: 'l', name: 'Liter (L)', ratioToBase: 1 },
      { id: 'ml', name: 'Milliliter (mL)', ratioToBase: 0.001 },
      { id: 'gal', name: 'US Gallon (gal)', ratioToBase: 3.78541 },
      { id: 'cup', name: 'US Cup', ratioToBase: 0.24 },
      { id: 'floz', name: 'Fluid Ounce (fl oz)', ratioToBase: 0.0295735 },
      { id: 'm3', name: 'Cubic Meter (m³)', ratioToBase: 1000 },
    ],
  },
  speed_converter: {
    id: 'speed_converter',
    title: 'Speed Converter',
    baseUnit: 'ms',
    units: [
      { id: 'kmh', name: 'Km / hour (km/h)', ratioToBase: 0.277778 },
      { id: 'mph', name: 'Miles / hour (mph)', ratioToBase: 0.44704 },
      { id: 'ms', name: 'Meters / second (m/s)', ratioToBase: 1 },
      { id: 'knot', name: 'Knot (kn)', ratioToBase: 0.514444 },
    ],
  },
  time_converter: {
    id: 'time_converter',
    title: 'Time Converter',
    baseUnit: 's',
    units: [
      { id: 's', name: 'Second (s)', ratioToBase: 1 },
      { id: 'min', name: 'Minute (min)', ratioToBase: 60 },
      { id: 'hr', name: 'Hour (h)', ratioToBase: 3600 },
      { id: 'day', name: 'Day', ratioToBase: 86400 },
      { id: 'week', name: 'Week', ratioToBase: 604800 },
      { id: 'yr', name: 'Year (365 days)', ratioToBase: 31536000 },
    ],
  },
  data_converter: {
    id: 'data_converter',
    title: 'Data Storage Converter',
    baseUnit: 'b',
    units: [
      { id: 'b', name: 'Bytes (B)', ratioToBase: 1 },
      { id: 'kb', name: 'Kilobytes (KB)', ratioToBase: 1024 },
      { id: 'mb', name: 'Megabytes (MB)', ratioToBase: 1024 * 1024 },
      { id: 'gb', name: 'Gigabytes (GB)', ratioToBase: 1024 * 1024 * 1024 },
      { id: 'tb', name: 'Terabytes (TB)', ratioToBase: 1024 * 1024 * 1024 * 1024 },
    ],
  },
  pressure_converter: {
    id: 'pressure_converter',
    title: 'Pressure Converter',
    baseUnit: 'pa',
    units: [
      { id: 'pa', name: 'Pascal (Pa)', ratioToBase: 1 },
      { id: 'kpa', name: 'Kilopascal (kPa)', ratioToBase: 1000 },
      { id: 'bar', name: 'Bar', ratioToBase: 100000 },
      { id: 'psi', name: 'PSI (lb/in²)', ratioToBase: 6894.76 },
      { id: 'atm', name: 'Atmosphere (atm)', ratioToBase: 101325 },
    ],
  },
  energy_converter: {
    id: 'energy_converter',
    title: 'Energy Converter',
    baseUnit: 'j',
    units: [
      { id: 'j', name: 'Joule (J)', ratioToBase: 1 },
      { id: 'kj', name: 'Kilojoule (kJ)', ratioToBase: 1000 },
      { id: 'cal', name: 'Calorie (cal)', ratioToBase: 4.184 },
      { id: 'kcal', name: 'Kilocalorie (kcal)', ratioToBase: 4184 },
      { id: 'kwh', name: 'Kilowatt-hour (kWh)', ratioToBase: 3600000 },
    ],
  },
};

interface ConvertersProps {
  toolId: string;
  precision?: number;
  soundEnabled?: boolean;
}

export const Converters: React.FC<ConvertersProps> = ({
  toolId,
  precision = 2,
  soundEnabled = true,
}) => {
  const config = CONVERTER_DATA[toolId] || CONVERTER_DATA.length_converter;

  const [fromUnit, setFromUnit] = useState(config.units[0].id);
  const [toUnit, setToUnit] = useState(config.units[1].id);
  const [inputValue, setInputValue] = useState<string>('1');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const cfg = CONVERTER_DATA[toolId] || CONVERTER_DATA.length_converter;
    setFromUnit(cfg.units[0].id);
    setToUnit(cfg.units[1] ? cfg.units[1].id : cfg.units[0].id);
    setInputValue('1');
  }, [toolId]);

  // Compute conversion
  const computeResult = (): string => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) return '';

    if (toolId === 'temperature_converter') {
      // Temperature custom formulas
      let celsius = num;
      if (fromUnit === 'f') celsius = (num - 32) * (5 / 9);
      if (fromUnit === 'k') celsius = num - 273.15;

      let result = celsius;
      if (toUnit === 'f') result = celsius * (9 / 5) + 32;
      if (toUnit === 'k') result = celsius + 273.15;

      return Number.isInteger(result) ? result.toString() : result.toFixed(precision);
    }

    const uFrom = config.units.find((u) => u.id === fromUnit);
    const uTo = config.units.find((u) => u.id === toUnit);

    if (!uFrom || !uTo) return '';

    const valueInBase = num * uFrom.ratioToBase;
    const finalVal = valueInBase / uTo.ratioToBase;

    if (Math.abs(finalVal) < 0.000001 && finalVal !== 0) {
      return finalVal.toExponential(4);
    }

    return Number.isInteger(finalVal)
      ? finalVal.toString()
      : parseFloat(finalVal.toFixed(precision)).toString();
  };

  const result = computeResult();

  const handleSwap = () => {
    soundEffects.playTap(soundEnabled);
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const handleReset = () => {
    soundEffects.playTap(soundEnabled);
    setInputValue('1');
    setFromUnit(config.units[0].id);
    setToUnit(config.units[1].id);
  };

  const handleCopy = () => {
    if (!result) return;
    soundEffects.playTap(soundEnabled);
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="frosted-card rounded-[2rem] p-5 shadow-sm space-y-4">
        {/* Source Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Input Value
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter number..."
              className="w-full px-4 py-3 frosted-subcard text-slate-900 dark:text-white rounded-2xl text-lg font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="px-3 py-3 frosted-subcard text-slate-800 dark:text-slate-100 rounded-2xl text-xs font-semibold focus:outline-hidden cursor-pointer"
            >
              {config.units.map((u) => (
                <option key={u.id} value={u.id} className="bg-white dark:bg-slate-900">
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleSwap}
            className="p-3 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-sm hover:scale-105 active:scale-95 transition-all backdrop-blur-xs"
            title="Swap source and target units"
          >
            <ArrowLeftRight size={20} />
          </button>
        </div>

        {/* Target Result */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Result Value
          </label>
          <div className="flex gap-2">
            <div className="w-full px-4 py-3 frosted-subcard text-indigo-600 dark:text-indigo-400 rounded-2xl text-2xl font-black flex items-center min-h-[52px]">
              {result !== '' ? result : '—'}
            </div>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="px-3 py-3 frosted-subcard text-slate-800 dark:text-slate-100 rounded-2xl text-xs font-semibold focus:outline-hidden cursor-pointer"
            >
              {config.units.map((u) => (
                <option key={u.id} value={u.id} className="bg-white dark:bg-slate-900">
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleCopy}
            disabled={!result}
            className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md shadow-indigo-500/20"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied Result!' : 'Copy Result'}
          </button>

          <button
            onClick={handleReset}
            className="py-3 px-4 rounded-2xl frosted-subcard text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all hover:bg-white/80 dark:hover:bg-slate-800/80 active:scale-98"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
};
