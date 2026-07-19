import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const LoadingScreen = () => {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0F172A]"
          data-testid="loading-screen"
          aria-label="Loading"
        >
          <div className="relative h-24 w-24">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
              <motion.circle
                cx="50" cy="50" r="42" fill="none" stroke="url(#load-grad)" strokeWidth="3" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                style={{ filter: "drop-shadow(0 0 6px rgba(91,33,182,0.8))" }}
              />
              <defs>
                <linearGradient id="load-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#5B21B6" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
            </svg>
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#5B21B6] shadow-[0_0_20px_rgba(91,33,182,0.7)]">
                <span className="h-3.5 w-3.5 rounded-sm bg-[#10B981]" />
              </span>
            </motion.div>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="mt-6 font-manrope font-semibold text-sm text-slate-300 tracking-wide"
          >
            Preparing Smarter Business Systems...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
