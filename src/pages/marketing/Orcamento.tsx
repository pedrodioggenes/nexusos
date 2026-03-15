/**
 * @deprecated Esta página foi substituída por Financeiro.tsx
 * @see src/pages/hipergestao/Financeiro.tsx
 * 
 * Este arquivo é mantido por razões históricas e de compatibilidade.
 * A rota /app/marketing/orcamento agora redireciona para /app/marketing/financeiro
 * 
 * Para acessar a funcionalidade de orçamento, use o componente Financeiro.tsx
 */

import { Navigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

/**
 * Redirect component que encaminha /orcamento para /financeiro
 * Mantém a querystring se existir
 */
export default function OrcamentoRedirect() {
  const location = useLocation();
  
  return (
    <Navigate
      to={`/app/marketing/financeiro${location.search}`}
      replace
    />
  );
}
