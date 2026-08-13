import React, { useState } from 'react';
import { soundEffects } from '../../utils/audio';
import { History, Trash2 } from 'lucide-react';

interface CalculatorsProps {
  toolId: string;
  precision?: number;
  soundEnabled?: boolean;
}

export const Calculators: React.FC<CalculatorsProps> = ({
  toolId,
  precision = 2,
  soundEnabled = true,
}) => {
  // --- BASIC & SCIENTIFIC CALCULATOR STATE ---
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcHistory, setCalcHistory] = useState<string[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const handleCalcBtn = (val: string) => {
    soundEffects.playTap(soundEnabled);

    if (val === 'C') {
      setCalcDisplay('0');
      return;
    }

    if (val === '⌫') {
      setCalcDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
      return;
    }

    if (val === '=') {
      try {
        // Sanitize string for evaluation
        let expr = calcDisplay
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/π/g, 'Math.PI')
          .replace(/e/g, 'Math.E')
          .replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)')
          .replace(/√([0-9.]+)/g, 'Math.sqrt($1)')
          .replace(/sin\(([^)]+)\)/g, 'Math.sin($1 * Math.PI / 180)')
          .replace(/cos\(([^)]+)\)/g, 'Math.cos($1 * Math.PI / 180)')
          .replace(/tan\(([^)]+)\)/g, 'Math.tan($1 * Math.PI / 180)')
          .replace(/log\(([^)]+)\)/g, 'Math.log10($1)')
          .replace(/ln\(([^)]+)\)/g, 'Math.log($1)');

        // Handle percentage simple
        expr = expr.replace(/([0-9.]+)\%/g, '($1 / 100)');

        // Evaluate using safer Function constructor
        // eslint-disable-next-line no-new-func
        const res = new Function(`return ${expr}`)();

        if (isNaN(res) || !isFinite(res)) {
          setCalcDisplay('Error');
        } else {
          const formatted = Number.isInteger(res) ? res.toString() : parseFloat(res.toFixed(precision)).toString();
          setCalcHistory((prev) => [`${calcDisplay} = ${formatted}`, ...prev.slice(0, 19)]);
          setCalcDisplay(formatted);
        }
      } catch {
        setCalcDisplay('Error');
      }
      return;
    }

    setCalcDisplay((prev) => {
      if (prev === '0' || prev === 'Error') return val;
      return prev + val;
    });
  };

  // --- SPECIALIZED CALCULATORS STATES ---
  // 1. Percentage
  const [pctX, setPctX] = useState('15');
  const [pctY, setPctY] = useState('200');

  // 2. Discount
  const [price, setPrice] = useState('100');
  const [discountPct, setDiscountPct] = useState('20');

  // 3. Tip
  const [bill, setBill] = useState('50');
  const [tipPct, setTipPct] = useState('15');
  const [splitCount, setSplitCount] = useState('2');

  // 4. Tax
  const [netAmount, setNetAmount] = useState('100');
  const [taxRate, setTaxRate] = useState('10');

  // 5. Loan EMI
  const [loanAmt, setLoanAmt] = useState('10000');
  const [interestRate, setInterestRate] = useState('8.5');
  const [tenureYears, setTenureYears] = useState('3');

  // 6. BMI
  const [heightCm, setHeightCm] = useState('175');
  const [weightKg, setWeightKg] = useState('70');

  // 7. Age
  const [birthDate, setBirthDate] = useState('2000-01-01');

  // RENDER BASED ON TOOL ID
  if (toolId === 'basic_calculator' || toolId === 'scientific_calculator') {
    const isScientific = toolId === 'scientific_calculator';

    return (
      <div className="frosted-card rounded-[2rem] p-4 shadow-sm max-w-sm mx-auto">
        {/* Header & History Button */}
        <div className="flex justify-between items-center mb-2 px-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {isScientific ? 'Scientific' : 'Basic'} Calculator
          </span>
          <button
            onClick={() => setShowHistoryModal(!showHistoryModal)}
            className="p-1.5 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 flex items-center gap-1 text-xs font-semibold"
          >
            <History size={14} /> History ({calcHistory.length})
          </button>
        </div>

        {/* Display Screen */}
        <div className="frosted-subcard rounded-2xl p-4 mb-4 text-right overflow-x-auto min-h-[70px] flex flex-col justify-end">
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight break-all">
            {calcDisplay}
          </div>
        </div>

        {/* History Modal Overlay */}
        {showHistoryModal && (
          <div className="mb-4 p-3 frosted-subcard rounded-2xl text-xs">
            <div className="flex justify-between items-center mb-2 font-bold text-slate-700 dark:text-slate-300">
              <span>Calculation History</span>
              <button
                onClick={() => setCalcHistory([])}
                className="text-red-500 hover:underline flex items-center gap-1"
              >
                <Trash2 size={12} /> Clear
              </button>
            </div>
            {calcHistory.length === 0 ? (
              <p className="text-slate-400 text-center py-2">No history yet</p>
            ) : (
              <div className="max-h-32 overflow-y-auto space-y-1">
                {calcHistory.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const res = item.split('=')[1]?.trim();
                      if (res) setCalcDisplay(res);
                      setShowHistoryModal(false);
                    }}
                    className="w-full text-right p-1 rounded-sm hover:bg-white/40 dark:hover:bg-slate-700/50 text-slate-800 dark:text-slate-200 font-mono"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2 text-sm">
          {/* Scientific Row 1 */}
          {isScientific && (
            <>
              {['sin(', 'cos(', 'tan(', 'log('].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcBtn(btn)}
                  className="py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold hover:bg-purple-100 dark:hover:bg-purple-900 transition-all active:scale-95"
                >
                  {btn.replace('(', '')}
                </button>
              ))}
              {['ln(', '√(', 'π', '^'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcBtn(btn === '^' ? '**' : btn)}
                  className="py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold hover:bg-purple-100 dark:hover:bg-purple-900 transition-all active:scale-95"
                >
                  {btn.replace('(', '')}
                </button>
              ))}
            </>
          )}

          {/* Standard Row 1 */}
          <button
            onClick={() => handleCalcBtn('C')}
            className="py-3.5 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-bold hover:bg-red-200 transition-all active:scale-95"
          >
            C
          </button>
          <button
            onClick={() => handleCalcBtn('(')}
            className="py-3.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-300 transition-all active:scale-95"
          >
            (
          </button>
          <button
            onClick={() => handleCalcBtn(')')}
            className="py-3.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-300 transition-all active:scale-95"
          >
            )
          </button>
          <button
            onClick={() => handleCalcBtn('÷')}
            className="py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all active:scale-95"
          >
            ÷
          </button>

          {/* Row 2 */}
          {['7', '8', '9'].map((n) => (
            <button
              key={n}
              onClick={() => handleCalcBtn(n)}
              className="py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => handleCalcBtn('×')}
            className="py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all active:scale-95"
          >
            ×
          </button>

          {/* Row 3 */}
          {['4', '5', '6'].map((n) => (
            <button
              key={n}
              onClick={() => handleCalcBtn(n)}
              className="py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => handleCalcBtn('-')}
            className="py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all active:scale-95"
          >
            -
          </button>

          {/* Row 4 */}
          {['1', '2', '3'].map((n) => (
            <button
              key={n}
              onClick={() => handleCalcBtn(n)}
              className="py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => handleCalcBtn('+')}
            className="py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all active:scale-95"
          >
            +
          </button>

          {/* Row 5 */}
          <button
            onClick={() => handleCalcBtn('0')}
            className="py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
          >
            0
          </button>
          <button
            onClick={() => handleCalcBtn('.')}
            className="py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
          >
            .
          </button>
          <button
            onClick={() => handleCalcBtn('⌫')}
            className="py-3.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-200 transition-all active:scale-95"
          >
            ⌫
          </button>
          <button
            onClick={() => handleCalcBtn('=')}
            className="py-3.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-md"
          >
            =
          </button>
        </div>
      </div>
    );
  }

  // --- PERCENTAGE CALCULATOR ---
  if (toolId === 'percentage_calculator') {
    const x = parseFloat(pctX) || 0;
    const y = parseFloat(pctY) || 0;
    const resultVal = (x / 100) * y;

    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white">What is X% of Y?</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">X (Percentage %)</label>
            <input
              type="number"
              value={pctX}
              onChange={(e) => setPctX(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Y (Total Number)</label>
            <input
              type="number"
              value={pctY}
              onChange={(e) => setPctY(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
            />
          </div>
        </div>

        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl border border-indigo-100 dark:border-indigo-900 text-center">
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">Result</span>
          <div className="text-3xl font-black text-indigo-700 dark:text-indigo-300 mt-1">
            {resultVal.toFixed(precision)}
          </div>
        </div>
      </div>
    );
  }

  // --- DISCOUNT CALCULATOR ---
  if (toolId === 'discount_calculator') {
    const origPrice = parseFloat(price) || 0;
    const disc = parseFloat(discountPct) || 0;
    const saved = (origPrice * disc) / 100;
    const finalPrice = origPrice - saved;

    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white">Discount Calculator</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Original Price ($)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Discount (%)</label>
            <input
              type="number"
              value={discountPct}
              onChange={(e) => setDiscountPct(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-100 dark:border-emerald-900 text-center">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Final Price</span>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
              ${finalPrice.toFixed(precision)}
            </div>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl border border-indigo-100 dark:border-indigo-900 text-center">
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase">You Save</span>
            <div className="text-2xl font-black text-indigo-700 dark:text-indigo-300 mt-0.5">
              ${saved.toFixed(precision)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TIP & SPLIT CALCULATOR ---
  if (toolId === 'tip_calculator') {
    const billAmt = parseFloat(bill) || 0;
    const tipPercentage = parseFloat(tipPct) || 0;
    const people = Math.max(1, parseInt(splitCount) || 1);

    const tipTotal = (billAmt * tipPercentage) / 100;
    const grandTotal = billAmt + tipTotal;
    const perPerson = grandTotal / people;

    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white">Tip & Bill Split</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Bill Amount ($)</label>
            <input
              type="number"
              value={bill}
              onChange={(e) => setBill(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tip (%)</label>
              <input
                type="number"
                value={tipPct}
                onChange={(e) => setTipPct(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Split People</label>
              <input
                type="number"
                value={splitCount}
                onChange={(e) => setSplitCount(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-950/60 rounded-2xl border border-purple-100 dark:border-purple-900 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600 dark:text-slate-300">Tip Amount:</span>
            <span className="font-bold text-purple-700 dark:text-purple-300">${tipTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600 dark:text-slate-300">Total Bill:</span>
            <span className="font-bold text-purple-700 dark:text-purple-300">${grandTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-base pt-2 border-t border-purple-200 dark:border-purple-800">
            <span className="font-bold text-slate-900 dark:text-white">Per Person:</span>
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">${perPerson.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  }

  // --- TAX / VAT CALCULATOR ---
  if (toolId === 'tax_calculator') {
    const net = parseFloat(netAmount) || 0;
    const rate = parseFloat(taxRate) || 0;
    const taxAmt = (net * rate) / 100;
    const gross = net + taxAmt;

    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white">Tax / VAT Calculator</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Net Price ($)</label>
            <input
              type="number"
              value={netAmount}
              onChange={(e) => setNetAmount(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tax Rate (%)</label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
            />
          </div>
        </div>

        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl border border-indigo-100 dark:border-indigo-900 space-y-1 text-center">
          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase">Gross Price (With Tax)</div>
          <div className="text-3xl font-black text-indigo-700 dark:text-indigo-300">${gross.toFixed(2)}</div>
          <div className="text-xs text-slate-500 mt-1">Tax Included: ${taxAmt.toFixed(2)}</div>
        </div>
      </div>
    );
  }

  // --- LOAN EMI CALCULATOR ---
  if (toolId === 'loan_calculator') {
    const P = parseFloat(loanAmt) || 0;
    const R = (parseFloat(interestRate) || 0) / 12 / 100;
    const N = (parseFloat(tenureYears) || 0) * 12;

    let emi = 0;
    if (P > 0 && N > 0) {
      if (R === 0) {
        emi = P / N;
      } else {
        emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
      }
    }
    const totalPayment = emi * N;
    const totalInterest = totalPayment - P;

    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white">Loan / EMI Calculator</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loan Amount ($)</label>
            <input
              type="number"
              value={loanAmt}
              onChange={(e) => setLoanAmt(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Interest Rate (% p.a.)</label>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tenure (Years)</label>
              <input
                type="number"
                value={tenureYears}
                onChange={(e) => setTenureYears(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-100 dark:border-emerald-900 space-y-2">
          <div className="text-center">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Monthly EMI</span>
            <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300 mt-1">${emi.toFixed(2)}</div>
          </div>
          <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 text-xs flex justify-between">
            <span>Total Interest: <strong className="text-emerald-700 dark:text-emerald-300">${totalInterest.toFixed(2)}</strong></span>
            <span>Total Payable: <strong className="text-emerald-700 dark:text-emerald-300">${totalPayment.toFixed(2)}</strong></span>
          </div>
        </div>
      </div>
    );
  }

  // --- BMI CALCULATOR ---
  if (toolId === 'bmi_calculator') {
    const hM = (parseFloat(heightCm) || 0) / 100;
    const wKg = parseFloat(weightKg) || 0;
    const bmi = hM > 0 ? wKg / (hM * hM) : 0;

    let category = 'Normal';
    let colorClass = 'text-emerald-600 dark:text-emerald-400';
    if (bmi < 18.5) {
      category = 'Underweight';
      colorClass = 'text-blue-600 dark:text-blue-400';
    } else if (bmi >= 25 && bmi < 29.9) {
      category = 'Overweight';
      colorClass = 'text-amber-600 dark:text-amber-400';
    } else if (bmi >= 30) {
      category = 'Obese';
      colorClass = 'text-red-600 dark:text-red-400';
    }

    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white">BMI Calculator</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Height (cm)</label>
            <input
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Weight (kg)</label>
            <input
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
            />
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Your Body Mass Index</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{bmi.toFixed(1)}</div>
          <div className={`text-sm font-bold ${colorClass}`}>{category}</div>
        </div>
      </div>
    );
  }

  // --- AGE CALCULATOR ---
  if (toolId === 'age_calculator') {
    const calculateAge = () => {
      const birth = new Date(birthDate);
      const now = new Date();
      if (isNaN(birth.getTime())) return { years: 0, months: 0, days: 0 };

      let years = now.getFullYear() - birth.getFullYear();
      let months = now.getMonth() - birth.getMonth();
      let days = now.getDate() - birth.getDate();

      if (days < 0) {
        months -= 1;
        days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }

      return { years, months, days };
    };

    const age = calculateAge();

    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white">Age Calculator</h3>
        <div>
          <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Select Birthdate</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-2">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl border border-indigo-100 dark:border-indigo-900">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{age.years}</span>
            <div className="text-xs font-semibold text-slate-500">Years</div>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl border border-indigo-100 dark:border-indigo-900">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{age.months}</span>
            <div className="text-xs font-semibold text-slate-500">Months</div>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl border border-indigo-100 dark:border-indigo-900">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{age.days}</span>
            <div className="text-xs font-semibold text-slate-500">Days</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
