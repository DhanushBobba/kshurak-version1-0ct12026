import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass,
  Search,
  Filter,
  Sparkles,
  Camera,
  Star,
  CheckCircle2,
  Sliders,
  Scissors,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Oval Face", "Square Face", "Round Face", "Heart Face", "Diamond Face"];

  const catalog = [
    {
      id: "1",
      title: "Textured Crop & Low Fade",
      category: "Oval Face",
      image: "/assets/images/style1.png",
      difficulty: "Low Maintenance",
      rating: 4.9,
      tags: ["Modern", "Casual", "Short"],
      description: "Blunt cut fringe with chopped layers on top and clean low skin taper. Ideal for balancing facial symmetry.",
    },
    {
      id: "2",
      title: "Curly Taper & Mid Drop Fade",
      category: "Square Face",
      image: "/assets/images/style2.png",
      difficulty: "Medium Maintenance",
      rating: 4.85,
      tags: ["Curly", "Textured", "Dynamic"],
      description: "Enhances natural curly texture while tapering the temple and neckline to soften sharp jawlines.",
    },
    {
      id: "3",
      title: "Executive Side Part & Clean Taper",
      category: "Round Face",
      image: "/assets/images/style3.png",
      difficulty: "Medium Maintenance",
      rating: 4.95,
      tags: ["Classic", "Professional", "Timeless"],
      description: "Structured comb-over with defined hard part line. Adds vertical height to elongate rounded contours.",
    },
    {
      id: "4",
      title: "Ultra Clean Military Buzz Cut",
      category: "Diamond Face",
      image: "/assets/images/style4.png",
      difficulty: "Very Low Maintenance",
      rating: 4.8,
      tags: ["Athletic", "Minimalist", "Sharp"],
      description: "Uniform close-cropped length that highlights high cheekbones and sculpted skull lines.",
    },
    {
      id: "5",
      title: "Voluminous Modern Pompadour",
      category: "Oval Face",
      image: "/assets/images/style5.png",
      difficulty: "High Maintenance",
      rating: 4.92,
      tags: ["Executive", "Voluminous", "Statement"],
      description: "High swept frontal quiff paired with tight burst fade along the ear contour for maximum presence.",
    },
    {
      id: "6",
      title: "Disconnected Undercut Quiff",
      category: "Heart Face",
      image: "/assets/images/style6.png",
      difficulty: "Medium Maintenance",
      rating: 4.88,
      tags: ["Edgy", "High-Fade", "Versatile"],
      description: "Contrasts long layered crown hair with high skin clip to offset narrower chin lines.",
    },
  ];

  const filtered = catalog.filter((item) => {
    const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-wider mb-1">
            <Compass size={14} />
            Hairstyle Intelligence Library
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Explore Hairstyle Directory</h1>
          <p className="text-xs text-textSecondary mt-1">
            Search our curated biometric taxonomy indexed by facial morphology and styling difficulty
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate("/scanner")}
            icon={<Camera size={16} />}
          >
            Scan Face For Matches
          </Button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
          <input
            type="text"
            placeholder="Search cut, style, texture or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-textMuted focus:outline-none focus:border-primary"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-black shadow-md shadow-amber-500/20"
                  : "bg-surface border border-border text-textSecondary hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <Card
            key={item.id}
            variant="surface"
            hoverEffect
            className="p-0 border-border overflow-hidden flex flex-col justify-between group shadow-xl"
          >
            <div>
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-surfaceDark">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-black text-primary uppercase">
                  {item.category}
                </div>
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white flex items-center gap-1">
                  <Star size={11} className="text-primary fill-primary" /> {item.rating}
                </div>
              </div>

              <div className="p-5 space-y-3">
                <h3 className="text-base font-black text-white group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-textSecondary leading-relaxed line-clamp-2">
                  {item.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-semibold text-textMuted bg-surfaceDark border border-border px-2 py-0.5 rounded-md"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate("/tryon")}
              >
                Virtual Try-On
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="w-full text-xs font-black"
                onClick={() => navigate("/scanner")}
              >
                Check Fit
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ExplorePage;
