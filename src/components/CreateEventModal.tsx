import { DistributionEvent } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { X, Calendar, Clock, MapPin, Tag, Users, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TRANSLATIONS } from '../constants';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateEventModal({ isOpen, onClose }: CreateEventModalProps) {
  const { t, language } = useLanguage();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    state: '',
    district: '',
    taman: '',
    quota: 50,
  });

  const states = TRANSLATIONS[language].malaysiaStates;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || profile?.role !== 'organizer') return;
    setLoading(true);

    try {
      await addDoc(collection(db, 'events'), {
        ...formData,
        quota: Number(formData.quota),
        currentCount: 0,
        organizerName: profile.name,
        organizerId: user.uid,
        organizerContact: profile.phone || '',
        status: 'upcoming',
        createdAt: serverTimestamp(),
      });
      onClose();
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event. Please check your permissions.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden relative shadow-2xl my-8"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 transition-colors z-10"
        >
          <X className="w-5 h-5 text-stone-400" />
        </button>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-[#2D6A4F] mb-2">{t('createEvent')}</h2>
            <p className="text-sm text-stone-500">Provide details for the distribution activity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 ml-1">{t('title')}</label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2D6A4F]"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 ml-1">{t('description')}</label>
              <textarea
                className="w-full px-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2D6A4F] h-24"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 ml-1">{t('date')}</label>
              <input
                required
                type="date"
                className="w-full px-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2D6A4F]"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 ml-1">{t('startTime')}</label>
              <input
                required
                type="time"
                className="w-full px-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2D6A4F]"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 ml-1">{t('filterState')}</label>
              <select
                required
                className="w-full px-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2D6A4F]"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
              >
                <option value="">Select State</option>
                {states.map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 ml-1">{t('filterDistrict') || "District"}</label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2D6A4F]"
                value={formData.district}
                onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                placeholder="e.g. Petaling Jaya"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 ml-1">{t('filterTaman')}</label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2D6A4F]"
                value={formData.taman}
                onChange={(e) => setFormData(prev => ({ ...prev, taman: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 ml-1">{t('totalQuota')}</label>
              <input
                required
                type="number"
                min="1"
                className="w-full px-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2D6A4F]"
                value={formData.quota}
                onChange={(e) => setFormData(prev => ({ ...prev, quota: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="mt-10 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200 transition-all"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              type="submit"
              className="flex-[2] py-4 bg-[#2D6A4F] text-white rounded-2xl font-bold hover:bg-[#1B4332] transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('submit')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
