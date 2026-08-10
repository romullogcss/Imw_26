/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PageId } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PrayerModal } from './components/PrayerModal';

import { Home } from './pages/Home';
import { HistoryPage } from './pages/History';
import { MinistriesPage } from './pages/Ministries';
import { SchedulePage } from './pages/Schedule';
import { SermonsPage } from './pages/Sermons';
import { ContactPage } from './pages/Contact';
import { AdminPage } from './pages/Admin';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.toLowerCase().startsWith('/admin')) {
      return 'admin';
    }
    return 'home';
  });
  const [selectedMinistryId, setSelectedMinistryId] = useState<string | undefined>(undefined);
  const [isPrayerModalOpen, setIsPrayerModalOpen] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.toLowerCase().startsWith('/admin')) {
        setCurrentPage('admin');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (page: PageId, extraParam?: string) => {
    setCurrentPage(page);
    if (page === 'admin') {
      window.history.pushState(null, '', '/admin');
    } else if (window.location.pathname.toLowerCase().startsWith('/admin')) {
      window.history.pushState(null, '', '/');
    }
    if (page === 'ministries' && extraParam) {
      setSelectedMinistryId(extraParam);
    } else if (page === 'ministries' && !extraParam) {
      setSelectedMinistryId(undefined);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentPage === 'admin') {
    return <AdminPage onNavigateSite={() => handleNavigate('home')} />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-800 antialiased">
      {/* Top Sticky Header */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenPrayerModal={() => setIsPrayerModalOpen(true)}
      />

      {/* Main Page Body */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <Home
            onNavigate={handleNavigate}
            onOpenPrayerModal={() => setIsPrayerModalOpen(true)}
          />
        )}

        {currentPage === 'history' && (
          <HistoryPage />
        )}

        {currentPage === 'ministries' && (
          <MinistriesPage initialMinistryId={selectedMinistryId} />
        )}

        {currentPage === 'schedule' && (
          <SchedulePage />
        )}

        {currentPage === 'sermons' && (
          <SermonsPage />
        )}

        {currentPage === 'contact' && (
          <ContactPage />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenPrayerModal={() => setIsPrayerModalOpen(true)}
      />

      {/* Prayer Request Modal */}
      <PrayerModal
        isOpen={isPrayerModalOpen}
        onClose={() => setIsPrayerModalOpen(false)}
      />
    </div>
  );
}
