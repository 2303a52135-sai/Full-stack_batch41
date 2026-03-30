import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiSparkles, HiCollection, HiCalendar, HiGlobe, HiChartBar, HiArrowRight, HiMoon, HiSun } from 'react-icons/hi';
import { useTheme } from '../context/ThemeContext';

const features = [
  { icon: HiCollection,  color: 'from-violet-500 to-purple-600', title: 'Digital Closet',       desc: 'Catalogue every item with photos, colors, occasions and seasons.' },
  { icon: HiSparkles,    color: 'from-pink-500 to-rose-600',     title: 'AI Outfit Suggestions', desc: 'Smart content-based filtering recommends perfect outfit combos.' },
  { icon: HiCalendar,    color: 'from-blue-500 to-cyan-600',     title: 'Outfit Planner',        desc: 'Plan outfits on a calendar. Never repeat or forget what you wore.' },
  { icon: HiGlobe,       color: 'from-emerald-500 to-teal-600',  title: 'Travel Packing',        desc: 'Input destination + days and get a smart packing list instantly.' },
  { icon: HiChartBar,    color: 'from-amber-500 to-orange-600',  title: 'Wear Analytics',        desc: 'See most/least worn items and rediscover forgotten favourites.' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-40 glass border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-glow">
              <span className="text-white font-bold text-xs">SV</span>
            </div>
            <span className="font-display font-semibold text-lg gradient-text">StyleVault</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="btn-ghost p-2 rounded-lg">
              {isDark ? <HiSun className="w-4 h-4" /> : <HiMoon className="w-4 h-4" />}
            </button>
            <Link to="/login"    className="btn-ghost text-sm">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700 text-primary-600 dark:text-primary-300 text-sm font-medium mb-6">
            <HiSparkles className="w-4 h-4" />
            Your Smart Digital Wardrobe
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-[var(--color-text)] leading-tight mb-6">
            Dress Smarter.<br />
            <span className="gradient-text">Live Stylishly.</span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
            StyleVault organises your wardrobe, recommends outfits based on your style, 
            plans your week and even packs for your trips — all in one beautiful app.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary px-8 py-3 text-base gap-2">
              Start for Free <HiArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="btn-secondary px-8 py-3 text-base">
              Sign In
            </Link>
          </motion.div>

          {/* Demo hint */}
          <motion.p {...fadeUp(0.4)} className="mt-5 text-xs text-[var(--color-text-muted)]">
            Demo: <code className="bg-gray-100 dark:bg-dark-700 px-2 py-0.5 rounded text-xs">demo@wardrobe.com</code> · <code className="bg-gray-100 dark:bg-dark-700 px-2 py-0.5 rounded text-xs">demo1234</code>
          </motion.p>
        </div>

        {/* Floating mockup cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 max-w-5xl mx-auto grid grid-cols-3 sm:grid-cols-5 gap-3 px-4"
        >
          {['👔','👖','🧥','👟','👜','👗','🧣','🕶️','👒','🩴'].map((emoji, i) => (
            <motion.div key={i} whileHover={{ y: -5, rotate: [-1, 1][i % 2] }}
              className="card aspect-square flex items-center justify-center text-3xl sm:text-4xl shadow-card hover:shadow-card-hover transition-all">
              {emoji}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-dark-800/50">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-[var(--color-text)] mb-4">
              Everything your wardrobe needs
            </h2>
            <p className="text-[var(--color-text-muted)] max-w-xl mx-auto">
              From cataloguing clothes to AI-powered outfit building — StyleVault has you covered.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, color, title, desc }, i) => (
              <motion.div key={title} {...fadeUp(i * 0.1)} className="card-hover p-6">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display font-semibold text-lg text-[var(--color-text)] mb-2">{title}</h3>
                <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div {...fadeUp()} className="max-w-2xl mx-auto text-center">
          <div className="card p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-purple-500/5 pointer-events-none" />
            <h2 className="font-display text-4xl font-bold text-[var(--color-text)] mb-4">
              Ready to transform your wardrobe?
            </h2>
            <p className="text-[var(--color-text-muted)] mb-8">Join now and get smart outfit recommendations in minutes.</p>
            <Link to="/register" className="btn-primary px-10 py-3 text-base gap-2 shadow-glow">
              Create Free Account <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] py-8 px-6 text-center">
        <p className="text-sm text-[var(--color-text-muted)]">
          © {new Date().getFullYear()} StyleVault — Smart Wardrobe System · Built with MERN Stack
        </p>
      </footer>
    </div>
  );
}
