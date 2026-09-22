import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

const CORES = {
  'Moradia': '#3B82F6',
  'Alimentação': '#F97316',
  'Transporte': '#06B6D4',
  'Saúde': '#EF4444',
  'Educação': '#8B5CF6',
  'Lazer': '#EC4899',
  'Vestuário': '#EAB308',
  'Contas': '#64748B',
  'Outros': '#6B7280'
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800">
        <p className="font-medium text-slate-800 dark:text-slate-100">{data.categoria}</p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          R$ {data.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">{data.percentual.toFixed(1)}% do total</p>
      </div>
    );
  }
  return null;
};

export default function GraficoCategorias({ despesasPorCategoria, salario }) {
  if (despesasPorCategoria.length === 0) {
    return null;
  }

  const totalGeral = despesasPorCategoria.reduce((acc, cat) => acc + cat.total, 0);
  const dadosComPercentual = despesasPorCategoria.map(cat => ({
    ...cat,
    percentual: (cat.total / totalGeral) * 100
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6"
    >
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
        <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
          <PieChartIcon className="w-4 h-4 text-white" />
        </div>
        Gastos por Categoria
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dadosComPercentual}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="total"
              >
                {dadosComPercentual.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CORES[entry.categoria]} 
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          {dadosComPercentual.map((cat, index) => (
            <motion.div
              key={cat.categoria}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3"
            >
              <div 
                className="w-3 h-3 rounded-full shrink-0" 
                style={{ backgroundColor: CORES[cat.categoria] }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                    {cat.categoria}
                  </span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 ml-2">
                    R$ {cat.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percentual}%` }}
                    transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: CORES[cat.categoria] }}
                  />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {cat.percentual.toFixed(1)}% do total
                  {salario > 0 && ` • ${((cat.total / salario) * 100).toFixed(1)}% do salário`}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}