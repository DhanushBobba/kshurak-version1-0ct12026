import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { AuthModal } from '../../features/auth/AuthModal';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const location = useLocation();
  const isBarberSection = location.pathname.startsWith('/barber');

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0D11] text-gray-100">
      <Navbar onOpenAuth={() => setIsAuthOpen(true)} />
      
      <div className="flex-1 flex">
        {isBarberSection && (
          <div className="hidden md:block">
            <Sidebar />
          </div>
        )}
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};
