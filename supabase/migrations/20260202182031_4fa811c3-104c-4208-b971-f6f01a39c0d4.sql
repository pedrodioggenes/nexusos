-- ============================================================
-- PHASE 5 - Notifications for proofs + deep links + trigger
-- File: 20260202190000_phase5_notifications_and_proofs.sql
-- ============================================================

-- 1) add action_url to notifications (deep link)
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS action_url TEXT;

-- 2) add tenant_id and resource fields to notifications if not exist
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS resource_type TEXT;

ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS resource_id UUID;

ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'info';

-- 3) expand notifications.type check constraint
ALTER TABLE public.notifications
DROP CONSTRAINT IF EXISTS notifications_type_check;

-- 4) helper: create notification (security definer)
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_tenant_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_resource_type TEXT,
  p_resource_id UUID,
  p_severity TEXT,
  p_action_url TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications(
    user_id, tenant_id, type, title, message,
    resource_type, resource_id, severity, action_url
  ) VALUES (
    p_user_id, p_tenant_id, p_type, p_title, p_message,
    p_resource_type, p_resource_id, p_severity, p_action_url
  );
END;
$$;

-- 5) notify internals when supplier submits a proof
CREATE OR REPLACE FUNCTION public.notify_internal_on_proof_submitted(p_proof_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_supplier_name TEXT;
  v_package_name TEXT;
  v_checklist_title TEXT;
  v_internal RECORD;
BEGIN
  SELECT s.tenant_id, s.name, tpkg.name, tci.title
  INTO v_tenant_id, v_supplier_name, v_package_name, v_checklist_title
  FROM public.trade_proofs pr
  JOIN public.trade_checklist_items tci ON tci.id = pr.checklist_item_id
  JOIN public.trade_packages tpkg ON tpkg.id = tci.package_id
  JOIN public.suppliers s ON s.id = tpkg.supplier_id
  WHERE pr.id = p_proof_id
  LIMIT 1;

  IF v_tenant_id IS NULL THEN
    RETURN;
  END IF;

  FOR v_internal IN
    SELECT ur.user_id
    FROM public.user_roles ur
    WHERE ur.tenant_id = v_tenant_id
      AND ur.user_type = 'internal'
      AND ur.role IN ('admin', 'operador')
  LOOP
    PERFORM public.create_notification(
      v_internal.user_id,
      v_tenant_id,
      'proof',
      'Nova comprovação enviada',
      COALESCE(v_supplier_name,'Fornecedor')
        || ' enviou comprovação para "'
        || COALESCE(v_checklist_title,'Checklist')
        || '" ('
        || COALESCE(v_package_name,'Pacote')
        || ').',
      'trade_proofs',
      p_proof_id,
      'info',
      '/hipersenna/hipertrade/comprovacoes'
    );
  END LOOP;
END;
$$;

-- 6) notify supplier when proof status changes
CREATE OR REPLACE FUNCTION public.notify_supplier_on_proof_status(p_proof_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_uploader UUID;
  v_supplier_name TEXT;
  v_package_name TEXT;
  v_checklist_title TEXT;
  v_status TEXT;
  v_notes TEXT;
  v_title TEXT;
  v_msg TEXT;
  v_severity TEXT;
BEGIN
  SELECT pr.uploaded_by, pr.status, pr.review_notes
  INTO v_uploader, v_status, v_notes
  FROM public.trade_proofs pr
  WHERE pr.id = p_proof_id
  LIMIT 1;

  SELECT s.tenant_id, s.name, tpkg.name, tci.title
  INTO v_tenant_id, v_supplier_name, v_package_name, v_checklist_title
  FROM public.trade_proofs pr
  JOIN public.trade_checklist_items tci ON tci.id = pr.checklist_item_id
  JOIN public.trade_packages tpkg ON tpkg.id = tci.package_id
  JOIN public.suppliers s ON s.id = tpkg.supplier_id
  WHERE pr.id = p_proof_id
  LIMIT 1;

  IF v_tenant_id IS NULL OR v_uploader IS NULL THEN
    RETURN;
  END IF;

  IF v_status = 'approved' THEN
    v_title := 'Comprovação aprovada';
    v_severity := 'success';
    v_msg := 'Sua comprovação para "'
      || COALESCE(v_checklist_title,'Checklist')
      || '" ('
      || COALESCE(v_package_name,'Pacote')
      || ') foi aprovada.';
  ELSIF v_status = 'rejected' THEN
    v_title := 'Comprovação rejeitada';
    v_severity := 'warning';
    v_msg := 'Sua comprovação para "'
      || COALESCE(v_checklist_title,'Checklist')
      || '" ('
      || COALESCE(v_package_name,'Pacote')
      || ') foi rejeitada.'
      || CASE WHEN v_notes IS NOT NULL AND length(v_notes) > 0
        THEN ' Motivo: ' || v_notes
        ELSE ''
      END;
  ELSE
    RETURN;
  END IF;

  PERFORM public.create_notification(
    v_uploader,
    v_tenant_id,
    'proof',
    v_title,
    v_msg,
    'trade_proofs',
    p_proof_id,
    v_severity,
    '/fornecedor/hipertrade/comprovacoes'
  );
END;
$$;

-- 7) trigger function (proof insert + status change)
CREATE OR REPLACE FUNCTION public.on_trade_proof_write()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.notify_internal_on_proof_submitted(NEW.id);
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      PERFORM public.notify_supplier_on_proof_status(NEW.id);
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_trade_proof_write ON public.trade_proofs;

CREATE TRIGGER trg_trade_proof_write
AFTER INSERT OR UPDATE ON public.trade_proofs
FOR EACH ROW
EXECUTE FUNCTION public.on_trade_proof_write();