import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User } from 'lucide-react';
import ExcluirConta from '@/components/ajustes/ExcluirConta';

export default function Ajustes() {
  const { data: usuario } = useQuery({
    queryKey: ['usuario'],
    queryFn: () => base44.auth.me()
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
            <SettingsIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Ajustes</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Sua conta e preferências do app</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6"
          >
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </div>
            Conta
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide">Nome</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{usuario?.full_name || 'Usuário'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide">E-mail</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{usuario?.email || '—'}</p>
            </div>
          </div>
        </motion.div>

        <ExcluirConta usuario={usuario} />
      </div>
    </div>
  );
}