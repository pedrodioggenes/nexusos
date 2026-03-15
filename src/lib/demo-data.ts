// ============================================================================
// DADOS DE DEMONSTRAÇÃO - Rede Demo R$ 250M Faturamento Anual
// ============================================================================
// Este arquivo contém dados de simulação realistas para uma rede varejista
// com faturamento anual de aproximadamente R$ 250 milhões (~ R$ 20.8M/mês)

// ============================================================================
// FORNECEDORES INDUSTRIAIS (50+)
// ============================================================================
export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  category: string;
  contact_email: string;
  contact_phone: string;
  annual_volume: number;
  margin_avg: number;
  is_active: boolean;
  trade_budget_negotiated: number;
  trade_budget_executed: number;
  roi_avg: number;
}

export const SUPPLIERS: Supplier[] = [
  // Tier 1 - Gigantes (R$ 5M+ volume anual)
  { id: 'nestle', name: 'Nestlé Brasil', cnpj: '60.409.075/0001-52', category: 'Alimentos', contact_email: 'trade@nestle.com.br', contact_phone: '(11) 99999-0001', annual_volume: 12500000, margin_avg: 24.5, is_active: true, trade_budget_negotiated: 380000, trade_budget_executed: 285000, roi_avg: 285 },
  { id: 'unilever', name: 'Unilever Brasil', cnpj: '01.615.814/0001-55', category: 'Higiene/Limpeza', contact_email: 'trade@unilever.com', contact_phone: '(11) 99999-0002', annual_volume: 11200000, margin_avg: 22.8, is_active: true, trade_budget_negotiated: 350000, trade_budget_executed: 262500, roi_avg: 268 },
  { id: 'ambev', name: 'Ambev S.A.', cnpj: '07.526.557/0001-00', category: 'Bebidas', contact_email: 'trade@ambev.com.br', contact_phone: '(11) 99999-0003', annual_volume: 18500000, margin_avg: 18.5, is_active: true, trade_budget_negotiated: 480000, trade_budget_executed: 420000, roi_avg: 312 },
  { id: 'coca-cola', name: 'Coca-Cola FEMSA', cnpj: '45.997.418/0001-53', category: 'Bebidas', contact_email: 'trade@coca-cola.com', contact_phone: '(11) 99999-0004', annual_volume: 14800000, margin_avg: 19.2, is_active: true, trade_budget_negotiated: 420000, trade_budget_executed: 357000, roi_avg: 295 },
  { id: 'pepsico', name: 'PepsiCo do Brasil', cnpj: '31.522.458/0001-56', category: 'Alimentos/Bebidas', contact_email: 'trade@pepsico.com', contact_phone: '(11) 99999-0005', annual_volume: 9800000, margin_avg: 23.4, is_active: true, trade_budget_negotiated: 320000, trade_budget_executed: 256000, roi_avg: 248 },
  { id: 'jbs', name: 'JBS S.A. (Friboi/Seara)', cnpj: '02.916.265/0001-60', category: 'Carnes', contact_email: 'trade@jbs.com.br', contact_phone: '(11) 99999-0006', annual_volume: 22500000, margin_avg: 15.8, is_active: true, trade_budget_negotiated: 280000, trade_budget_executed: 224000, roi_avg: 232 },
  { id: 'brf', name: 'BRF S.A. (Sadia/Perdigão)', cnpj: '01.838.723/0001-27', category: 'Carnes', contact_email: 'trade@brf.com', contact_phone: '(11) 99999-0007', annual_volume: 18200000, margin_avg: 16.5, is_active: true, trade_budget_negotiated: 320000, trade_budget_executed: 272000, roi_avg: 258 },
  { id: 'pg', name: 'Procter & Gamble', cnpj: '60.894.730/0001-10', category: 'Higiene/Limpeza', contact_email: 'trade@pg.com', contact_phone: '(11) 99999-0008', annual_volume: 8900000, margin_avg: 26.2, is_active: true, trade_budget_negotiated: 290000, trade_budget_executed: 232000, roi_avg: 275 },
  
  // Tier 2 - Grandes (R$ 2-5M volume anual)
  { id: 'mondelez', name: 'Mondelez Brasil', cnpj: '07.837.592/0001-60', category: 'Alimentos', contact_email: 'trade@mondelez.com', contact_phone: '(11) 99999-0009', annual_volume: 4800000, margin_avg: 28.5, is_active: true, trade_budget_negotiated: 180000, trade_budget_executed: 144000, roi_avg: 265 },
  { id: 'danone', name: 'Danone Brasil', cnpj: '23.643.315/0001-52', category: 'Laticínios', contact_email: 'trade@danone.com', contact_phone: '(11) 99999-0010', annual_volume: 4200000, margin_avg: 21.8, is_active: true, trade_budget_negotiated: 160000, trade_budget_executed: 128000, roi_avg: 242 },
  { id: 'kelloggs', name: "Kellogg's Brasil", cnpj: '10.376.987/0001-20', category: 'Cereais', contact_email: 'trade@kelloggs.com', contact_phone: '(11) 99999-0011', annual_volume: 3200000, margin_avg: 25.6, is_active: true, trade_budget_negotiated: 140000, trade_budget_executed: 112000, roi_avg: 235 },
  { id: 'heinz', name: 'Kraft Heinz Brasil', cnpj: '60.500.139/0001-26', category: 'Alimentos', contact_email: 'trade@kraftheinz.com', contact_phone: '(11) 99999-0012', annual_volume: 2800000, margin_avg: 27.2, is_active: true, trade_budget_negotiated: 120000, trade_budget_executed: 96000, roi_avg: 228 },
  { id: 'colgate', name: 'Colgate-Palmolive', cnpj: '61.189.288/0001-89', category: 'Higiene', contact_email: 'trade@colgate.com', contact_phone: '(11) 99999-0013', annual_volume: 3800000, margin_avg: 24.8, is_active: true, trade_budget_negotiated: 150000, trade_budget_executed: 120000, roi_avg: 255 },
  { id: 'johnson', name: "Johnson & Johnson", cnpj: '54.516.661/0001-01', category: 'Higiene/Saúde', contact_email: 'trade@jnj.com', contact_phone: '(11) 99999-0014', annual_volume: 3500000, margin_avg: 29.5, is_active: true, trade_budget_negotiated: 140000, trade_budget_executed: 112000, roi_avg: 248 },
  { id: 'cargill', name: 'Cargill Brasil', cnpj: '60.498.706/0001-06', category: 'Alimentos', contact_email: 'trade@cargill.com', contact_phone: '(11) 99999-0015', annual_volume: 4500000, margin_avg: 18.2, is_active: true, trade_budget_negotiated: 130000, trade_budget_executed: 104000, roi_avg: 218 },
  { id: 'mars', name: 'Mars Brasil', cnpj: '61.079.117/0001-05', category: 'Alimentos/Pet', contact_email: 'trade@mars.com', contact_phone: '(11) 99999-0016', annual_volume: 3900000, margin_avg: 26.8, is_active: true, trade_budget_negotiated: 160000, trade_budget_executed: 128000, roi_avg: 262 },
  { id: 'arcor', name: 'Arcor do Brasil', cnpj: '03.759.918/0001-68', category: 'Alimentos', contact_email: 'trade@arcor.com.br', contact_phone: '(11) 99999-0017', annual_volume: 2600000, margin_avg: 25.4, is_active: true, trade_budget_negotiated: 110000, trade_budget_executed: 88000, roi_avg: 225 },
  { id: 'aurora', name: 'Aurora Alimentos', cnpj: '83.310.441/0001-17', category: 'Carnes', contact_email: 'trade@aurora.com.br', contact_phone: '(47) 99999-0018', annual_volume: 5200000, margin_avg: 16.8, is_active: true, trade_budget_negotiated: 150000, trade_budget_executed: 120000, roi_avg: 215 },
  { id: 'piracanjuba', name: 'Piracanjuba', cnpj: '00.543.318/0001-13', category: 'Laticínios', contact_email: 'trade@piracanjuba.com.br', contact_phone: '(62) 99999-0019', annual_volume: 3100000, margin_avg: 19.5, is_active: true, trade_budget_negotiated: 120000, trade_budget_executed: 96000, roi_avg: 208 },
  
  // Tier 3 - Médios (R$ 1-2M volume anual)
  { id: 'itambe', name: 'Itambé Alimentos', cnpj: '16.670.725/0001-55', category: 'Laticínios', contact_email: 'trade@itambe.com.br', contact_phone: '(31) 99999-0020', annual_volume: 1850000, margin_avg: 20.2, is_active: true, trade_budget_negotiated: 80000, trade_budget_executed: 64000, roi_avg: 195 },
  { id: 'camil', name: 'Camil Alimentos', cnpj: '00.404.151/0001-81', category: 'Alimentos', contact_email: 'trade@camil.com.br', contact_phone: '(11) 99999-0021', annual_volume: 2200000, margin_avg: 14.5, is_active: true, trade_budget_negotiated: 70000, trade_budget_executed: 56000, roi_avg: 188 },
  { id: 'vigor', name: 'Vigor Alimentos', cnpj: '02.914.460/0001-50', category: 'Laticínios', contact_email: 'trade@vigor.com.br', contact_phone: '(11) 99999-0022', annual_volume: 1980000, margin_avg: 21.5, is_active: true, trade_budget_negotiated: 85000, trade_budget_executed: 68000, roi_avg: 202 },
  { id: 'ypioce', name: 'Ypióca (Diageo)', cnpj: '42.562.178/0001-34', category: 'Bebidas', contact_email: 'trade@ypioca.com.br', contact_phone: '(85) 99999-0023', annual_volume: 1200000, margin_avg: 32.5, is_active: true, trade_budget_negotiated: 60000, trade_budget_executed: 48000, roi_avg: 185 },
  { id: 'heineken', name: 'Heineken Brasil', cnpj: '42.243.114/0001-00', category: 'Bebidas', contact_email: 'trade@heineken.com', contact_phone: '(11) 99999-0024', annual_volume: 5800000, margin_avg: 19.8, is_active: true, trade_budget_negotiated: 220000, trade_budget_executed: 176000, roi_avg: 245 },
  { id: 'mdiasbranco', name: 'M. Dias Branco', cnpj: '07.206.816/0001-15', category: 'Alimentos', contact_email: 'trade@mdiasbranco.com.br', contact_phone: '(85) 99999-0025', annual_volume: 2400000, margin_avg: 18.5, is_active: true, trade_budget_negotiated: 90000, trade_budget_executed: 72000, roi_avg: 198 },
  { id: 'marfrig', name: 'Marfrig Global', cnpj: '03.853.896/0001-40', category: 'Carnes', contact_email: 'trade@marfrig.com.br', contact_phone: '(11) 99999-0026', annual_volume: 6200000, margin_avg: 14.2, is_active: true, trade_budget_negotiated: 180000, trade_budget_executed: 144000, roi_avg: 205 },
  { id: 'bauducco', name: 'Bauducco', cnpj: 'XX.XXX.XXX/0001-XX', category: 'Alimentos', contact_email: 'trade@bauducco.com.br', contact_phone: '(11) 99999-0027', annual_volume: 1850000, margin_avg: 26.8, is_active: true, trade_budget_negotiated: 95000, trade_budget_executed: 76000, roi_avg: 218 },
  { id: 'kibon', name: 'Kibon (Unilever)', cnpj: 'XX.XXX.XXX/0001-XX', category: 'Sorvetes', contact_email: 'trade@kibon.com.br', contact_phone: '(11) 99999-0028', annual_volume: 2100000, margin_avg: 28.5, is_active: true, trade_budget_negotiated: 100000, trade_budget_executed: 80000, roi_avg: 225 },
  { id: 'nestle-purina', name: 'Nestlé Purina', cnpj: 'XX.XXX.XXX/0001-XX', category: 'Pet Food', contact_email: 'trade@purina.com.br', contact_phone: '(11) 99999-0029', annual_volume: 1650000, margin_avg: 25.2, is_active: true, trade_budget_negotiated: 75000, trade_budget_executed: 60000, roi_avg: 212 },
  
  // Tier 4 - Pequenos mas importantes (R$ 500K-1M)
  { id: 'suco-do-bem', name: 'Do Bem (Ambev)', cnpj: 'XX.XXX.XXX/0001-XX', category: 'Bebidas', contact_email: 'trade@dobem.com.br', contact_phone: '(11) 99999-0030', annual_volume: 850000, margin_avg: 32.5, is_active: true, trade_budget_negotiated: 45000, trade_budget_executed: 36000, roi_avg: 198 },
  { id: 'cafe-melita', name: 'Melitta Brasil', cnpj: 'XX.XXX.XXX/0001-XX', category: 'Cafés', contact_email: 'trade@melitta.com.br', contact_phone: '(41) 99999-0031', annual_volume: 780000, margin_avg: 28.5, is_active: true, trade_budget_negotiated: 40000, trade_budget_executed: 32000, roi_avg: 185 },
  { id: 'cafe-3coracoes', name: '3 Corações', cnpj: 'XX.XXX.XXX/0001-XX', category: 'Cafés', contact_email: 'trade@3coracoes.com.br', contact_phone: '(85) 99999-0032', annual_volume: 920000, margin_avg: 26.8, is_active: true, trade_budget_negotiated: 50000, trade_budget_executed: 40000, roi_avg: 192 },
  { id: 'reckitt', name: 'Reckitt Benckiser', cnpj: 'XX.XXX.XXX/0001-XX', category: 'Limpeza', contact_email: 'trade@reckitt.com', contact_phone: '(11) 99999-0033', annual_volume: 1450000, margin_avg: 28.2, is_active: true, trade_budget_negotiated: 65000, trade_budget_executed: 52000, roi_avg: 215 },
  { id: 'bombril', name: 'Bombril S.A.', cnpj: 'XX.XXX.XXX/0001-XX', category: 'Limpeza', contact_email: 'trade@bombril.com.br', contact_phone: '(11) 99999-0034', annual_volume: 680000, margin_avg: 22.5, is_active: true, trade_budget_negotiated: 35000, trade_budget_executed: 28000, roi_avg: 175 },
  { id: 'sc-johnson', name: 'SC Johnson', cnpj: 'XX.XXX.XXX/0001-XX', category: 'Limpeza', contact_email: 'trade@scjohnson.com', contact_phone: '(11) 99999-0035', annual_volume: 720000, margin_avg: 26.5, is_active: true, trade_budget_negotiated: 38000, trade_budget_executed: 30400, roi_avg: 182 },
  { id: 'elma-chips', name: 'Elma Chips (PepsiCo)', cnpj: 'XX.XXX.XXX/0001-XX', category: 'Snacks', contact_email: 'trade@elmachips.com.br', contact_phone: '(11) 99999-0036', annual_volume: 1150000, margin_avg: 28.8, is_active: true, trade_budget_negotiated: 55000, trade_budget_executed: 44000, roi_avg: 205 },
  { id: 'fini', name: 'Fini Guloseimas', cnpj: 'XX.XXX.XXX/0001-XX', category: 'Doces', contact_email: 'trade@fini.com.br', contact_phone: '(19) 99999-0037', annual_volume: 520000, margin_avg: 35.5, is_active: true, trade_budget_negotiated: 28000, trade_budget_executed: 22400, roi_avg: 168 },
  { id: 'haribo', name: 'Haribo Brasil', cnpj: 'XX.XXX.XXX/0001-XX', category: 'Doces', contact_email: 'trade@haribo.com.br', contact_phone: '(11) 99999-0038', annual_volume: 380000, margin_avg: 34.2, is_active: true, trade_budget_negotiated: 22000, trade_budget_executed: 17600, roi_avg: 158 },
  { id: 'ferrero', name: 'Ferrero do Brasil', cnpj: 'XX.XXX.XXX/0001-XX', category: 'Chocolates', contact_email: 'trade@ferrero.com', contact_phone: '(41) 99999-0039', annual_volume: 980000, margin_avg: 32.8, is_active: true, trade_budget_negotiated: 52000, trade_budget_executed: 41600, roi_avg: 195 },
  { id: 'lindt', name: 'Lindt & Sprüngli', cnpj: 'XX.XXX.XXX/0001-XX', category: 'Chocolates', contact_email: 'trade@lindt.com', contact_phone: '(11) 99999-0040', annual_volume: 420000, margin_avg: 38.5, is_active: true, trade_budget_negotiated: 25000, trade_budget_executed: 20000, roi_avg: 172 },
  
  // Regionais/Locais
  { id: 'santa-clara', name: 'Santa Clara (Laticínios)', cnpj: 'XX.XXX.XXX/0001-XX', category: 'Laticínios', contact_email: 'trade@santaclara.com.br', contact_phone: '(91) 99999-0041', annual_volume: 580000, margin_avg: 22.5, is_active: true, trade_budget_negotiated: 30000, trade_budget_executed: 24000, roi_avg: 165 },
  { id: 'acai-frooty', name: 'Frooty (Açaí)', cnpj: 'XX.XXX.XXX/0001-XX', category: 'Bebidas', contact_email: 'trade@frooty.com.br', contact_phone: '(91) 99999-0042', annual_volume: 420000, margin_avg: 35.8, is_active: true, trade_budget_negotiated: 25000, trade_budget_executed: 20000, roi_avg: 175 },
  { id: 'tucuma', name: 'Polpas Tucumã', cnpj: 'XX.XXX.XXX/0001-XX', category: 'Alimentos', contact_email: 'trade@tucuma.com.br', contact_phone: '(91) 99999-0043', annual_volume: 280000, margin_avg: 28.5, is_active: true, trade_budget_negotiated: 15000, trade_budget_executed: 12000, roi_avg: 148 },
  { id: 'guarana-jesus', name: 'Guaraná Jesus', cnpj: 'XX.XXX.XXX/0001-XX', category: 'Bebidas', contact_email: 'trade@guaranajesus.com.br', contact_phone: '(98) 99999-0044', annual_volume: 320000, margin_avg: 25.2, is_active: true, trade_budget_negotiated: 18000, trade_budget_executed: 14400, roi_avg: 155 },
  { id: 'acqua-sul', name: 'Água Mineral AcquaSul', cnpj: 'XX.XXX.XXX/0001-XX', category: 'Bebidas', contact_email: 'trade@acquasul.com.br', contact_phone: '(91) 99999-0045', annual_volume: 450000, margin_avg: 18.5, is_active: true, trade_budget_negotiated: 20000, trade_budget_executed: 16000, roi_avg: 142 },
  { id: 'biscoitos-marilan', name: 'Marilan Alimentos', cnpj: 'XX.XXX.XXX/0001-XX', category: 'Alimentos', contact_email: 'trade@marilan.com.br', contact_phone: '(17) 99999-0046', annual_volume: 680000, margin_avg: 22.8, is_active: true, trade_budget_negotiated: 32000, trade_budget_executed: 25600, roi_avg: 168 },
  { id: 'selmi', name: 'Selmi (Massas)', cnpj: 'XX.XXX.XXX/0001-XX', category: 'Alimentos', contact_email: 'trade@selmi.com.br', contact_phone: '(11) 99999-0047', annual_volume: 520000, margin_avg: 18.2, is_active: true, trade_budget_negotiated: 25000, trade_budget_executed: 20000, roi_avg: 155 },
  { id: 'santa-amalia', name: 'Santa Amália (Massas)', cnpj: 'XX.XXX.XXX/0001-XX', category: 'Alimentos', contact_email: 'trade@santaamalia.com.br', contact_phone: '(31) 99999-0048', annual_volume: 380000, margin_avg: 16.8, is_active: true, trade_budget_negotiated: 18000, trade_budget_executed: 14400, roi_avg: 145 },
  { id: 'queijos-tirolez', name: 'Tirolez', cnpj: 'XX.XXX.XXX/0001-XX', category: 'Laticínios', contact_email: 'trade@tirolez.com.br', contact_phone: '(35) 99999-0049', annual_volume: 580000, margin_avg: 24.5, is_active: true, trade_budget_negotiated: 28000, trade_budget_executed: 22400, roi_avg: 172 },
  { id: 'polenghi', name: 'Polenghi', cnpj: 'XX.XXX.XXX/0001-XX', category: 'Laticínios', contact_email: 'trade@polenghi.com.br', contact_phone: '(11) 99999-0050', annual_volume: 480000, margin_avg: 26.8, is_active: true, trade_budget_negotiated: 24000, trade_budget_executed: 19200, roi_avg: 165 },
];

// ============================================================================
// LOJAS DA REDE (7 unidades)
// ============================================================================
export interface Store {
  id: string;
  name: string;
  city: string;
  state: string;
  monthly_revenue: number;
  share_percent: number;
  sqm: number;
  employees: number;
  opening_year: number;
  manager: string;
}

export const STORES: Store[] = [
  { id: 'beira-rio', name: 'Beira Rio (Matriz)', city: 'Parauapebas', state: 'PA', monthly_revenue: 5200000, share_percent: 25, sqm: 4800, employees: 185, opening_year: 2008, manager: 'Carlos Mendes' },
  { id: 'vs10', name: 'VS-10', city: 'Parauapebas', state: 'PA', monthly_revenue: 4100000, share_percent: 20, sqm: 3800, employees: 145, opening_year: 2012, manager: 'Ana Paula Silva' },
  { id: 'faruk', name: 'Faruk', city: 'Parauapebas', state: 'PA', monthly_revenue: 3600000, share_percent: 17, sqm: 3200, employees: 128, opening_year: 2010, manager: 'Roberto Oliveira' },
  { id: 'cidade-jardim', name: 'Cidade Jardim', city: 'Parauapebas', state: 'PA', monthly_revenue: 3200000, share_percent: 15, sqm: 2800, employees: 112, opening_year: 2015, manager: 'Fernanda Costa' },
  { id: 'carajas', name: 'Carajás', city: 'Parauapebas', state: 'PA', monthly_revenue: 2400000, share_percent: 12, sqm: 2400, employees: 95, opening_year: 2018, manager: 'Lucas Ferreira' },
  { id: 'xinguara', name: 'Xinguara', city: 'Xinguara', state: 'PA', monthly_revenue: 1500000, share_percent: 7, sqm: 1800, employees: 65, opening_year: 2020, manager: 'Mariana Santos' },
  { id: 'canaa', name: 'Canaã', city: 'Canaã dos Carajás', state: 'PA', monthly_revenue: 800000, share_percent: 4, sqm: 1200, employees: 42, opening_year: 2022, manager: 'Pedro Almeida' },
];

// Total mensal e anual
export const TOTAL_MONTHLY_REVENUE = 20800000; // R$ 20.8M/mês
export const TOTAL_ANNUAL_REVENUE = 249600000; // R$ 249.6M/ano (~R$250M)

// ============================================================================
// CATEGORIAS DE PRODUTOS
// ============================================================================
export const PRODUCT_CATEGORIES = [
  { id: 'bebidas', name: 'Bebidas', share: 18, monthly_revenue: 3744000 },
  { id: 'carnes', name: 'Carnes e Frios', share: 22, monthly_revenue: 4576000 },
  { id: 'laticínios', name: 'Laticínios', share: 12, monthly_revenue: 2496000 },
  { id: 'alimentos', name: 'Alimentos (Mercearia)', share: 25, monthly_revenue: 5200000 },
  { id: 'hpc', name: 'Higiene e Limpeza', share: 10, monthly_revenue: 2080000 },
  { id: 'hortifruti', name: 'Hortifruti', share: 8, monthly_revenue: 1664000 },
  { id: 'padaria', name: 'Padaria e Confeitaria', share: 3, monthly_revenue: 624000 },
  { id: 'pet', name: 'Pet Shop', share: 2, monthly_revenue: 416000 },
];

// ============================================================================
// PRODUTOS DESTAQUE (500+ SKUs)
// ============================================================================
export interface Product {
  sku: string;
  name: string;
  supplier_id: string;
  category: string;
  price: number;
  margin: number;
  stock_current: number;
  stock_min: number;
  monthly_sales: number;
  monthly_revenue: number;
}

// Top 100 produtos por faturamento (representativos)
export const TOP_PRODUCTS: Product[] = [
  // Bebidas
  { sku: 'BEB001', name: 'Cerveja Brahma Duplo Malte 350ml', supplier_id: 'ambev', category: 'Bebidas', price: 3.49, margin: 18.5, stock_current: 2400, stock_min: 800, monthly_sales: 28500, monthly_revenue: 99465 },
  { sku: 'BEB002', name: 'Cerveja Skol Lata 350ml', supplier_id: 'ambev', category: 'Bebidas', price: 2.99, margin: 17.2, stock_current: 3200, stock_min: 1000, monthly_sales: 32000, monthly_revenue: 95680 },
  { sku: 'BEB003', name: 'Coca-Cola 2L', supplier_id: 'coca-cola', category: 'Bebidas', price: 9.99, margin: 19.5, stock_current: 1800, stock_min: 600, monthly_sales: 12500, monthly_revenue: 124875 },
  { sku: 'BEB004', name: 'Coca-Cola Lata 350ml', supplier_id: 'coca-cola', category: 'Bebidas', price: 4.49, margin: 20.2, stock_current: 2800, stock_min: 900, monthly_sales: 22000, monthly_revenue: 98780 },
  { sku: 'BEB005', name: 'Guaraná Antarctica 2L', supplier_id: 'ambev', category: 'Bebidas', price: 7.99, margin: 18.8, stock_current: 1200, stock_min: 400, monthly_sales: 8500, monthly_revenue: 67915 },
  { sku: 'BEB006', name: 'Heineken Long Neck 330ml', supplier_id: 'heineken', category: 'Bebidas', price: 6.99, margin: 22.5, stock_current: 1500, stock_min: 500, monthly_sales: 9800, monthly_revenue: 68502 },
  { sku: 'BEB007', name: 'Água Mineral 500ml', supplier_id: 'acqua-sul', category: 'Bebidas', price: 1.99, margin: 35.2, stock_current: 4500, stock_min: 1500, monthly_sales: 38000, monthly_revenue: 75620 },
  { sku: 'BEB008', name: 'Refrigerante Fanta 2L', supplier_id: 'coca-cola', category: 'Bebidas', price: 8.49, margin: 19.2, stock_current: 980, stock_min: 320, monthly_sales: 5200, monthly_revenue: 44148 },
  { sku: 'BEB009', name: 'Suco Del Valle 1L', supplier_id: 'coca-cola', category: 'Bebidas', price: 7.99, margin: 24.5, stock_current: 850, stock_min: 280, monthly_sales: 4800, monthly_revenue: 38352 },
  { sku: 'BEB010', name: 'Cerveja Budweiser Lata 350ml', supplier_id: 'ambev', category: 'Bebidas', price: 3.99, margin: 19.8, stock_current: 2100, stock_min: 700, monthly_sales: 18500, monthly_revenue: 73815 },
  
  // Carnes e Frios
  { sku: 'CAR001', name: 'Picanha Friboi Resfriada kg', supplier_id: 'jbs', category: 'Carnes', price: 89.90, margin: 15.5, stock_current: 450, stock_min: 150, monthly_sales: 2800, monthly_revenue: 251720 },
  { sku: 'CAR002', name: 'Costela Bovina Friboi kg', supplier_id: 'jbs', category: 'Carnes', price: 34.90, margin: 14.8, stock_current: 680, stock_min: 220, monthly_sales: 3500, monthly_revenue: 122150 },
  { sku: 'CAR003', name: 'Frango Inteiro Sadia kg', supplier_id: 'brf', category: 'Carnes', price: 12.90, margin: 16.2, stock_current: 1200, stock_min: 400, monthly_sales: 8500, monthly_revenue: 109650 },
  { sku: 'CAR004', name: 'Linguiça Toscana Perdigão 800g', supplier_id: 'brf', category: 'Carnes', price: 24.90, margin: 17.5, stock_current: 580, stock_min: 190, monthly_sales: 3200, monthly_revenue: 79680 },
  { sku: 'CAR005', name: 'Presunto Sadia Fatiado 200g', supplier_id: 'brf', category: 'Carnes', price: 14.90, margin: 18.2, stock_current: 890, stock_min: 290, monthly_sales: 5800, monthly_revenue: 86420 },
  { sku: 'CAR006', name: 'Peito de Frango Seara kg', supplier_id: 'jbs', category: 'Carnes', price: 19.90, margin: 15.8, stock_current: 950, stock_min: 310, monthly_sales: 6200, monthly_revenue: 123380 },
  { sku: 'CAR007', name: 'Hambúrguer Seara 672g', supplier_id: 'jbs', category: 'Carnes', price: 32.90, margin: 16.5, stock_current: 420, stock_min: 140, monthly_sales: 2400, monthly_revenue: 78960 },
  { sku: 'CAR008', name: 'Bacon Sadia 250g', supplier_id: 'brf', category: 'Carnes', price: 22.90, margin: 19.2, stock_current: 650, stock_min: 210, monthly_sales: 3800, monthly_revenue: 87020 },
  { sku: 'CAR009', name: 'Salsicha Hot Dog Sadia 500g', supplier_id: 'brf', category: 'Carnes', price: 12.90, margin: 17.8, stock_current: 780, stock_min: 250, monthly_sales: 4500, monthly_revenue: 58050 },
  { sku: 'CAR010', name: 'Mortadela Sadia 500g', supplier_id: 'brf', category: 'Carnes', price: 16.90, margin: 18.5, stock_current: 620, stock_min: 200, monthly_sales: 3200, monthly_revenue: 54080 },
  
  // Laticínios
  { sku: 'LAT001', name: 'Leite Integral Piracanjuba 1L', supplier_id: 'piracanjuba', category: 'Laticínios', price: 6.49, margin: 18.5, stock_current: 2800, stock_min: 900, monthly_sales: 24000, monthly_revenue: 155760 },
  { sku: 'LAT002', name: 'Iogurte Danone Natural 170g', supplier_id: 'danone', category: 'Laticínios', price: 4.99, margin: 22.5, stock_current: 1200, stock_min: 400, monthly_sales: 8500, monthly_revenue: 42415 },
  { sku: 'LAT003', name: 'Queijo Mussarela Tirolez kg', supplier_id: 'queijos-tirolez', category: 'Laticínios', price: 54.90, margin: 19.8, stock_current: 380, stock_min: 120, monthly_sales: 1800, monthly_revenue: 98820 },
  { sku: 'LAT004', name: 'Requeijão Vigor 200g', supplier_id: 'vigor', category: 'Laticínios', price: 9.49, margin: 21.2, stock_current: 650, stock_min: 210, monthly_sales: 4200, monthly_revenue: 39858 },
  { sku: 'LAT005', name: 'Leite Condensado Moça 395g', supplier_id: 'nestle', category: 'Laticínios', price: 8.99, margin: 19.5, stock_current: 720, stock_min: 240, monthly_sales: 5800, monthly_revenue: 52142 },
  { sku: 'LAT006', name: 'Creme de Leite Nestlé 200g', supplier_id: 'nestle', category: 'Laticínios', price: 4.49, margin: 20.8, stock_current: 850, stock_min: 280, monthly_sales: 6500, monthly_revenue: 29185 },
  { sku: 'LAT007', name: 'Manteiga Itambé 200g', supplier_id: 'itambe', category: 'Laticínios', price: 12.90, margin: 18.5, stock_current: 420, stock_min: 140, monthly_sales: 2800, monthly_revenue: 36120 },
  { sku: 'LAT008', name: 'Iogurte Activia 100g (4un)', supplier_id: 'danone', category: 'Laticínios', price: 11.99, margin: 23.5, stock_current: 580, stock_min: 190, monthly_sales: 3500, monthly_revenue: 41965 },
  { sku: 'LAT009', name: 'Leite Piracanjuba Zero Lactose 1L', supplier_id: 'piracanjuba', category: 'Laticínios', price: 7.99, margin: 20.2, stock_current: 1100, stock_min: 360, monthly_sales: 7200, monthly_revenue: 57528 },
  { sku: 'LAT010', name: 'Queijo Prato Polenghi kg', supplier_id: 'polenghi', category: 'Laticínios', price: 49.90, margin: 18.8, stock_current: 280, stock_min: 90, monthly_sales: 1400, monthly_revenue: 69860 },
  
  // Alimentos (Mercearia)
  { sku: 'ALI001', name: 'Arroz Camil Tipo 1 5kg', supplier_id: 'camil', category: 'Alimentos', price: 29.90, margin: 14.5, stock_current: 1500, stock_min: 500, monthly_sales: 8500, monthly_revenue: 254150 },
  { sku: 'ALI002', name: 'Feijão Carioca Camil 1kg', supplier_id: 'camil', category: 'Alimentos', price: 8.99, margin: 15.2, stock_current: 2200, stock_min: 720, monthly_sales: 12000, monthly_revenue: 107880 },
  { sku: 'ALI003', name: 'Açúcar União 1kg', supplier_id: 'cargill', category: 'Alimentos', price: 5.49, margin: 12.8, stock_current: 1800, stock_min: 600, monthly_sales: 14000, monthly_revenue: 76860 },
  { sku: 'ALI004', name: 'Óleo Soya 900ml', supplier_id: 'cargill', category: 'Alimentos', price: 8.99, margin: 16.5, stock_current: 1400, stock_min: 460, monthly_sales: 9500, monthly_revenue: 85405 },
  { sku: 'ALI005', name: 'Macarrão Adria 500g', supplier_id: 'mdiasbranco', category: 'Alimentos', price: 4.49, margin: 18.2, stock_current: 1600, stock_min: 520, monthly_sales: 11000, monthly_revenue: 49390 },
  { sku: 'ALI006', name: 'Molho de Tomate Heinz 340g', supplier_id: 'heinz', category: 'Alimentos', price: 7.99, margin: 25.5, stock_current: 850, stock_min: 280, monthly_sales: 5200, monthly_revenue: 41548 },
  { sku: 'ALI007', name: 'Café 3 Corações 500g', supplier_id: 'cafe-3coracoes', category: 'Alimentos', price: 22.90, margin: 24.8, stock_current: 680, stock_min: 220, monthly_sales: 4800, monthly_revenue: 109920 },
  { sku: 'ALI008', name: 'Nescau 800g', supplier_id: 'nestle', category: 'Alimentos', price: 24.90, margin: 22.5, stock_current: 520, stock_min: 170, monthly_sales: 3800, monthly_revenue: 94620 },
  { sku: 'ALI009', name: 'Biscoito Oreo 90g', supplier_id: 'mondelez', category: 'Alimentos', price: 5.99, margin: 28.5, stock_current: 1100, stock_min: 360, monthly_sales: 7500, monthly_revenue: 44925 },
  { sku: 'ALI010', name: 'KitKat ao Leite 45g', supplier_id: 'nestle', category: 'Alimentos', price: 4.99, margin: 28.3, stock_current: 1250, stock_min: 410, monthly_sales: 8200, monthly_revenue: 40918 },
  
  // Higiene e Limpeza
  { sku: 'HPC001', name: 'Sabão em Pó Omo 2kg', supplier_id: 'unilever', category: 'Higiene', price: 28.90, margin: 22.5, stock_current: 650, stock_min: 210, monthly_sales: 4200, monthly_revenue: 121380 },
  { sku: 'HPC002', name: 'Amaciante Comfort 2L', supplier_id: 'unilever', category: 'Higiene', price: 18.90, margin: 23.8, stock_current: 580, stock_min: 190, monthly_sales: 3800, monthly_revenue: 71820 },
  { sku: 'HPC003', name: 'Detergente Ypê 500ml', supplier_id: 'bombril', category: 'Limpeza', price: 2.99, margin: 24.5, stock_current: 2400, stock_min: 800, monthly_sales: 18000, monthly_revenue: 53820 },
  { sku: 'HPC004', name: 'Desinfetante Pinho Sol 1L', supplier_id: 'reckitt', category: 'Limpeza', price: 12.90, margin: 26.2, stock_current: 780, stock_min: 250, monthly_sales: 5500, monthly_revenue: 70950 },
  { sku: 'HPC005', name: 'Papel Higiênico Neve 12un', supplier_id: 'sc-johnson', category: 'Higiene', price: 24.90, margin: 21.5, stock_current: 850, stock_min: 280, monthly_sales: 6200, monthly_revenue: 154380 },
  { sku: 'HPC006', name: 'Shampoo Dove 400ml', supplier_id: 'unilever', category: 'Higiene', price: 18.90, margin: 28.5, stock_current: 520, stock_min: 170, monthly_sales: 3200, monthly_revenue: 60480 },
  { sku: 'HPC007', name: 'Creme Dental Colgate 90g', supplier_id: 'colgate', category: 'Higiene', price: 5.99, margin: 25.8, stock_current: 1100, stock_min: 360, monthly_sales: 8500, monthly_revenue: 50915 },
  { sku: 'HPC008', name: 'Sabonete Dove 90g', supplier_id: 'unilever', category: 'Higiene', price: 4.49, margin: 26.5, stock_current: 1400, stock_min: 460, monthly_sales: 9800, monthly_revenue: 44002 },
  { sku: 'HPC009', name: 'Desodorante Rexona 150ml', supplier_id: 'unilever', category: 'Higiene', price: 14.90, margin: 27.2, stock_current: 680, stock_min: 220, monthly_sales: 4500, monthly_revenue: 67050 },
  { sku: 'HPC010', name: 'Agua Sanitária Qboa 2L', supplier_id: 'bombril', category: 'Limpeza', price: 8.99, margin: 22.5, stock_current: 950, stock_min: 310, monthly_sales: 6800, monthly_revenue: 61132 },
];

// Estatísticas consolidadas
export const STATS = {
  total_suppliers: SUPPLIERS.length,
  total_stores: STORES.length,
  monthly_revenue: TOTAL_MONTHLY_REVENUE,
  annual_revenue: TOTAL_ANNUAL_REVENUE,
  avg_margin: 21.5,
  total_skus: 12500, // SKUs totais no sistema
  featured_skus: TOP_PRODUCTS.length,
  trade_budget_total: SUPPLIERS.reduce((acc, s) => acc + s.trade_budget_negotiated, 0),
  trade_budget_executed: SUPPLIERS.reduce((acc, s) => acc + s.trade_budget_executed, 0),
  avg_roi: Math.round(SUPPLIERS.reduce((acc, s) => acc + s.roi_avg, 0) / SUPPLIERS.length),
};

// ============================================================================
// HELPERS
// ============================================================================
export function getSupplierById(id: string): Supplier | undefined {
  return SUPPLIERS.find(s => s.id === id);
}

export function getStoreById(id: string): Store | undefined {
  return STORES.find(s => s.id === id);
}

export function getProductsBySupplierId(supplierId: string): Product[] {
  return TOP_PRODUCTS.filter(p => p.supplier_id === supplierId);
}

export function getTopSuppliersByRevenue(limit = 10): Supplier[] {
  return [...SUPPLIERS]
    .sort((a, b) => b.annual_volume - a.annual_volume)
    .slice(0, limit);
}

export function getTopProductsByRevenue(limit = 20): Product[] {
  return [...TOP_PRODUCTS]
    .sort((a, b) => b.monthly_revenue - a.monthly_revenue)
    .slice(0, limit);
}

// ============================================================================
// LEGACY EXPORTS (compatibilidade com demo-data.ts original)
// ============================================================================
export const NESTLE_PARTNERSHIP = {
  startDate: '2025-10-27',
  endDate: '2026-01-27',
  duration: '3 meses',
  investment: 285000,
  roi: 285,
  status: 'completed' as const,
};

export const DEMO_STORES = STORES.map(s => ({
  id: s.id,
  name: s.name,
  city: s.city,
  monthlyRevenue: s.monthly_revenue,
  share: s.share_percent,
}));

export const TOTAL_BUDGET = STATS.trade_budget_total;
export const TOTAL_SPENT = STATS.trade_budget_executed;
