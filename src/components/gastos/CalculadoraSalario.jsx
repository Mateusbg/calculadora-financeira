import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Check, Loader2, Calculator, ChevronDown, ChevronUp, CalendarClock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import InputMoeda from '@/components/gastos/InputMoeda';

// Tabela INSS 2024
const calcularINSS = (salarioBruto) => {
  let inss = 0;

  if (salarioBruto <= 1412.00) {
    inss = salarioBruto * 0.075;
  } else if (salarioBruto <= 2666.68) {
    inss = (1412.00 * 0.075) + ((salarioBruto - 1412.00) * 0.09);
  } else if (salarioBruto <= 4000.03) {
    inss = (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((salarioBruto - 2666.68) * 0.12);
  } else if (salarioBruto <= 7786.02) {
    inss = (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((4000.03 - 2666.68) * 0.12) + ((salarioBruto - 4000.03) * 0.14);
  } else {
    inss = (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((4000.03 - 2666.68) * 0.12) + ((7786.02 - 4000.03) * 0.14);
  }

  return inss;
};

const paraCentavos = (valor) => (valor ? Math.round(valor * 100).toString() : '');

export default function CalculadoraSalario({ configuracao, onSalvar, isLoading }) {
  const [salarioBruto, setSalarioBruto] = useState(paraCentavos(configuracao?.salarioBruto));
  const [quinzenal, setQuinzenal] = useState(!!configuracao?.pagamentoQuinzenal);
  const [percentualAdiantamento, setPercentualAdiantamento] = useState(
    configuracao?.percentualAdiantamento?.toString() || '40'
  );
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    setSalarioBruto(paraCentavos(configuracao?.salarioBruto));
    setQuinzenal(!!configuracao?.pagamentoQuinzenal);
    setPercentualAdiantamento(configuracao?.percentualAdiantamento?.toString() || '40');
  }, [configuracao]);

  const bruto = salarioBruto ? parseInt(salarioBruto, 10) / 100 : 0;
  const inss = calcularINSS(bruto);
  const liquido = bruto - inss;

  const pct = Math.min(100, Math.max(0, parseFloat(percentualAdiantamento) || 0));
  const adiantamento = quinzenal ? bruto * (pct / 100) : 0;
  const pagamentoFinal = quinzenal ? liquido - adiantamento : 0;

  const handleSalvar = async () => {
    await onSalvar({
      salarioBruto: bruto,
      salario: liquido,
      descontoINSS: inss,
      pagamentoQuinzenal: quinzenal,
      percentualAdiantamento: pct
    });
    setEditando(false);
  };

  const temAlteracao =
    salarioBruto !== paraCentavos(configuracao?.salarioBruto) ||
    quinzenal !== !!configuracao?.pagamentoQuinzenal ||
    pct !== (configuracao?.percentualAdiantamento ?? 40);

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

      <div className="space-y-4">
        {/* Salário Bruto */}
        <div>
          <Label className="text-white/80 text-sm mb-2 block">
            Salário Bruto (antes dos descontos)
          </Label>
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700 font-medium">
              R$
            </span>
            <InputMoeda
              centavos={salarioBruto}
              onAlterar={(novosCentavos) => {
                setSalarioBruto(novosCentavos);
                setEditando(true);
              }}
              placeholder="0,00"
              className="pl-12 h-14 text-2xl font-bold bg-white/95 border-0 shadow-lg placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* Pagamento Quinzenal */}
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-white/80" />
            <Label className="text-white/80 text-sm cursor-pointer">
              Pagamento Quinzenal
            </Label>
          </div>
          <Switch
            checked={quinzenal}
            onCheckedChange={(checked) => {
              setQuinzenal(checked);
              setEditando(true);
            }}
          />
        </div>

        {/* Configuração do Adiantamento Quinzenal */}
        <AnimatePresence>
          {quinzenal && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Label className="text-white/80 text-sm mb-2 block">
                  % paga no adiantamento (1ª quinzena)
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={percentualAdiantamento}
                    onChange={(e) => {
                      setPercentualAdiantamento(e.target.value);
                      setEditando(true);
                    }}
                    min="0"
                    max="100"
                    className="h-11 pr-10 bg-white/95 border-0 shadow-lg"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                    %
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80">Adiantamento (1ª quinzena)</span>
                    <span className="text-white font-semibold">
                      R$ {adiantamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80">Pagamento final (2ª quinzena)</span>
                    <span className="text-white font-semibold">
                      R$ {pagamentoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="h-px bg-white/20" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">Desconto INSS no pagamento final</span>
                    <span className="text-red-300">
                      - R$ {inss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Salário Líquido */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 text-sm">Salário Líquido</span>
            <button
              onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
              className="flex items-center gap-1 text-white/80 hover:text-white text-sm"
            >
              <Calculator className="w-4 h-4" />
              Ver cálculo
              {mostrarDetalhes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-3xl font-bold text-white">
            R$ {liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Detalhes dos Descontos */}
        <AnimatePresence>
          {mostrarDetalhes && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-3 border border-white/20"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/80">Salário Bruto</span>
                <span className="text-white font-semibold">
                  R$ {bruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-px bg-white/20" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/80">(-) INSS</span>
                <span className="text-red-300 font-semibold">
                  - R$ {inss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-px bg-white/20" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-white font-semibold">(=) Líquido</span>
                <span className="text-white font-bold text-base">
                  R$ {liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botão Salvar */}
        {temAlteracao && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button
              onClick={handleSalvar}
              disabled={isLoading || !salarioBruto}
              className="w-full h-12 bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg font-semibold"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Check className="w-5 h-5 mr-2" />
              )}
              Salvar Configuração
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}