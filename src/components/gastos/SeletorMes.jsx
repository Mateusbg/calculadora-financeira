import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SeletorMes({ mesAtual, onMudarMes, formatarMes }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center gap-3"
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => onMudarMes(-1)}
        className="h-10 w-10 rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:hover:border-slate-600"
      >
        <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
      </Button>

      <div className="flex items-center gap-3 px-6 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-lg">
        <Calendar className="w-5 h-5 text-white/80" />
        <span className="text-lg font-semibold text-white min-w-[160px] text-center">
          {formatarMes(mesAtual)}
        </span>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onMudarMes(1)}
        className="h-10 w-10 rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:hover:border-slate-600"
      >
        <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
      </Button>
    </motion.div>
  );
}