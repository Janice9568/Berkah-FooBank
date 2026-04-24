import { useLanguage } from '../contexts/LanguageContext';
import { TRANSLATIONS } from '../constants';
import { Filter, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface EventFiltersProps {
  onFilterChange: (filters: { state: string, district: string, taman: string }) => void;
}

export default function EventFilters({ onFilterChange }: EventFiltersProps) {
  const { t, language } = useLanguage();
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [taman, setTaman] = useState('');

  const handleUpdate = (updates: any) => {
    const newFilters = { state, district, taman, ...updates };
    onFilterChange(newFilters);
  };

  const states = TRANSLATIONS[language].malaysiaStates;

  return (
    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-white/50 shadow-sm flex flex-wrap gap-4 items-center justify-center">
      <div className="flex items-center gap-2 text-stone-500 mr-2">
        <Filter className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">{t('filterState')}</span>
      </div>

      <select
        value={state}
        onChange={(e) => {
          setState(e.target.value);
          handleUpdate({ state: e.target.value });
        }}
        className="bg-white border-none rounded-xl text-sm px-4 py-2 focus:ring-2 focus:ring-[#5A5A40] shadow-sm appearance-none cursor-pointer pr-10"
      >
        <option value="">{t('filterState')}</option>
        {states.map((s: string) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          placeholder={t('filterTaman')}
          value={taman}
          onChange={(e) => {
            setTaman(e.target.value);
            handleUpdate({ taman: e.target.value });
          }}
          className="w-full bg-white border-none rounded-xl text-sm px-4 py-2 focus:ring-2 focus:ring-[#5A5A40] shadow-sm"
        />
      </div>
    </div>
  );
}
