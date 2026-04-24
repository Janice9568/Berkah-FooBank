import { DistributionEvent } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Calendar, Clock, User, Phone, CheckCircle, Users, ListFilter } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { useState } from 'react';
import RegistrationModal from './RegistrationModal';
import BeneficiaryList from './BeneficiaryList';
import { cn } from '../lib/utils';

interface EventCardProps {
  event: DistributionEvent;
  isRegistered?: boolean;
}

export default function EventCard({ event, isRegistered }: EventCardProps) {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [showBeneficiaries, setShowBeneficiaries] = useState(false);

  const isFull = event.currentCount >= event.quota;
  const isExpired = event.status === 'expired' || event.status === 'completed';
  const isOrganizer = user && event.organizerId === user.uid;

  const statusColors = {
    upcoming: 'bg-emerald-100 text-emerald-700',
    ongoing: 'bg-amber-100 text-amber-700',
    completed: 'bg-stone-100 text-stone-500',
    expired: 'bg-red-100 text-red-700',
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full border border-stone-100 relative">
      {/* Background/Image Placeholder */}
      <div className="h-48 bg-stone-50 relative group overflow-hidden">
        {event.photos && event.photos.length > 0 ? (
          <img src={event.photos[0]} alt={event.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#5A5A40]/5">
            <Users className="w-12 h-12 text-[#5A5A40]/20" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider", statusColors[event.status])}>
            {t(event.status)}
          </span>
        </div>
        
        {isOrganizer && (
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setShowBeneficiaries(true)}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-[#5A5A40] hover:bg-white transition-colors"
              title={t('beneficiaries')}
            >
              <ListFilter className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">{event.title}</h3>
        <p className="text-sm text-stone-500 line-clamp-2 mb-4 h-10">{event.description}</p>

        <div className="space-y-3 mb-6 flex-grow">
          <div className="flex items-center gap-3 text-sm text-stone-600">
            <Calendar className="w-4 h-4 text-[#2D6A4F]" />
            <span>{format(new Date(event.date), 'dd MMM yyyy')}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-stone-600">
            <Clock className="w-4 h-4 text-[#2D6A4F]" />
            <span>{event.startTime}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-stone-600">
            <MapPin className="w-4 h-4 text-[#2D6A4F]" />
            <span className="truncate">{event.taman}, {event.district}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-stone-600">
            <User className="w-4 h-4 text-[#2D6A4F]" />
            <span>{event.organizerName}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-stone-400">{t('quota')}</p>
            <p className={cn("text-lg font-bold", isFull ? "text-red-500" : "text-[#2D6A4F]")}>
              {event.currentCount} / {event.quota}
            </p>
          </div>

          <button
            disabled={isFull || isExpired || isRegistered}
            onClick={() => setShowRegister(true)}
            className={cn(
              "px-6 py-2 rounded-2xl font-bold text-sm transition-all shadow-sm flex items-center gap-2",
              isRegistered 
                ? "bg-emerald-100 text-emerald-700 cursor-default"
                : isFull || isExpired 
                  ? "bg-stone-100 text-stone-400 cursor-not-allowed" 
                  : "bg-[#2D6A4F] text-white hover:bg-[#1B4332] hover:shadow-md active:scale-95"
            )}
          >
            {isRegistered && <CheckCircle className="w-4 h-4" />}
            {isRegistered ? t('registered') : isFull ? t('full') : t('register')}
          </button>
        </div>
      </div>

      <RegistrationModal 
        event={event} 
        isOpen={showRegister} 
        onClose={() => setShowRegister(false)} 
      />

      {isOrganizer && (
        <BeneficiaryList
          event={event}
          isOpen={showBeneficiaries}
          onClose={() => setShowBeneficiaries(false)}
        />
      )}
    </div>
  );
}

