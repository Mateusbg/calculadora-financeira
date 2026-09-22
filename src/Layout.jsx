import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, Wallet, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const itensNavegacao = [
  { to: '/', label: 'Gastos', icone: Wallet },
  { to: '/settings', label: 'Ajustes', icone: Settings },
];

export default function Layout({ children }) {
  const local = useLocation();
  const navegar = useNavigate();

  useEffect(() => {
    document.documentElement.lang = 'pt-BR';
  }, []);

  // Sincroniza automaticamente o modo escuro com as preferências do sistema
  useEffect(() => {
    const preferenciaEscura = window.matchMedia('(prefers-color-scheme: dark)');
    const aplicarTema = (evento) => {
      document.documentElement.classList.toggle('dark', evento.matches);
    };
    aplicarTema(preferenciaEscura);
    preferenciaEscura.addEventListener('change', aplicarTema);
    return () => preferenciaEscura.removeEventListener('change', aplicarTema);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Cabeçalho fixo (respeita a área segura superior em dispositivos com notch) */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="safe-area-top" />
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Botão voltar em telas internas (apenas mobile) */}
            {local.pathname !== '/' && (
              <button
                type="button"
                onClick={() => navegar(-1)}
                aria-label="Voltar"
                className="sm:hidden p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent no-select"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <Link to="/" className="flex items-center gap-3 no-select">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <p className="font-bold text-foreground text-sm sm:text-base">Controle Financeiro</p>
              <p className="text-xs text-muted-foreground hidden sm:block">Gerencie suas finanças</p>
            </div>
          </Link>
          </div>

          {/* Navegação no cabeçalho (desktop) */}
          <nav className="hidden sm:flex items-center gap-1 no-select">
            {itensNavegacao.map(({ to, label, icone: Icone }) => {
              const ativo = local.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    ativo
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <Icone className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Conteúdo com folga para a barra de abas inferior no mobile */}
      <main className="pb-24 sm:pb-0">{children}</main>

      {/* Barra de abas inferior (mobile, respeita a área segura inferior) */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border">
        <div className="grid grid-cols-2">
          {itensNavegacao.map(({ to, label, icone: Icone }) => {
            const ativo = local.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex flex-col items-center gap-1 py-2 text-xs font-medium no-select',
                  ativo ? 'text-emerald-600' : 'text-muted-foreground'
                )}
              >
                <Icone className="w-5 h-5" />
                {label}
              </Link>
            );
          })}
        </div>
        <div className="safe-area-bottom" />
      </nav>
    </div>
  );
}