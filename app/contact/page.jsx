// /app/contact/page.jsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Mail, Phone, MapPin, Clock, Send, Facebook, Twitter, Instagram, Linkedin, CheckCircle, Loader2, MessageCircle } from "lucide-react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  .contact-page {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #f0f9ff 100%);
    min-height: 100vh;
  }
  .hph { font-family: 'Outfit', sans-serif; }

  .info-card {
    background: white;
    border-radius: 18px;
    padding: 20px;
    transition: all 0.3s ease;
    border: 1px solid rgba(14,165,233,0.1);
  }
  .info-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(14,165,233,0.08);
  }

  .form-card {
    background: white;
    border-radius: 20px;
    padding: 28px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.03);
    border: 1px solid rgba(14,165,233,0.1);
  }

  .form-input {
    width: 100%;
    padding: 12px 16px;
    border: 1.5px solid #e2e8f0;
    border-radius: 14px;
    font-size: 14px;
    transition: all 0.2s ease;
    outline: none;
  }
  .form-input:focus {
    border-color: #0ea5e9;
    box-shadow: 0 0 0 3px rgba(14,165,233,0.1);
  }
  
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-up {
    animation: fadeUp 0.5s ease forwards;
  }
`;

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // ✅ Auto-fill user data if logged in
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setFormData(prev => ({
          ...prev,
          name: parsedUser.name || "",
          email: parsedUser.email || "",
          phone: parsedUser.phone || "",
        }));
      } catch (e) {}
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSubmitted(false);

    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };
      
      // ✅ Add auth token if logged in
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phone || "",
          subject: "",
          message: "",
        });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError(data.message || "Failed to send message");
      }
    } catch (err) {
      console.error("Contact error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="contact-page">
        <Navbar />

        {/* Hero Section */}
        <div className="pt-24 pb-12 text-center">
          <div className="max-w-4xl mx-auto px-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center mx-auto mb-5 shadow-lg">
              <Mail size={32} className="text-white" />
            </div>
            <h1 className="hph text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
              Get in Touch
            </h1>
            <p className="text-gray-500 text-base max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond within 24 hours.
            </p>
          </div>
        </div>

        {/* Contact Grid */}
        <div className="max-w-6xl mx-auto px-6 pb-16">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Left Side - Info Cards */}
            <div className="space-y-5">
              {[
                { icon: Phone, title: "Phone", details: "+92 300 1234567", sub: "Mon-Fri, 9AM - 6PM", gradient: "from-sky-500 to-blue-500" },
                { icon: Mail, title: "Email", details: "support@cartradehub.pk", sub: "sales@cartradehub.pk", gradient: "from-emerald-500 to-green-500" },
                { icon: MapPin, title: "Office", details: "DHA Phase 8, Karachi", sub: "Pakistan", gradient: "from-sky-500 to-emerald-500" },
                { icon: Clock, title: "Hours", details: "Mon-Fri: 9AM - 6PM", sub: "Sat: 10AM - 2PM", gradient: "from-blue-500 to-sky-500" },
              ].map((item, idx) => (
                <div key={item.title} className="info-card fade-up" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${item.gradient} flex items-center justify-center flex-shrink-0`}>
                      <item.icon size={22} className="text-white" />
                    </div>
                    <div>
                      <h3 className="hph text-lg font-bold text-gray-800">{item.title}</h3>
                      <p className="text-gray-600 mt-1">{item.details}</p>
                      <p className="text-gray-400 text-sm">{item.sub}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Social Links */}
              <div className="info-card fade-up" style={{ animationDelay: "400ms" }}>
                <h3 className="hph text-lg font-bold text-gray-800 mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  {[
                    { icon: Facebook, color: "#1877f2", bg: "bg-blue-50" },
                    { icon: Twitter, color: "#1da1f2", bg: "bg-sky-50" },
                    { icon: Instagram, color: "#e4405f", bg: "bg-pink-50" },
                    { icon: Linkedin, color: "#0a66c2", bg: "bg-blue-50" },
                  ].map((social, idx) => (
                    <button key={idx} className={`w-10 h-10 rounded-xl ${social.bg} flex items-center justify-center transition hover:scale-110`} style={{ color: social.color }}>
                      <social.icon size={18} />
                    </button>
                  ))}
                </div>
              </div>

              {/* ✅ Message Sent Confirmation */}
              {submitted && (
                <div className="info-card fade-up border-green-200 bg-green-50" style={{ animationDelay: "500ms" }}>
                  <div className="flex items-center gap-3">
                    <CheckCircle size={24} className="text-green-500" />
                    <div>
                      <p className="font-semibold text-green-700">Message Sent!</p>
                      <p className="text-sm text-green-600">We'll get back to you soon.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ Success Message for Messages Page */}
              {submitted && (
                <div className="info-card fade-up border-sky-200 bg-sky-50" style={{ animationDelay: "550ms" }}>
                  <div className="flex items-center gap-3">
                    <MessageCircle size={24} className="text-sky-500" />
                    <div>
                      <p className="font-semibold text-sky-700">Check Your Messages</p>
                      <p className="text-sm text-sky-600">View this message in your inbox</p>
                      <button
                        onClick={() => router.push("/messages")}
                        className="mt-1 text-xs text-sky-600 hover:underline font-semibold"
                      >
                        Go to Messages →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Form */}
            <div className="form-card fade-up" style={{ animationDelay: "200ms" }}>
              <h2 className="hph text-xl font-bold text-gray-800 mb-5">Send us a Message</h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  ❌ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name *"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                
                <div>
                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                
                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="form-input"
                  />
                </div>
                
                <div>
                  <input
                    type="text"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="form-input"
                  />
                </div>
                
                <div>
                  <textarea
                    placeholder="Your Message *"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="form-input resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}