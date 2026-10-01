import React from "react";

import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

/* ============================================================
   APP PAGES
============================================================ */

import HomePage from "@/app/home/HomePage";

import LoginPage from "@/app/auth/LoginPage";
import SignupPage from "@/app/auth/SignupPage";

import SurveyPage from "@/app/survey/SurveyPage";

import ScannerPage from "@/app/scanner/ScannerPage";

/*
 * NEW PAGE
 *
 * Mobile:
 * scanner
 *   ↓
 * face-result
 *   ↓
 * geometry
 *
 * Same flow for Web.
 */
import FaceResultPage from "@/app/face-result/FaceResultPage";

import GeometryPage from "@/app/geometry/GeometryPage";

import TryOnPage from "@/app/tryon/TryOnPage";

import BookingPage from "@/app/booking/BookingPage";

import ExplorePage from "@/app/explore/ExplorePage";

import ProfilePage from "@/app/profile/ProfilePage";

import AddChildPage from "@/app/profile/AddChildPage";

import EditProfilePage from "@/app/profile/EditProfilePage";

import HistoryPage from "@/app/profile/HistoryPage";

/* ============================================================
   PROTECTED ROUTE
============================================================ */

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<
  ProtectedRouteProps
> = ({ children }) => {
  const {
    user,
    loading,
  } = useAuth();

  const location =
    useLocation();

  /*
   * AuthContext is still checking
   * Supabase session.
   */
  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-11 h-11 border-4 border-primary/20 rounded-full" />

          <div className="absolute w-11 h-11 border-4 border-transparent border-t-primary rounded-full animate-spin" />
        </div>

        <p className="text-xs font-black text-primary uppercase tracking-wider">
          Validating Security Session...
        </p>
      </div>
    );
  }

  /*
   * No authenticated user.
   *
   * Save current route inside location state
   * so login page can support redirect-back
   * behavior later if required.
   */
  if (!user) {
    return (
      <Navigate
        to="/auth/login"
        state={{
          from: location,
        }}
        replace
      />
    );
  }

  return <>{children}</>;
};

/* ============================================================
   APPLICATION ROUTES
============================================================ */

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* =====================================================
          PUBLIC
      ====================================================== */}

      <Route
        path="/"
        element={<HomePage />}
      />

      <Route
        path="/auth/login"
        element={<LoginPage />}
      />

      <Route
        path="/auth/signup"
        element={<SignupPage />}
      />

      {/*
       * Existing public discovery pages.
       * Keep unchanged for now.
       */}

      <Route
        path="/explore"
        element={<ExplorePage />}
      />

      {/* =====================================================
          AUTHENTICATED CUSTOMER FLOW
          
          Survey
            ↓
          Scanner
            ↓
          Face Result
            ↓
          Geometry
            ↓
          Try-On
      ====================================================== */}

      <Route
        path="/survey"
        element={
          <ProtectedRoute>
            <SurveyPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/scanner"
        element={
          <ProtectedRoute>
            <ScannerPage />
          </ProtectedRoute>
        }
      />

      {/*
       * NEW WEB FACE RESULT ROUTE
       *
       * Expected URLs:
       *
       * /face-result?scanId=<uuid>
       *
       * Scanner also passes:
       * location.state.scanId
       */}

      <Route
        path="/face-result"
        element={
          <ProtectedRoute>
            <FaceResultPage />
          </ProtectedRoute>
        }
      />

      {/*
       * Geometry now loads real data using scanId.
       *
       * Example:
       *
       * /geometry?scanId=<uuid>
       */}

      <Route
        path="/geometry"
        element={
          <ProtectedRoute>
            <GeometryPage />
          </ProtectedRoute>
        }
      />

      {/*
       * Try-On receives scanId from Geometry.
       *
       * Example:
       *
       * /tryon?scanId=<uuid>
       */}

      <Route
        path="/tryon"
        element={
          <ProtectedRoute>
            <TryOnPage />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          BOOKING
      ====================================================== */}

      <Route
        path="/booking"
        element={
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          PROFILE
      ====================================================== */}

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/add-child"
        element={
          <ProtectedRoute>
            <AddChildPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/history"
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          FALLBACK

          Invalid URLs return Home.
      ====================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
};

export default AppRoutes;