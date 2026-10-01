import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Sparkles,
  Calendar,
  Camera,
  Heart,
  ChevronRight,
  ClipboardList,
  Flame,
  ArrowRight,
  Eye,
  Scan,
  ShieldCheck,
  Activity,
  Layers,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import SurveyPopup from "@/components/common/SurveyPopup";
import { COLORS } from "@/constants/colors";

// Hairstyle Definitions matching the reference assets
interface HairstyleItem {
  id: string;
  name: string;
  category: string;
  faceMatch: string;
  description: string;
  modelImage: string;
  mannequinImage: string;
  thumbnail: string;
  hairLength: string;
  maintenance: string;
  faceShapes: string[];
}

const HAIRSTYLES: HairstyleItem[] = [
  {
    id: "quiff-taper",
    name: "Quiff with Taper Fade",
    category: "Modern Classic",
    faceMatch: "Oval & Square Faces",
    description: "Select a selected thumbnail, e.g. other's seamlessly on the 3D mannequin.",
    modelImage: "/assets/images/style6.png",
    mannequinImage: "/assets/images/mannequin_quiff.jpg",
    thumbnail: "/assets/images/style6.png",
    hairLength: "Medium Top / High Fade",
    maintenance: "Medium (4-5 weeks)",
    faceShapes: ["Oval", "Square", "Rectangle"],
  },
  {
    id: "textured-crop",
    name: "Textured Crop Fade",
    category: "Street Contemporary",
    faceMatch: "Oval, Round & Diamond",
    description: "Forward-swept textured crop with dropped temple fade and defined hairline.",
    modelImage: "/assets/images/style1.png",
    mannequinImage: "/assets/images/mannequin_slickback.jpg",
    thumbnail: "/assets/images/style1.png",
    hairLength: "Short / Low Taper",
    maintenance: "Low (3-4 weeks)",
    faceShapes: ["Oval", "Round", "Diamond"],
  },
  {
    id: "buzz-fade",
    name: "Precision Buzz Cut",
    category: "Athletic Minimal",
    faceMatch: "Oval, Square & Oblong",
    description: "Sharp military-grade buzz with razor sharp shape-up and skin-level gradient fade.",
    modelImage: "/assets/images/style2.png",
    mannequinImage: "/assets/images/mannequin_buzz.jpg",
    thumbnail: "/assets/images/style2.png",
    hairLength: "Ultra Short / Skin Fade",
    maintenance: "Ultra Low (2-3 weeks)",
    faceShapes: ["Oval", "Square", "Oblong"],
  },
  {
    id: "curly-fringe",
    name: "Voluminous Curly Fringe",
    category: "Natural Wave",
    faceMatch: "Diamond, Oval & Heart",
    description: "Full natural curls with controlled weight on crown and tapered nape line.",
    modelImage: "/assets/images/style3.png",
    mannequinImage: "/assets/images/mannequin_curly.jpg",
    thumbnail: "/assets/images/style3.png",
    hairLength: "Medium Curls / Clean Taper",
    maintenance: "Medium (Curly Routine)",
    faceShapes: ["Diamond", "Oval", "Heart"],
  },
  {
    id: "side-pompadour",
    name: "Sharp Side Pompadour",
    category: "Executive Sharp",
    faceMatch: "Square & Rectangle",
    description: "High-volume sculptured side part with razor-sculpted taper fade transition.",
    modelImage: "/assets/images/style4.png",
    mannequinImage: "/assets/images/mannequin_pompadour.jpg",
    thumbnail: "/assets/images/style4.png",
    hairLength: "Medium-Long / Drop Fade",
    maintenance: "High (Daily Pomade)",
    faceShapes: ["Square", "Rectangle", "Oval"],
  },
  {
    id: "wavy-curtain",
    name: "Wavy Curtain Cut",
    category: "Flow & Fringe",
    faceMatch: "Heart, Oval & Diamond",
    description: "Relaxed middle-part layered curtains providing soft forehead balance and organic movement.",
    modelImage: "/assets/images/style5.png",
    mannequinImage: "/assets/images/mannequin_curtain.jpg",
    thumbnail: "/assets/images/style5.png",
    hairLength: "Medium Long / Soft Taper",
    maintenance: "Medium (Texture Spray)",
    faceShapes: ["Heart", "Oval", "Diamond"],
  },
];

// Sample biometric profiles for the Facial Geometry Section
interface GeometryProfile {
  name: string;
  shape: string;
  confidence: number;
  faceLength: number;
  faceWidth: number;
  faceRatio: number;
  jawAngle: number;
  symmetry: number;
  cheekbones: number;
  forehead: number;
  jawWidth: number;
  jawShape: string;
}

const GEOMETRY_PROFILES: GeometryProfile[] = [
  {
    name: "Oval (Balanced)",
    shape: "OVAL",
    confidence: 96.8,
    faceLength: 188,
    faceWidth: 136,
    faceRatio: 1.38,
    jawAngle: 118,
    symmetry: 98.2,
    cheekbones: 140,
    forehead: 128,
    jawWidth: 116,
    jawShape: "Soft Rounded",
  },
  {
    name: "Square (Defined)",
    shape: "SQUARE",
    confidence: 95.4,
    faceLength: 176,
    faceWidth: 142,
    faceRatio: 1.24,
    jawAngle: 104,
    symmetry: 97.6,
    cheekbones: 144,
    forehead: 136,
    jawWidth: 134,
    jawShape: "Sharp Angular",
  },
  {
    name: "Diamond (High Cheekbones)",
    shape: "DIAMOND",
    confidence: 94.2,
    faceLength: 184,
    faceWidth: 132,
    faceRatio: 1.39,
    jawAngle: 122,
    symmetry: 96.5,
    cheekbones: 146,
    forehead: 120,
    jawWidth: 108,
    jawShape: "Tapered Narrow",
  },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [selectedStyleIndex, setSelectedStyleIndex] = useState(0);
  const [savedLooks, setSavedLooks] = useState<{ [key: string]: boolean }>({});
  const [showSurvey, setShowSurvey] = useState(false);
  const [showWireframe, setShowWireframe] = useState(false);
  const [selectedGeoProfile, setSelectedGeoProfile] = useState(0);

  // Hero Clockwise 3D Carousel state
  const [heroRotationAngle, setHeroRotationAngle] = useState(0);
  const [isRotatingClockwise, setIsRotatingClockwise] = useState(true);
  const heroIntervalRef = useRef<any>(null);

  const rawName = user
    ? user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.user_metadata?.username ||
    user?.email?.split("@")[0] ||
    "User"
    : "Guest";
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  /* ============================================================
   PROTECTED HOME ACTION FLOW

   HOME FEATURE
      ↓
   Logged in?
      NO  → Login → return Home → Survey Popup
      YES → Survey Popup
============================================================ */

  useEffect(() => {
    if (!user) {
      return;
    }

    const shouldShowSurvey =
      localStorage.getItem(
        "kshurak_show_survey_after_login"
      );

    if (shouldShowSurvey === "true") {
      localStorage.removeItem(
        "kshurak_show_survey_after_login"
      );

      setShowSurvey(true);
    }
  }, [user]);

  const navigateService = (_route?: string) => {
    /*
     * USER NOT LOGGED IN
     *
     * Remember that this login was started
     * from a protected Home feature.
     */
    if (!user) {
      localStorage.setItem(
        "kshurak_show_survey_after_login",
        "true"
      );

      navigate("/auth/login");

      return;
    }

    /*
     * USER ALREADY LOGGED IN
     *
     * Do NOT directly open Scanner / Try-On /
     * Booking from Home.
     *
     * First show SurveyPopup.
     */
    setShowSurvey(true);
  };

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedLooks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Clockwise rotation animation effect
  useEffect(() => {
    heroIntervalRef.current = setInterval(() => {
      setHeroRotationAngle(
        (prev) =>
          (prev + 360 / HAIRSTYLES.length) % 360
      );
    }, 2800);

    return () => {
      if (heroIntervalRef.current) {
        clearInterval(heroIntervalRef.current);
      }
    };
  }, []);

  const rotateClockwiseManually = () => {
    setHeroRotationAngle((prev) => (prev + 60) % 360);
  };

  const rotateCounterClockwiseManually = () => {
    setHeroRotationAngle((prev) => (prev - 60 + 360) % 360);
  };
  

  const activeHeroIndex = Math.round(heroRotationAngle / 60) % HAIRSTYLES.length;
  const currentHeroStyle = HAIRSTYLES[activeHeroIndex] || HAIRSTYLES[0];

  const currentStyle = HAIRSTYLES[selectedStyleIndex] || HAIRSTYLES[0];
  const activeGeo = GEOMETRY_PROFILES[selectedGeoProfile];

  return (
    <div className="min-h-screen bg-background text-text pb-24 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pt-8">

        {/* ============================================================ */}
        {/* 1. HERO SECTION (Split Layout)                               */}
        {/* Left: Personalized greeting, Trending headline, CTAs         */}
        {/* Right: Clockwise Rotating Image Carousel                     */}
        {/* ============================================================ */}
        <section className="relative rounded-3xl bg-transparent border-0 overflow-visible pt-4 pb-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

            {/* Left Column */}
            <div className="lg:col-span-6 z-10 self-start">

              {/* Greeting stays at top-left */}
              <div className="pt-1">
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight leading-tight">
                  {getGreeting()},{" "}
                  <span className="text-primary">
                    {displayName}
                  </span>
                </h1>

                <p className="text-sm text-textSecondary mt-3 font-medium">
                  Find your next signature look
                </p>
              </div>

              {/* Keep previous spacing/position for Trending content */}
              <div className="mt-14 space-y-7">

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary font-black text-xs tracking-wider uppercase">
                    <span>🔥</span>
                    <span>TRENDING STYLES</span>
                  </div>

                  <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-[1.08] max-w-lg">
                    Find Your Perfect
                    <br />
                    Hairstyle with AI
                  </h2>

                  <p className="text-base text-textSecondary max-w-md leading-relaxed font-normal">
                    Fresh cuts. Modern looks.
                    <br />
                    See what&apos;s trending now.
                  </p>
                </div>

                {/* Buttons remain in previous position */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => navigateService("/scanner")}
                    className="flex items-center gap-2.5 bg-primary hover:bg-amber-400 text-black font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                  >
                    <Sparkles size={18} className="fill-black" />
                    <span>Face Scanner</span>
                  </button>

                  <button
                    onClick={() => navigateService("/booking")}
                    className="flex items-center gap-2.5 border border-primary/80 hover:border-primary bg-transparent hover:bg-primary/10 text-primary font-bold text-sm px-6 py-3.5 rounded-2xl transition-all active:scale-95"
                  >
                    <Calendar size={18} />
                    <span>Book Now</span>
                  </button>
                </div>

              </div>

            </div>

            {/* Right Column: Clockwise Rotating Showcase */}
            <div className="lg:col-span-6 relative flex flex-col items-center justify-center">
              {/* 3D Perspective Clockwise Rotating Cylinder */}
              <div className="relative w-full max-w-[600px] h-[410px] sm:h-[440px] perspective-1500 flex items-center justify-center overflow-visible">
                {HAIRSTYLES.map((style, idx) => {
                  // Calculate angular placement on 360-degree circle
                  // In a 6-card setup, angles are 0, 60, 120, 180, 240, 300
                  const baseAngle = idx * (360 / HAIRSTYLES.length);
                  // Current angle moving in clockwise direction
                  const currentAngle = (baseAngle - heroRotationAngle + 360) % 360;
                  const rad = (currentAngle * Math.PI) / 180;

                  // 3D positioning
                  const radiusX = 215;
                  const radiusZ = 150;

                  const x =
                    Math.sin(rad) * radiusX;

                  const z =
                    Math.cos(rad) * radiusZ;

                  const depth =
                    (z + radiusZ) / (2 * radiusZ);

                  const scale =
                    0.78 + depth * 0.24;

                  const opacity =
                    0.58 + depth * 0.42;

                  const y =
                    (1 - depth) * 18;

                  const rotateY =
                    Math.sin(rad) * -12;

                  const isFront =
                    z > radiusZ * 0.72;
                  return (
                    <motion.div
                      key={style.id}
                      animate={{
                        x,
                        y,
                        scale,
                        opacity,
                        rotateY,
                        zIndex: Math.round(z + 500),
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 85,
                        damping: 18,
                        mass: 0.8
                      }}
                      onClick={() => {
                        setSelectedStyleIndex(idx);
                        setHeroRotationAngle(idx * 60);
                      }}
                      className={`absolute w-[240px] sm:w-[260px] h-[340px] sm:h-[370px] rounded-3xl overflow-hidden cursor-pointer bg-surface border transition-all ${isFront
                        ? "border-primary shadow-[0_0_35px_rgba(245,158,11,0.25)] ring-1 ring-primary/40"
                        : "border-border/80 shadow-2xl"
                        }`}
                    >
                      <img
                        src={style.modelImage}
                        alt={style.name}
                        className="w-full h-full object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                      {/* Card Info Overlay */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                          {style.category}
                        </span>
                        <h4 className="text-sm font-black text-white leading-tight mt-0.5 truncate">
                          {style.name}
                        </h4>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                          <span className="text-[10px] text-textSecondary font-semibold">
                            {style.hairLength}
                          </span>
                          <span className="text-[10px] text-primary font-bold">
                            View 3D Fit →
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Dot Indicators */}
              <div className="flex items-center gap-2 mt-4">
                {HAIRSTYLES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setHeroRotationAngle(idx * 60);
                      setSelectedStyleIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all ${activeHeroIndex === idx
                      ? "w-7 bg-primary shadow-[0_0_8px_#F59E0B]"
                      : "w-2 bg-border hover:bg-textMuted"
                      }`}
                  />
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* 2. QUICK ACTIONS SECTION (Placed before Virtual Fitting)     */}
        {/* 4 Cards: 5 Step Survey, Face Scanner, AI Try-On, Book Appt   */}
        {/* ============================================================ */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: 5 Step Survey */}
            <div
              onClick={() => navigateService("/survey")}
              className="group cursor-pointer rounded-2xl bg-surface border border-border hover:border-primary/80 transition-all duration-300 p-8 flex flex-col items-center text-center justify-center space-y-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10"
            >
              <div className="w-14 h-14 rounded-2xl bg-surfaceDark border border-border group-hover:border-primary/60 flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-300">
                <ClipboardList size={30} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-primary transition-colors">
                  5 Step Survey
                </h3>
                <p className="text-xs text-textSecondary mt-1.5 leading-relaxed font-medium">
                  Complete your hair profile
                </p>
              </div>
            </div>

            {/* Card 2: Face Scanner */}
            <div
              onClick={() => navigateService("/scanner")}
              className="group cursor-pointer rounded-2xl bg-surface border border-border hover:border-primary/80 transition-all duration-300 p-8 flex flex-col items-center text-center justify-center space-y-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10"
            >
              <div className="w-14 h-14 rounded-2xl bg-surfaceDark border border-border group-hover:border-primary/60 flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-300">
                <Camera size={30} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-primary transition-colors">
                  Face Scanner
                </h3>
                <p className="text-xs text-textSecondary mt-1.5 leading-relaxed font-medium">
                  Analyze your face
                </p>
              </div>
            </div>

            {/* Card 3: AI Try-On */}
            <div
              onClick={() => navigateService("/tryon")}
              className="group cursor-pointer rounded-2xl bg-surface border border-border hover:border-primary/80 transition-all duration-300 p-8 flex flex-col items-center text-center justify-center space-y-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10"
            >
              <div className="w-14 h-14 rounded-2xl bg-surfaceDark border border-border group-hover:border-primary/60 flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-300">
                <Sparkles size={30} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-primary transition-colors">
                  AI Try-On
                </h3>
                <p className="text-xs text-textSecondary mt-1.5 leading-relaxed font-medium">
                  See it on you
                </p>
              </div>
            </div>

            {/* Card 4: Book Appointment */}
            <div
              onClick={() => navigateService("/booking")}
              className="group cursor-pointer rounded-2xl bg-surface border border-border hover:border-primary/80 transition-all duration-300 p-8 flex flex-col items-center text-center justify-center space-y-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10"
            >
              <div className="w-14 h-14 rounded-2xl bg-surfaceDark border border-border group-hover:border-primary/60 flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-300">
                <Calendar size={30} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-primary transition-colors">
                  Book Appointment
                </h3>
                <p className="text-xs text-textSecondary mt-1.5 leading-relaxed font-medium">
                  Find a barber
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 3. VIRTUAL FITTING ROOM SECTION                              */}
        {/* Left: 3D Mannequin with Dynamic Hair Changing & Selector     */}
        {/* Right: Selected Haircut Portrait & "Book this Look" CTA      */}
        {/* ============================================================ */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Virtual Fitting Room
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Card: 3D Mannequin Stage & Style Selector Strip */}
            <div className="lg:col-span-8 rounded-3xl bg-surface border border-border p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between">

              {/* Header inside Mannequin Stage */}
              <div className="flex items-center justify-between z-20">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-surfaceDark border border-border text-[11px] font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Scan size={13} />
                    <span>3D Interactive Fitting</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowWireframe(!showWireframe)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${showWireframe
                      ? "bg-primary text-black border-primary"
                      : "bg-surfaceDark text-textSecondary border-border hover:text-white"
                      }`}
                  >
                    <Layers size={13} />
                    <span>{showWireframe ? "Wireframe Active" : "Facial Mesh"}</span>
                  </button>
                </div>
              </div>

              {/* Main Stage: Center Mannequin + Floating Right Selector */}
              <div className="relative flex-1 min-h-[400px] sm:min-h-[460px] flex items-center justify-center my-4">

                {/* 3D Mannequin Face Display */}
                <div className="relative w-[300px] sm:w-[360px] h-[340px] sm:h-[400px] flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStyle.id}
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center"
                    >
                      <img
                        src={currentStyle.mannequinImage}
                        alt={`3D Mannequin with ${currentStyle.name}`}
                        className="w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
                      />

                      {/* Biometric Wireframe Overlay */}
                      {showWireframe && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <svg className="w-full h-full opacity-80" viewBox="0 0 400 400">
                            {/* Head oval */}
                            <ellipse cx="200" cy="180" rx="90" ry="120" fill="none" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="4 4" />
                            {/* Horizontal alignment lines */}
                            <line x1="120" y1="140" x2="280" y2="140" stroke="#F59E0B" strokeWidth="1" opacity="0.6" />
                            <line x1="110" y1="180" x2="290" y2="180" stroke="#F59E0B" strokeWidth="1.2" />
                            <line x1="130" y1="230" x2="270" y2="230" stroke="#F59E0B" strokeWidth="1" opacity="0.6" />
                            {/* Vertical symmetry axis */}
                            <line x1="200" y1="60" x2="200" y2="300" stroke="#F59E0B" strokeWidth="1.5" />
                            {/* Landmark nodes */}
                            <circle cx="200" cy="140" r="3" fill="#F59E0B" />
                            <circle cx="160" cy="180" r="3.5" fill="#F59E0B" />
                            <circle cx="240" cy="180" r="3.5" fill="#F59E0B" />
                            <circle cx="200" cy="230" r="3" fill="#F59E0B" />
                            <circle cx="200" cy="275" r="4" fill="#22C55E" />
                          </svg>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Active Look Watermark Chip */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-border text-[11px] font-bold text-white whitespace-nowrap">
                    Active Hair Model: <span className="text-primary font-black">{currentStyle.name}</span>
                  </div>
                </div>

                {/* Right Floating Selector Strip: "SELECT A STYLE:" */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2.5 z-20 bg-surfaceDark/85 backdrop-blur-md p-2.5 rounded-2xl border border-border shadow-2xl">
                  <span className="text-[10px] font-black uppercase tracking-wider text-textMuted text-center px-1 mb-1">
                    SELECT A STYLE:
                  </span>

                  <div className="flex flex-col gap-2">
                    {HAIRSTYLES.map((item, idx) => {
                      const isSelected = selectedStyleIndex === idx;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedStyleIndex(idx)}
                          title={item.name}
                          className={`relative w-12 h-12 rounded-xl overflow-hidden transition-all duration-200 ${isSelected
                            ? "border-2 border-primary ring-2 ring-primary/40 scale-105 shadow-lg shadow-amber-500/25"
                            : "border border-border opacity-70 hover:opacity-100 hover:border-textMuted"
                            }`}
                        >
                          <img
                            src={item.thumbnail}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Mannequin Helper Note */}
              <div className="flex items-center justify-between text-xs text-textMuted pt-3 border-t border-border/80">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle size={14} className="text-primary" />
                  Real-time facial geometry alignment active
                </span>
                <span className="text-[11px] text-textSecondary font-semibold">
                  Click any hairstyle thumbnail to preview
                </span>
              </div>
            </div>

            {/* Right Card: Selected Look Details & "Book this Look" CTA */}
            <div className="lg:col-span-4 rounded-3xl bg-surface border border-border p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Real-life Model Photo */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-surfaceDark border border-border shadow-inner">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentStyle.id}
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0.3 }}
                      transition={{ duration: 0.3 }}
                      src={currentStyle.modelImage}
                      alt={currentStyle.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </AnimatePresence>
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-black text-primary uppercase">
                    {currentStyle.category}
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">
                    {currentStyle.name}
                  </h3>
                  <p className="text-xs text-textSecondary mt-2 leading-relaxed">
                    {currentStyle.description}
                  </p>
                </div>

                {/* Face Compatibility Tags */}
                <div className="p-3.5 rounded-xl bg-surfaceDark border border-border space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-textMuted font-bold uppercase text-[10px]">
                      Recommended Face Shapes
                    </span>
                    <span className="text-primary font-black text-xs">
                      {currentStyle.faceMatch}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {currentStyle.faceShapes.map((shape) => (
                      <span
                        key={shape}
                        className="px-2 py-0.5 rounded-md bg-surface border border-border text-[10px] font-bold text-white"
                      >
                        ✓ {shape}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* High Contrast Amber "Book this Look" Button */}
              <button
                onClick={() =>
                  navigate(`/booking?style=${encodeURIComponent(currentStyle.name)}`)
                }
                className="w-full bg-primary hover:bg-amber-400 text-black font-black text-sm py-4 rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
              >
                <span>Book this Look</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 4. FACIAL GEOMETRY CARDS SECTION                             */}
        {/* Placed immediately after Virtual Fitting Room as requested   */}
        {/* Showcases live biometrics, skull ratios, and analysis data   */}
        {/* ============================================================ */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-wider mb-1">
                <Activity size={14} />
                <span>AI Biometric Extraction Engine</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Facial Geometry &amp; Biometrics
              </h2>
              <p className="text-xs text-textSecondary mt-1">
                Precision skull coordinates and proportion ratios calculated by computer vision
              </p>
            </div>

            {/* Profile Preset Switcher */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-surface border border-border self-start sm:self-auto overflow-x-auto">
              {GEOMETRY_PROFILES.map((p, idx) => (
                <button
                  key={p.shape}
                  onClick={() => setSelectedGeoProfile(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedGeoProfile === idx
                    ? "bg-primary text-black font-black shadow-md shadow-amber-500/20"
                    : "text-textSecondary hover:text-white"
                    }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Primary Geometry Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Face Shape */}
            <div className="rounded-2xl bg-surface border border-border p-6 space-y-4 hover:border-primary/60 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">
                  Detected Shape
                </span>
                <span className="text-[11px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  {activeGeo.confidence}% Accuracy
                </span>
              </div>
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight">
                  {activeGeo.shape}
                </h3>
                <p className="text-xs text-textSecondary mt-1">
                  Balanced vertical ratio with soft curvature along temporal bones.
                </p>
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-textMuted">Contour</span>
                <span className="text-white font-bold">{activeGeo.jawShape}</span>
              </div>
            </div>

            {/* Card 2: Face Ratio & Proportions */}
            <div className="rounded-2xl bg-surface border border-border p-6 space-y-4 hover:border-primary/60 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">
                  Proportion Ratio
                </span>
                <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Ideal 1.35-1.40
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-primary tracking-tight">
                    {activeGeo.faceRatio}
                  </h3>
                  <span className="text-xs text-textMuted">L/W</span>
                </div>
                <p className="text-xs text-textSecondary mt-1">
                  Face Length ({activeGeo.faceLength} mm) ÷ Width ({activeGeo.faceWidth} mm)
                </p>
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-textMuted">Cheekbone Width</span>
                <span className="text-white font-bold">{activeGeo.cheekbones} mm</span>
              </div>
            </div>

            {/* Card 3: Jawline Structure */}
            <div className="rounded-2xl bg-surface border border-border p-6 space-y-4 hover:border-primary/60 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">
                  Jawline Angle
                </span>
                <span className="text-[11px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  Mandibular
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-white tracking-tight">
                    {activeGeo.jawAngle}°
                  </h3>
                  <span className="text-xs text-textMuted">Gonial Angle</span>
                </div>
                <p className="text-xs text-textSecondary mt-1">
                  Defines lower third angularity and optimal fade height.
                </p>
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-textMuted">Lower Jaw Width</span>
                <span className="text-white font-bold">{activeGeo.jawWidth} mm</span>
              </div>
            </div>

            {/* Card 4: Bilateral Symmetry */}
            <div className="rounded-2xl bg-surface border border-border p-6 space-y-4 hover:border-primary/60 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">
                  Bilateral Symmetry
                </span>
                <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Optimal
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-emerald-400 tracking-tight">
                    {activeGeo.symmetry}%
                  </h3>
                  <span className="text-xs text-textMuted">Balance</span>
                </div>
                <p className="text-xs text-textSecondary mt-1">
                  High equilibrium between left and right facial quadrants.
                </p>
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-textMuted">Forehead Width</span>
                <span className="text-white font-bold">{activeGeo.forehead} mm</span>
              </div>
            </div>
          </div>

          {/* Action Row for Face Geometry */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surfaceDark border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">Want your personal geometry report?</h4>
                <p className="text-[11px] text-textSecondary">
                  Take a 3-angle scan with your camera to unlock exact millimeter specs.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigateService("/scanner")}
                className="flex-1 sm:flex-none bg-primary hover:bg-amber-400 text-black font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-amber-500/20"
              >
                Start Face Scan
              </button>
              <button
                onClick={() => navigateService("/geometry")}
                className="flex-1 sm:flex-none border border-border hover:border-primary/80 bg-surface text-white hover:text-primary font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
              >
                View Full Report
              </button>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 5. RECOMMENDED FOR YOU (Curated Gallery)                     */}
        {/* Header with "View all >", 4 Column Grid with Heart & CTA     */}
        {/* ============================================================ */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Recommended for You
            </h2>
            <button
              onClick={() => navigateService("/explore")}
              className="flex items-center gap-1 text-xs font-black text-primary hover:text-amber-300 transition-colors uppercase tracking-wider"
            >
              <span>View all</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HAIRSTYLES.slice(0, 4).map((style, index) => {
              const isSaved = !!savedLooks[style.id];
              return (
                <div
                  key={style.id}
                  onClick={() => {
                    setSelectedStyleIndex(index);
                    window.scrollTo({ top: 600, behavior: "smooth" });
                  }}
                  className="group rounded-3xl bg-surface border border-border hover:border-primary/80 p-4 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 hover:-translate-y-1 shadow-lg hover:shadow-xl hover:shadow-amber-500/10"
                >
                  {/* Portrait Image Container */}
                  <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-surfaceDark border border-border/80">
                    <img
                      src={style.modelImage}
                      alt={style.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Floating Heart / Bookmark Icon Button */}
                    <button
                      onClick={(e) => toggleSave(style.id, e)}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                      title={isSaved ? "Remove from favorites" : "Save look"}
                    >
                      <Heart
                        size={16}
                        className={
                          isSaved ? "text-primary fill-primary" : "text-white"
                        }
                      />
                    </button>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-base font-black text-white group-hover:text-primary transition-colors">
                      Signature Look {index + 1}
                    </h3>
                    <p className="text-xs text-textMuted mt-0.5 font-medium">
                      {style.name}
                    </p>
                  </div>

                  {/* Outlined Amber "View details" Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStyleIndex(index);
                      window.scrollTo({ top: 600, behavior: "smooth" });
                    }}
                    className="w-full border border-primary/80 hover:border-primary bg-transparent hover:bg-primary/10 text-primary font-black text-xs py-3 rounded-xl transition-all active:scale-95 text-center"
                  >
                    View details
                  </button>
                </div>
              );
            })}
          </div>
        </section>

      </div>

      <SurveyPopup visible={showSurvey} onClose={() => setShowSurvey(false)} />
    </div>
  );
};

export default HomePage;
