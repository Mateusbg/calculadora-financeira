import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, ShieldAlert, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

// Exclusão de conta com dupla confirmação (requisito de conformidade das lojas)
export default function ExcluirConta({ usuario }) {
  const queryClient = useQueryClient();
  const [passo, setPasso] = useState(0); // 0 = fechado, 1 = primeira confirmação, 2 = confirmação final
  const [confirmacao, setConfirmacao] = useState('');
  const [excluindo, setExcluindo] = useState(false);

  const excluirTudo = async () => {
    if (!usuario?.email || confirmacao !== 'EXCLUIR') return;
    setExcluindo(true);
    try {
      await base44.entities.Despesa.deleteMany({ created_by: usuario.email });
      await base44.entities.ConfiguracaoFinanceira.deleteMany({ created_by: usuario.email });
      queryClient.clear();
      await base44.auth.logout();
    } catch {
      setExcluindo(false);
      setPasso(0);
      toast.error('Erro ao excluir seus dados. Tente novamente.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-red-100 dark:border-red-500/20 shadow-sm p-6"
    >
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
        <div className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10">
          <ShieldAlert className="w-4 h-4 text-red-500" />
        </div>
        Excluir conta
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Exclui permanentemente todos os seus dados financeiros (despesas e configurações) e encerra
        sua sessão. Esta ação não pode ser desfeita.
      </p>

      {/* Primeira confirmação */}
      <AlertDialog open={passo === 1} onOpenChange={(aberto) => setPasso(aberto ? 1 : 0)}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="h-11 px-6" disabled={!usuario}>
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir conta e dados
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir sua conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os seus dados (despesas e configurações financeiras) serão excluídos
              permanentemente e você será desconectado do aplicativo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={(e) => {
                e.preventDefault();
                setPasso(2);
              }}
            >
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmação final: exige digitar EXCLUIR */}
      <AlertDialog open={passo === 2} onOpenChange={(aberto) => { if (!aberto && !excluindo) setPasso(0); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação final</AlertDialogTitle>
            <AlertDialogDescription>
              Para confirmar a exclusão permanente da sua conta e de todos os seus dados, digite
              EXCLUIR no campo abaixo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            placeholder="EXCLUIR"
            disabled={excluindo}
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              disabled={confirmacao !== 'EXCLUIR' || excluindo}
              onClick={(e) => {
                e.preventDefault();
                excluirTudo();
              }}
            >
              {excluindo ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir definitivamente'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}