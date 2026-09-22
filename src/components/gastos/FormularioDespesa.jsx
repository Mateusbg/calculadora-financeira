import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CreditCard, Calendar, Tag, FileText, Hash, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputMoeda from '@/components/gastos/InputMoeda';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { Switch } from '@/components/ui/switch';

const categorias = [
  'Moradia', 'Alimentação', 'Transporte', 'Saúde', 
  'Educação', 'Lazer', 'Vestuário', 'Contas', 'Outros'
];

const categoriaCores = {
  'Moradia': 'bg-blue-500',
  'Alimentação': 'bg-orange-500',
  'Transporte': 'bg-cyan-500',
  'Saúde': 'bg-red-500',
  'Educação': 'bg-purple-500',
  'Lazer': 'bg-pink-500',
  'Vestuário': 'bg-yellow-500',
  'Contas': 'bg-slate-500',
  'Outros': 'bg-gray-500'
};

export default function FormularioDespesa({ onAdicionar, isLoading }) {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('Moradia');
  const [data, setData] = useState(new Date().toISOString().slice(0, 7));
  const [parcelado, setParcelado] = useState(false);
  const [totalParcelas, setTotalParcelas] = useState('2');
  const [recorrente, setRecorrente] = useState(false);
  const [mesesRecorrencia, setMesesRecorrencia] = useState('12');
  const [categoriaAberta, setCategoriaAberta] = useState(false);
  const isMobile = useIsMobile();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!descricao || !valor || !data) return;

    await onAdicionar({
      descricao,
      valor: valor ? parseInt(valor, 10) / 100 : 0,
      categoria,
      data,
      parcelado,
      totalParcelas: parcelado ? parseInt(totalParcelas) : 1,
      recorrente,
      mesesRecorrencia: recorrente ? parseInt(mesesRecorrencia) : 12
    });

    setDescricao('');
    setValor('');
    setParcelado(false);
    setTotalParcelas('2');
    setRecorrente(false);
    setMesesRecorrencia('12');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6"
    >
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
        <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
          <Plus className="w-4 h-4 text-white" />
        </div>
        Nova Despesa
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-600 dark:text-slate-300 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Mês
            </Label>
            <Input
              type="month"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="h-11 border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-600 dark:text-slate-300 text-sm flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Categoria
            </Label>
            {isMobile ? (
              <Drawer open={categoriaAberta} onOpenChange={setCategoriaAberta}>
                <DrawerTrigger asChild>
                  <button
                    type="button"
                    className="flex h-11 w-full items-center justify-between rounded-md border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${categoriaCores[categoria]}`} />
                      {categoria}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  </button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[70vh]">
                  <DrawerHeader className="text-left">
                    <DrawerTitle>Categoria</DrawerTitle>
                  </DrawerHeader>
                  <div className="p-4 pb-8 space-y-1 overflow-y-auto">
                    {categorias.map(cat => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => {
                          setCategoria(cat);
                          setCategoriaAberta(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <span className={`w-2 h-2 rounded-full ${categoriaCores[cat]}`} />
                        <span className={cat === categoria ? 'font-semibold text-emerald-600' : 'text-slate-700 dark:text-slate-200'}>
                          {cat}
                        </span>
                        {cat === categoria && <Check className="ml-auto w-4 h-4 text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                </DrawerContent>
              </Drawer>
            ) : (
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger className="h-11 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${categoriaCores[cat]}`} />
                        {cat}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-slate-600 dark:text-slate-300 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Descrição
            </Label>
            <Input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Aluguel"
              className="h-11 border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-600 dark:text-slate-300 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Valor Total
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm pointer-events-none">
                R$
              </span>
              <InputMoeda
                centavos={valor}
                onAlterar={setValor}
                placeholder="0,00"
                className="h-11 pl-10 border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-2">
          <div className="flex items-center gap-3">
            <Switch
              checked={parcelado}
              onCheckedChange={(checked) => {
                setParcelado(checked);
                if (checked) setRecorrente(false);
              }}
              className="data-[state=checked]:bg-emerald-500"
            />
            <Label className="text-slate-600 dark:text-slate-300 text-sm cursor-pointer">
              Parcelado
            </Label>
          </div>

          <AnimatePresence>
            {parcelado && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-2"
              >
                <Hash className="w-4 h-4 text-slate-400" />
                <Input
                  type="number"
                  value={totalParcelas}
                  onChange={(e) => setTotalParcelas(e.target.value)}
                  min="2"
                  max="48"
                  className="w-20 h-9 border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                />
                <span className="text-sm text-slate-500 dark:text-slate-400">parcelas</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3">
            <Switch
              checked={recorrente}
              onCheckedChange={(checked) => {
                setRecorrente(checked);
                if (checked) setParcelado(false);
              }}
              className="data-[state=checked]:bg-violet-500"
            />
            <Label className="text-slate-600 dark:text-slate-300 text-sm cursor-pointer">
              Recorrente
            </Label>
          </div>

          <AnimatePresence>
            {recorrente && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-2"
              >
                <Hash className="w-4 h-4 text-slate-400" />
                <Input
                  type="number"
                  value={mesesRecorrencia}
                  onChange={(e) => setMesesRecorrencia(e.target.value)}
                  min="1"
                  max="60"
                  className="w-20 h-9 border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                />
                <span className="text-sm text-slate-500 dark:text-slate-400">meses</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1" />

          <Button
            type="submit"
            disabled={!descricao || !valor || isLoading}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 h-11 px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </form>
    </motion.div>
  );
}