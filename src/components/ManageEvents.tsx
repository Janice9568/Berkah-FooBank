import { DistributionEvent } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Calendar, MapPin, Users, Loader2, X, LayoutDashboard, ListFilter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import BeneficiaryList from './BeneficiaryList';

interface ManageEventsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ManageEvents({ isOpen, onClose }: ManageEventsProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [events, setEvents] = useState<DistributionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<DistributionEvent | null>(null);

  useEffect(() => {
    if (!user || !isOpen) return;

    const q = query(collection(db, 'events'), where('organizerId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DistributionEvent[];
      setEvents(docs);
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
        className="bg-[#F4F9F4] rounded-[2rem] w-full max-w-2xl h-[70vh] flex flex-col overflow-hidden shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-200/50 transition-colors z-10"
        >
          <X className="w-5 h-5 text-stone-400" />
        </button>

        <div className="p-8 bg-white border-b border-stone-200">
          <h2 className="text-2xl font-serif font-bold text-[#2D6A4F] flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6" />
            {t('manageEvents')}
          </h2>
        </div>

        <div className="flex-grow overflow-y-auto p-6 sm:p-8">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#2D6A4F]" /></div>
          ) : events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 flex items-center justify-between"
                >
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-stone-800 mb-2">{event.title}</h3>
                    <div className="flex gap-4 text-xs text-stone-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(event.date), 'dd MMM yyyy')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {event.currentCount} / {event.quota}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2D6A4F] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#1B4332] transition-colors shadow-md shadow-[#2D6A4F]/10"
                  >
                    <ListFilter className="w-4 h-4" />
                    Manage
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-stone-400 italic">
              You haven't created any events yet.
            </div>
          )}
        </div>
      </motion.div>

      {selectedEvent && (
        <BeneficiaryList
          event={selectedEvent}
          isOpen={true}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
