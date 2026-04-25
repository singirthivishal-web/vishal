import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Palette, Moon, ChevronRight, CheckCircle2 } from 'lucide-react';

const SECTIONS = [
  {
    id: 'profile',
    icon: User,
    title: 'Profile',
    fields: [
      { label: 'Full Name',        placeholder: 'Your full name',       type: 'text'  },
      { label: 'Email Address',    placeholder: 'you@example.com',      type: 'email' },
      { label: 'Target Job Title', placeholder: 'e.g. Senior React Dev',type: 'text'  },
      { label: 'LinkedIn URL',     placeholder: 'https://linkedin.com/in/…', type: 'url' },
    ],
  },
  {
    id: 'notifications',
    icon: Bell,
    title: 'Notifications',
    toggles: [
      { label: 'Job match alerts',          sub: 'Get notified when a role matches your skills' },
      { label: 'Resume analysis complete',  sub: 'Notify when analysis results are ready' },
      { label: 'Weekly career digest',      sub: 'Weekly summary of your career metrics' },
    ],
  },
  {
    id: 'appearance',
    icon: Palette,
    title: 'Appearance',
    toggles: [
      { label: 'Dark mode',         sub: 'Use the dark theme (default)' },
      { label: 'Compact sidebar',   sub: 'Show icons only in the sidebar' },
      { label: 'Animated charts',   sub: 'Enable chart entry animations' },
    ],
  },
  {
    id: 'privacy',
    icon: Shield,
    title: 'Privacy & Security',
    toggles: [
      { label: 'Store resume data locally', sub: 'Keep all data in browser storage only' },
      { label: 'Analytics',                 sub: 'Help improve CareerOS with anonymous usage data' },
    ],
  },
];

export default function Settings() {
  const [saved,   setSaved]   = useState(false);
  const [profile, setProfile] = useState({ 0: '', 1: '', 2: '', 3: '' });
  const [toggles, setToggles] = useState({ 'Dark mode': true, 'Animated charts': true });

  function toggle(label) {
    setToggles(prev => ({ ...prev, [label]: !prev[label] }));
  }

  function saveAll() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-textMain tracking-tight">Settings</h1>
        <p className="text-textMuted mt-1">Manage your profile, notifications, and preferences.</p>
      </div>

      {SECTIONS.map(sec => (
        <div key={sec.id} className="bg-surface border border-surfaceHighlight rounded-2xl overflow-hidden">
          {/* Section header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-surfaceHighlight">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <sec.icon size={16} className="text-primary" />
            </div>
            <h2 className="font-semibold text-textMain">{sec.title}</h2>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* Text fields */}
            {sec.fields?.map((f, i) => (
              <div key={i}>
                <label className="block text-sm font-medium text-textMain mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={profile[i] || ''}
                  onChange={e => setProfile(prev => ({ ...prev, [i]: e.target.value }))}
                  className="w-full bg-background border border-surfaceHighlight rounded-xl px-4 py-2.5 text-sm text-textMain focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            ))}

            {/* Toggles */}
            {sec.toggles?.map((t, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-textMain">{t.label}</p>
                  <p className="text-xs text-textMuted mt-0.5">{t.sub}</p>
                </div>
                <button
                  onClick={() => toggle(t.label)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${toggles[t.label] ? 'bg-primary' : 'bg-surfaceHighlight'}`}
                >
                  <motion.div
                    animate={{ x: toggles[t.label] ? 22 : 2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Save button */}
      <div className="flex justify-end pb-4">
        <motion.button
          onClick={saveAll}
          whileTap={{ scale: 0.97 }}
          className={`px-8 py-3 rounded-xl font-medium transition-all shadow-lg flex items-center gap-2 ${
            saved
              ? 'bg-success text-white shadow-success/20'
              : 'bg-primary hover:bg-primaryHover text-white shadow-primary/20'
          }`}
        >
          {saved ? <><CheckCircle2 size={18} /> Saved!</> : 'Save Changes'}
        </motion.button>
      </div>
    </motion.div>
  );
}
