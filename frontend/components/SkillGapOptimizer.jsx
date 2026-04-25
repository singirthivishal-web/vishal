'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function SkillGapOptimizer() {
  const [input, setInput]           = useState('');
  const [isOptimizing, setOptimize] = useState(false);
  const [result, setResult]         = useState(null);

  function handleOptimize() {
    if (!input.trim()) return;
    setOptimize(true);
    setTimeout(() => {
      setOptimize(false);
      setResult([
        'Spearheaded the development of a responsive e-commerce web application using React, reducing load times by 40% and increasing user retention by 25%.',
        'Engineered scalable front-end architecture, collaborating with cross-functional teams to deliver 3 major feature releases ahead of schedule.',
        'Optimized core rendering logic, achieving a 98% Lighthouse performance score and improving overall SEO rankings.',
      ]);
    }, 2000);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-textMain tracking-tight">AI Bullet Point Rewriter</h1>
        <p className="text-textMuted mt-1">Transform weak resume points into high-impact, ATS-friendly achievements.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-textMain">Original Bullet Point</label>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            placeholder="e.g. Worked on a website using React and made it faster."
            className="w-full h-40 bg-surface border border-surfaceHighlight rounded-xl p-4 text-sm text-textMain focus:outline-none focus:border-primary transition-colors resize-none" />
          <button onClick={handleOptimize} disabled={!input.trim() || isOptimizing}
            className="w-full bg-primary hover:bg-primaryHover disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
            {isOptimizing
              ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              : <><Sparkles size={18} /> Optimize with AI</>}
          </button>
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-medium text-textMain">AI Optimized Variations</label>
          <div className="bg-surface border border-surfaceHighlight rounded-xl h-40 p-4 overflow-y-auto flex flex-col gap-3 min-h-[16rem]">
            {!result && !isOptimizing && <div className="flex-1 flex items-center justify-center text-textMuted text-sm">Optimized results will appear here.</div>}
            {isOptimizing && (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                <div className="flex gap-1">
                  {[0, 0.2, 0.4].map((d, i) => (
                    <motion.div key={i} animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: d }} className="w-2 h-2 rounded-full bg-primary" />
                  ))}
                </div>
                <span className="text-sm text-textMuted animate-pulse">Analyzing impact metrics…</span>
              </div>
            )}
            {result && result.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="p-3 bg-surfaceHighlight/30 border border-surfaceHighlight rounded-lg relative group cursor-pointer hover:border-primary transition-colors">
                <p className="text-sm text-textMain pr-8">{item}</p>
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted group-hover:text-primary transition-colors"><CheckCircle2 size={18} /></button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
