import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Receipt, CreditCard, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const categoriaCores = {
  'Moradia': 'bg-blue-100 text-blue-700 border-blue-200',
  'Alimentação': 'bg-orange-100 text-orange-700 border-orange-200',
  'Transporte': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Saúde': 'bg-red-100 text-red-700 border-red-200',
  'Educação': 'bg-purple-100 text-purple-700 border-purple-200',
  'Lazer': 'bg-pink-100 text-pink-700 border-pink-200',
  'Vestuário': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Contas': 'bg-slate-100 text-slate-700 border-slate-200',
  'Outros': 'bg-gray-100 text-gray-700 border-gray-200'
};

export default function ListaDespesas({ despesas, onRemover, mesAtual, formatarMes }) {
  if (despesas.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-12 text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Receipt className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-2">Nenhuma despesa</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Adicione sua primeira despesa para começar o controle.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
    >
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900">
            <Receipt className="w-4 h-4 text-white" />
          </div>
          Despesas de {formatarMes(mesAtual)}
        </h2>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        <AnimatePresence>
          {despesas.map((desp, index) => {
            const valorExibir = desp.ehParcela ? desp.valorParcela : desp.valor;
            
            return (
              <motion.div
                key={`${desp.id}-${desp.parcelaAtual || 1}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className={`hidden sm:flex w-10 h-10 rounded-xl items-center justify-center ${categoriaCores[desp.categoria]?.split(' ')[0]} border ${categoriaCores[desp.categoria]?.split(' ')[2]}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-slate-800 dark:text-slate-100 truncate">
                        {desp.descricao}
                      </h3>
                      {desp.ehParcela && (
                        <span className="shrink-0 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                          {desp.parcelaAtual}/{desp.totalParcelas}
                        </span>
                      )}
                      {desp.ehRecorrente && (
                        <span className="shrink-0 px-2 py-0.5 text-xs font-medium rounded-full bg-violet-100 text-violet-700 border border-violet-200 flex items-center gap-1">
                          <Repeat className="w-3 h-3" />
                          {desp.mesRecorrencia}/{desp.mesesRecorrencia || 12}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${categoriaCores[desp.categoria]}`}>
                        {desp.categoria}
                      </span>
                      {desp.ehParcela && (
                        <span className="text-xs text-slate-400">
                          Faltam {desp.parcelasRestantes - 1} parcelas
                        </span>
                      )}
                      {desp.ehRecorrente && (
                        <span className="text-xs text-slate-400">
                          Faltam {desp.mesesRestantes - 1} meses
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      R$ {valorExibir.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    {!desp.ehParcela && !desp.parcelado && (
                      <span className="text-xs text-slate-400">À vista</span>
                    )}
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover despesa?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {desp.parcelado || desp.ehParcela 
                            ? 'Isso removerá todas as parcelas desta despesa.'
                            : desp.recorrente || desp.ehRecorrente
                            ? 'Isso removerá todas as repetições desta despesa.'
                            : 'Esta ação não pode ser desfeita.'}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onRemover(desp.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}