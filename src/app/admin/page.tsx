"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FaLock,
  FaCalendarAlt,
  FaEnvelopeOpenText,
  FaSignOutAlt,
  FaPlus,
  FaTrash,
  FaCheck,
  FaEdit,
  FaTools,
  FaSave,
  FaImage,
  FaVideo,
  FaCheckCircle,
  FaTimes,
} from "react-icons/fa";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

/* ───────────────────── INTERFACES ───────────────────── */

interface PrayerRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  resolved: boolean;
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  desc: string;
  type: string;
}

interface SiteContent {
  heroTitle: string;
  heroSubtitle: string;
  heroParagraph: string;
  aboutTitle: string;
  aboutParagraph: string;
  mission: string;
  vision: string;
  pastorBio: string;
  pastorQuote: string;
  statsSouls: number;
  statsMembers: number;
  statsYears: number;
  statsProjects: number;
  sundayTime: string;
  wednesdayTime: string;
  fridayTime: string;
  pastorName: string;
  pastorImage: string;
}

interface GalleryItem {
  id: string;
  src: string;
  title: string;
  cat: string;
}

interface SermonItem {
  id: string;
  title: string;
  speaker: string;
  date: string;
  embed: string;
  category: string;
}

/* ───────────────────── DEFAULTS ───────────────────── */

const DEFAULT_CONTENT: SiteContent = {
  heroTitle: "HALL OF FAITH",
  heroSubtitle: "A Place Where Faith Comes Alive",
  heroParagraph:
    "Transforming Lives Through the Word, Worship, Prayer and the Power of Jesus Christ.",
  aboutTitle: "Raising Believers to Dominate, Impact, & Transform Generations",
  aboutParagraph:
    "Hall of Faith is a vibrant, family-oriented parish of The Redeemed Christian Church of God dedicated to raising believers who walk in faith, purpose, holiness, and kingdom influence. We believe in the potency of the Word, the intimacy of Worship, and the prevailing power of Prayer.",
  mission:
    "To bring people into a life-transforming relationship with Jesus Christ, equipping them to discover and manifest their divine destiny.",
  vision:
    "Building a global community of strong believers empowered to impact generations through faith, excellence, holiness, and community service.",
  pastorBio:
    "Pastor Abraham Okoye is a visionary leader called to empower generations and build faith in the heart of people. With a deep passion for prayer and an unwavering commitment to holiness, he leads the flock of RCCG Hall of Faith into experiencing the daily miracles and sovereignty of God.",
  pastorQuote:
    "God is not looking for gold vessels or silver vessels; He is looking for yielded vessels that will move when He moves.",
  statsSouls: 1200,
  statsMembers: 850,
  statsYears: 15,
  statsProjects: 24,
  sundayTime: "8:00 AM",
  wednesdayTime: "Wednesday 6:00 PM",
  fridayTime: "Friday 6:00 PM",
  pastorName: "Pastor Abraham Okoye",
  pastorImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200",
};

const DEFAULT_GALLERY: GalleryItem[] = [
  { id: "g1", src: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=1200", title: "Worship Moments", cat: "Worship" },
  { id: "g2", src: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200", title: "Community Outreach", cat: "Outreach" },
  { id: "g3", src: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200", title: "Choir Ministration", cat: "Choir" },
  { id: "g4", src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200", title: "Youth Conference", cat: "Youth" },
  { id: "g5", src: "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1200", title: "Sunday Fellowship", cat: "Worship" },
  { id: "g6", src: "https://images.unsplash.com/photo-1489641493513-ba4ee84ccea9?q=80&w=1200", title: "Bible Study Fellowship", cat: "Bible" },
];

const DEFAULT_SERMONS: SermonItem[] = [
  {
    id: "s1",
    title: "Unshakable Faith in Trying Times",
    speaker: "Pastor Abraham Okoye",
    date: "June 21, 2026",
    embed: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    category: "Faith",
  },
  {
    id: "s2",
    title: "The Covenant of Worship",
    speaker: "Pastor Abraham Okoye",
    date: "June 14, 2026",
    embed: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    category: "Worship",
  },
  {
    id: "s3",
    title: "Understanding Kingdom Influence",
    speaker: "Pastor Abraham Okoye",
    date: "June 07, 2026",
    embed: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    category: "Influence",
  },
];

type TabKey = "prayers" | "events" | "content" | "gallery" | "sermons";

/* ───────────────────── TOAST COMPONENT ───────────────────── */

function SaveToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-8 right-8 z-[100] animate-slideUp">
      <div className="flex items-center gap-3 px-6 py-4 bg-emerald-500 text-white rounded-2xl shadow-2xl shadow-emerald-500/30 font-semibold text-sm">
        <FaCheckCircle className="text-lg" />
        {message}
        <button onClick={onClose} className="ml-2 hover:text-white/70 transition-colors">
          <FaTimes />
        </button>
      </div>
    </div>
  );
}

/* ───────────────────── SAVE BUTTON COMPONENT ───────────────────── */

function SaveButton({ onClick, label }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98]"
    >
      <FaSave /> {label || "Save Changes"}
    </button>
  );
}

/* ───────────────────── INPUT HELPERS ───────────────────── */

const inputClass =
  "w-full bg-[#07122D] border border-white/10 focus:border-[#D4AF37] outline-none text-white rounded-xl px-4 py-2.5 text-xs transition-all";
const labelClass = "text-[10px] uppercase tracking-wider text-white/50 font-semibold";

/* ═══════════════════════════════════════════════════════════
   MAIN ADMIN DASHBOARD
   ═══════════════════════════════════════════════════════════ */

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState<TabKey>("prayers");

  /* ── Toast ── */
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => setToast(msg), []);

  /* ── Prayers ── */
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);

  /* ── Events ── */
  const [events, setEvents] = useState<EventItem[]>([]);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", desc: "", type: "Special Service" });

  /* ── Site Content (committed + draft) ── */
  const [siteContent, setSiteContent] = useState<SiteContent>(DEFAULT_CONTENT);
    const [draftHero, setDraftHero] = useState({ heroTitle: "", heroSubtitle: "", heroParagraph: "" });
  const [draftAbout, setDraftAbout] = useState({ aboutTitle: "", aboutParagraph: "" });
  const [draftMVP, setDraftMVP] = useState({ mission: "", vision: "", pastorBio: "", pastorQuote: "", pastorName: "", pastorImage: "" });
  const [draftStats, setDraftStats] = useState({
    statsSouls: 0, statsMembers: 0, statsYears: 0, statsProjects: 0,
    sundayTime: "", wednesdayTime: "", fridayTime: "",
  });

  /* ── Gallery (committed + new-form) ── */
  const [gallery, setGallery] = useState<GalleryItem[]>(DEFAULT_GALLERY);
  const [newPhoto, setNewPhoto] = useState({ src: "", title: "", cat: "Worship" });

  /* ── Sermons (committed + new-form) ── */
  const [sermons, setSermons] = useState<SermonItem[]>(DEFAULT_SERMONS);
  const [newSermon, setNewSermon] = useState({ title: "", speaker: "Pastor Abraham Okoye", date: "", embed: "", category: "Faith" });

  const [dragOverGallery, setDragOverGallery] = useState(false);
  const [dragOverPastor, setDragOverPastor] = useState(false);

  const handleGalleryFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const img = document.createElement("img");
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
            setNewPhoto((prev) => ({ ...prev, src: dataUrl }));
          }
        };
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePastorFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const img = document.createElement("img");
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
            setDraftMVP((prev) => ({ ...prev, pastorImage: dataUrl }));
          }
        };
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  /* ══════════════════════ LOAD FROM FIRESTORE ══════════════════════ */

  useEffect(() => {
    const loadFromFirestore = async () => {
      try {
        // Prayers
        const prayersSnap = await getDoc(doc(db, "site", "prayers"));
        if (prayersSnap.exists()) setPrayers(prayersSnap.data().items || []);

        // Events
        const eventsSnap = await getDoc(doc(db, "site", "events"));
        if (eventsSnap.exists()) setEvents(eventsSnap.data().items || []);

        // Site Content
        const contentSnap = await getDoc(doc(db, "site", "content"));
        if (contentSnap.exists()) {
          const parsed = contentSnap.data() as SiteContent;
          setSiteContent(parsed);
          syncDraftsFromContent(parsed);
        } else {
          await setDoc(doc(db, "site", "content"), DEFAULT_CONTENT);
          syncDraftsFromContent(DEFAULT_CONTENT);
        }

        // Gallery
        const gallerySnap = await getDoc(doc(db, "site", "gallery"));
        if (gallerySnap.exists()) {
          setGallery(gallerySnap.data().items || []);
        } else {
          await setDoc(doc(db, "site", "gallery"), { items: DEFAULT_GALLERY });
        }

        // Sermons
        const sermonsSnap = await getDoc(doc(db, "site", "sermons"));
        if (sermonsSnap.exists()) {
          setSermons(sermonsSnap.data().items || []);
        } else {
          await setDoc(doc(db, "site", "sermons"), { items: DEFAULT_SERMONS });
        }
      } catch (error) {
        console.error("Error loading from Firestore:", error);
      }

      // Auth
      if (sessionStorage.getItem("hof_admin_auth") === "true") {
        setIsAuthenticated(true);
      }
    };
    loadFromFirestore();
  }, []);

  /* ── Helper to sync all drafts from a SiteContent object ── */
  function syncDraftsFromContent(c: SiteContent) {
    setDraftHero({ heroTitle: c.heroTitle, heroSubtitle: c.heroSubtitle, heroParagraph: c.heroParagraph });
    setDraftAbout({ aboutTitle: c.aboutTitle, aboutParagraph: c.aboutParagraph });
    setDraftMVP({
      mission: c.mission,
      vision: c.vision,
      pastorBio: c.pastorBio,
      pastorQuote: c.pastorQuote,
      pastorName: c.pastorName || "",
      pastorImage: c.pastorImage || "",
    });
    setDraftStats({
      statsSouls: c.statsSouls, statsMembers: c.statsMembers, statsYears: c.statsYears, statsProjects: c.statsProjects,
      sundayTime: c.sundayTime, wednesdayTime: c.wednesdayTime, fridayTime: c.fridayTime,
    });
  }

  /* ══════════════════════ AUTH ══════════════════════ */

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin") {
      setIsAuthenticated(true);
      sessionStorage.setItem("hof_admin_auth", "true");
      setLoginError("");
    } else {
      setLoginError("Invalid password credentials.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("hof_admin_auth");
  };

  /* ══════════════════════ PRAYERS ══════════════════════ */

  const handleResolvePrayer = async (id: string) => {
    const updated = prayers.map((p) => (p.id === id ? { ...p, resolved: !p.resolved } : p));
    setPrayers(updated);
    await setDoc(doc(db, "site", "prayers"), { items: updated });
  };

  const handleDeletePrayer = async (id: string) => {
    const updated = prayers.filter((p) => p.id !== id);
    setPrayers(updated);
    await setDoc(doc(db, "site", "prayers"), { items: updated });
  };

  /* ══════════════════════ EVENTS ══════════════════════ */

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.desc) return;
    const item: EventItem = { id: Date.now().toString(), ...newEvent };
    const updated = [...events, item];
    setEvents(updated);
    await setDoc(doc(db, "site", "events"), { items: updated });
    setNewEvent({ title: "", date: "", desc: "", type: "Special Service" });
    showToast("Event created successfully!");
  };

  const handleDeleteEvent = async (id: string) => {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    await setDoc(doc(db, "site", "events"), { items: updated });
  };

  /* ══════════════════════ SAVE CONTENT SECTIONS ══════════════════════ */

  const saveHero = async () => {
    const updated = { ...siteContent, ...draftHero };
    setSiteContent(updated);
    await setDoc(doc(db, "site", "content"), updated);
    showToast("Hero & Branding section saved!");
  };

  const saveAbout = async () => {
    const updated = { ...siteContent, ...draftAbout };
    setSiteContent(updated);
    await setDoc(doc(db, "site", "content"), updated);
    showToast("About Us section saved!");
  };

  const saveMVP = async () => {
    const updated = { ...siteContent, ...draftMVP };
    try {
      await setDoc(doc(db, "site", "content"), updated);
      setSiteContent(updated);
      showToast("Mission, Vision & Pastor saved!");
    } catch (error) {
      console.error(error);
      alert("Error saving to database. Please try again.");
    }
  };

  const saveStats = async () => {
    const updated = { ...siteContent, ...draftStats };
    setSiteContent(updated);
    await setDoc(doc(db, "site", "content"), updated);
    showToast("Counters & Service Timings saved!");
  };

  /* ══════════════════════ GALLERY MANAGEMENT ══════════════════════ */

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoto.src || !newPhoto.title) return;
    const item: GalleryItem = { id: Date.now().toString(), ...newPhoto };
    const updated = [...gallery, item];
    try {
      await setDoc(doc(db, "site", "gallery"), { items: updated });
      setGallery(updated);
      setNewPhoto({ src: "", title: "", cat: "Worship" });
      showToast("Photo added to gallery!");
    } catch (error) {
      console.error(error);
      alert("Error saving photo. The image might be too large for the database.");
    }
  };

  const handleDeletePhoto = async (id: string) => {
    const updated = gallery.filter((g) => g.id !== id);
    setGallery(updated);
    await setDoc(doc(db, "site", "gallery"), { items: updated });
    showToast("Photo removed from gallery.");
  };

  /* ══════════════════════ SERMONS MANAGEMENT ══════════════════════ */

  const handleAddSermon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSermon.title || !newSermon.embed) return;
    const item: SermonItem = { id: Date.now().toString(), ...newSermon };
    const updated = [item, ...sermons]; // Newest first
    setSermons(updated);
    await setDoc(doc(db, "site", "sermons"), { items: updated });
    setNewSermon({ title: "", speaker: "Pastor Abraham Okoye", date: "", embed: "", category: "Faith" });
    showToast("Sermon/Video added successfully!");
  };

  const handleDeleteSermon = async (id: string) => {
    const updated = sermons.filter((s) => s.id !== id);
    setSermons(updated);
    await setDoc(doc(db, "site", "sermons"), { items: updated });
    showToast("Sermon/Video removed.");
  };

  /* ══════════════════════ TAB CONFIG ══════════════════════ */

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "prayers", label: "Prayer Requests", icon: <FaEnvelopeOpenText />, count: prayers.length },
    { key: "events", label: "Church Events", icon: <FaCalendarAlt />, count: events.length },
    { key: "content", label: "Edit Site Sections", icon: <FaTools /> },
    { key: "gallery", label: "Gallery Manager", icon: <FaImage />, count: gallery.length },
    { key: "sermons", label: "Sermons & Videos", icon: <FaVideo />, count: sermons.length },
  ];

  /* ══════════════════════ LOGIN SCREEN ══════════════════════ */

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07122D] flex items-center justify-center p-6">
        <div className="glass-panel max-w-md w-full rounded-3xl p-8 border border-[#D4AF37]/30 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#D4AF37]/15 flex items-center justify-center text-2xl text-[#D4AF37] border border-[#D4AF37]/35 mx-auto animate-pulse">
            <FaLock />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-cinzel text-white">HOF Portal</h1>
            <p className="text-xs text-[#D4AF37] uppercase tracking-widest font-semibold mt-1">
              Admin Gateway Authorization
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-white/60 font-semibold">
                Passcode
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-[#07122D]/80 border border-[#D4AF37]/20 focus:border-[#D4AF37] outline-none text-white rounded-xl px-5 py-3 text-sm transition-all"
              />
            </div>

            {loginError && <p className="text-xs text-red-400 font-semibold">{loginError}</p>}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#FFF099] text-[#07122D] font-extrabold uppercase tracking-wider rounded-xl hover:shadow-lg transition-all"
            >
              Sign In
            </button>
          </form>
          <p className="text-[10px] text-white/30">Default passcode is admin</p>
        </div>
      </div>
    );
  }

  /* ══════════════════════ DASHBOARD ══════════════════════ */

  return (
    <div className="min-h-screen bg-[#07122D] text-white p-6 md:p-12 font-poppins">
      {/* Toast notification */}
      {toast && <SaveToast message={toast} onClose={() => setToast(null)} />}

      {/* Custom animation style for toast */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.35s ease-out; }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#D4AF37]/20 pb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-wider font-cinzel">
              Admin Control Panel
            </h1>
            <p className="text-sm text-[#D4AF37] uppercase tracking-widest font-semibold mt-1">
              RCCG Hall of Faith Management
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 border border-red-500/30 hover:bg-red-500 hover:text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all"
          >
            <FaSignOutAlt /> Sign Out
          </button>
        </div>

        {/* ── Tab Selector ── */}
        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
                activeTab === tab.key
                  ? "bg-[#D4AF37] text-[#07122D] border-[#D4AF37]"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              {tab.icon} {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === tab.key ? "bg-[#07122D]/20 text-[#07122D]" : "bg-white/10 text-white/60"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ═══════════════ PRAYERS TAB ═══════════════ */}
        {activeTab === "prayers" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-cinzel text-[#D4AF37]">Submitted Prayer Requests</h2>
            {prayers.length === 0 ? (
              <div className="glass-panel p-12 text-center rounded-3xl border border-white/10 text-white/50 text-sm">
                No prayer requests received yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {prayers.map((prayer) => (
                  <div
                    key={prayer.id}
                    className={`glass-panel p-6 rounded-2xl border transition-all ${
                      prayer.resolved ? "border-emerald-500/30 opacity-70" : "border-[#D4AF37]/20"
                    } flex flex-col md:flex-row justify-between gap-6`}
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm font-bold text-[#D4AF37]">{prayer.name}</span>
                        <span className="text-xs text-white/50">{prayer.email} &bull; {prayer.phone}</span>
                        <span className="text-[10px] text-white/40">{prayer.date}</span>
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed font-light">
                        &ldquo;{prayer.message}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      <button
                        onClick={() => handleResolvePrayer(prayer.id)}
                        className={`p-3 rounded-full transition-all ${
                          prayer.resolved
                            ? "bg-emerald-500 text-white"
                            : "bg-white/5 text-white/60 hover:bg-emerald-500/20"
                        }`}
                        title={prayer.resolved ? "Mark Unresolved" : "Mark Resolved"}
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={() => handleDeletePrayer(prayer.id)}
                        className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-all"
                        title="Delete Request"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ EVENTS TAB ═══════════════ */}
        {activeTab === "events" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Events List */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold font-cinzel text-[#D4AF37]">Active Event Timeline</h2>
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="glass-panel p-6 rounded-2xl border border-[#D4AF37]/15 flex justify-between items-center gap-6"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs uppercase tracking-wider text-[#D4AF37] font-semibold">
                          {event.type}
                        </span>
                        <span className="text-xs text-white/40">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <h4 className="font-bold text-white font-cinzel">{event.title}</h4>
                      <p className="text-xs text-white/65 font-light">{event.desc}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-all"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Event Form */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-[#D4AF37]/20 space-y-6">
              <h3 className="text-lg font-bold font-cinzel text-white flex items-center gap-2">
                <FaPlus className="text-[#D4AF37] text-sm" /> Add New Event
              </h3>

              <form onSubmit={handleAddEvent} className="space-y-4">
                <div className="space-y-1">
                  <label className={labelClass}>Title</label>
                  <input
                    type="text"
                    required
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Supernatural Sunday..."
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Type</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                    className={inputClass}
                  >
                    <option value="Special Service">Special Service</option>
                    <option value="Conference">Conference</option>
                    <option value="Crusade">Crusade</option>
                    <option value="Vigil">Vigil</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Description</label>
                  <textarea
                    required
                    rows={4}
                    value={newEvent.desc}
                    onChange={(e) => setNewEvent({ ...newEvent, desc: e.target.value })}
                    placeholder="Provide details about the program..."
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#D4AF37] hover:bg-[#FFF099] text-[#07122D] font-bold uppercase tracking-wider text-xs rounded-xl transition-all"
                >
                  Create Event
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ═══════════════ EDIT SITE SECTIONS TAB ═══════════════ */}
        {activeTab === "content" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Section 1: Hero Settings */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-[#D4AF37]/15 space-y-4">
              <h3 className="text-lg font-bold font-cinzel text-[#D4AF37] flex items-center gap-2">
                <FaEdit /> 1. Hero & Branding
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className={labelClass}>Church Name</label>
                  <input
                    type="text"
                    value={draftHero.heroTitle}
                    onChange={(e) => setDraftHero({ ...draftHero, heroTitle: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Hero Subheading Tagline</label>
                  <input
                    type="text"
                    value={draftHero.heroSubtitle}
                    onChange={(e) => setDraftHero({ ...draftHero, heroSubtitle: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Hero Mission Paragraph</label>
                  <textarea
                    rows={2}
                    value={draftHero.heroParagraph}
                    onChange={(e) => setDraftHero({ ...draftHero, heroParagraph: e.target.value })}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
              <div className="pt-2">
                <SaveButton onClick={saveHero} label="Save Hero Section" />
              </div>
            </div>

            {/* Section 2: About Us Settings */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-[#D4AF37]/15 space-y-4">
              <h3 className="text-lg font-bold font-cinzel text-[#D4AF37] flex items-center gap-2">
                <FaEdit /> 2. About Us Details
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className={labelClass}>Heading</label>
                  <input
                    type="text"
                    value={draftAbout.aboutTitle}
                    onChange={(e) => setDraftAbout({ ...draftAbout, aboutTitle: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Description Paragraph</label>
                  <textarea
                    rows={4}
                    value={draftAbout.aboutParagraph}
                    onChange={(e) => setDraftAbout({ ...draftAbout, aboutParagraph: e.target.value })}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
              <div className="pt-2">
                <SaveButton onClick={saveAbout} label="Save About Section" />
              </div>
            </div>

            {/* Section 3: Mission, Vision & Pastor settings */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-[#D4AF37]/15 space-y-4">
              <h3 className="text-lg font-bold font-cinzel text-[#D4AF37] flex items-center gap-2">
                <FaEdit /> 3. Mission / Vision & Pastor Profile
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className={labelClass}>Pastor&apos;s Name</label>
                  <input
                    type="text"
                    value={draftMVP.pastorName}
                    onChange={(e) => setDraftMVP({ ...draftMVP, pastorName: e.target.value })}
                    className={inputClass}
                    placeholder="Pastor Abraham Okoye"
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Pastor&apos;s Photo</label>
                  {draftMVP.pastorImage ? (
                    <div className="relative rounded-xl overflow-hidden border border-[#D4AF37]/30 bg-[#0A1E5E]/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={draftMVP.pastorImage} alt="Pastor Preview" className="w-full h-36 object-cover" />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                        <label className="px-3 py-1.5 bg-[#D4AF37] hover:bg-[#FFF099] text-[#07122D] rounded-lg text-xs font-semibold cursor-pointer uppercase tracking-wider transition-all">
                          Change
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handlePastorFileSelect(file);
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setDraftMVP((prev) => ({ ...prev, pastorImage: "" }))}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverPastor(true);
                      }}
                      onDragLeave={() => setDragOverPastor(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOverPastor(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handlePastorFileSelect(file);
                      }}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                        dragOverPastor
                          ? "border-[#D4AF37] bg-[#D4AF37]/10"
                          : "border-white/10 hover:border-[#D4AF37]/40 bg-[#07122D]"
                      }`}
                    >
                      <label className="cursor-pointer block space-y-2">
                        <FaImage className="mx-auto text-2xl text-white/40" />
                        <span className="block text-xs font-medium text-white/70">
                          Drag & drop pastor photo, or <span className="text-[#D4AF37] underline">browse</span>
                        </span>
                        <span className="block text-[10px] text-white/30">PNG, JPG up to 5MB</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePastorFileSelect(file);
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Or Paste Pastor Photo URL</label>
                  <input
                    type="text"
                    value={draftMVP.pastorImage.startsWith("data:") ? "" : draftMVP.pastorImage}
                    onChange={(e) => setDraftMVP({ ...draftMVP, pastorImage: e.target.value })}
                    className={inputClass}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Mission Statement</label>
                  <textarea
                    rows={2}
                    value={draftMVP.mission}
                    onChange={(e) => setDraftMVP({ ...draftMVP, mission: e.target.value })}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Vision Statement</label>
                  <textarea
                    rows={2}
                    value={draftMVP.vision}
                    onChange={(e) => setDraftMVP({ ...draftMVP, vision: e.target.value })}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Pastor Biography</label>
                  <textarea
                    rows={4}
                    value={draftMVP.pastorBio}
                    onChange={(e) => setDraftMVP({ ...draftMVP, pastorBio: e.target.value })}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Pastor Quote</label>
                  <input
                    type="text"
                    value={draftMVP.pastorQuote}
                    onChange={(e) => setDraftMVP({ ...draftMVP, pastorQuote: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="pt-2">
                <SaveButton onClick={saveMVP} label="Save Mission & Pastor" />
              </div>
            </div>

            {/* Section 4: Timings & Stats Counters */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-[#D4AF37]/15 space-y-4">
              <h3 className="text-lg font-bold font-cinzel text-[#D4AF37] flex items-center gap-2">
                <FaEdit /> 4. Counters & Service Timings
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Souls Won Counter</label>
                  <input
                    type="number"
                    value={draftStats.statsSouls}
                    onChange={(e) => setDraftStats({ ...draftStats, statsSouls: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Active Members Counter</label>
                  <input
                    type="number"
                    value={draftStats.statsMembers}
                    onChange={(e) => setDraftStats({ ...draftStats, statsMembers: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Years of Impact</label>
                  <input
                    type="number"
                    value={draftStats.statsYears}
                    onChange={(e) => setDraftStats({ ...draftStats, statsYears: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Community Projects</label>
                  <input
                    type="number"
                    value={draftStats.statsProjects}
                    onChange={(e) => setDraftStats({ ...draftStats, statsProjects: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#D4AF37]/10">
                <div className="space-y-1">
                  <label className={labelClass}>Sunday Service Timings</label>
                  <input
                    type="text"
                    value={draftStats.sundayTime}
                    onChange={(e) => setDraftStats({ ...draftStats, sundayTime: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Bible Study Timings</label>
                  <input
                    type="text"
                    value={draftStats.wednesdayTime}
                    onChange={(e) => setDraftStats({ ...draftStats, wednesdayTime: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Prayer Service Timings</label>
                  <input
                    type="text"
                    value={draftStats.fridayTime}
                    onChange={(e) => setDraftStats({ ...draftStats, fridayTime: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="pt-2">
                <SaveButton onClick={saveStats} label="Save Counters & Timings" />
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ GALLERY MANAGER TAB ═══════════════ */}
        {activeTab === "gallery" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Gallery Items */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold font-cinzel text-[#D4AF37]">
                Photo Gallery ({gallery.length} photos)
              </h2>

              {gallery.length === 0 ? (
                <div className="glass-panel p-12 text-center rounded-3xl border border-white/10 text-white/50 text-sm">
                  No photos in gallery yet. Add some using the form.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gallery.map((photo) => (
                    <div
                      key={photo.id}
                      className="glass-panel rounded-2xl overflow-hidden border border-[#D4AF37]/15 group relative"
                    >
                      <div className="relative h-48 w-full bg-[#0A1E5E]/30">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.src}
                          alt={photo.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%230A1E5E' width='400' height='200'/%3E%3Ctext fill='%23D4AF37' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='14'%3EImage Not Found%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-bold text-white">{photo.title}</h4>
                          <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">
                            {photo.cat}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-all text-xs"
                          title="Delete Photo"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Photo Form */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-[#D4AF37]/20 space-y-6">
              <h3 className="text-lg font-bold font-cinzel text-white flex items-center gap-2">
                <FaPlus className="text-[#D4AF37] text-sm" /> Add New Photo
              </h3>

              <form onSubmit={handleAddPhoto} className="space-y-4">
                <div className="space-y-1">
                  <label className={labelClass}>Upload Image</label>
                  {newPhoto.src ? (
                    <div className="relative rounded-xl overflow-hidden border border-[#D4AF37]/30 bg-[#0A1E5E]/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={newPhoto.src} alt="To Upload" className="w-full h-36 object-cover" />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                        <label className="px-3 py-1.5 bg-[#D4AF37] hover:bg-[#FFF099] text-[#07122D] rounded-lg text-xs font-semibold cursor-pointer uppercase tracking-wider transition-all">
                          Change
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleGalleryFileSelect(file);
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setNewPhoto((prev) => ({ ...prev, src: "" }))}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverGallery(true);
                      }}
                      onDragLeave={() => setDragOverGallery(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOverGallery(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleGalleryFileSelect(file);
                      }}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                        dragOverGallery
                          ? "border-[#D4AF37] bg-[#D4AF37]/10"
                          : "border-white/10 hover:border-[#D4AF37]/40 bg-[#07122D]"
                      }`}
                    >
                      <label className="cursor-pointer block space-y-2">
                        <FaImage className="mx-auto text-2xl text-white/40" />
                        <span className="block text-xs font-medium text-white/70">
                          Drag & drop a photo here, or <span className="text-[#D4AF37] underline">browse</span>
                        </span>
                        <span className="block text-[10px] text-white/30">PNG, JPG, GIF up to 5MB</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleGalleryFileSelect(file);
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Or Paste Image URL</label>
                  <input
                    type="text"
                    value={newPhoto.src.startsWith("data:") ? "" : newPhoto.src}
                    onChange={(e) => setNewPhoto({ ...newPhoto, src: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className={inputClass}
                  />
                  <p className="text-[9px] text-white/30 mt-1">
                    Paste a direct URL to an image instead
                  </p>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Photo Title</label>
                  <input
                    type="text"
                    required
                    value={newPhoto.title}
                    onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                    placeholder="Worship Night 2026..."
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Category</label>
                  <select
                    value={newPhoto.cat}
                    onChange={(e) => setNewPhoto({ ...newPhoto, cat: e.target.value })}
                    className={inputClass}
                  >
                    <option value="Worship">Worship</option>
                    <option value="Outreach">Outreach</option>
                    <option value="Choir">Choir</option>
                    <option value="Youth">Youth</option>
                    <option value="Bible">Bible</option>
                    <option value="Conference">Conference</option>
                    <option value="Vigil">Vigil</option>
                    <option value="Fellowship">Fellowship</option>
                  </select>
                </div>

                {/* Preview */}
                {newPhoto.src && (
                  <div className="rounded-xl overflow-hidden border border-[#D4AF37]/20 bg-[#0A1E5E]/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={newPhoto.src}
                      alt="Preview"
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <p className="text-[10px] text-center text-white/40 py-1">Preview</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-[#D4AF37] hover:bg-[#FFF099] text-[#07122D] font-bold uppercase tracking-wider text-xs rounded-xl transition-all"
                >
                  Add to Gallery
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ═══════════════ SERMONS & VIDEOS TAB ═══════════════ */}
        {activeTab === "sermons" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Sermons List */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold font-cinzel text-[#D4AF37]">
                Sermons & Videos ({sermons.length} entries)
              </h2>

              {sermons.length === 0 ? (
                <div className="glass-panel p-12 text-center rounded-3xl border border-white/10 text-white/50 text-sm">
                  No sermons/videos added yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {sermons.map((sermon) => (
                    <div
                      key={sermon.id}
                      className="glass-panel p-5 rounded-2xl border border-[#D4AF37]/15 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Video thumbnail preview */}
                        <div className="hidden sm:block w-32 h-20 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-[#0A1E5E]/30">
                          <iframe
                            src={sermon.embed}
                            title={sermon.title}
                            className="w-full h-full pointer-events-none"
                            tabIndex={-1}
                          />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">
                            {sermon.category}
                          </span>
                          <h4 className="font-bold text-white font-poppins text-sm truncate">
                            {sermon.title}
                          </h4>
                          <p className="text-[11px] text-white/50">
                            {sermon.speaker} &bull; {sermon.date}
                          </p>
                          <p className="text-[9px] text-white/30 truncate">{sermon.embed}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteSermon(sermon.id)}
                        className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-all flex-shrink-0"
                        title="Delete Sermon"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Sermon/Video Form */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-[#D4AF37]/20 space-y-6">
              <h3 className="text-lg font-bold font-cinzel text-white flex items-center gap-2">
                <FaPlus className="text-[#D4AF37] text-sm" /> Add New Sermon / Video
              </h3>

              <form onSubmit={handleAddSermon} className="space-y-4">
                <div className="space-y-1">
                  <label className={labelClass}>Sermon Title</label>
                  <input
                    type="text"
                    required
                    value={newSermon.title}
                    onChange={(e) => setNewSermon({ ...newSermon, title: e.target.value })}
                    placeholder="The Power of Covenant..."
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Speaker</label>
                  <input
                    type="text"
                    value={newSermon.speaker}
                    onChange={(e) => setNewSermon({ ...newSermon, speaker: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Date</label>
                  <input
                    type="text"
                    value={newSermon.date}
                    onChange={(e) => setNewSermon({ ...newSermon, date: e.target.value })}
                    placeholder="June 29, 2026"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>YouTube Embed URL</label>
                  <input
                    type="url"
                    required
                    value={newSermon.embed}
                    onChange={(e) => setNewSermon({ ...newSermon, embed: e.target.value })}
                    placeholder="https://www.youtube.com/embed/..."
                    className={inputClass}
                  />
                  <p className="text-[9px] text-white/30 mt-1">
                    Use the embed URL format: youtube.com/embed/VIDEO_ID
                  </p>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Category</label>
                  <select
                    value={newSermon.category}
                    onChange={(e) => setNewSermon({ ...newSermon, category: e.target.value })}
                    className={inputClass}
                  >
                    <option value="Faith">Faith</option>
                    <option value="Worship">Worship</option>
                    <option value="Influence">Influence</option>
                    <option value="Prayer">Prayer</option>
                    <option value="Holiness">Holiness</option>
                    <option value="Prophecy">Prophecy</option>
                    <option value="Healing">Healing</option>
                    <option value="Livestream">Livestream</option>
                  </select>
                </div>

                {/* Embed Preview */}
                {newSermon.embed && (
                  <div className="rounded-xl overflow-hidden border border-[#D4AF37]/20 bg-[#0A1E5E]/20 aspect-video">
                    <iframe
                      src={newSermon.embed}
                      title="Preview"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-[#D4AF37] hover:bg-[#FFF099] text-[#07122D] font-bold uppercase tracking-wider text-xs rounded-xl transition-all"
                >
                  Add Sermon / Video
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
