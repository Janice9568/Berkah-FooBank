import { DistributionEvent, Registration } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { db } from '../services/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { X, CheckCircle, Clock, User, Phone, Search, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface BeneficiaryListProps {
  event: DistributionEvent;
  isOpen: boolean;
  onClose: () => void;
}

export default function BeneficiaryList({ event, isOpen, onClose }: BeneficiaryListProps) {
  const { t } = useLanguage();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const regRef = collection(db, `events/${event.id}/registrations`);
    const q = query(regRef, orderBy('rank', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Registration[];
      setRegistrations(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [event.id, isOpen]);

  const handleCheckIn = async (regId: string, currentStatus: boolean) => {
    try {
      const regDoc = doc(db, `events/${event.id}/registrations`, regId);
      await updateDoc(regDoc, { attended: !currentStatus });
    } catch (error) {
      console.error("Check-in error:", error);
    }
  };

  const filtered = registrations.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.ic.includes(search) || 
    r.phone.includes(search)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[2rem] w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 transition-colors z-10"
        >
          <X className="w-5 h-5 text-stone-400" />
        </button>

        <div className="p-8 border-b border-stone-100">
          <h2 className="text-2xl font-serif font-bold text-[#2D6A4F] mb-1">{t('beneficiaries')}</h2>
          <p className="text-sm text-stone-500 mb-6">{event.title}</p>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
            <input
              type="text"
              placeholder="Search by name, IC, or phone..."
              className="w-full pl-12 pr-4 py-3 bg-[#F4F9F4] border-none rounded-2xl focus:ring-2 focus:ring-[#2D6A4F]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-4 sm:p-8">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#2D6A4F]" /></div>
          ) : (
            <div className="space-y-3">
              {filtered.map((reg) => (
                <div 
                  key={reg.id}
                  className={cn(
                    "p-4 rounded-2xl border flex items-center justify-between transition-all",
                    reg.attended ? "border-emerald-100 bg-emerald-50/30" : "border-stone-100 bg-white"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-400 text-xs">
                      #{reg.rank + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-800">{reg.name}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        <span className="text-[10px] uppercase font-bold text-stone-400 flex items-center gap-1">
                          IC: {reg.ic}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {reg.estimatedTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCheckIn(reg.id, reg.attended)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                      reg.attended 
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" 
                        : "bg-stone-50 text-stone-400 hover:bg-stone-100"
                    )}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {reg.attended ? t('attended') : t('checkIn')}
                  </button>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="text-center py-10 text-stone-400 italic">No registrations found.</p>
              )}
            </div>
          )}
        </div>

        <div className="p-6 bg-stone-50 border-t border-stone-100 text-center">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
              Total: {registrations.filter(r => r.attended).length} / {registrations.length} Checked-in
            </span>
        </div>
      </motion.div>
    </div>
  );
}
