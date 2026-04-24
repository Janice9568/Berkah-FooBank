import { DistributionEvent, Registration } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError } from '../services/firebase';
import { doc, collection, addDoc, runTransaction, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { X, User, Phone, CreditCard, Loader2, CheckCircle2, Clock } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatEstimatedTime } from '../lib/utils';

interface RegistrationModalProps {
  event: DistributionEvent;
  isOpen: boolean;
  onClose: () => void;
}

export default function RegistrationModal({ event, isOpen, onClose }: RegistrationModalProps) {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<Registration | null>(null);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    ic: profile?.ic || '',
  });

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.name || prev.name,
        phone: profile.phone || prev.phone,
        ic: profile.ic || prev.ic,
      }));
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      console.log("Starting registration transaction for event:", event.id);
      const result = await runTransaction(db, async (transaction) => {
        const eventRef = doc(db, 'events', event.id);
        const eventSnap = await transaction.get(eventRef);

        if (!eventSnap.exists()) throw new Error("Event does not exist!");
        console.log("Event snapshot fetched, current count:", eventSnap.data()?.currentCount);
        const eventData = eventSnap.data() as DistributionEvent;

        if (eventData.currentCount >= eventData.quota) {
          throw new Error("Quota full!");
        }

        const newCount = eventData.currentCount + 1;
        const rank = eventData.currentCount; // 0-indexed rank
        const estimatedTime = formatEstimatedTime(eventData.startTime, rank);

        const registrationRef = doc(collection(db, `events/${event.id}/registrations`));
        const registrationData = {
          eventId: event.id,
          userId: user.uid,
          name: formData.name,
          phone: formData.phone,
          ic: formData.ic,
          rank: rank,
          estimatedTime: estimatedTime,
          attended: false,
          createdAt: serverTimestamp(),
        };

        transaction.set(registrationRef, registrationData);
        transaction.update(eventRef, { currentCount: newCount });

        return { id: registrationRef.id, ...registrationData } as Registration;
      });

      setSuccess(result);
    } catch (error: any) {
      console.error("Registration error:", error);
      let message = "Registration failed. Please try again.";
      if (error.message === "Quota full!") message = t('full');
      if (error.code === 'permission-denied') message = "Permission denied. Please ensure you are logged in correctly.";
      
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden relative shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 transition-colors z-10"
        >
          <X className="w-5 h-5 text-stone-400" />
        </button>

        <div className="p-8">
          {!success ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-serif font-bold text-[#2D6A4F] mb-2">{t('registrationForm')}</h2>
                <p className="text-sm text-stone-500">{event.title}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 ml-1">
                    {t('fullName')}
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                    <input
                      required
                      type="text"
                      className="w-full pl-12 pr-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2D6A4F]"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 ml-1">
                    {t('phoneNumber')}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                    <input
                      required
                      type="tel"
                      className="w-full pl-12 pr-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2D6A4F]"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 ml-1">
                    {t('icNumber')}
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                    <input
                      required
                      type="text"
                      placeholder="e.g. 900101-14-1234"
                      className="w-full pl-12 pr-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2D6A4F]"
                      value={formData.ic}
                      onChange={(e) => setFormData(prev => ({ ...prev, ic: e.target.value }))}
                    />
                  </div>
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full py-4 bg-[#2D6A4F] text-white rounded-2xl font-bold hover:bg-[#1B4332] transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('submit')}
                </button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">Registration Successful!</h2>
              <p className="text-stone-500 mb-8">You are successfully registered for {event.title}.</p>

              <div className="bg-[#2D6A4F]/5 rounded-3xl p-6 mb-8">
                <p className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F] mb-2">{t('estimatedTime')}</p>
                <div className="flex items-center justify-center gap-2 text-4xl font-serif font-bold text-[#2D6A4F]">
                  <Clock className="w-8 h-8" />
                  {success.estimatedTime}
                </div>
              </div>

              <p className="text-sm text-stone-400 italic px-6">{t('queueNote')}</p>
              
              <button
                onClick={onClose}
                className="mt-8 w-full py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200 transition-all underline decoration-stone-300"
              >
                Close
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
