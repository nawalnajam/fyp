"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Shield, Zap, HeartHandshake, Users, MapPin, Award, ChevronRight, Car } from "lucide-react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  .about-page {
    font-family: 'Plus Jakarta Sans', sans-serif;
    min-height: 100vh;
  }
  .hph { font-family: 'Outfit', sans-serif; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-up { animation: fadeUp 0.6s ease forwards; }

  .stat-card {
    background: white;
    border-radius: 20px;
    padding: 20px 16px;
    text-align: center;
    transition: all 0.3s ease;
    border: 1px solid rgba(14,165,233,0.15);
    box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  }
  .stat-card:hover { transform: translateY(-4px); box-shadow: 0 15px 30px rgba(14,165,233,0.1); }

  .value-card {
    background: white;
    border-radius: 20px;
    padding: 24px;
    transition: all 0.3s ease;
    border: 1px solid rgba(0,0,0,0.05);
  }
  .value-card:hover { transform: translateY(-4px); box-shadow: 0 15px 30px rgba(14,165,233,0.08); }
`;

export default function AboutPage() {
  const router = useRouter();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("fade-up"); }); },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{STYLES}</style>
      <div className="about-page">
        <Navbar />

        {/* Hero */}
        <div className="pt-20 pb-12 text-center">
          <div className="max-w-4xl mx-auto px-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center mx-auto mb-5 shadow-lg">
              <Car size={32} className="text-white" />
            </div>
            <h1 className="hph text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">About Car Trade Hub</h1>
            <p className="text-gray-500 text-base max-w-2xl mx-auto">Pakistan's most trusted car marketplace — connecting buyers and sellers with AI-powered technology.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "10,000+", label: "Cars Sold", icon: Car, color: "from-sky-500 to-blue-500" },
              { value: "5,000+", label: "Happy Buyers", icon: Users, color: "from-emerald-500 to-green-500" },
              { value: "50+", label: "Cities", icon: MapPin, color: "from-sky-500 to-emerald-500" },
              { value: "98%", label: "Satisfaction", icon: Award, color: "from-emerald-500 to-sky-500" },
            ].map((stat, idx) => (
              <div key={stat.label} className="stat-card reveal" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mx-auto mb-2`}><stat.icon size={20} className="text-white" /></div>
                <p className="hph text-xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-gray-400 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Story */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="reveal">
              <span className="inline-block px-3 py-1 rounded-full bg-sky-100 text-sky-600 text-xs font-semibold mb-4">📖 Our Journey</span>
              <h2 className="hph text-2xl font-bold text-gray-800 mb-3">Revolutionizing Car Trading</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-3">Founded in 2023, Car Trade Hub was born from a simple idea: make buying and selling cars in Pakistan transparent, efficient, and hassle-free.</p>
              <p className="text-gray-500 text-sm leading-relaxed">Today, we help thousands of Pakistanis find their dream cars with AI-powered technology.</p>
            </div>
            <div className="reveal"><img src="about1.jpg" alt="Story" className="rounded-xl shadow-lg w-full object-cover" /></div>
          </div>
        </div>

        {/* Values */}
        <div className="bg-white/50 py-12">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-8"><span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-xs font-semibold mb-3">💡 Core Values</span><h2 className="hph text-2xl font-bold text-gray-800">What Drives Us</h2></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Shield, title: "Trust & Transparency", desc: "Every listing is verified by our team.", gradient: "from-sky-500 to-blue-500" },
                { icon: Zap, title: "Innovation First", desc: "AI-powered car detection and smart search.", gradient: "from-emerald-500 to-green-500" },
                { icon: HeartHandshake, title: "Customer First", desc: "Your satisfaction is our priority.", gradient: "from-sky-500 to-emerald-500" },
              ].map((value, idx) => (
                <div key={value.title} className="value-card reveal" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${value.gradient} flex items-center justify-center mb-3`}><value.icon size={20} className="text-white" /></div>
                  <h3 className="hph text-lg font-bold text-gray-800 mb-2">{value.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="bg-gradient-to-r from-sky-500 to-emerald-500 rounded-2xl p-8 text-center">
            <h2 className="hph text-2xl font-bold text-white mb-3">Ready to Start?</h2>
            <p className="text-white/90 text-sm mb-5 max-w-md mx-auto">Join thousands of satisfied customers who found their dream car with us.</p>
            <button onClick={() => router.push("/cars")} className="bg-white text-sky-600 px-6 py-2 rounded-xl font-semibold text-sm hover:shadow-lg transition inline-flex items-center gap-2">Browse Cars <ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </>
  );
}