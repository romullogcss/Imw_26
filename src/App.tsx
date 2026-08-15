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
import { DonationsPage } from './pages/Donations';
import { AdminPage } from './pages/Admin';
import { EventDetailPage } from './pages/EventDetail';

export default function App() {
  const [selectedEventSlug, setSelectedEventSlug] = useState<string>('');

  const [currentPage, setCurrentPage] = useState<PageId>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/admin')) {
        return 'admin';
      }
      if (path.startsWith('/eventos-especiais/')) {
        const parts = window.location.pathname.split('/eventos-especiais/');
        if (parts[1]) {
          return 'event-detail';
        }
      }
    }
    return 'home';
  });

  const [selectedMinistryId, setSelectedMinistryId] = useState<string | undefined>(undefined);
  const [isPrayerModalOpen, setIsPrayerModalOpen] = useState(false);

  useEffect(() => {
    const pageTitles: Record<PageId, string> = {
      home: 'IMW Cosmópolis - Igreja Metodista Wesleyana',
      history: 'Nossa História - IMW Cosmópolis',
      ministries: 'Ministérios - IMW Cosmópolis',
      schedule: 'Programação - IMW Cosmópolis',
      sermons: 'Pregações & Sermões - IMW Cosmópolis',
      contact: 'Fale Conosco - IMW Cosmópolis',
      donations: 'Doações e Ofertas - IMW Cosmópolis',
      admin: 'Painel Administrativo - IMW Cosmópolis',
      'event-detail': 'Evento Especial - IMW Cosmópolis',
    };
    if (pageTitles[currentPage]) {
      document.title = pageTitles[currentPage];
    }
  }, [currentPage]);

  useEffect(() => {
    const syncRouteFromUrl = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/admin')) {
        setCurrentPage('admin');
      } else if (path.startsWith('/eventos-especiais/')) {
        const parts = window.location.pathname.split('/eventos-especiais/');
        const slug = parts[1] ? decodeURIComponent(parts[1]) : '';
        if (slug) {
          setSelectedEventSlug(slug);
          setCurrentPage('event-detail');
        } else {
          setCurrentPage('schedule');
        }
      } else if (currentPage === 'event-detail' || currentPage === 'admin') {
        setCurrentPage('home');
      }
    };

    // Initialize slug if initial state was event-detail
    if (typeof window !== 'undefined' && window.location.pathname.toLowerCase().startsWith('/eventos-especiais/')) {
      const parts = window.location.pathname.split('/eventos-especiais/');
      if (parts[1]) {
        setSelectedEventSlug(decodeURIComponent(parts[1]));
      }
    }

    window.addEventListener('popstate', syncRouteFromUrl);
    return () => window.removeEventListener('popstate', syncRouteFromUrl);
  }, []);

  const handleNavigate = (page: PageId, extraParam?: string) => {
    setCurrentPage(page);
    if (page === 'admin') {
      window.history.pushState(null, '', '/admin');
    } else if (page === 'event-detail' && extraParam) {
      setSelectedEventSlug(extraParam);
      window.history.pushState(null, '', `/eventos-especiais/${extraParam}`);
    } else {
      if (window.location.pathname !== '/') {
        window.history.pushState(null, '', '/');
      }
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

        {currentPage === 'donations' && (
          <DonationsPage />
        )}

        {currentPage === 'event-detail' && (
          <EventDetailPage
            eventSlug={selectedEventSlug}
            onNavigate={handleNavigate}
            onOpenPrayerModal={() => setIsPrayerModalOpen(true)}
          />
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
