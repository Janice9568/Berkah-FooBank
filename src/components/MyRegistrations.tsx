import { Registration, DistributionEvent } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { collectionGroup, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { Clock, Calendar, MapPin, CheckCircle2, Loader2, X, Ticket } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface MyRegistrationsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MyRegistrations({ isOpen, onClose }: MyRegistrationsProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<(Registration & { event?: DistributionEvent })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isOpen) return;

    // Use collectionGroup to find all registrations for this user across all event subcollections
    const q = query(collectionGroup(db, 'registrations'), where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const regData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Registration[];
      
      // Fetch event details for each registration
      const enriched = await Promise.all(regData.map(async (reg) => {
        const eventRef = doc(db, 'events', reg.eventId);
        const eventSnap = await getDoc(eventRef);
        return {
          ...reg,
          event: eventSnap.exists() ? { id: eventSnap.id, ...eventSnap.data() } as DistributionEvent : undefined
        };
      }));

      setRegistrations(enriched.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#f5f5f0] rounded-[2rem] w-full max-w-2xl h-[70vh] flex flex-col overflow-hidden shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-200/50 transition-colors z-10"
        >
          <X className="w-5 h-5 text-stone-400" />
        </button>

        <div className="p-8 bg-white border-b border-stone-200">
          <h2 className="text-2xl font-serif font-bold text-[#2D6A4F] flex items-center gap-2">
            <Ticket className="w-6 h-6" />
            {t('myRegistrations')}
          </h2>
        </div>

        <div className="flex-grow overflow-y-auto p-6 sm:p-8">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#2D6A4F]" /></div>
          ) : registrations.length > 0 ? (
            <div className="space-y-6">
              {registrations.map((reg) => (
                <motion.div 
                  key={reg.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 relative overflow-hidden"
                >
                  {reg.attended && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3" />
                      {t('attended')}
                    </div>
                  )}

                  <h3 className="text-lg font-serif font-bold text-stone-800 mb-3 pr-20">
                    {reg.event?.title || 'Unknown Event'}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <Calendar className="w-4 h-4 text-[#2D6A4F]" />
                        {reg.event ? format(new Date(reg.event.date), 'dd MMM yyyy') : 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <MapPin className="w-4 h-4 text-[#2D6A4F]" />
                        {reg.event?.taman}, {reg.event?.district}
                      </div>
                    </div>

                    <div className="bg-[#2D6A4F]/5 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">{t('estimatedTime')}</p>
                        <p className="text-xl font-bold text-[#2D6A4F] flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          {reg.estimatedTime}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Rank</p>
                        <p className="font-mono text-stone-800">#{reg.rank + 1}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-stone-400 italic">
              You haven't registered for any events yet.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
