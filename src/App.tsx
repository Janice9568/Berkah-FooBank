/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import EventCard from './components/EventCard';
import EventFilters from './components/EventFilters';
import { DistributionEvent } from './types';
import { collection, query, where, orderBy, onSnapshot, Timestamp, getDocs, addDoc, serverTimestamp, collectionGroup } from 'firebase/firestore';
import { db } from './services/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Search } from 'lucide-react';
import { cn } from './lib/utils';
import { Registration } from './types';

function AppContent() {
  const { user, profile, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [events, setEvents] = useState<DistributionEvent[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ state: '', district: '', taman: '' });
  const [loading, setLoading] = useState(true);

  // Fetch registrations
  useEffect(() => {
    if (!user) {
      setUserRegistrations([]);
      return;
    }
    const q = query(collectionGroup(db, 'registrations'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventIds = snapshot.docs.map(doc => doc.data().eventId);
      setUserRegistrations(eventIds);
    });
    return () => unsubscribe();
  }, [user]);

  // Seeding logic for dummy data
  useEffect(() => {
    const seedData = async () => {
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef);
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log("Seeding dummy data...");
        const dummyEvents = [
          {
            title: "Taman Jaya Surplus Distribution",
            description: "Fresh vegetables from PJ Old Town Market. Priority for low-income families.",
            date: new Date().toISOString().split('T')[0],
            startTime: "18:00",
            state: "Selangor",
            district: "Petaling Jaya",
            taman: "Taman Jaya",
            quota: 30,
            currentCount: 0,
            organizerName: "PJ Welfare NGO",
            organizerContact: "0123456789",
            organizerId: "system",
            status: "upcoming",
            createdAt: serverTimestamp()
          },
          {
            title: "USJ 4 Community Veggie Share",
            description: "Surplus fruits and leafy greens. Bring your own bags please!",
            date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            startTime: "19:30",
            state: "Selangor",
            district: "Subang Jaya",
            taman: "USJ 4",
            quota: 50,
            currentCount: 12,
            organizerName: "Subang Hope",
            organizerContact: "0198765432",
            organizerId: "system",
            status: "upcoming",
            createdAt: serverTimestamp()
          }
        ];

        for (const event of dummyEvents) {
          await addDoc(eventsRef, event);
        }
      }
    };
    seedData();
  }, []);

  useEffect(() => {
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DistributionEvent[];
      setEvents(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.organizerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesState = !filters.state || event.state === filters.state;
    const matchesDistrict = !filters.district || event.district === filters.district;
    const matchesTaman = !filters.taman || event.taman.toLowerCase().includes(filters.taman.toLowerCase());

    return matchesSearch && matchesState && matchesDistrict && matchesTaman;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Leaf className="w-12 h-12 text-[#2D6A4F]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F9F4] font-sans text-[#1a1a1a]">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-serif text-[#1B4332] mb-4 font-bold tracking-tight"
          >
            {t('appName')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-[#2D6A4F] font-medium"
          >
            {t('tagline')}
          </motion.p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border-2 border-transparent shadow-sm focus:border-[#2D6A4F] focus:ring-0 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <EventFilters onFilterChange={setFilters} />
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <EventCard 
                  event={event} 
                  isRegistered={userRegistrations.includes(event.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredEvents.length === 0 && !loading && (
          <div className="text-center py-20 text-stone-500">
            <p className="text-xl">{t('noEvents')}</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}

