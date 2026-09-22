import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, PercentCircle } from 'lucide-react';

export default function ResumoFinanceiro({ salario, totalDespesas, saldo, percentualGasto }) {
  const cards = [
    {
      title: 'Total de Despesas',
      value: totalDespesas,
      icon: TrendingDown,
      gradient: 'from-rose-500 to-pink-600',
      bgLight: 'bg-rose-50'
    },
    {
      title: 'Saldo Restante',
      value: saldo,
      icon: saldo >= 0 ? PiggyBank : Wallet,
      gradient: saldo >= 0 ? 'from-emerald-500 to-teal-600' : 'from-red-500 to-rose-600',
      bgLight: saldo >= 0 ? 'bg-emerald-50' : 'bg-red-50'
    },
    {
      title: '% do Salário',
      value: percentualGasto,
      isPercent: true,
      icon: PercentCircle,
      gradient: percentualGasto > 100 ? 'from-red-500 to-rose-600' : 'from-violet-500 to-purple-600',
      bgLight: 'bg-violet-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300"
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient}`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              {!card.isPercent && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  card.value >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {card.value >= 0 ? '+' : '-'}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{card.title}</p>
            <p className={`text-2xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
              {card.isPercent 
                ? `${card.value.toFixed(1)}%`
                : `R$ ${Math.abs(card.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              }
            </p>
          </div>
          <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full ${card.bgLight} opacity-50 dark:opacity-10`} />
        </motion.div>
      ))}
    </div>
  );
}