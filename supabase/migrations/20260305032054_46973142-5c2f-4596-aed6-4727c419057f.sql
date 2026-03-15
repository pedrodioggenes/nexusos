
-- =============================================
-- FASE 4: Regras de Negócio Críticas
-- R-01, R-03, R-05, R-09, R-11
-- =============================================

-- ============ R-01: Imutabilidade de Resultado Aprovado ============
-- Trigger que impede UPDATE/DELETE em registros aprovados.
-- Para alterar, deve-se criar nova versão via RPC.

CREATE OR REPLACE FUNCTION public.fin_protect_approved_resultado()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.status = 'aprovado' THEN
      RAISE EXCEPTION 'Não é possível excluir um resultado aprovado. Crie uma nova versão.';
    END IF;
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'aprovado' AND NEW.status != OLD.status THEN
      RAISE EXCEPTION 'Resultado aprovado é imutável. Use a função de nova versão para criar uma revisão.';
    END IF;
    IF OLD.status = 'aprovado' THEN
      -- Only allow updating justificativa_revisao field on approved records
      IF NEW.receita_bruta IS DISTINCT FROM OLD.receita_bruta
         OR NEW.devolucoes IS DISTINCT FROM OLD.devolucoes
         OR NEW.descontos IS DISTINCT FROM OLD.descontos
         OR NEW.impostos_sobre_vendas IS DISTINCT FROM OLD.impostos_sobre_vendas
         OR NEW.cmv_bruto IS DISTINCT FROM OLD.cmv_bruto
         OR NEW.perdas_operacionais IS DISTINCT FROM OLD.perdas_operacionais
         OR NEW.bonificacoes IS DISTINCT FROM OLD.bonificacoes
         OR NEW.verbas_comerciais IS DISTINCT FROM OLD.verbas_comerciais
         OR NEW.despesas_operacionais IS DISTINCT FROM OLD.despesas_operacionais
         OR NEW.depreciacao_amortizacao IS DISTINCT FROM OLD.depreciacao_amortizacao
         OR NEW.resultado_financeiro IS DISTINCT FROM OLD.resultado_financeiro
      THEN
        RAISE EXCEPTION 'Valores financeiros de resultado aprovado são imutáveis. Crie uma nova versão.';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_fin_protect_approved
  BEFORE UPDATE OR DELETE ON public.fin_resultado_periodo
  FOR EACH ROW
  EXECUTE FUNCTION public.fin_protect_approved_resultado();

-- RPC para criar nova versão de resultado aprovado
CREATE OR REPLACE FUNCTION public.fin_criar_nova_versao_resultado(
  p_resultado_id UUID,
  p_justificativa TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_old RECORD;
  v_new_id UUID;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  SELECT * INTO v_old FROM public.fin_resultado_periodo WHERE id = p_resultado_id;
  
  IF v_old IS NULL THEN
    RAISE EXCEPTION 'Resultado não encontrado';
  END IF;
  
  IF v_old.status != 'aprovado' THEN
    RAISE EXCEPTION 'Apenas resultados aprovados podem gerar nova versão';
  END IF;

  INSERT INTO public.fin_resultado_periodo (
    tenant_id, loja_id, loja_nome, periodo_inicio, periodo_fim,
    receita_bruta, devolucoes, descontos, impostos_sobre_vendas,
    cmv_bruto, perdas_operacionais, bonificacoes, verbas_comerciais,
    despesas_operacionais, depreciacao_amortizacao, resultado_financeiro,
    aliquota_ir_efetiva, status, versao, versao_anterior_id,
    justificativa_revisao, created_by
  ) VALUES (
    v_old.tenant_id, v_old.loja_id, v_old.loja_nome, v_old.periodo_inicio, v_old.periodo_fim,
    v_old.receita_bruta, v_old.devolucoes, v_old.descontos, v_old.impostos_sobre_vendas,
    v_old.cmv_bruto, v_old.perdas_operacionais, v_old.bonificacoes, v_old.verbas_comerciais,
    v_old.despesas_operacionais, v_old.depreciacao_amortizacao, v_old.resultado_financeiro,
    v_old.aliquota_ir_efetiva, 'rascunho', v_old.versao + 1, v_old.id,
    p_justificativa, v_user_id
  ) RETURNING id INTO v_new_id;

  -- Audit
  PERFORM public.log_audit(
    'fin_nova_versao',
    'fin_resultado_periodo',
    v_new_id,
    NULL,
    jsonb_build_object('original_id', p_resultado_id, 'original_versao', v_old.versao),
    jsonb_build_object('nova_versao', v_old.versao + 1, 'justificativa', p_justificativa)
  );

  RETURN v_new_id;
END;
$$;

-- ============ R-03: Rateio proporcional de despesas ============
-- Function to distribute a yearly/quarterly expense across months proportionally

CREATE OR REPLACE FUNCTION public.fin_ratear_despesa(
  p_despesa_id UUID,
  p_meses INTEGER DEFAULT 12
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_desp RECORD;
  v_valor_mensal NUMERIC;
  v_mes INTEGER;
  v_periodo_inicio DATE;
BEGIN
  SELECT * INTO v_desp FROM public.fin_despesa_operacional WHERE id = p_despesa_id;
  
  IF v_desp IS NULL THEN
    RAISE EXCEPTION 'Despesa não encontrada';
  END IF;

  IF v_desp.periodicidade NOT IN ('anual', 'trimestral') THEN
    RAISE EXCEPTION 'Rateio só se aplica a despesas anuais ou trimestrais';
  END IF;

  v_valor_mensal := ROUND(v_desp.valor / p_meses, 2);

  FOR v_mes IN 0..(p_meses - 1) LOOP
    v_periodo_inicio := v_desp.competencia_inicio + (v_mes || ' months')::INTERVAL;
    
    INSERT INTO public.fin_despesa_operacional (
      tenant_id, loja_id, loja_nome, natureza, descricao,
      valor, competencia_inicio, competencia_fim,
      periodicidade, origem, created_by
    ) VALUES (
      v_desp.tenant_id, v_desp.loja_id, v_desp.loja_nome, v_desp.natureza,
      v_desp.descricao || ' (rateio ' || (v_mes + 1) || '/' || p_meses || ')',
      v_valor_mensal,
      v_periodo_inicio,
      (v_periodo_inicio + INTERVAL '1 month' - INTERVAL '1 day')::DATE,
      'mensal', 'rateio', v_desp.created_by
    );
  END LOOP;

  -- Mark original as rateada
  UPDATE public.fin_despesa_operacional
  SET descricao = descricao || ' [RATEADA em ' || p_meses || ' parcelas]'
  WHERE id = p_despesa_id;
END;
$$;

-- ============ R-05: Motor de Semáforos Automático ============
-- RPC that evaluates all KPIs against metas and inserts alerts

CREATE OR REPLACE FUNCTION public.fin_avaliar_semaforos(p_tenant_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_meta RECORD;
  v_resultado RECORD;
  v_valor NUMERIC;
  v_severidade TEXT;
  v_count INTEGER := 0;
BEGIN
  FOR v_meta IN
    SELECT * FROM public.fin_meta_financeira
    WHERE tenant_id = p_tenant_id AND ativo = true
  LOOP
    -- Get latest resultado for the dimension
    SELECT * INTO v_resultado
    FROM public.fin_resultado_periodo
    WHERE tenant_id = p_tenant_id
      AND (v_meta.dimensao_tipo = 'rede' OR loja_id::TEXT = v_meta.dimensao_id)
    ORDER BY periodo_inicio DESC
    LIMIT 1;

    IF v_resultado IS NULL THEN
      CONTINUE;
    END IF;

    -- Map KPI name to value
    v_valor := CASE v_meta.kpi_nome
      WHEN 'margem_bruta_pct' THEN
        CASE WHEN v_resultado.receita_bruta - v_resultado.devolucoes - v_resultado.descontos - v_resultado.impostos_sobre_vendas = 0 THEN NULL
        ELSE ((v_resultado.receita_bruta - v_resultado.devolucoes - v_resultado.descontos - v_resultado.impostos_sobre_vendas - v_resultado.cmv_bruto - v_resultado.perdas_operacionais + v_resultado.bonificacoes) * 100.0) /
             (v_resultado.receita_bruta - v_resultado.devolucoes - v_resultado.descontos - v_resultado.impostos_sobre_vendas)
        END
      WHEN 'margem_operacional_pct' THEN
        CASE WHEN v_resultado.receita_bruta - v_resultado.devolucoes - v_resultado.descontos - v_resultado.impostos_sobre_vendas = 0 THEN NULL
        ELSE ((v_resultado.receita_bruta - v_resultado.devolucoes - v_resultado.descontos - v_resultado.impostos_sobre_vendas - v_resultado.cmv_bruto - v_resultado.perdas_operacionais + v_resultado.bonificacoes + v_resultado.verbas_comerciais - v_resultado.despesas_operacionais) * 100.0) /
             (v_resultado.receita_bruta - v_resultado.devolucoes - v_resultado.descontos - v_resultado.impostos_sobre_vendas)
        END
      WHEN 'margem_liquida_pct' THEN
        CASE WHEN v_resultado.receita_bruta - v_resultado.devolucoes - v_resultado.descontos - v_resultado.impostos_sobre_vendas = 0 THEN NULL
        ELSE (
          (v_resultado.receita_bruta - v_resultado.devolucoes - v_resultado.descontos - v_resultado.impostos_sobre_vendas - v_resultado.cmv_bruto - v_resultado.perdas_operacionais + v_resultado.bonificacoes + v_resultado.verbas_comerciais - v_resultado.despesas_operacionais + v_resultado.resultado_financeiro)
          * (1 - v_resultado.aliquota_ir_efetiva / 100.0) * 100.0
        ) / (v_resultado.receita_bruta - v_resultado.devolucoes - v_resultado.descontos - v_resultado.impostos_sobre_vendas)
        END
      ELSE NULL
    END;

    IF v_valor IS NULL THEN
      CONTINUE;
    END IF;

    -- Evaluate against thresholds
    IF v_meta.limite_vermelho IS NOT NULL AND v_valor <= v_meta.limite_vermelho THEN
      v_severidade := 'critico';
    ELSIF v_meta.limite_amarelo IS NOT NULL AND v_valor <= v_meta.limite_amarelo THEN
      v_severidade := 'alerta';
    ELSE
      CONTINUE; -- Green = no alert needed
    END IF;

    -- Insert alert (avoid duplicates for same period)
    INSERT INTO public.fin_alerta_financeiro (
      tenant_id, tipo, severidade, titulo, descricao,
      kpi_nome, valor_atual, valor_meta, loja_id, loja_nome,
      modulo_origem, link_acao
    )
    SELECT
      p_tenant_id, 'semaforo', v_severidade,
      v_meta.kpi_nome || ' abaixo do limite (' || ROUND(v_valor, 1) || '%)',
      'Meta: ' || v_meta.valor_meta || '% | Atual: ' || ROUND(v_valor, 1) || '% | Loja: ' || COALESCE(v_resultado.loja_nome, 'Rede'),
      v_meta.kpi_nome, ROUND(v_valor, 1), v_meta.valor_meta,
      v_resultado.loja_id, v_resultado.loja_nome,
      'hiperfinanceiro', '/hipersenna/hiperfinanceiro/dre/' || CASE WHEN v_meta.dimensao_tipo = 'rede' THEN 'rede' ELSE 'loja' END
    WHERE NOT EXISTS (
      SELECT 1 FROM public.fin_alerta_financeiro
      WHERE tenant_id = p_tenant_id
        AND kpi_nome = v_meta.kpi_nome
        AND COALESCE(loja_id::TEXT, '') = COALESCE(v_resultado.loja_id::TEXT, '')
        AND resolvido_em IS NULL
    );

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- ============ R-09: Validação Alocação de Verbas = 100% ============

CREATE OR REPLACE FUNCTION public.fin_validar_alocacao_verbas()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_total NUMERIC;
BEGIN
  SELECT COALESCE(SUM(percentual_alocacao), 0) INTO v_total
  FROM public.fin_alocacao_verba
  WHERE tenant_id = NEW.tenant_id
    AND periodo_referencia = NEW.periodo_referencia
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);

  v_total := v_total + NEW.percentual_alocacao;

  IF v_total > 100.01 THEN
    RAISE EXCEPTION 'A soma das alocações de verba excede 100%% (total: %%%). Ajuste os percentuais.', ROUND(v_total, 2);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_fin_validar_alocacao
  BEFORE INSERT OR UPDATE ON public.fin_alocacao_verba
  FOR EACH ROW
  EXECUTE FUNCTION public.fin_validar_alocacao_verbas();

-- ============ R-11: Alerta IMC Negativo por 2+ Períodos ============

CREATE OR REPLACE FUNCTION public.fin_verificar_imc_deterioracao(p_tenant_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_cat RECORD;
  v_count INTEGER := 0;
  v_periodos_negativos INTEGER;
BEGIN
  FOR v_cat IN
    SELECT DISTINCT categoria_nome
    FROM public.fin_margem_contribuicao_categoria
    WHERE tenant_id = p_tenant_id
  LOOP
    -- Count consecutive periods with declining IMC
    SELECT COUNT(*) INTO v_periodos_negativos
    FROM (
      SELECT imc_percentual,
             LAG(imc_percentual) OVER (ORDER BY periodo_referencia) AS imc_anterior
      FROM public.fin_margem_contribuicao_categoria
      WHERE tenant_id = p_tenant_id AND categoria_nome = v_cat.categoria_nome
      ORDER BY periodo_referencia DESC
      LIMIT 3
    ) sub
    WHERE imc_anterior IS NOT NULL AND imc_percentual < imc_anterior;

    IF v_periodos_negativos >= 2 THEN
      INSERT INTO public.fin_alerta_financeiro (
        tenant_id, tipo, severidade, titulo, descricao,
        kpi_nome, modulo_origem, link_acao
      )
      SELECT
        p_tenant_id, 'deterioracao_imc', 'alerta',
        'IMC em queda: ' || v_cat.categoria_nome,
        'Categoria ' || v_cat.categoria_nome || ' com IMC em deterioração por ' || v_periodos_negativos || ' períodos consecutivos.',
        'imc_' || v_cat.categoria_nome, 'hiperfinanceiro',
        '/hipersenna/hiperfinanceiro/margem-categoria'
      WHERE NOT EXISTS (
        SELECT 1 FROM public.fin_alerta_financeiro
        WHERE tenant_id = p_tenant_id
          AND tipo = 'deterioracao_imc'
          AND kpi_nome = 'imc_' || v_cat.categoria_nome
          AND resolvido_em IS NULL
      );

      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$;
