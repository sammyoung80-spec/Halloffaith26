"use client";

import React, { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FaPlay,
  FaClock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaDonate,
  FaHandsHelping,
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaTwitter,
  FaTimes,
  FaCheckCircle,
  FaVolumeUp,
  FaBookOpen,
  FaQuoteLeft,
  FaWhatsapp,
  FaBars
} from "react-icons/fa";

gsap.registerPlugin(ScrollTrigger);

// ----------------------------------------------------
// DUMMY DATA FOR GALLERY, EVENTS, TESTIMONIALS & GIVING
// ----------------------------------------------------

const MINISTRIES = [
  {
    name: "Children's Church",
    desc: "Nurturing young minds in the love of Christ with sound biblical foundations.",
    color: "from-blue-600/30 to-purple-600/30",
  },
  {
    name: "Youth Ministry",
    desc: "Empowering teenagers and young adults to discover purpose and dominate for Christ.",
    color: "from-amber-600/30 to-red-600/30",
  },
  {
    name: "Women's Fellowship",
    desc: "A safe space for ladies to grow spiritually, support families, and make generational impact.",
    color: "from-pink-600/30 to-purple-600/30",
  },
  {
    name: "Men's Fellowship",
    desc: "Building strong men of integrity, faith, and leadership who model kingdom principles.",
    color: "from-emerald-600/30 to-teal-600/30",
  },
  {
    name: "Choir (Voice of Faith)",
    desc: "Leading the congregation into deep, cinematic worship and atmospheric praise.",
    color: "from-violet-600/30 to-indigo-600/30",
  },
  {
    name: "Evangelism Team",
    desc: "Spreading the gospel of Jesus Christ across Ojodu and beyond, winning souls to the kingdom.",
    color: "from-rose-600/30 to-orange-600/30",
  },
];

const TESTIMONIALS = [
  {
    name: "Sister Deborah Adelaja",
    title: "Miracle Childbirth",
    story: "After 7 years of waiting and medical diagnoses, the Senior Pastor prayed for me, declaring I would carry twins. Exactly nine months later, I delivered twin girls!",
    type: "Miracle",
  },
  {
    name: "Brother Kingsley Uche",
    title: "Salvation & Deliverance",
    story: "I came to Ojodu broken, addicted, and homeless. The community at Hall of Faith welcomed me. Today, I am clean, employed, and proudly serving in the choir.",
    type: "Salvation",
  },
  {
    name: "Sister Miracle Williams",
    title: "Instant Healing",
    story: "During the last Friday vigil, I had severe spine pain that required a brace. When the Pastor called out my case, I felt warm fire. I took off the brace and ran!",
    type: "Healing",
  },
];

const DEFAULT_GALLERY = [
  { id: "g1", src: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=1200", title: "Worship Moments", cat: "Worship" },
  { id: "g2", src: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200", title: "Community Outreach", cat: "Outreach" },
  { id: "g3", src: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200", title: "Choir Ministration", cat: "Choir" },
  { id: "g4", src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200", title: "Youth Conference", cat: "Youth" },
  { id: "g5", src: "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1200", title: "Sunday Fellowship", cat: "Worship" },
  { id: "g6", src: "https://images.unsplash.com/photo-1489641493513-ba4ee84ccea9?q=80&w=1200", title: "Bible Study Fellowship", cat: "Bible" },
];

const DEFAULT_SERMONS = [
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

const DEFAULT_CONTENT = {
  heroTitle: "HALL OF FAITH",
  heroSubtitle: "A Place Where Faith Comes Alive",
  heroParagraph: "Transforming Lives Through the Word, Worship, Prayer and the Power of Jesus Christ.",
  aboutTitle: "Raising Believers to Dominate, Impact, & Transform Generations",
  aboutParagraph: "Hall of Faith is a vibrant, family-oriented parish of The Redeemed Christian Church of God dedicated to raising believers who walk in faith, purpose, holiness, and kingdom influence. We believe in the potency of the Word, the intimacy of Worship, and the prevailing power of Prayer.",
  mission: "To bring people into a life-transforming relationship with Jesus Christ, equipping them to discover and manifest their divine destiny.",
  vision: "Building a global community of strong believers empowered to impact generations through faith, excellence, holiness, and community service.",
  pastorBio: "Pastor Abraham Okoye is a visionary leader called to empower generations and build faith in the heart of people. With a deep passion for prayer and an unwavering commitment to holiness, he leads the flock of RCCG Hall of Faith into experiencing the daily miracles and sovereignty of God.",
  pastorQuote: "God is not looking for gold vessels or silver vessels; He is looking for yielded vessels that will move when He moves.",
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

interface EventItem {
  id: string;
  title: string;
  date: string;
  desc: string;
  type: string;
}

export default function ChurchWebsite() {
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dynamic Content State
  const [siteContent, setSiteContent] = useState(DEFAULT_CONTENT);

  // Counter State
  const [animatedStats, setAnimatedStats] = useState([0, 0, 0, 0]);

  // Carousel & Modal States
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("All");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dynamic Event State
  const [events, setEvents] = useState<EventItem[]>([]);

  // Dynamic Gallery & Sermons state
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(DEFAULT_GALLERY);
  const [sermonsList, setSermonsList] = useState<SermonItem[]>(DEFAULT_SERMONS);

  // Giving & Prayer form States
  const [selectedGiving, setSelectedGiving] = useState<string | null>(null);
  const [showGivingModal, setShowGivingModal] = useState(false);
  const [prayerForm, setPrayerForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [prayerSuccess, setPrayerSuccess] = useState(false);

  // Countdown timer State
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  // Floating particles background effect on Hero canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles: Array<{ x: number; y: number; r: number; d: number; speed: number; opacity: number }> = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2.5 + 0.5,
        d: Math.random() * 60,
        speed: Math.random() * 0.4 + 0.1,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Gold Glow effects
      ctx.fillStyle = "rgba(212, 175, 55, 0.05)";
      ctx.beginPath();
      ctx.arc(width * 0.3, height * 0.3, 300, 0, Math.PI * 2);
      ctx.fill();

      // Light Beams effect
      const gradient = ctx.createLinearGradient(width / 2, 0, width / 2, height);
      gradient.addColorStop(0, "rgba(212, 175, 55, 0.1)");
      gradient.addColorStop(0.5, "rgba(10, 30, 94, 0.03)");
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 150, 0);
      ctx.lineTo(width / 2 + 150, 0);
      ctx.lineTo(width / 2 + 400, height);
      ctx.lineTo(width / 2 - 400, height);
      ctx.closePath();
      ctx.fill();

      // Render floating particles (simulating dust motes/light ray reflections)
      particles.forEach((p) => {
        ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        p.y -= p.speed;
        p.x += Math.sin(p.d) * 0.2;

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // GSAP scroll trigger for Stats counter
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: "#stats-section",
      start: "top 80%",
      onEnter: () => {
        const stats = [
          siteContent.statsSouls,
          siteContent.statsMembers,
          siteContent.statsYears,
          siteContent.statsProjects
        ];
        stats.forEach((target, index) => {
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 2.5,
            ease: "power2.out",
            onUpdate: () => {
              setAnimatedStats((prev) => {
                const next = [...prev];
                next[index] = Math.floor(obj.val);
                return next;
              });
            },
          });
        });
      },
    });

    return () => trigger.kill();
  }, [siteContent]);

  // Load and sync dynamic Events, Site Content, Gallery & Sermons state
  useEffect(() => {
    const loadFromFirestore = async () => {
      try {
        // Events
        const eventsSnap = await getDoc(doc(db, "site", "events"));
        if (eventsSnap.exists()) {
          setEvents(eventsSnap.data().items || []);
        } else {
          const defaultEvents = [
            {
              id: "1",
              title: "Supernatural Turnaround Conference",
              date: "2026-07-12T08:00:00",
              desc: "Three days of prophetic declarations, deliverance, and restoration. Join us!",
              type: "Conference",
            },
            {
              id: "2",
              title: "Worship & Miracle Night",
              date: "2026-07-24T18:00:00",
              desc: "An atmospheric night of pure worship, healing, and miraculous encounters with Jesus.",
              type: "Special Service",
            },
            {
              id: "3",
              title: "Ojodu Berger Mega Crusade",
              date: "2026-08-15T17:00:00",
              desc: "Reaching Ojodu-Berger with the light of the Gospel. Lives will be transformed.",
              type: "Crusade",
            },
          ];
          setEvents(defaultEvents);
          await setDoc(doc(db, "site", "events"), { items: defaultEvents });
        }

        // Site Content
        const contentSnap = await getDoc(doc(db, "site", "content"));
        if (contentSnap.exists()) {
          setSiteContent(contentSnap.data() as typeof DEFAULT_CONTENT);
        } else {
          await setDoc(doc(db, "site", "content"), DEFAULT_CONTENT);
        }

        // Gallery
        const gallerySnap = await getDoc(doc(db, "site", "gallery"));
        if (gallerySnap.exists()) {
          setGalleryItems(gallerySnap.data().items || []);
        } else {
          await setDoc(doc(db, "site", "gallery"), { items: DEFAULT_GALLERY });
        }

        // Sermons
        const sermonsSnap = await getDoc(doc(db, "site", "sermons"));
        if (sermonsSnap.exists()) {
          setSermonsList(sermonsSnap.data().items || []);
        } else {
          await setDoc(doc(db, "site", "sermons"), { items: DEFAULT_SERMONS });
        }
      } catch (error) {
        console.error("Error loading from Firestore:", error);
      }
    };

    loadFromFirestore();
  }, []);

  // Countdown timer logic
  useEffect(() => {
    if (events.length === 0) return;
    const targetDate = new Date(events[0].date).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference < 0) {
        clearInterval(interval);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown({ days, hours, mins, secs });
    }, 1000);

    return () => clearInterval(interval);
  }, [events]);

  const handlePrayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest = {
      id: Date.now().toString(),
      name: prayerForm.name,
      email: prayerForm.email,
      phone: prayerForm.phone,
      message: prayerForm.message,
      date: new Date().toLocaleDateString(),
      resolved: false,
    };

    try {
      const prayersSnap = await getDoc(doc(db, "site", "prayers"));
      const prayers = prayersSnap.exists() ? prayersSnap.data().items || [] : [];
      prayers.push(newRequest);
      await setDoc(doc(db, "site", "prayers"), { items: prayers });
    } catch (error) {
      console.error("Error saving prayer:", error);
    }

    setPrayerSuccess(true);
    setTimeout(() => {
      setPrayerForm({ name: "", email: "", phone: "", message: "" });
      setPrayerSuccess(false);
    }, 4000);
  };

  // Testimonial auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Filter gallery items – derive categories dynamically from the gallery data
  const galleryCats = Array.from(new Set(galleryItems.map((g) => g.cat)));
  const categories = ["All", ...galleryCats];
  const filteredGallery = galleryItems.filter((img) => activeTab === "All" || img.cat === activeTab);

  // Use dynamic sermons list from state
  const SERMONS_LIST = sermonsList;

  const SERVICE_TIMES_LIST = [
    {
      title: "Sunday Worship Service",
      time: siteContent.sundayTime,
      description: "Experience power, praise, and prophetic word that elevates your faith.",
      icon: FaVolumeUp,
    },
    {
      title: "Bible Study",
      time: siteContent.wednesdayTime,
      description: "Dig deep into the scripture, uncover truth, and gain kingdom wisdom.",
      icon: FaBookOpen,
    },
    {
      title: "Prayer Meeting",
      time: siteContent.fridayTime,
      description: "An hour of intense intercession, breaking limits, and divine encounters.",
      icon: FaHandsHelping,
    },
  ];

  return (
    <div className="relative min-h-screen selection:bg-[#D4AF37] selection:text-black">
      {/* ------------------ NAV BAR ------------------ */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 glass-panel border-b border-[#D4AF37]/10 py-4">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <a href="#hero" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Hall of Faith Logo"
              width={50}
              height={50}
              className="rounded-full shadow-lg border border-[#D4AF37]/20"
            />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8 font-poppins text-sm uppercase tracking-wider font-medium text-white/90">
            <a href="#about" className="hover:text-[#D4AF37] transition-colors">About Us</a>
            <a href="#pastor" className="hover:text-[#D4AF37] transition-colors">Leadership</a>
            <a href="#services" className="hover:text-[#D4AF37] transition-colors">Services</a>
            <a href="#watch" className="hover:text-[#D4AF37] transition-colors">Watch Live</a>
            <a href="#ministries" className="hover:text-[#D4AF37] transition-colors">Ministries</a>
            <a href="#events" className="hover:text-[#D4AF37] transition-colors">Events</a>
            <a href="#gallery" className="hover:text-[#D4AF37] transition-colors">Gallery</a>
            <a href="#giving" className="hover:text-[#D4AF37] transition-colors">Giving</a>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="#giving"
              onClick={() => {
                setSelectedGiving("Offering");
                setShowGivingModal(true);
              }}
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#FFF099] text-[#07122D] hover:shadow-lg hover:shadow-[#D4AF37]/20 transition-all font-semibold uppercase tracking-wider text-xs px-5 py-2.5 rounded-full"
            >
              <FaDonate /> Give Online
            </a>

            {/* WhatsApp Contact Float trigger */}
            <a
              href="https://wa.me/2348136337124"
              target="_blank"
              rel="noopener noreferrer"
              className="lg:hidden text-2xl text-[#25D366] hover:scale-110 transition-transform"
            >
              <FaWhatsapp />
            </a>

            {/* Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-2xl text-white hover:text-[#D4AF37] transition-colors focus:outline-none"
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden bg-[#07122D]/95 backdrop-blur-xl border-b border-[#D4AF37]/20"
            >
              <nav className="flex flex-col items-center py-6 gap-6 font-poppins text-sm uppercase tracking-wider font-semibold text-white/90">
                <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#D4AF37] transition-colors">About Us</a>
                <a href="#pastor" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#D4AF37] transition-colors">Leadership</a>
                <a href="#services" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#D4AF37] transition-colors">Services</a>
                <a href="#watch" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#D4AF37] transition-colors">Watch Live</a>
                <a href="#ministries" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#D4AF37] transition-colors">Ministries</a>
                <a href="#events" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#D4AF37] transition-colors">Events</a>
                <a href="#gallery" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#D4AF37] transition-colors">Gallery</a>
                <a href="#giving" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#D4AF37] transition-colors">Giving</a>
                <a
                  href="#giving"
                  onClick={() => {
                    setSelectedGiving("Offering");
                    setShowGivingModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="sm:hidden mt-2 flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#FFF099] text-[#07122D] shadow-lg shadow-[#D4AF37]/20 transition-all font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-full"
                >
                  <FaDonate /> Give Online
                </a>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ------------------ HERO SECTION ------------------ */}
      <section
        id="hero"
        ref={heroRef}
        className="relative h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden pt-20 bg-[#07122D]"
      >
        {/* Animated Background Image */}
        <motion.div 
          className="absolute inset-0 z-0"
          animate={{
            scale: [1, 1.08, 1],
            y: [0, -20, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Image
            src="/hero-bg.jpg"
            alt="Angel Background"
            fill
            priority
            className="object-cover opacity-25 mix-blend-lighten"
          />
        </motion.div>

        <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#07122D]/60 to-[#07122D] z-1" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-4"
          >
            <Image
              src="/rccg.png"
              alt="RCCG Logo"
              width={70}
              height={70}
              className="opacity-90 animate-pulse"
            />
            <span className="text-[#D4AF37] uppercase tracking-[0.4em] text-sm md:text-base font-semibold font-poppins">
              The Redeemed Christian Church of God
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-5xl md:text-8xl font-extrabold tracking-wider font-cinzel text-white leading-none drop-shadow-lg"
          >
            {siteContent.heroTitle}
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-xl md:text-3xl font-light italic text-[#D4AF37] tracking-widest font-playfair"
          >
            &ldquo;{siteContent.heroSubtitle}&rdquo;
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="max-w-2xl mx-auto text-sm md:text-lg text-white/80 font-poppins font-light leading-relaxed"
          >
            {siteContent.heroParagraph}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6"
          >
            <a
              href="#services"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#0A1E5E] to-[#07122D] border border-[#D4AF37]/30 hover:border-[#D4AF37] text-white rounded-full font-semibold uppercase tracking-wider transition-all shadow-lg hover:shadow-[#D4AF37]/10"
            >
              Join Us This Sunday
            </a>
            <a
              href="#watch"
              className="w-full sm:w-auto px-8 py-4 flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-[#D4AF37] border border-[#D4AF37]/20 rounded-full font-semibold uppercase tracking-wider transition-all backdrop-blur-md"
            >
              <FaPlay className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-[#D4AF37] opacity-75" />
              <FaPlay className="relative z-10 text-sm text-white" /> Watch Live
            </a>
          </motion.div>
        </div>
      </section>

      {/* ------------------ ABOUT US & STATS SECTION ------------------ */}
      <section id="about" className="relative py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-block px-4 py-1.5 glass-panel rounded-full border border-[#D4AF37]/30">
              <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                WHO WE ARE
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-playfair text-white leading-tight">
              {siteContent.aboutTitle}
            </h2>

            <p className="text-white/80 leading-relaxed font-light text-base md:text-lg">
              {siteContent.aboutParagraph}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-[#D4AF37]">
                <h3 className="text-lg font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
                  OUR MISSION
                </h3>
                <p className="text-sm text-white/70">
                  {siteContent.mission}
                </p>
              </div>

              <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-[#D4AF37]">
                <h3 className="text-lg font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
                  OUR VISION
                </h3>
                <p className="text-sm text-white/70">
                  {siteContent.vision}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Counters Grid */}
          <div id="stats-section" className="grid grid-cols-2 gap-6 relative">
            <div className="absolute inset-0 bg-[#D4AF37]/5 rounded-3xl filter blur-3xl -z-10" />
            {[
              { label: "Souls Won", prefix: "+" },
              { label: "Active Members", prefix: "+" },
              { label: "Years of Impact", prefix: "" },
              { label: "Community Projects", prefix: "" }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-panel p-8 rounded-3xl text-center space-y-2 border border-[#D4AF37]/10"
              >
                <h4 className="text-4xl md:text-5xl font-extrabold text-[#D4AF37] font-cinzel">
                  {animatedStats[i]}
                  {stat.prefix}
                </h4>
                <p className="text-xs uppercase tracking-widest text-white/60 font-semibold font-poppins">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------ SENIOR PASTOR SECTION ------------------ */}
      <section id="pastor" className="relative py-24 px-6 bg-[#07122D]/40">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          {/* Portrait Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37] to-transparent opacity-30 rounded-3xl filter blur-2xl group-hover:opacity-40 transition-opacity" />
            <div className="relative aspect-[4/5] w-full max-w-md mx-auto overflow-hidden rounded-3xl border border-[#D4AF37]/20 shadow-2xl">
              {/* Fallback image representing an elegant biography profile */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={siteContent.pastorImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200"}
                alt={siteContent.pastorName || "Pastor Abraham Okoye"}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07122D] via-transparent to-transparent opacity-85" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-bold">
                  Senior Pastor
                </p>
                <h3 className="text-2xl font-bold font-cinzel text-white">
                  {siteContent.pastorName || "Pastor Abraham Okoye"}
                </h3>
              </div>
            </div>
          </motion.div>

          {/* Biography Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 space-y-6"
          >
            <div className="inline-block px-4 py-1.5 glass-panel rounded-full border border-[#D4AF37]/30">
              <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                LEADERSHIP SHOWCASE
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-playfair text-white">
              Leading with Love, Integrity, & Power
            </h2>

            <p className="text-white/80 leading-relaxed font-light text-base md:text-lg">
              {siteContent.pastorBio}
            </p>

            <blockquote className="border-l-4 border-[#D4AF37] pl-4 italic text-white/90 text-lg font-light font-playfair py-2">
              &ldquo;{siteContent.pastorQuote}&rdquo;
            </blockquote>

            <div className="pt-4">
              <span className="text-[#D4AF37] font-cinzel text-2xl tracking-widest">
                {siteContent.pastorName ? siteContent.pastorName.replace(/^Pastor\s+/i, "") : "Abraham Okoye"}
              </span>
              <p className="text-xs text-white/50 uppercase tracking-widest">
                Signature of Grace
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ------------------ SERVICE TIMES SECTION ------------------ */}
      <section id="services" className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <div className="inline-block px-4 py-1.5 glass-panel rounded-full border border-[#D4AF37]/30">
              <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                FELLOWSHIP HOURS
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-cinzel text-white">
              Join Us in Worship
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Find a service time that works for you and experience a powerful encounter with Jesus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SERVICE_TIMES_LIST.map((service) => (
              <div
                key={service.title}
                className="glass-panel glass-panel-hover p-8 rounded-3xl space-y-6 flex flex-col justify-between text-left"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 flex items-center justify-center text-xl text-[#D4AF37] border border-[#D4AF37]/20">
                    <service.icon />
                  </div>
                  <h3 className="text-xl font-bold font-cinzel text-white">
                    {service.title}
                  </h3>
                  <p className="text-sm text-white/70 font-light">
                    {service.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-[#D4AF37] font-semibold border-t border-[#D4AF37]/10 pt-4">
                  <FaClock /> <span>{service.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------ WATCH ONLINE / SERMONS ------------------ */}
      <section id="watch" className="relative py-24 px-6 bg-[#07122D]/40">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-4 text-left">
              <div className="inline-block px-4 py-1.5 glass-panel rounded-full border border-[#D4AF37]/30">
                <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                  MEDIA & LIVE STREAM
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-cinzel text-white">
                Sermons & Livestream
              </h2>
            </div>
            <div className="flex gap-4">
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 glass-panel glass-panel-hover rounded-full text-xs font-semibold uppercase tracking-wider text-white"
              >
                <FaYoutube className="text-red-500" /> Youtube Channel
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 glass-panel glass-panel-hover rounded-full text-xs font-semibold uppercase tracking-wider text-white"
              >
                <FaFacebookF className="text-blue-500" /> Facebook Live
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Live streaming feature card */}
            {SERMONS_LIST.length > 0 ? (
            <div className="lg:col-span-2 glass-panel rounded-3xl overflow-hidden border border-[#D4AF37]/20 flex flex-col justify-between">
              <div className="relative aspect-video w-full">
                <iframe
                  className="w-full h-full"
                  src={SERMONS_LIST[0].embed}
                  title={SERMONS_LIST[0].title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
                    Now Playing / Latest Sermon
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white font-cinzel">
                  {SERMONS_LIST[0].title}
                </h3>
                <p className="text-sm text-white/60">
                  Preached by {SERMONS_LIST[0].speaker} &bull; {SERMONS_LIST[0].date}
                </p>
              </div>
            </div>
            ) : (
            <div className="lg:col-span-2 glass-panel rounded-3xl overflow-hidden border border-[#D4AF37]/20 flex items-center justify-center p-12">
              <p className="text-white/50 text-sm">No sermons available yet. Check back soon!</p>
            </div>
            )}

            {/* Sermon Archives */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold font-cinzel text-[#D4AF37]">
                Recent Sermons
              </h3>
              <div className="space-y-4">
                {SERMONS_LIST.map((sermon) => (
                  <div
                    key={sermon.title}
                    className="glass-panel p-5 rounded-2xl border border-[#D4AF37]/10 flex flex-col justify-between hover:border-[#D4AF37]/30 transition-all cursor-pointer"
                  >
                    <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold mb-1">
                      {sermon.category}
                    </span>
                    <h4 className="font-bold text-white font-poppins text-sm line-clamp-1">
                      {sermon.title}
                    </h4>
                    <p className="text-[11px] text-white/50 mt-2">
                      {sermon.speaker} &bull; {sermon.date}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------ MINISTRIES SECTION ------------------ */}
      <section id="ministries" className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <div className="inline-block px-4 py-1.5 glass-panel rounded-full border border-[#D4AF37]/30">
              <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                OUR DEPARTMENTS
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-cinzel text-white">
              Ministries at Hall of Faith
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Get involved, serve with your giftings, and grow in community. We have a place for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MINISTRIES.map((min) => (
              <div
                key={min.name}
                className="glass-panel p-8 rounded-3xl space-y-4 border border-[#D4AF37]/10 flex flex-col justify-between hover:scale-[1.02] hover:border-[#D4AF37]/30 transition-all cursor-default"
              >
                <div>
                  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${min.color} mb-6`} />
                  <h3 className="text-xl font-bold font-cinzel text-white">
                    {min.name}
                  </h3>
                  <p className="text-sm text-white/70 font-light mt-2">
                    {min.desc}
                  </p>
                </div>

                <a
                  href="#contact"
                  className="inline-block text-[#D4AF37] hover:text-[#FFF099] font-medium text-xs uppercase tracking-widest pt-4 transition-colors"
                >
                  Learn More &rarr;
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------ EVENTS SECTION WITH COUNTDOWN ------------------ */}
      <section id="events" className="relative py-24 px-6 bg-[#07122D]/40">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <div className="inline-block px-4 py-1.5 glass-panel rounded-full border border-[#D4AF37]/30">
              <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                UPCOMING EVENTS
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-cinzel text-white">
              Calendar & Special Events
            </h2>
          </div>

          {events.length > 0 && (
            <div className="glass-panel rounded-3xl p-8 md:p-12 border border-[#D4AF37]/20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="px-3.5 py-1.5 bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-semibold rounded-full border border-[#D4AF37]/25 uppercase tracking-wider inline-block">
                  {events[0].type}
                </span>
                <h3 className="text-3xl md:text-4xl font-bold text-white font-cinzel">
                  {events[0].title}
                </h3>
                <p className="text-white/80 leading-relaxed text-sm md:text-base">
                  {events[0].desc}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <a
                    href="#prayer-request"
                    className="px-8 py-3.5 bg-[#D4AF37] hover:bg-[#FFF099] text-[#07122D] rounded-full font-bold uppercase tracking-wider transition-colors text-center"
                  >
                    Register / Attend
                  </a>
                </div>
              </div>

              {/* Countdown Container */}
              <div className="glass-panel p-8 rounded-3xl border border-[#D4AF37]/10 flex flex-col justify-center items-center text-center space-y-6">
                <h4 className="text-xs uppercase tracking-[0.25em] text-white/50 font-bold">
                  EVENT STARTS IN
                </h4>
                <div className="flex justify-center gap-4 md:gap-6">
                  {[
                    { value: countdown.days, unit: "Days" },
                    { value: countdown.hours, unit: "Hrs" },
                    { value: countdown.mins, unit: "Mins" },
                    { value: countdown.secs, unit: "Secs" },
                  ].map((item) => (
                    <div key={item.unit} className="w-16 md:w-20">
                      <span className="text-2xl md:text-4xl font-bold text-[#D4AF37] font-cinzel block">
                        {String(item.value).padStart(2, "0")}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-white/50 font-semibold block mt-1">
                        {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Timeline of other events */}
          <div className="space-y-6 pt-6">
            {events.slice(1).map((event) => (
              <div
                key={event.id}
                className="glass-panel p-6 rounded-2xl border border-[#D4AF37]/10 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#D4AF37]/30 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                      {event.type}
                    </span>
                    <span className="text-[11px] text-white/40">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold font-cinzel text-white">
                    {event.title}
                  </h4>
                  <p className="text-sm text-white/70 max-w-xl">
                    {event.desc}
                  </p>
                </div>

                <a
                  href="#contact"
                  className="px-6 py-2.5 glass-panel glass-panel-hover rounded-full text-xs font-bold uppercase tracking-wider text-white border-l-4 border-l-[#D4AF37]"
                >
                  Join Event
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------ GALLERY SECTION ------------------ */}
      <section id="gallery" className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <div className="inline-block px-4 py-1.5 glass-panel rounded-full border border-[#D4AF37]/30">
              <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                WORSHIP MOMENTS
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-cinzel text-white">
              Visual Expressions of Worship
            </h2>

            {/* Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-3 pt-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-5 py-2 rounded-full text-xs uppercase tracking-widest font-semibold border transition-all ${
                    activeTab === cat
                      ? "bg-[#D4AF37] text-[#07122D] border-[#D4AF37]"
                      : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Pinterest Masonry layout */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredGallery.map((img, index) => (
              <motion.div
                key={img.src}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="break-inside-avoid relative overflow-hidden rounded-3xl border border-[#D4AF37]/10 group cursor-pointer"
                onClick={() => setLightboxIndex(index)}
              >
                <div className="relative w-full h-auto min-h-[250px] max-h-[450px] aspect-[3/4]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%230A1E5E' width='400' height='400'/%3E%3Ctext fill='%23D4AF37' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='14'%3EImage Not Found%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07122D] via-transparent to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col justify-end p-6" />
                  <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-left">
                    <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                      {img.cat}
                    </span>
                    <h4 className="text-lg font-bold font-cinzel text-white">
                      {img.title}
                    </h4>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {lightboxIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#07122D]/95 backdrop-blur-md flex items-center justify-center p-4"
            >
              <button
                onClick={() => setLightboxIndex(null)}
                className="absolute top-6 right-6 text-white text-3xl hover:text-[#D4AF37] transition-colors"
              >
                <FaTimes />
              </button>

              <div className="relative max-w-4xl w-full aspect-[4/3] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={filteredGallery[lightboxIndex].src}
                  alt={filteredGallery[lightboxIndex].title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
                <span className="text-[#D4AF37] text-xs uppercase tracking-widest font-bold">
                  {filteredGallery[lightboxIndex].cat}
                </span>
                <h3 className="text-white text-2xl font-bold font-cinzel">
                  {filteredGallery[lightboxIndex].title}
                </h3>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ------------------ TESTIMONIALS SECTION ------------------ */}
      <section id="testimonies" className="relative py-24 px-6 bg-[#07122D]/40">
        <div className="max-w-4xl mx-auto space-y-12 text-center">
          <div className="inline-block px-4 py-1.5 glass-panel rounded-full border border-[#D4AF37]/30">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
              TESTIMONIALS
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold font-cinzel text-white">
            Living Testimonies of God&apos;s Faithfulness
          </h2>

          <div className="relative min-h-[300px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {TESTIMONIALS.map((test, index) => {
                if (index !== activeTestimonial) return null;
                return (
                  <motion.div
                    key={test.name}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                    className="glass-panel p-8 md:p-12 rounded-3xl border border-[#D4AF37]/20 space-y-6 relative"
                  >
                    <FaQuoteLeft className="text-4xl text-[#D4AF37]/30 absolute top-6 left-6" />

                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                        {test.type} Testimonial
                      </span>
                      <h3 className="text-xl md:text-2xl font-bold font-cinzel text-white">
                        {test.title}
                      </h3>
                    </div>

                    <p className="text-white/80 leading-relaxed font-light text-base md:text-lg">
                      &ldquo;{test.story}&rdquo;
                    </p>

                    <div className="pt-4">
                      <h4 className="font-bold text-white font-poppins">
                        {test.name}
                      </h4>
                      <p className="text-xs text-white/50">Verified Member</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`w-3.5 h-3.5 rounded-full border transition-all ${
                  activeTestimonial === i ? "bg-[#D4AF37] border-[#D4AF37]" : "border-[#D4AF37]/30 hover:border-[#D4AF37]"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------ ONLINE GIVING ------------------ */}
      <section id="giving" className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <div className="inline-block px-4 py-1.5 glass-panel rounded-full border border-[#D4AF37]/30">
              <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                KINGDOM STEWARDSHIP
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-cinzel text-white">
              Honoring God with our Substance
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Give securely online to support the propagation of the gospel, outreach programs, and kingdom impact.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {["Tithe", "Offering", "FIRST FRUIT", "PROJECT/PLEDGE/SEED"].map((type) => (
              <div
                key={type}
                className="glass-panel p-8 rounded-3xl text-center space-y-6 border border-[#D4AF37]/10 flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] text-xl flex items-center justify-center mx-auto border border-[#D4AF37]/25 animate-pulse">
                    <FaDonate />
                  </div>
                  <h3 className="text-xl font-bold font-cinzel text-white">
                    {type}
                  </h3>
                  <p className="text-xs text-white/50 uppercase tracking-widest">
                    Graceful Giving
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedGiving(type);
                    setShowGivingModal(true);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFF099] text-[#07122D] hover:shadow-lg hover:shadow-[#D4AF37]/20 rounded-full font-bold uppercase tracking-wider text-xs transition-all"
                >
                  Give Securely
                </button>
              </div>
            ))}
          </div>

          {/* Security trust badge info */}
          <div className="text-center text-xs text-white/40 flex items-center justify-center gap-2 pt-4">
            <FaCheckCircle className="text-[#D4AF37]" /> Your transaction is secured with modern 256-bit encryption protocols.
          </div>
        </div>

        {/* Giving Payment Details Modal */}
        <AnimatePresence>
          {showGivingModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="glass-panel max-w-lg w-full rounded-3xl p-8 border border-[#D4AF37]/30 space-y-6 relative"
              >
                <button
                  onClick={() => setShowGivingModal(false)}
                  className="absolute top-6 right-6 text-white hover:text-[#D4AF37] text-xl"
                >
                  <FaTimes />
                </button>

                <h3 className="text-2xl font-bold font-cinzel text-white">
                  Support via {selectedGiving}
                </h3>

                <p className="text-sm text-white/70">
                  You can make your payments or transfers to the official RCCG Hall of Faith parish account below:
                </p>

                <div className="space-y-4">
                  <div className="glass-panel p-6 rounded-2xl border border-[#D4AF37]/20 space-y-2">
                    <p className="text-[10px] uppercase tracking-wider text-white/50">
                      Bank Name
                    </p>
                    <p className="text-lg font-bold font-poppins text-white">
                      Zenith Bank
                    </p>
                  </div>

                  <div className="glass-panel p-6 rounded-2xl border border-[#D4AF37]/20 space-y-2">
                    <p className="text-[10px] uppercase tracking-wider text-white/50">
                      Account Number
                    </p>
                    <p className="text-2xl font-extrabold font-cinzel text-[#D4AF37] tracking-wider">
                      {selectedGiving === "PROJECT/PLEDGE/SEED" ? "1214705307" : "1214702306"}
                    </p>
                  </div>

                  <div className="glass-panel p-6 rounded-2xl border border-[#D4AF37]/20 space-y-2">
                    <p className="text-[10px] uppercase tracking-wider text-white/50">
                      Account Name
                    </p>
                    <p className="text-lg font-bold font-poppins text-white">
                      RCCG Hall of Faith ojodu
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      const accNo = selectedGiving === "PROJECT/PLEDGE/SEED" ? "1214705307" : "1214702306";
                      navigator.clipboard.writeText(accNo);
                      alert("Account number copied to clipboard!");
                    }}
                    className="flex-1 py-3 border border-[#D4AF37] text-[#D4AF37] rounded-full font-bold uppercase tracking-wider text-xs hover:bg-[#D4AF37] hover:text-[#07122D] transition-all"
                  >
                    Copy Account No
                  </button>
                  <button
                    onClick={() => setShowGivingModal(false)}
                    className="flex-1 py-3 bg-[#D4AF37] text-[#07122D] rounded-full font-bold uppercase tracking-wider text-xs hover:bg-[#FFF099] transition-all"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ------------------ PRAYER REQUESTS FORM ------------------ */}
      <section id="prayer-request" className="relative py-24 px-6 bg-[#07122D]/40">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-block px-4 py-1.5 glass-panel rounded-full border border-[#D4AF37]/30">
              <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                INTERCESSION & SUPPORT
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-cinzel text-white">
              Submit a Prayer Request
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Our intercessors are standing by to stand in agreement with you. God answers prayer!
            </p>
          </div>

          <form onSubmit={handlePrayerSubmit} className="glass-panel p-8 md:p-12 rounded-3xl border border-[#D4AF37]/20 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-white/60 font-semibold">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={prayerForm.name}
                  onChange={(e) => setPrayerForm({ ...prayerForm, name: e.target.value })}
                  placeholder="Your Name"
                  className="w-full bg-[#07122D] border border-[#D4AF37]/20 focus:border-[#D4AF37] outline-none text-white rounded-xl px-5 py-3 text-sm transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-white/60 font-semibold">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={prayerForm.email}
                  onChange={(e) => setPrayerForm({ ...prayerForm, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full bg-[#07122D] border border-[#D4AF37]/20 focus:border-[#D4AF37] outline-none text-white rounded-xl px-5 py-3 text-sm transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-white/60 font-semibold">
                Phone Number (WhatsApp preferred)
              </label>
              <input
                type="tel"
                required
                value={prayerForm.phone}
                onChange={(e) => setPrayerForm({ ...prayerForm, phone: e.target.value })}
                placeholder="+234..."
                className="w-full bg-[#07122D] border border-[#D4AF37]/20 focus:border-[#D4AF37] outline-none text-white rounded-xl px-5 py-3 text-sm transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-white/60 font-semibold">
                Your Prayer Request
              </label>
              <textarea
                required
                rows={5}
                value={prayerForm.message}
                onChange={(e) => setPrayerForm({ ...prayerForm, message: e.target.value })}
                placeholder="What would you like us to stand in agreement with you for?"
                className="w-full bg-[#07122D] border border-[#D4AF37]/20 focus:border-[#D4AF37] outline-none text-white rounded-xl px-5 py-3 text-sm transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#FFF099] text-[#07122D] font-extrabold uppercase tracking-wider rounded-xl hover:shadow-lg transition-all"
            >
              Submit Request
            </button>

            <AnimatePresence>
              {prayerSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 bg-emerald-500/20 border border-emerald-500 rounded-xl flex items-center gap-3 text-emerald-400 text-sm"
                >
                  <FaCheckCircle className="text-lg flex-shrink-0" />
                  <span>
                    Your request has been received. Our pastors and prayer partners will lift this up to heaven. Stay blessed!
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </section>

      {/* ------------------ CONTACT SECTION ------------------ */}
      <section id="contact" className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-8">
            <div className="inline-block px-4 py-1.5 glass-panel rounded-full border border-[#D4AF37]/30">
              <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                GET IN TOUCH
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold font-cinzel text-white leading-tight">
              Reach Out & Join Us
            </h2>

            <p className="text-white/70 leading-relaxed font-light">
              Do you have inquiries, need directions, or want to speak with a pastor? Connect with us via any of the channels below.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20 flex-shrink-0">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-xs">
                    CHURCH SANCTUARY
                  </h4>
                  <p className="text-sm text-white/70 mt-1">
                    37B, Gbadamosi Street,<br />
                    Adjacent to the Health Center,<br />
                    Ojodu-Berger, Lagos State, Nigeria
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20 flex-shrink-0">
                  <FaPhoneAlt />
                </div>
                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-xs">
                    TELEPHONE & WHATSAPP
                  </h4>
                  <a
                    href="tel:+2348136337124"
                    className="text-sm text-white/75 hover:text-[#D4AF37] mt-1 block"
                  >
                    +234 813 633 7124
                  </a>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <a
                href="https://wa.me/2348136337124"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] text-[#07122D] hover:shadow-lg rounded-full font-bold uppercase tracking-wider text-xs px-6 py-3 transition-all"
              >
                <FaWhatsapp className="text-lg" /> Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Map Mockup */}
          <div className="glass-panel p-4 rounded-3xl border border-[#D4AF37]/20 relative w-full aspect-video overflow-hidden shadow-2xl">
            {/* Using interactive dynamic styled maps from Mapbox/Leaflet fallback (SVG mockup for perfect elegance) */}
            <div className="absolute inset-0 bg-[#07122D] flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-xl text-[#D4AF37]">
                <FaMapMarkerAlt />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold font-cinzel text-white">
                  37B, Gbadamosi Street, Ojodu-Berger
                </h4>
                <p className="text-xs text-white/60">
                  Adjacent to the Health Center, Lagos State, Nigeria
                </p>
              </div>
              <a
                href="https://maps.google.com/?q=37B,+Gbadamosi+Street,+Ojodu-Berger,+Lagos"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#FFF099] text-[#07122D] rounded-full font-bold uppercase tracking-wider text-xs transition-colors"
              >
                Open Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------ FOOTER ------------------ */}
      <footer className="glass-panel border-t border-[#D4AF37]/20 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-[#D4AF37]/10 text-left">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Hall of Faith Logo"
                width={45}
                height={45}
                className="rounded-full border border-[#D4AF37]/35"
              />
              <div>
                <h3 className="text-lg font-bold font-cinzel text-white tracking-widest">
                  {siteContent.heroTitle}
                </h3>
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#D4AF37]">
                  A Parish of RCCG
                </p>
              </div>
            </div>
            <p className="text-xs text-white/60 leading-relaxed font-light pt-2">
              Transforming lives through worship, the infallible Word, prayer, and the absolute power of Jesus Christ. Join us on this journey of faith!
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-[#D4AF37] uppercase tracking-wider text-xs font-cinzel">
              Quick Links
            </h4>
            <div className="flex flex-col gap-2.5 text-xs text-white/70">
              <a href="#about" className="hover:text-[#D4AF37] transition-colors">About Us</a>
              <a href="#services" className="hover:text-[#D4AF37] transition-colors">Service Times</a>
              <a href="#watch" className="hover:text-[#D4AF37] transition-colors">Sermon Archive</a>
              <a href="#giving" className="hover:text-[#D4AF37] transition-colors">Giving Online</a>
              <a href="#prayer-request" className="hover:text-[#D4AF37] transition-colors">Prayer Requests</a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-[#D4AF37] uppercase tracking-wider text-xs font-cinzel">
              Service Hours
            </h4>
            <div className="space-y-2.5 text-xs text-white/70">
              <p>
                <strong>Sunday Worship:</strong> {siteContent.sundayTime}
              </p>
              <p>
                <strong>Bible Study (Wed):</strong> {siteContent.wednesdayTime}
              </p>
              <p>
                <strong>Prayer Meeting (Fri):</strong> {siteContent.fridayTime}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-[#D4AF37] uppercase tracking-wider text-xs font-cinzel">
              Stay Connected
            </h4>
            <div className="flex gap-4 text-white/70">
              <a href="https://facebook.com" className="hover:text-[#D4AF37] transition-all"><FaFacebookF /></a>
              <a href="https://youtube.com" className="hover:text-[#D4AF37] transition-all"><FaYoutube /></a>
              <a href="https://instagram.com" className="hover:text-[#D4AF37] transition-all"><FaInstagram /></a>
              <a href="https://twitter.com" className="hover:text-[#D4AF37] transition-all"><FaTwitter /></a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-white/40 gap-4 md:gap-0">
          <p className="flex-1 text-center md:text-left">
            &copy; {new Date().getFullYear()} RCCG Hall of Faith. All Rights Reserved.
          </p>
          <div className="flex-1 flex justify-center gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
          <p className="flex-1 text-center md:text-right">
            SITE DONATED BY <a href="https://www.didsystemsinc.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors font-semibold">DIDS&apos; SYSTEMS INC.</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
