import React from "react";
import {
  BrowserRouter,
  useLocation
} from "react-router-dom";

import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AppRoutes from "@/routes";

const AppContent: React.FC = () => {
  const location = useLocation();

  const showFooter =
    location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-background text-text selection:bg-primary selection:text-black">

      <Navbar />

      <main className="flex-1">
        <AppRoutes />
      </main>

      {showFooter && <Footer />}

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;