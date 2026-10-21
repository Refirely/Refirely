import React, { useState, useEffect } from 'react';
import { CountryCurrencyMacro, formatLocalCurrency } from '../data/userAccounts';

interface CurrencyAmountInputProps {
  usdValue: number;
  onChangeUsd: (newUsdValue: number) => void;
  currencyMode: 'USD' | 'LOCAL';
  countryMacro: CountryCurrencyMacro;
  stepUsd?: number;
  min?: number;
  className?: string;
  inputSize?: 'sm' | 'md';
  helperSuffix?: string;
}

export const CurrencyAmountInput: React.FC<CurrencyAmountInputProps> = ({
  usdValue,
  onChangeUsd,
  currencyMode,
  countryMacro,
  min = 0,
  className = '',
  inputSize = 'md',
  helperSuffix,
}) => {
  const isLocalActive = currencyMode === 'LOCAL' && countryMacro.currencyCode !== 'USD';
  const rate = countryMacro.rateToUSD > 0 ? countryMacro.rateToUSD : 1;

  // Compute displayed value from canonical USD
  const computeDisplayNumber = (usd: number, localMode: boolean, r: number) => {
    const safeUsd = Number.isFinite(usd) ? usd : 0;
    if (localMode) {
      return Math.round(safeUsd * r);
    }
    return Math.round(safeUsd);
  };

  const [isFocused, setIsFocused] = useState(false);
  const [draftValue, setDraftValue] = useState<string>(() =>
    String(computeDisplayNumber(usdValue, isLocalActive, rate))
  );

  // Sync draft value whenever not focused or when currencyMode / rate / external usdValue changes
  useEffect(() => {
    if (!isFocused) {
      const nextComputed = computeDisplayNumber(usdValue, isLocalActive, rate);
      const currentNumeric = parseFloat(draftValue);
      // Avoid overwriting the user's exact typed local integer due to tiny USD rounding differences
      if (
        Number.isNaN(currentNumeric) ||
        Math.abs(nextComputed - currentNumeric) > Math.max(1, Math.ceil(rate * 0.5))
      ) {
        setDraftValue(String(nextComputed));
      }
    }
  }, [usdValue, isLocalActive, rate, isFocused]);

  // Also force resync when user switches currency mode (LOCAL <-> USD) or country rate
  useEffect(() => {
    setDraftValue(String(computeDisplayNumber(usdValue, isLocalActive, rate)));
  }, [isLocalActive, rate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDraftValue(raw);
    if (raw.trim() === '') {
      onChangeUsd(0);
      return;
    }
    const parsed = parseFloat(raw);
    if (Number.isNaN(parsed)) {
      onChangeUsd(0);
      return;
    }
    if (isLocalActive) {
      // Keep 2 decimal precision in USD so multiplying back by rate gives the exact local integer
      const exactUsd = Math.round((parsed / rate) * 100) / 100;
      onChangeUsd(exactUsd);
    } else {
      onChangeUsd(Math.round(parsed));
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (draftValue.trim() === '' || Number.isNaN(parseFloat(draftValue))) {
      setDraftValue('0');
      onChangeUsd(0);
    } else {
      // Keep clean integer string on blur
      const cleanNum = Math.round(parseFloat(draftValue));
      setDraftValue(String(cleanNum));
    }
  };

  const prefixSymbol = isLocalActive ? countryMacro.symbol.trim() : '$';
  const badgeCode = isLocalActive ? countryMacro.currencyCode : 'USD';
  const displayUsdWhole = Math.round(usdValue || 0);

  return (
    <div className={className}>
      <div className="relative">
        <span
          className={`absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono font-semibold select-none ${
            inputSize === 'sm' ? 'text-xs' : 'text-sm'
          }`}
        >
          {prefixSymbol}
        </span>
        <input
          type="number"
          min={min}
          step="any"
          value={draftValue}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onChange={handleChange}
          className={`w-full rounded-lg border border-slate-300 bg-white font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${
            prefixSymbol.length > 2 ? 'pl-11' : prefixSymbol.length > 1 ? 'pl-9' : 'pl-7'
          } pr-14 ${inputSize === 'sm' ? 'py-1.5 text-xs' : 'py-2 text-sm'}`}
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono font-bold text-slate-600 select-none">
          {badgeCode}
        </span>
      </div>

      {/* Live Dual-Currency Conversion Caption */}
      {countryMacro.currencyCode !== 'USD' && (
        <div className="flex flex-wrap items-center justify-between gap-1 mt-1 text-[11px] font-mono">
          {isLocalActive ? (
            <>
              <span className="text-orange-900 font-semibold">
                {formatLocalCurrency(usdValue || 0, countryMacro, true)}
                {helperSuffix ? ` ${helperSuffix}` : ''}
              </span>
              <span className="text-slate-500">
                ≈ ${displayUsdWhole.toLocaleString()} USD
                {helperSuffix ? ` ${helperSuffix}` : ''}
              </span>
            </>
          ) : (
            <>
              <span className="text-teal-800 font-semibold">
                ≈ {formatLocalCurrency(usdValue || 0, countryMacro, true)} ({countryMacro.currencyCode})
                {helperSuffix ? ` ${helperSuffix}` : ''}
              </span>
              <span className="text-slate-500">
                ${displayUsdWhole.toLocaleString()} USD
                {helperSuffix ? ` ${helperSuffix}` : ''}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
