import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { auth, googleProvider, db } from '../services/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { LogIn, LogOut, User, Globe, LayoutDashboard, PlusCircle, ShieldCheck } from 'lucide-react';
import { Language } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import CreateEventModal from './CreateEventModal';
import MyRegistrations from './MyRegistrations';
import ManageEvents from './ManageEvents';
import { cn } from '../lib/utils';
import { Ticket } from 'lucide-react';

export default function Navbar() {
  const { user, profile, refreshProfile } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [myRegOpen, setMyRegOpen] = useState(false);
  const [manageEventsOpen, setManageEventsOpen] = useState(false);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const toggleRole = async () => {
    if (!user || !profile) return;
    const newRole = profile.role === 'user' ? 'organizer' : 'user';
    try {
      await updateDoc(doc(db, 'users', user.uid), { role: newRole });
      await refreshProfile();
    } catch (error) {
      console.error("Role toggle error:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#5A5A40] rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-serif text-xl font-bold">B</span>
            </div>
            <span className="hidden sm:block font-serif text-xl font-semibold text-[#5A5A40]">
              {t('appName')}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="p-2 rounded-full hover:bg-stone-100 transition-colors flex items-center gap-1 text-stone-600"
              >
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium uppercase">{language}</span>
              </button>
              <AnimatePresence>
                {langMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-stone-100 overflow-hidden"
                  >
                    {(['en', 'ms', 'zh'] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-stone-50 transition-colors uppercase ${
                          language === lang ? 'text-[#5A5A40] font-bold' : 'text-stone-600'
                        }`}
                      >
                        {lang === 'en' ? 'English' : lang === 'ms' ? 'Bahasa Melayu' : '中文'}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {user ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={() => setMyRegOpen(true)}
                  className="flex items-center gap-2 p-3 rounded-full text-[#2D6A4F] hover:bg-[#D8F3DC] transition-colors relative"
                  title={t('myRegistrations')}
                >
                  <Ticket className="w-5 h-5" />
                </button>

                {profile?.role === 'organizer' && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCreateModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#2D6A4F] text-white rounded-full hover:bg-[#1B4332] transition-all font-bold text-[10px] sm:text-xs shadow-lg shadow-[#2D6A4F]/20"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span className="hidden xs:inline">{t('createEvent')}</span>
                    </button>
                    {/* Manage My Events button for NGO */}
                    <button 
                      onClick={() => setManageEventsOpen(true)}
                      className="flex items-center gap-2 p-2 sm:p-3 rounded-full text-[#40916C] hover:bg-[#D8F3DC] transition-colors relative"
                      title={t('manageEvents')}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                    </button>
                  </div>
                )}
                
                <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-stone-200">
                  <button 
                    onClick={toggleRole}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all text-[10px] font-bold uppercase tracking-tight",
                      profile?.role === 'organizer' 
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
                        : "bg-stone-100 text-stone-500 border border-stone-200 hover:bg-stone-200"
                    )}
                    title="Toggle between Citizen and NGO role"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {profile?.role === 'organizer' ? "NGO Mode" : "Switch to NGO"}
                  </button>
                  
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-stone-900 leading-tight">{profile?.name}</p>
                    <p className="text-[10px] text-[#2D6A4F] font-bold uppercase tracking-tighter leading-none">{profile?.role}</p>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-full text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all font-medium text-sm"
                    title={t('logout')}
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#2D6A4F] text-white rounded-full hover:bg-[#1B4332] transition-all font-bold text-sm shadow-xl shadow-[#2D6A4F]/30"
              >
                <LogIn className="w-4 h-4" />
                {t('login')}
              </button>
            )}
          </div>
        </div>
      </div>

      <CreateEventModal 
        isOpen={createModalOpen} 
        onClose={() => setCreateModalOpen(false)} 
      />

      <MyRegistrations
        isOpen={myRegOpen}
        onClose={() => setMyRegOpen(false)}
      />

      <ManageEvents
        isOpen={manageEventsOpen}
        onClose={() => setManageEventsOpen(false)}
      />
    </nav>
  );
}



