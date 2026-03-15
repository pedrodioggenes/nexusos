-- ============================================
-- ARQUITETURA RBAC: Tipos de Usuário e Fornecedores
-- ============================================

-- 1. Criar enum para tipo de usuário
CREATE TYPE public.user_type AS ENUM ('internal', 'supplier');

-- 2. Adicionar coluna user_type na tabela user_roles
ALTER TABLE public.user_roles 
ADD COLUMN user_type public.user_type NOT NULL DEFAULT 'internal';

-- 3. Criar tabela de fornecedores
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  contact_email TEXT,
  contact_phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Relacionar usuários com fornecedores
CREATE TABLE public.user_suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, supplier_id)
);

-- 5. Criar tabela de pacotes de trade
CREATE TABLE public.trade_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  total_value DECIMAL(10,2),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Criar tabela de itens do checklist
CREATE TABLE public.trade_checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID NOT NULL REFERENCES public.trade_packages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'approved', 'rejected')),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Criar tabela de comprovações (imagens)
CREATE TABLE public.trade_proofs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_item_id UUID NOT NULL REFERENCES public.trade_checklist_items(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  description TEXT,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- HABILITAR RLS
-- ============================================

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_proofs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FUNÇÃO PARA VERIFICAR TIPO DE USUÁRIO
-- ============================================

CREATE OR REPLACE FUNCTION public.get_user_type(_user_id uuid)
RETURNS public.user_type
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_type
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- ============================================
-- FUNÇÃO PARA VERIFICAR SE USUÁRIO É DO FORNECEDOR
-- ============================================

CREATE OR REPLACE FUNCTION public.user_belongs_to_supplier(_user_id uuid, _supplier_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_suppliers
    WHERE user_id = _user_id
      AND supplier_id = _supplier_id
  )
$$;

-- ============================================
-- POLÍTICAS DE SUPPLIERS
-- ============================================

-- Internos podem ver todos
CREATE POLICY "Internal users can view all suppliers"
ON public.suppliers FOR SELECT
TO authenticated
USING (public.get_user_type(auth.uid()) = 'internal');

-- Fornecedores veem apenas seu próprio
CREATE POLICY "Suppliers can view their own supplier"
ON public.suppliers FOR SELECT
TO authenticated
USING (
  public.get_user_type(auth.uid()) = 'supplier' AND
  EXISTS (
    SELECT 1 FROM public.user_suppliers
    WHERE user_id = auth.uid() AND supplier_id = suppliers.id
  )
);

-- Apenas admins podem gerenciar
CREATE POLICY "Admins can manage suppliers"
ON public.suppliers FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- POLÍTICAS DE USER_SUPPLIERS
-- ============================================

CREATE POLICY "Admins can manage user_suppliers"
ON public.user_suppliers FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own supplier associations"
ON public.user_suppliers FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- POLÍTICAS DE TRADE_PACKAGES
-- ============================================

-- Internos veem todos os pacotes
CREATE POLICY "Internal users can view all packages"
ON public.trade_packages FOR SELECT
TO authenticated
USING (public.get_user_type(auth.uid()) = 'internal');

-- Fornecedores veem apenas seus pacotes
CREATE POLICY "Suppliers can view their own packages"
ON public.trade_packages FOR SELECT
TO authenticated
USING (
  public.get_user_type(auth.uid()) = 'supplier' AND
  public.user_belongs_to_supplier(auth.uid(), supplier_id)
);

-- Internos podem gerenciar pacotes
CREATE POLICY "Internal users can manage packages"
ON public.trade_packages FOR ALL
TO authenticated
USING (public.get_user_type(auth.uid()) = 'internal')
WITH CHECK (public.get_user_type(auth.uid()) = 'internal');

-- ============================================
-- POLÍTICAS DE TRADE_CHECKLIST_ITEMS
-- ============================================

-- Internos veem todos
CREATE POLICY "Internal users can view all checklist items"
ON public.trade_checklist_items FOR SELECT
TO authenticated
USING (public.get_user_type(auth.uid()) = 'internal');

-- Fornecedores veem apenas de seus pacotes
CREATE POLICY "Suppliers can view their checklist items"
ON public.trade_checklist_items FOR SELECT
TO authenticated
USING (
  public.get_user_type(auth.uid()) = 'supplier' AND
  EXISTS (
    SELECT 1 FROM public.trade_packages tp
    WHERE tp.id = package_id
    AND public.user_belongs_to_supplier(auth.uid(), tp.supplier_id)
  )
);

-- Internos podem gerenciar
CREATE POLICY "Internal users can manage checklist items"
ON public.trade_checklist_items FOR ALL
TO authenticated
USING (public.get_user_type(auth.uid()) = 'internal')
WITH CHECK (public.get_user_type(auth.uid()) = 'internal');

-- Fornecedores podem atualizar status de seus itens
CREATE POLICY "Suppliers can update their checklist items"
ON public.trade_checklist_items FOR UPDATE
TO authenticated
USING (
  public.get_user_type(auth.uid()) = 'supplier' AND
  EXISTS (
    SELECT 1 FROM public.trade_packages tp
    WHERE tp.id = package_id
    AND public.user_belongs_to_supplier(auth.uid(), tp.supplier_id)
  )
)
WITH CHECK (
  public.get_user_type(auth.uid()) = 'supplier' AND
  EXISTS (
    SELECT 1 FROM public.trade_packages tp
    WHERE tp.id = package_id
    AND public.user_belongs_to_supplier(auth.uid(), tp.supplier_id)
  )
);

-- ============================================
-- POLÍTICAS DE TRADE_PROOFS
-- ============================================

-- Internos veem todas
CREATE POLICY "Internal users can view all proofs"
ON public.trade_proofs FOR SELECT
TO authenticated
USING (public.get_user_type(auth.uid()) = 'internal');

-- Fornecedores veem apenas de seus itens
CREATE POLICY "Suppliers can view their proofs"
ON public.trade_proofs FOR SELECT
TO authenticated
USING (
  public.get_user_type(auth.uid()) = 'supplier' AND
  EXISTS (
    SELECT 1 FROM public.trade_checklist_items tci
    JOIN public.trade_packages tp ON tp.id = tci.package_id
    WHERE tci.id = checklist_item_id
    AND public.user_belongs_to_supplier(auth.uid(), tp.supplier_id)
  )
);

-- Fornecedores podem inserir provas
CREATE POLICY "Suppliers can insert proofs"
ON public.trade_proofs FOR INSERT
TO authenticated
WITH CHECK (
  uploaded_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.trade_checklist_items tci
    JOIN public.trade_packages tp ON tp.id = tci.package_id
    WHERE tci.id = checklist_item_id
    AND public.user_belongs_to_supplier(auth.uid(), tp.supplier_id)
  )
);

-- Internos podem gerenciar provas (aprovar/rejeitar)
CREATE POLICY "Internal users can manage proofs"
ON public.trade_proofs FOR ALL
TO authenticated
USING (public.get_user_type(auth.uid()) = 'internal')
WITH CHECK (public.get_user_type(auth.uid()) = 'internal');

-- ============================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================

CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trade_packages_updated_at
BEFORE UPDATE ON public.trade_packages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trade_checklist_items_updated_at
BEFORE UPDATE ON public.trade_checklist_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX idx_user_suppliers_user_id ON public.user_suppliers(user_id);
CREATE INDEX idx_user_suppliers_supplier_id ON public.user_suppliers(supplier_id);
CREATE INDEX idx_trade_packages_supplier_id ON public.trade_packages(supplier_id);
CREATE INDEX idx_trade_packages_status ON public.trade_packages(status);
CREATE INDEX idx_trade_checklist_items_package_id ON public.trade_checklist_items(package_id);
CREATE INDEX idx_trade_checklist_items_status ON public.trade_checklist_items(status);
CREATE INDEX idx_trade_proofs_checklist_item_id ON public.trade_proofs(checklist_item_id);
CREATE INDEX idx_user_roles_user_type ON public.user_roles(user_type);