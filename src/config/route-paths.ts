/**
 * Route Paths — Single Source of Truth for all URL paths in the system.
 * 
 * The tenant is NEVER exposed in the URL. It is resolved from the 
 * authenticated user's JWT token on the backend.
 * 
 * URL structure: /app/{module-slug}/{page-path}
 */

// ─── App Path Mapping ────────────────────────────────────────

/** Maps internal appId → clean URL slug */
export const APP_PATHS: Record<string, string> = {
  nexusdesk:  '/app/desk',
  marketing:   '/app/marketing',
  ofertas:     '/app/ofertas',
  trade:       '/app/trade',
  rh:          '/app/rh',
  dominio:     '/app/dominio',
  pmo:         '/app/tech',
  cd:          '/app/cd',
  cliente:     '/app/cliente',
  compras:     '/app/compras',
  financeiro:  '/app/financeiro',
  loja:        '/app/loja',
  reposicao:   '/app/reposicao',
  sorteios:    '/app/sorteios',
  ia:          '/app/ia',
  academy:     '/app/academy',
};

/** Portal route (hidden, only accessible if you know the URL) */
export const PORTAL_PATH = '/portal';

/** Supplier portal */
export const SUPPLIER_PORTAL_PATH = '/fornecedor';

/** Supplier trade routes base */
export const SUPPLIER_TRADE_PATH = '/app/trade/fornecedor';

/** Resolve the URL path for an appId */
export function getAppPath(appId: string): string {
  return APP_PATHS[appId] || `/app/${appId}`;
}

/** Build a full path for a page within an app */
export function getAppPagePath(appId: string, pagePath?: string): string {
  const base = getAppPath(appId);
  if (!pagePath) return base;
  return `${base}/${pagePath}`.replace(/\/+/g, '/');
}
