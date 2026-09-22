import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Check, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function InputSalario({ salario, onSalvar, isLoading }) {
  const [valor, setValor] = useState(salario?.toString() || '');
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    setValor(salario?.toString() || '');
  }, [salario]);

  const handleSalvar = async () => {
    await onSalvar(parseFloat(valor) || 0);
    setEditando(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-lg shadow-emerald-500/20"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-white">
          Salário Mensal
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700 font-medium">
            R$
          </span>
          <Input
            type="number"
            value={valor}
            onChange={(e) => {
              setValor(e.target.value);
              setEditando(true);
            }}
            placeholder="0,00"
            className="pl-12 h-14 text-2xl font-bold bg-white/95 border-0 shadow-lg placeholder:text-slate-300"
          />
        </div>

        {editando && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button
              onClick={handleSalvar}
              disabled={isLoading}
              className="h-14 w-14 bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Check className="w-5 h-5" />
              )}
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}