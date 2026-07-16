"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Calendar, Clock, Search, ChevronRight, BookOpen, Eye, Tag } from "lucide-react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  .blog-page { font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; }
  .hph { font-family: 'Outfit', sans-serif; }

  .blog-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
    border: 1px solid rgba(14,165,233,0.12);
    cursor: pointer;
  }
  .blog-card:hover { transform: translateY(-4px); box-shadow: 0 15px 30px rgba(14,165,233,0.1); }

  .category-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 12px;
    border-radius: 99px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    background: white;
    border: 1px solid #e2e8f0;
    color: #64748b;
  }
  .category-chip.active { background: linear-gradient(135deg, #0ea5e9, #22c55e); color: white; border-color: transparent; }
`;

const blogPosts = [
  { id: 1, title: "Top 10 Cars to Buy in Pakistan Under 3 Million PKR", excerpt: "Looking for an affordable car? Here's our comprehensive guide.", image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=250&fit=crop", date: "Apr 15, 2024", readTime: "8 min", category: "Buying Tips", views: 12500 },
  { id: 2, title: "How to Get Best Resale Value for Your Used Car", excerpt: "Expert tips to maximize your car's resale value.", image: "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400&h=250&fit=crop", date: "Apr 10, 2024", readTime: "6 min", category: "Selling Tips", views: 8900 },
  { id: 3, title: "Electric Vehicles in Pakistan: Complete Guide", excerpt: "Everything you need to know about EVs in Pakistan.", image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=250&fit=crop", date: "Apr 5, 2024", readTime: "10 min", category: "EV & Hybrid", views: 15700 },
  { id: 4, title: "Car Maintenance Checklist: Spring 2024", excerpt: "Essential maintenance tasks to keep your car running smoothly.", image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=250&fit=crop", date: "Mar 28, 2024", readTime: "5 min", category: "Maintenance", views: 6200 },
  { id: 5, title: "Toyota vs Honda: Which is Better?", excerpt: "Detailed comparison of Pakistan's most popular car brands.", image: "toyota.jpg", date: "Mar 20, 2024", readTime: "7 min", category: "Car Reviews", views: 21000 },
  { id: 6, title: "Upcoming Cars in Pakistan 2024-2025", excerpt: "Exciting new launches coming to Pakistan.", image: "car.jpg", date: "Mar 15, 2024", readTime: "9 min", category: "Market News", views: 18300 },
];

const categories = ["All", "Buying Tips", "Selling Tips", "Car Reviews", "Maintenance", "Market News", "EV & Hybrid"];

export default function BlogPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState(blogPosts);

  useEffect(() => {
    let filtered = blogPosts;
    if (selectedCategory !== "All") filtered = filtered.filter((post) => post.category === selectedCategory);
    if (searchQuery) filtered = filtered.filter((post) => post.title.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredPosts(filtered);
  }, [selectedCategory, searchQuery]);

  return (
    <>
      <style>{STYLES}</style>
      <div className="blog-page">
        <Navbar />

        {/* Hero */}
        <div className="pt-20 pb-10 text-center">
          <div className="max-w-4xl mx-auto px-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center mx-auto mb-5 shadow-lg"><BookOpen size={32} className="text-white" /></div>
            <h1 className="hph text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">Car Trade Hub Blog</h1>
            <p className="text-gray-500 text-base">Expert insights, car reviews, and automotive news</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
            <div className="flex flex-wrap gap-2">{categories.map((cat) => (<button key={cat} onClick={() => setSelectedCategory(cat)} className={`category-chip ${selectedCategory === cat ? "active" : ""}`}><Tag size={12} /> {cat}</button>))}</div>
            <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:border-sky-400 focus:outline-none w-full md:w-56 text-sm" /></div>
          </div>

          {/* Blog Grid */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16"><BookOpen size={48} className="mx-auto text-gray-300 mb-3" /><h3 className="text-lg font-bold text-gray-700">No articles found</h3></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 pb-16">
              {filteredPosts.map((post) => (
                <div key={post.id} className="blog-card group" onClick={() => router.push(`/blog/${post.id}`)}>
                  <div className="relative h-40 overflow-hidden"><img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /><div className="absolute top-2 right-2 bg-black/50 px-1.5 py-0.5 rounded text-white text-xs"><Eye size={10} className="inline mr-0.5" />{post.views}</div></div>
                  <div className="p-4"><span className="inline-block px-2 py-0.5 rounded-full bg-sky-100 text-sky-600 text-xs font-semibold mb-2">{post.category}</span><h3 className="hph font-bold text-gray-800 text-sm mb-2 line-clamp-2">{post.title}</h3><p className="text-gray-500 text-xs mb-3 line-clamp-2">{post.excerpt}</p><div className="flex justify-between items-center"><div className="flex items-center gap-2 text-xs text-gray-400"><span className="flex items-center gap-1"><Calendar size={10} /> {post.date}</span><span className="flex items-center gap-1"><Clock size={10} /> {post.readTime}</span></div><button className="text-sky-600 text-xs font-semibold flex items-center gap-1">Read <ChevronRight size={12} /></button></div></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}