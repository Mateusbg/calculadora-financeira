import React, { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Loader2, DollarSign, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import CalculadoraSalario from '@/components/gastos/CalculadoraSalario';
import SeletorMes from '@/components/gastos/SeletorMes';
import ResumoFinanceiro from '@/components/gastos/ResumoFinanceiro';
import FormularioDespesa from '@/components/gastos/FormularioDespesa';
import ListaDespesas from '@/components/gastos/ListaDespesas';
import GraficoCategorias from '@/components/gastos/GraficoCategorias';

const categorias = [
  'Moradia', 'Alimentação', 'Transporte', 'Saúde', 
  'Educação', 'Lazer', 'Vestuário', 'Contas', 'Outros'
];

export default function PlanilhaGastos() {
  const [mesAtual, setMesAtual] = useState(new Date().toISOString().slice(0, 7));
  const [usuario, setUsuario] = useState(null);
  // Pull-to-Refresh (toque no topo da lista)
  const [distanciaPuxar, setDistanciaPuxar] = useState(0);
  const [atualizando, setAtualizando] = useState(false);
  const inicioToque = useRef(null);
  const queryClient = useQueryClient();

  // Carregar usuário atual
  useQuery({
    queryKey: ['usuario'],
    queryFn: async () => {
      const user = await base44.auth.me();
      setUsuario(user);
      return user;
    }
  });

  // Carregar configuração (salário) - filtrada por usuário
  const { data: configuracoes = [], isLoading: loadingConfig } = useQuery({
    queryKey: ['configuracao', usuario?.email],
    queryFn: async () => {
      if (!usuario) return [];
      return base44.entities.ConfiguracaoFinanceira.filter({ created_by: usuario.email });
    },
    enabled: !!usuario
  });

  const configuracao = configuracoes[0] || null;
  const salario = configuracao?.salario || 0;

  // Carregar despesas - filtradas por usuário
  const { data: despesas = [], isLoading: loadingDespesas } = useQuery({
    queryKey: ['despesas', usuario?.email],
    queryFn: async () => {
      if (!usuario) return [];
      return base44.entities.Despesa.filter({ created_by: usuario.email }, '-data');
    },
    enabled: !!usuario
  });

  // Mutations
  const salvarSalarioMutation = useMutation({
    mutationFn: async (dadosConfiguracao) => {
      if (configuracao?.id) {
        return base44.entities.ConfiguracaoFinanceira.update(configuracao.id, dadosConfiguracao);
      } else {
        return base44.entities.ConfiguracaoFinanceira.create(dadosConfiguracao);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracao', usuario?.email] });
      toast.success('Configuração salva com sucesso!');
    }
  });

  const adicionarDespesaMutation = useMutation({
    mutationFn: (novaDespesa) => base44.entities.Despesa.create(novaDespesa),
    // Renderização otimista: a despesa aparece na hora, sem estado de carregamento
    onMutate: async (novaDespesa) => {
      await queryClient.cancelQueries({ queryKey: ['despesas', usuario?.email] });
      const despesasAnteriores = queryClient.getQueryData(['despesas', usuario?.email]);
      queryClient.setQueryData(['despesas', usuario?.email], (atual = []) => [
        ...atual,
        { ...novaDespesa, id: `temporaria-${Date.now()}`, created_date: new Date().toISOString() }
      ]);
      return { despesasAnteriores };
    },
    onError: (_erro, _dados, contexto) => {
      queryClient.setQueryData(['despesas', usuario?.email], contexto.despesasAnteriores);
      toast.error('Erro ao adicionar despesa');
    },
    onSuccess: () => {
      toast.success('Despesa adicionada!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas', usuario?.email] });
    }
  });

  const removerDespesaMutation = useMutation({
    mutationFn: (id) => base44.entities.Despesa.delete(id),
    // Renderização otimista: a despesa some da lista imediatamente
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['despesas', usuario?.email] });
      const despesasAnteriores = queryClient.getQueryData(['despesas', usuario?.email]);
      queryClient.setQueryData(['despesas', usuario?.email], (atual = []) =>
        atual.filter(d => d.id !== id)
      );
      return { despesasAnteriores };
    },
    onError: (_erro, _id, contexto) => {
      queryClient.setQueryData(['despesas', usuario?.email], contexto.despesasAnteriores);
      toast.error('Erro ao remover despesa');
    },
    onSuccess: () => {
      toast.success('Despesa removida!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas', usuario?.email] });
    }
  });

  // Calcular despesas do mês considerando parcelamentos e recorrência
  const despesasMesAtual = useMemo(() => {
    const despesasFiltradas = [];
    
    despesas.forEach(desp => {
      if (desp.parcelado && desp.totalParcelas > 1) {
        const dataInicio = new Date(desp.data + '-01');
        const mesAtualDate = new Date(mesAtual + '-01');
        
        const mesesDiferenca = (mesAtualDate.getFullYear() - dataInicio.getFullYear()) * 12 + 
                               (mesAtualDate.getMonth() - dataInicio.getMonth());
        
        if (mesesDiferenca >= 0 && mesesDiferenca < desp.totalParcelas) {
          despesasFiltradas.push({
            ...desp,
            parcelaAtual: mesesDiferenca + 1,
            parcelasRestantes: desp.totalParcelas - mesesDiferenca,
            valorParcela: desp.valor / desp.totalParcelas,
            ehParcela: true
          });
        }
      } else if (desp.recorrente) {
        const dataInicio = new Date(desp.data + '-01');
        const mesAtualDate = new Date(mesAtual + '-01');
        
        const mesesDiferenca = (mesAtualDate.getFullYear() - dataInicio.getFullYear()) * 12 + 
                               (mesAtualDate.getMonth() - dataInicio.getMonth());
        
        if (mesesDiferenca >= 0 && mesesDiferenca < (desp.mesesRecorrencia || 12)) {
          despesasFiltradas.push({
            ...desp,
            mesRecorrencia: mesesDiferenca + 1,
            mesesRestantes: (desp.mesesRecorrencia || 12) - mesesDiferenca,
            ehRecorrente: true
          });
        }
      } else {
        if (desp.data === mesAtual) {
          despesasFiltradas.push({ ...desp, ehParcela: false, ehRecorrente: false });
        }
      }
    });
    
    return despesasFiltradas;
  }, [despesas, mesAtual]);

  // Cálculos financeiros
  const totalDespesas = despesasMesAtual.reduce((acc, desp) => {
    const valor = desp.ehParcela ? desp.valorParcela : desp.valor;
    return acc + parseFloat(valor || 0);
  }, 0);
  
  const saldo = salario - totalDespesas;
  const percentualGasto = salario > 0 ? (totalDespesas / salario) * 100 : 0;

  // Despesas por categoria
  const despesasPorCategoria = useMemo(() => {
    return categorias.map(cat => ({
      categoria: cat,
      total: despesasMesAtual
        .filter(d => d.categoria === cat)
        .reduce((acc, d) => acc + (d.ehParcela ? d.valorParcela : d.valor), 0)
    })).filter(c => c.total > 0);
  }, [despesasMesAtual]);

  // Pull-to-Refresh: puxar para baixo no topo atualiza a lista de despesas
  const iniciarToque = (e) => {
    if (window.scrollY <= 0 && !atualizando) inicioToque.current = e.touches[0].clientY;
  };

  const moverToque = (e) => {
    if (inicioToque.current == null) return;
    const delta = e.touches[0].clientY - inicioToque.current;
    if (delta > 0 && window.scrollY <= 0) setDistanciaPuxar(Math.min(delta * 0.5, 80));
  };

  const soltarToque = async () => {
    const puxouSuficiente = distanciaPuxar >= 60;
    inicioToque.current = null;
    setDistanciaPuxar(0);
    if (!puxouSuficiente) return;
    setAtualizando(true);
    try {
      await queryClient.refetchQueries({ queryKey: ['despesas', usuario?.email] });
    } finally {
      setAtualizando(false);
    }
  };

  const mudarMes = (direcao) => {
    const [ano, mes] = mesAtual.split('-').map(Number);
    const novaData = new Date(ano, mes - 1 + direcao, 1);
    setMesAtual(novaData.toISOString().slice(0, 7));
  };

  const formatarMes = (mesStr) => {
    const [ano, mes] = mesStr.split('-');
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${meses[parseInt(mes) - 1]} ${ano}`;
  };

  if (!usuario || loadingConfig || loadingDespesas) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950"
      onTouchStart={iniciarToque}
      onTouchMove={moverToque}
      onTouchEnd={soltarToque}
    >
      {/* Indicador de pull-to-refresh */}
      {(distanciaPuxar > 0 || atualizando) && (
        <div
          className="fixed top-16 left-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-lg text-emerald-600 dark:text-emerald-400 text-xs font-medium"
          style={{ transform: `translate(-50%, ${distanciaPuxar}px)` }}
        >
          <RefreshCw className={`w-4 h-4 ${atualizando ? 'animate-spin' : ''}`} />
          {atualizando ? 'Atualizando...' : 'Puxe para atualizar'}
        </div>
      )}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
              <DollarSign className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
                Controle de Gastos
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Gerencie suas finanças de forma simples
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Calculadora de Salário e Seletor de Mês */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CalculadoraSalario
              configuracao={configuracao}
              onSalvar={salvarSalarioMutation.mutateAsync}
              isLoading={salvarSalarioMutation.isPending}
            />
            <div className="flex items-center justify-center lg:justify-end">
              <SeletorMes
                mesAtual={mesAtual}
                onMudarMes={mudarMes}
                formatarMes={formatarMes}
              />
            </div>
          </div>

          {/* Resumo Financeiro */}
          <ResumoFinanceiro
            salario={salario}
            totalDespesas={totalDespesas}
            saldo={saldo}
            percentualGasto={percentualGasto}
          />

          {/* Formulário de Despesa */}
          <FormularioDespesa
            onAdicionar={adicionarDespesaMutation.mutateAsync}
            isLoading={adicionarDespesaMutation.isPending}
          />

          {/* Grid de Conteúdo */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ListaDespesas
                despesas={despesasMesAtual}
                onRemover={removerDespesaMutation.mutateAsync}
                mesAtual={mesAtual}
                formatarMes={formatarMes}
              />
            </div>
            <div>
              <GraficoCategorias
                despesasPorCategoria={despesasPorCategoria}
                salario={salario}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}