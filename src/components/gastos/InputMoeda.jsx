import React from 'react';
import { Input } from '@/components/ui/input';

// Campo de moeda: enquanto digita, os números são formatados como R$ (padrão brasileiro)
// O valor digitado em centavos (dígitos) é exibido como "3.500,00"
export default function InputMoeda({ centavos, onAlterar, className, placeholder }) {
  const formatar = (digits) => {
    if (!digits) return '';
    return (parseInt(digits, 10) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  };

  return (
    <Input
      type="text"
      inputMode="numeric"
      value={formatar(centavos)}
      onChange={(e) => onAlterar(e.target.value.replace(/\D/g, ''))}
      placeholder={placeholder}
      className={className}
    />
  );
}