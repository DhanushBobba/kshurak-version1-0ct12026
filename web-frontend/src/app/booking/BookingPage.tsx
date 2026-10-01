import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Star,
  Scissors,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";

interface Barber {
  id: string;
  name: string;
  shop: string;
  location: string;
  rating: number;
  reviews: number;
  specialty: string;
  image: string;
  price: string;
}

export const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const barbers: Barber[] = [
    {
      id: "1",
      name: "Marcus Vance",
      shop: "Apex Geometry Grooming Lounge",
      location: "Downtown • 1.2 miles",
      rating: 4.95,
      reviews: 142,
      specialty: "Precision Tapers & Skull Contouring",
      image: "/assets/images/style1.png",
      price: "$45",
    },
    {
      id: "2",
      name: "Elias Thorne",
      shop: "Atelier Barber & Co.",
      location: "Arts District • 2.5 miles",
      rating: 4.92,
      reviews: 98,
      specialty: "Textured Crops & Beard Architecture",
      image: "/assets/images/style2.png",
      price: "$50",
    },
    {
      id: "3",
      name: "Kenji Sato",
      shop: "Kshurak Certified Studio",
      location: "Midtown • 3.1 miles",
      rating: 4.98,
      reviews: 215,
      specialty: "Scissor Work & Biometric Flow Cuts",
      image: "/assets/images/style5.png",
      price: "$60",
    },
  ];

  const services = [
    { id: "s1", name: "AI Geometry Haircut", duration: "45 min", price: "$45", desc: "Cut executed precisely according to your Kshurak facial measurement report" },
    { id: "s2", name: "Haircut & Beard Sculpt", duration: "60 min", price: "$65", desc: "Complete head and facial hair styling tailored to jawline geometry" },
    { id: "s3", name: "Scalp Health Detox", duration: "30 min", price: "$35", desc: "Clarifying treatment matched to your survey sensitivity profile" },
  ];

  const [selectedBarber, setSelectedBarber] = useState<Barber>(barbers[0]);
  const [selectedService, setSelectedService] = useState(services[0].id);
  const [selectedDate, setSelectedDate] = useState("Tomorrow, 10:30 AM");
  const [confirmedModal, setConfirmedModal] = useState(false);

  const dates = [
    "Today, 3:00 PM",
    "Today, 5:30 PM",
    "Tomorrow, 10:30 AM",
    "Tomorrow, 2:00 PM",
    "Tomorrow, 4:30 PM",
    "Friday, 11:00 AM",
  ];

  const handleBooking = () => {
    if (!user) {
      if (confirm("Please login to confirm your appointment.")) {
        navigate("/auth/login");
      }
      return;
    }
    setConfirmedModal(true);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-wider mb-1">
            <Scissors size={14} />
            Verified Network
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Book Barber Appointment</h1>
          <p className="text-xs text-textSecondary mt-1">
            Direct your Kshurak AI facial specifications to certified precision barbers in your area
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <ShieldCheck size={16} /> Certified Precision Barbers
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= LEFT COLUMN: Barber & Service Selection ================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* Barbers list */}
          <Card variant="surface" className="p-6 border-border space-y-4">
            <h3 className="text-sm font-black text-primary uppercase tracking-wider">
              1. Select Certified Master Barber
            </h3>

            <div className="space-y-3">
              {barbers.map((barber) => {
                const isSelected = selectedBarber.id === barber.id;
                return (
                  <div
                    key={barber.id}
                    onClick={() => setSelectedBarber(barber)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? "bg-surfaceLight border-primary shadow-lg shadow-amber-500/10"
                        : "bg-surfaceDark border-border hover:border-borderLight"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-border bg-surface shrink-0">
                        <img src={barber.image} alt={barber.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white">{barber.name}</h4>
                          <span className="flex items-center text-[11px] text-primary font-bold">
                            <Star size={12} className="fill-primary mr-1" /> {barber.rating}
                          </span>
                        </div>
                        <p className="text-xs text-textSecondary font-medium">{barber.shop}</p>
                        <p className="text-[11px] text-textMuted flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="text-primary" /> {barber.location} • {barber.specialty}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-primary">{barber.price}</span>
                      <span className="text-[10px] text-textMuted block">Base Cut</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Services list */}
          <Card variant="surface" className="p-6 border-border space-y-4">
            <h3 className="text-sm font-black text-primary uppercase tracking-wider">
              2. Select Haircut Service
            </h3>

            <div className="space-y-3">
              {services.map((srv) => {
                const isSelected = selectedService === srv.id;
                return (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedService(srv.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? "bg-surfaceLight border-primary"
                        : "bg-surfaceDark border-border hover:border-borderLight"
                    }`}
                  >
                    <div>
                      <h4 className={`text-sm font-black ${isSelected ? "text-primary" : "text-white"}`}>
                        {srv.name}
                      </h4>
                      <p className="text-xs text-textSecondary mt-0.5">{srv.desc}</p>
                      <span className="text-[11px] text-textMuted mt-1 inline-flex items-center gap-1">
                        <Clock size={11} /> {srv.duration}
                      </span>
                    </div>
                    <span className="text-sm font-black text-white font-mono">{srv.price}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* ================= RIGHT COLUMN: Time Slots & Summary ================= */}
        <div className="lg:col-span-5 space-y-6">
          <Card variant="surface" className="p-6 border-border space-y-5">
            <h3 className="text-sm font-black text-primary uppercase tracking-wider">
              3. Available Time Slots
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              {dates.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDate(d)}
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                    selectedDate === d
                      ? "bg-primary text-black border-primary font-black shadow-md shadow-amber-500/20"
                      : "bg-surfaceDark text-white border-border hover:bg-surfaceLight"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Booking Summary Card */}
            <div className="p-4 bg-surfaceDark rounded-2xl border border-border space-y-3 mt-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-textMuted">
                Reservation Summary
              </h4>

              <div className="flex items-center justify-between text-xs">
                <span className="text-textSecondary">Barber</span>
                <span className="font-bold text-white">{selectedBarber.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-textSecondary">Service</span>
                <span className="font-bold text-white">
                  {services.find((s) => s.id === selectedService)?.name}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-textSecondary">Scheduled Date</span>
                <span className="font-bold text-primary">{selectedDate}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                <span className="font-bold text-white">Attached Report</span>
                <span className="text-[11px] text-emerald-400 font-bold">
                  ✓ AI Facial Coordinates Attached
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full text-base font-black py-4 shadow-xl shadow-amber-500/20"
              onClick={handleBooking}
              icon={<Sparkles size={18} />}
            >
              CONFIRM APPOINTMENT
            </Button>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={confirmedModal} onClose={() => setConfirmedModal(false)}>
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 mx-auto flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white">Appointment Confirmed!</h3>
            <p className="text-xs text-textSecondary max-w-sm mx-auto">
              Your appointment with <span className="text-white font-bold">{selectedBarber.name}</span> for{" "}
              <span className="text-primary font-bold">{selectedDate}</span> has been confirmed. Your Kshurak AI facial specifications have been forwarded to the barber.
            </p>
          </div>

          <div className="pt-3">
            <Button
              variant="primary"
              size="md"
              className="w-full font-black"
              onClick={() => {
                setConfirmedModal(false);
                navigate("/profile/history");
              }}
            >
              VIEW IN ACTIVITY HISTORY
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BookingPage;
