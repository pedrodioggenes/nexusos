export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agency_approvals: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          delivery_id: string | null
          feedback: string | null
          file_type: string | null
          file_url: string
          id: string
          markup_data: Json | null
          status: string | null
          thumbnail_url: string | null
          version: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          delivery_id?: string | null
          feedback?: string | null
          file_type?: string | null
          file_url: string
          id?: string
          markup_data?: Json | null
          status?: string | null
          thumbnail_url?: string | null
          version?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          delivery_id?: string | null
          feedback?: string | null
          file_type?: string | null
          file_url?: string
          id?: string
          markup_data?: Json | null
          status?: string | null
          thumbnail_url?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_approvals_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "agency_deliveries"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_briefings: {
        Row: {
          agency_id: string | null
          assets: Json | null
          budget: number | null
          created_at: string
          created_by: string | null
          deadline: string | null
          id: string
          objective: string | null
          priority: string | null
          references_urls: Json | null
          sent_at: string | null
          status: string | null
          target_audience: string | null
          tenant_id: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          agency_id?: string | null
          assets?: Json | null
          budget?: number | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          id?: string
          objective?: string | null
          priority?: string | null
          references_urls?: Json | null
          sent_at?: string | null
          status?: string | null
          target_audience?: string | null
          tenant_id?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          agency_id?: string | null
          assets?: Json | null
          budget?: number | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          id?: string
          objective?: string | null
          priority?: string | null
          references_urls?: Json | null
          sent_at?: string | null
          status?: string | null
          target_audience?: string | null
          tenant_id?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_briefings_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_briefings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_communications: {
        Row: {
          agency_id: string | null
          attachments: Json | null
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          meeting_date: string | null
          participants: Json | null
          tenant_id: string | null
          title: string
          type: string
        }
        Insert: {
          agency_id?: string | null
          attachments?: Json | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          meeting_date?: string | null
          participants?: Json | null
          tenant_id?: string | null
          title: string
          type: string
        }
        Update: {
          agency_id?: string | null
          attachments?: Json | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          meeting_date?: string | null
          participants?: Json | null
          tenant_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_communications_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_communications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_deliveries: {
        Row: {
          assigned_to: string | null
          briefing_id: string | null
          created_at: string
          deadline: string | null
          delivered_at: string | null
          files: Json | null
          id: string
          max_revisions: number | null
          notes: string | null
          revision_count: number | null
          status: string | null
          tenant_id: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          briefing_id?: string | null
          created_at?: string
          deadline?: string | null
          delivered_at?: string | null
          files?: Json | null
          id?: string
          max_revisions?: number | null
          notes?: string | null
          revision_count?: number | null
          status?: string | null
          tenant_id?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          briefing_id?: string | null
          created_at?: string
          deadline?: string | null
          delivered_at?: string | null
          files?: Json | null
          id?: string
          max_revisions?: number | null
          notes?: string | null
          revision_count?: number | null
          status?: string | null
          tenant_id?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_deliveries_briefing_id_fkey"
            columns: ["briefing_id"]
            isOneToOne: false
            referencedRelation: "agency_briefings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_deliveries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_invoices: {
        Row: {
          agency_id: string | null
          base_fee: number | null
          created_at: string
          due_date: string | null
          extras: Json | null
          id: string
          invoice_number: string | null
          notes: string | null
          paid_at: string | null
          reference_month: string
          status: string | null
          tenant_id: string | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          agency_id?: string | null
          base_fee?: number | null
          created_at?: string
          due_date?: string | null
          extras?: Json | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid_at?: string | null
          reference_month: string
          status?: string | null
          tenant_id?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          agency_id?: string | null
          base_fee?: number | null
          created_at?: string
          due_date?: string | null
          extras?: Json | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid_at?: string | null
          reference_month?: string
          status?: string | null
          tenant_id?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_invoices_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_partners: {
        Row: {
          cnpj: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contract_end: string | null
          contract_start: string | null
          created_at: string
          id: string
          logo_url: string | null
          monthly_fee: number | null
          name: string
          notes: string | null
          status: string | null
          tenant_id: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          cnpj?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          monthly_fee?: number | null
          name: string
          notes?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          cnpj?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          monthly_fee?: number | null
          name?: string
          notes?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_partners_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_scores: {
        Row: {
          agency_id: string | null
          communication_score: number | null
          cost_benefit_score: number | null
          created_at: string
          evaluated_by: string | null
          id: string
          notes: string | null
          overall_score: number | null
          period: string
          punctuality_score: number | null
          quality_score: number | null
          strategy_score: number | null
          tenant_id: string | null
        }
        Insert: {
          agency_id?: string | null
          communication_score?: number | null
          cost_benefit_score?: number | null
          created_at?: string
          evaluated_by?: string | null
          id?: string
          notes?: string | null
          overall_score?: number | null
          period: string
          punctuality_score?: number | null
          quality_score?: number | null
          strategy_score?: number | null
          tenant_id?: string | null
        }
        Update: {
          agency_id?: string | null
          communication_score?: number | null
          cost_benefit_score?: number | null
          created_at?: string
          evaluated_by?: string | null
          id?: string
          notes?: string | null
          overall_score?: number | null
          period?: string
          punctuality_score?: number | null
          quality_score?: number | null
          strategy_score?: number | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_scores_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_scores_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_sla_metrics: {
        Row: {
          agency_id: string | null
          avg_revision_rounds: number | null
          created_at: string
          deliveries_approved: number | null
          deliveries_count: number | null
          deliveries_rejected: number | null
          id: string
          max_revision_target: number | null
          on_time_delivery_rate: number | null
          on_time_target_rate: number | null
          period: string
          response_time_avg_hours: number | null
          response_time_target_hours: number | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          agency_id?: string | null
          avg_revision_rounds?: number | null
          created_at?: string
          deliveries_approved?: number | null
          deliveries_count?: number | null
          deliveries_rejected?: number | null
          id?: string
          max_revision_target?: number | null
          on_time_delivery_rate?: number | null
          on_time_target_rate?: number | null
          period: string
          response_time_avg_hours?: number | null
          response_time_target_hours?: number | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          agency_id?: string | null
          avg_revision_rounds?: number | null
          created_at?: string
          deliveries_approved?: number | null
          deliveries_count?: number | null
          deliveries_rejected?: number | null
          id?: string
          max_revision_target?: number | null
          on_time_delivery_rate?: number | null
          on_time_target_rate?: number | null
          period?: string
          response_time_avg_hours?: number | null
          response_time_target_hours?: number | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_sla_metrics_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agency_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_sla_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_rules: {
        Row: {
          action_link: string | null
          created_at: string
          description: string | null
          enabled: boolean
          evaluation_config: Json
          id: string
          name: string
          rule_key: string
          severity: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          action_link?: string | null
          created_at?: string
          description?: string | null
          enabled?: boolean
          evaluation_config?: Json
          id?: string
          name: string
          rule_key: string
          severity?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          action_link?: string | null
          created_at?: string
          description?: string | null
          enabled?: boolean
          evaluation_config?: Json
          id?: string
          name?: string
          rule_key?: string
          severity?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type: string
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_results: {
        Row: {
          calculated_roi: number | null
          campaign_id: string
          created_at: string
          created_by: string | null
          id: string
          kpi_snapshot: Json
          notes: string | null
          period_end: string
          period_start: string
          tenant_id: string
          total_investment: number | null
          total_revenue: number | null
          updated_at: string
        }
        Insert: {
          calculated_roi?: number | null
          campaign_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          kpi_snapshot?: Json
          notes?: string | null
          period_end: string
          period_start: string
          tenant_id: string
          total_investment?: number | null
          total_revenue?: number | null
          updated_at?: string
        }
        Update: {
          calculated_roi?: number | null
          campaign_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          kpi_snapshot?: Json
          notes?: string | null
          period_end?: string
          period_start?: string
          tenant_id?: string
          total_investment?: number | null
          total_revenue?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_results_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_results_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_tracking_links: {
        Row: {
          base_url: string
          campaign_id: string
          channel: string
          clicks_count: number
          created_at: string
          final_url: string
          id: string
          short_url: string | null
          tenant_id: string
          utm_campaign: string
          utm_content: string | null
          utm_medium: string
          utm_source: string
          utm_term: string | null
        }
        Insert: {
          base_url: string
          campaign_id: string
          channel: string
          clicks_count?: number
          created_at?: string
          final_url: string
          id?: string
          short_url?: string | null
          tenant_id: string
          utm_campaign: string
          utm_content?: string | null
          utm_medium: string
          utm_source: string
          utm_term?: string | null
        }
        Update: {
          base_url?: string
          campaign_id?: string
          channel?: string
          clicks_count?: number
          created_at?: string
          final_url?: string
          id?: string
          short_url?: string | null
          tenant_id?: string
          utm_campaign?: string
          utm_content?: string | null
          utm_medium?: string
          utm_source?: string
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_tracking_links_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_tracking_links_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_units: {
        Row: {
          campaign_id: string
          id: string
          unit_id: string
        }
        Insert: {
          campaign_id: string
          id?: string
          unit_id: string
        }
        Update: {
          campaign_id?: string
          id?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_units_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_units_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          content_text: string
          created_at: string
          created_by: string | null
          id: string
          media_url: string | null
          message_type: Database["public"]["Enums"]["message_type"]
          scheduled_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          title: string
          unit_scope: Database["public"]["Enums"]["unit_scope"]
          updated_at: string
        }
        Insert: {
          content_text: string
          created_at?: string
          created_by?: string | null
          id?: string
          media_url?: string | null
          message_type?: Database["public"]["Enums"]["message_type"]
          scheduled_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          title: string
          unit_scope?: Database["public"]["Enums"]["unit_scope"]
          updated_at?: string
        }
        Update: {
          content_text?: string
          created_at?: string
          created_by?: string | null
          id?: string
          media_url?: string | null
          message_type?: Database["public"]["Enums"]["message_type"]
          scheduled_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          title?: string
          unit_scope?: Database["public"]["Enums"]["unit_scope"]
          updated_at?: string
        }
        Relationships: []
      }
      cd_alerts: {
        Row: {
          action_url: string | null
          auto_generated: boolean
          category: string
          created_at: string
          description: string | null
          id: string
          level: string
          related_entity_id: string | null
          related_entity_type: string | null
          resolved_at: string | null
          resolved_by: string | null
          tenant_id: string
          title: string
          viewed_at: string | null
          viewed_by: string | null
        }
        Insert: {
          action_url?: string | null
          auto_generated?: boolean
          category: string
          created_at?: string
          description?: string | null
          id?: string
          level: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          tenant_id: string
          title: string
          viewed_at?: string | null
          viewed_by?: string | null
        }
        Update: {
          action_url?: string | null
          auto_generated?: boolean
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          level?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          tenant_id?: string
          title?: string
          viewed_at?: string | null
          viewed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cd_alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_audit_log: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          tenant_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          tenant_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          tenant_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cd_audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_consumption_history: {
        Row: {
          consumption_date: string
          created_at: string
          had_rupture: boolean
          id: string
          qty_sold: number
          qty_transferred: number
          sku_id: string
          store_id: string
          tenant_id: string
        }
        Insert: {
          consumption_date: string
          created_at?: string
          had_rupture?: boolean
          id?: string
          qty_sold?: number
          qty_transferred?: number
          sku_id: string
          store_id: string
          tenant_id: string
        }
        Update: {
          consumption_date?: string
          created_at?: string
          had_rupture?: boolean
          id?: string
          qty_sold?: number
          qty_transferred?: number
          sku_id?: string
          store_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cd_consumption_history_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "cd_skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_consumption_history_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "cd_stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_consumption_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_cycle_counts: {
        Row: {
          adjustment_reason: string | null
          approved_at: string | null
          approved_by: string | null
          counted_at: string | null
          counted_by: string | null
          created_at: string
          delta: number | null
          delta_pct: number | null
          id: string
          location_id: string | null
          qty_physical: number | null
          qty_system: number
          sku_id: string | null
          status: string
          stock_lot_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          adjustment_reason?: string | null
          approved_at?: string | null
          approved_by?: string | null
          counted_at?: string | null
          counted_by?: string | null
          created_at?: string
          delta?: number | null
          delta_pct?: number | null
          id?: string
          location_id?: string | null
          qty_physical?: number | null
          qty_system: number
          sku_id?: string | null
          status?: string
          stock_lot_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          adjustment_reason?: string | null
          approved_at?: string | null
          approved_by?: string | null
          counted_at?: string | null
          counted_by?: string | null
          created_at?: string
          delta?: number | null
          delta_pct?: number | null
          id?: string
          location_id?: string | null
          qty_physical?: number | null
          qty_system?: number
          sku_id?: string | null
          status?: string
          stock_lot_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cd_cycle_counts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "cd_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_cycle_counts_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "cd_skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_cycle_counts_stock_lot_id_fkey"
            columns: ["stock_lot_id"]
            isOneToOne: false
            referencedRelation: "cd_stock_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_cycle_counts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_kpi_snapshots: {
        Row: {
          created_at: string
          id: string
          metrics: Json
          period_type: string
          snapshot_date: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metrics?: Json
          period_type?: string
          snapshot_date: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metrics?: Json
          period_type?: string
          snapshot_date?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cd_kpi_snapshots_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_locations: {
        Row: {
          aisle: string | null
          code: string
          created_at: string
          depth_cm: number | null
          height_cm: number | null
          id: string
          is_active: boolean
          is_occupied: boolean
          level: string | null
          location_type: string
          max_volume_m3: number | null
          max_weight_kg: number | null
          module: string | null
          position: string | null
          tenant_id: string
          updated_at: string
          width_cm: number | null
          zone: string
        }
        Insert: {
          aisle?: string | null
          code: string
          created_at?: string
          depth_cm?: number | null
          height_cm?: number | null
          id?: string
          is_active?: boolean
          is_occupied?: boolean
          level?: string | null
          location_type?: string
          max_volume_m3?: number | null
          max_weight_kg?: number | null
          module?: string | null
          position?: string | null
          tenant_id: string
          updated_at?: string
          width_cm?: number | null
          zone: string
        }
        Update: {
          aisle?: string | null
          code?: string
          created_at?: string
          depth_cm?: number | null
          height_cm?: number | null
          id?: string
          is_active?: boolean
          is_occupied?: boolean
          level?: string | null
          location_type?: string
          max_volume_m3?: number | null
          max_weight_kg?: number | null
          module?: string | null
          position?: string | null
          tenant_id?: string
          updated_at?: string
          width_cm?: number | null
          zone?: string
        }
        Relationships: [
          {
            foreignKeyName: "cd_locations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_loss_records: {
        Row: {
          cause: string | null
          created_at: string
          id: string
          notes: string | null
          origin: string
          photo_urls: Json | null
          qty: number
          recorded_at: string
          recorded_by: string | null
          sku_id: string
          stock_lot_id: string | null
          store_id: string | null
          supplier_id: string | null
          tenant_id: string
          total_value: number | null
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          cause?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          origin: string
          photo_urls?: Json | null
          qty: number
          recorded_at?: string
          recorded_by?: string | null
          sku_id: string
          stock_lot_id?: string | null
          store_id?: string | null
          supplier_id?: string | null
          tenant_id: string
          total_value?: number | null
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          cause?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          origin?: string
          photo_urls?: Json | null
          qty?: number
          recorded_at?: string
          recorded_by?: string | null
          sku_id?: string
          stock_lot_id?: string | null
          store_id?: string | null
          supplier_id?: string | null
          tenant_id?: string
          total_value?: number | null
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cd_loss_records_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "cd_skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_loss_records_stock_lot_id_fkey"
            columns: ["stock_lot_id"]
            isOneToOne: false
            referencedRelation: "cd_stock_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_loss_records_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "cd_stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_loss_records_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "cd_suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_loss_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_non_conformities: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          photo_urls: Json | null
          qty_affected: number | null
          receiving_item_id: string | null
          receiving_record_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          sku_id: string | null
          supplier_id: string | null
          tenant_id: string
          treatment_action: string | null
          treatment_status: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          photo_urls?: Json | null
          qty_affected?: number | null
          receiving_item_id?: string | null
          receiving_record_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          sku_id?: string | null
          supplier_id?: string | null
          tenant_id: string
          treatment_action?: string | null
          treatment_status?: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          photo_urls?: Json | null
          qty_affected?: number | null
          receiving_item_id?: string | null
          receiving_record_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          sku_id?: string | null
          supplier_id?: string | null
          tenant_id?: string
          treatment_action?: string | null
          treatment_status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cd_non_conformities_receiving_item_id_fkey"
            columns: ["receiving_item_id"]
            isOneToOne: false
            referencedRelation: "cd_receiving_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_non_conformities_receiving_record_id_fkey"
            columns: ["receiving_record_id"]
            isOneToOne: false
            referencedRelation: "cd_receiving_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_non_conformities_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "cd_skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_non_conformities_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "cd_suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_non_conformities_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_order_suggestions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          converted_to_transfer_id: string | null
          created_at: string
          current_stock: number | null
          id: string
          priority: string | null
          projected_rupture_date: string | null
          reorder_point: number | null
          sku_id: string
          status: string
          store_id: string
          suggested_qty: number
          suggested_qty_packs: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          converted_to_transfer_id?: string | null
          created_at?: string
          current_stock?: number | null
          id?: string
          priority?: string | null
          projected_rupture_date?: string | null
          reorder_point?: number | null
          sku_id: string
          status?: string
          store_id: string
          suggested_qty: number
          suggested_qty_packs?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          converted_to_transfer_id?: string | null
          created_at?: string
          current_stock?: number | null
          id?: string
          priority?: string | null
          projected_rupture_date?: string | null
          reorder_point?: number | null
          sku_id?: string
          status?: string
          store_id?: string
          suggested_qty?: number
          suggested_qty_packs?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cd_order_suggestions_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "cd_skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_order_suggestions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "cd_stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_order_suggestions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_picking_tasks: {
        Row: {
          accuracy_rate: number | null
          completed_at: string | null
          created_at: string
          id: string
          items: Json
          items_picked: number | null
          items_total: number | null
          operator_id: string | null
          sequence_order: number | null
          started_at: string | null
          status: string
          tenant_id: string
          transfer_order_id: string | null
          updated_at: string
          wave_id: string | null
        }
        Insert: {
          accuracy_rate?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          items?: Json
          items_picked?: number | null
          items_total?: number | null
          operator_id?: string | null
          sequence_order?: number | null
          started_at?: string | null
          status?: string
          tenant_id: string
          transfer_order_id?: string | null
          updated_at?: string
          wave_id?: string | null
        }
        Update: {
          accuracy_rate?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          items?: Json
          items_picked?: number | null
          items_total?: number | null
          operator_id?: string | null
          sequence_order?: number | null
          started_at?: string | null
          status?: string
          tenant_id?: string
          transfer_order_id?: string | null
          updated_at?: string
          wave_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cd_picking_tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_picking_tasks_transfer_order_id_fkey"
            columns: ["transfer_order_id"]
            isOneToOne: false
            referencedRelation: "cd_transfer_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_picking_tasks_wave_id_fkey"
            columns: ["wave_id"]
            isOneToOne: false
            referencedRelation: "cd_picking_waves"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_picking_waves: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          id: string
          started_at: string | null
          status: string
          tenant_id: string
          total_items: number | null
          total_skus: number | null
          transfer_order_ids: Json
          updated_at: string
          wave_number: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          started_at?: string | null
          status?: string
          tenant_id: string
          total_items?: number | null
          total_skus?: number | null
          transfer_order_ids?: Json
          updated_at?: string
          wave_number: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          started_at?: string | null
          status?: string
          tenant_id?: string
          total_items?: number | null
          total_skus?: number | null
          transfer_order_ids?: Json
          updated_at?: string
          wave_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "cd_picking_waves_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_purchase_order_items: {
        Row: {
          created_at: string
          id: string
          purchase_order_id: string
          qty_ordered: number
          qty_received: number
          sku_id: string
          status: string
          tenant_id: string
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          purchase_order_id: string
          qty_ordered: number
          qty_received?: number
          sku_id: string
          status?: string
          tenant_id: string
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          purchase_order_id?: string
          qty_ordered?: number
          qty_received?: number
          sku_id?: string
          status?: string
          tenant_id?: string
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cd_purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "cd_purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_purchase_order_items_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "cd_skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_purchase_order_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_purchase_orders: {
        Row: {
          created_at: string
          created_by: string | null
          expected_date: string | null
          id: string
          notes: string | null
          po_number: string
          received_date: string | null
          status: string
          supplier_id: string | null
          tenant_id: string
          total_cost: number | null
          total_items: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          po_number: string
          received_date?: string | null
          status?: string
          supplier_id?: string | null
          tenant_id: string
          total_cost?: number | null
          total_items?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          po_number?: string
          received_date?: string | null
          status?: string
          supplier_id?: string | null
          tenant_id?: string
          total_cost?: number | null
          total_items?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cd_purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "cd_suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_purchase_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_putaway_tasks: {
        Row: {
          actual_location_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          operator_id: string | null
          qty: number
          receiving_record_id: string | null
          sku_id: string
          started_at: string | null
          status: string
          stock_lot_id: string | null
          suggested_location_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          actual_location_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          operator_id?: string | null
          qty: number
          receiving_record_id?: string | null
          sku_id: string
          started_at?: string | null
          status?: string
          stock_lot_id?: string | null
          suggested_location_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          actual_location_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          operator_id?: string | null
          qty?: number
          receiving_record_id?: string | null
          sku_id?: string
          started_at?: string | null
          status?: string
          stock_lot_id?: string | null
          suggested_location_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cd_putaway_tasks_actual_location_id_fkey"
            columns: ["actual_location_id"]
            isOneToOne: false
            referencedRelation: "cd_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_putaway_tasks_receiving_record_id_fkey"
            columns: ["receiving_record_id"]
            isOneToOne: false
            referencedRelation: "cd_receiving_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_putaway_tasks_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "cd_skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_putaway_tasks_stock_lot_id_fkey"
            columns: ["stock_lot_id"]
            isOneToOne: false
            referencedRelation: "cd_stock_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_putaway_tasks_suggested_location_id_fkey"
            columns: ["suggested_location_id"]
            isOneToOne: false
            referencedRelation: "cd_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_putaway_tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_receiving_items: {
        Row: {
          batch_number: string | null
          created_at: string
          expiration_date: string | null
          id: string
          po_item_id: string | null
          qty_accepted: number
          qty_invoice: number
          qty_physical: number
          qty_rejected: number
          receiving_record_id: string
          rejection_reason: string | null
          sku_id: string
          status: string
          temperature_reading: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          expiration_date?: string | null
          id?: string
          po_item_id?: string | null
          qty_accepted?: number
          qty_invoice: number
          qty_physical: number
          qty_rejected?: number
          receiving_record_id: string
          rejection_reason?: string | null
          sku_id: string
          status?: string
          temperature_reading?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          expiration_date?: string | null
          id?: string
          po_item_id?: string | null
          qty_accepted?: number
          qty_invoice?: number
          qty_physical?: number
          qty_rejected?: number
          receiving_record_id?: string
          rejection_reason?: string | null
          sku_id?: string
          status?: string
          temperature_reading?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cd_receiving_items_po_item_id_fkey"
            columns: ["po_item_id"]
            isOneToOne: false
            referencedRelation: "cd_purchase_order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_receiving_items_receiving_record_id_fkey"
            columns: ["receiving_record_id"]
            isOneToOne: false
            referencedRelation: "cd_receiving_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_receiving_items_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "cd_skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_receiving_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_receiving_records: {
        Row: {
          completed_at: string | null
          created_at: string
          dock_to_stock_minutes: number | null
          id: string
          invoice_number: string | null
          invoice_total: number | null
          notes: string | null
          operator_id: string | null
          purchase_order_id: string | null
          result: string | null
          schedule_id: string | null
          started_at: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          dock_to_stock_minutes?: number | null
          id?: string
          invoice_number?: string | null
          invoice_total?: number | null
          notes?: string | null
          operator_id?: string | null
          purchase_order_id?: string | null
          result?: string | null
          schedule_id?: string | null
          started_at?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          dock_to_stock_minutes?: number | null
          id?: string
          invoice_number?: string | null
          invoice_total?: number | null
          notes?: string | null
          operator_id?: string | null
          purchase_order_id?: string | null
          result?: string | null
          schedule_id?: string | null
          started_at?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cd_receiving_records_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "cd_purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_receiving_records_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "cd_receiving_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_receiving_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_receiving_schedules: {
        Row: {
          created_at: string
          created_by: string | null
          dock: string | null
          driver_name: string | null
          id: string
          notes: string | null
          purchase_order_id: string | null
          scheduled_date: string
          status: string
          supplier_id: string | null
          tenant_id: string
          time_window_end: string | null
          time_window_start: string | null
          updated_at: string
          vehicle_plate: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          dock?: string | null
          driver_name?: string | null
          id?: string
          notes?: string | null
          purchase_order_id?: string | null
          scheduled_date: string
          status?: string
          supplier_id?: string | null
          tenant_id: string
          time_window_end?: string | null
          time_window_start?: string | null
          updated_at?: string
          vehicle_plate?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          dock?: string | null
          driver_name?: string | null
          id?: string
          notes?: string | null
          purchase_order_id?: string | null
          scheduled_date?: string
          status?: string
          supplier_id?: string | null
          tenant_id?: string
          time_window_end?: string | null
          time_window_start?: string | null
          updated_at?: string
          vehicle_plate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cd_receiving_schedules_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "cd_purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_receiving_schedules_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "cd_suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_receiving_schedules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_replenishment_params: {
        Row: {
          add_std_dev: number | null
          add_value: number | null
          created_at: string
          id: string
          last_calculated_at: string | null
          order_qty: number | null
          reorder_point: number | null
          replenishment_cycle_days: number
          safety_stock: number | null
          service_level: number
          sku_id: string
          store_id: string
          tenant_id: string
          updated_at: string
          z_score: number
        }
        Insert: {
          add_std_dev?: number | null
          add_value?: number | null
          created_at?: string
          id?: string
          last_calculated_at?: string | null
          order_qty?: number | null
          reorder_point?: number | null
          replenishment_cycle_days?: number
          safety_stock?: number | null
          service_level?: number
          sku_id: string
          store_id: string
          tenant_id: string
          updated_at?: string
          z_score?: number
        }
        Update: {
          add_std_dev?: number | null
          add_value?: number | null
          created_at?: string
          id?: string
          last_calculated_at?: string | null
          order_qty?: number | null
          reorder_point?: number | null
          replenishment_cycle_days?: number
          safety_stock?: number | null
          service_level?: number
          sku_id?: string
          store_id?: string
          tenant_id?: string
          updated_at?: string
          z_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "cd_replenishment_params_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "cd_skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_replenishment_params_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "cd_stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_replenishment_params_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_romaneio_orders: {
        Row: {
          created_at: string
          id: string
          romaneio_id: string
          tenant_id: string
          transfer_order_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          romaneio_id: string
          tenant_id: string
          transfer_order_id: string
        }
        Update: {
          created_at?: string
          id?: string
          romaneio_id?: string
          tenant_id?: string
          transfer_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cd_romaneio_orders_romaneio_id_fkey"
            columns: ["romaneio_id"]
            isOneToOne: false
            referencedRelation: "cd_romaneios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_romaneio_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_romaneio_orders_transfer_order_id_fkey"
            columns: ["transfer_order_id"]
            isOneToOne: false
            referencedRelation: "cd_transfer_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_romaneios: {
        Row: {
          arrival_at: string | null
          carrier_name: string | null
          created_at: string
          created_by: string | null
          departure_at: string | null
          driver_name: string | null
          id: string
          notes: string | null
          romaneio_number: string
          status: string
          tenant_id: string
          total_items: number | null
          total_orders: number | null
          total_weight_kg: number | null
          updated_at: string
          vehicle_plate: string | null
        }
        Insert: {
          arrival_at?: string | null
          carrier_name?: string | null
          created_at?: string
          created_by?: string | null
          departure_at?: string | null
          driver_name?: string | null
          id?: string
          notes?: string | null
          romaneio_number: string
          status?: string
          tenant_id: string
          total_items?: number | null
          total_orders?: number | null
          total_weight_kg?: number | null
          updated_at?: string
          vehicle_plate?: string | null
        }
        Update: {
          arrival_at?: string | null
          carrier_name?: string | null
          created_at?: string
          created_by?: string | null
          departure_at?: string | null
          driver_name?: string | null
          id?: string
          notes?: string | null
          romaneio_number?: string
          status?: string
          tenant_id?: string
          total_items?: number | null
          total_orders?: number | null
          total_weight_kg?: number | null
          updated_at?: string
          vehicle_plate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cd_romaneios_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_rupture_projections: {
        Row: {
          add_value: number
          calculated_at: string
          created_at: string
          current_stock: number
          days_until_rupture: number
          id: string
          oos_cost_daily: number | null
          oos_cost_gap: number | null
          projected_rupture_date: string
          sku_id: string
          store_id: string
          substitution_rate: number | null
          tenant_id: string
        }
        Insert: {
          add_value: number
          calculated_at?: string
          created_at?: string
          current_stock: number
          days_until_rupture: number
          id?: string
          oos_cost_daily?: number | null
          oos_cost_gap?: number | null
          projected_rupture_date: string
          sku_id: string
          store_id: string
          substitution_rate?: number | null
          tenant_id: string
        }
        Update: {
          add_value?: number
          calculated_at?: string
          created_at?: string
          current_stock?: number
          days_until_rupture?: number
          id?: string
          oos_cost_daily?: number | null
          oos_cost_gap?: number | null
          projected_rupture_date?: string
          sku_id?: string
          store_id?: string
          substitution_rate?: number | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cd_rupture_projections_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "cd_skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_rupture_projections_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "cd_stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_rupture_projections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_shipping_manifests: {
        Row: {
          arrival_at: string | null
          checker_id: string | null
          created_at: string
          departure_at: string | null
          driver_doc: string | null
          driver_name: string | null
          id: string
          manifest_number: string
          notes: string | null
          status: string
          store_id: string | null
          temperature_departure: number | null
          tenant_id: string
          transfer_order_ids: Json
          updated_at: string
          vehicle_plate: string | null
        }
        Insert: {
          arrival_at?: string | null
          checker_id?: string | null
          created_at?: string
          departure_at?: string | null
          driver_doc?: string | null
          driver_name?: string | null
          id?: string
          manifest_number: string
          notes?: string | null
          status?: string
          store_id?: string | null
          temperature_departure?: number | null
          tenant_id: string
          transfer_order_ids?: Json
          updated_at?: string
          vehicle_plate?: string | null
        }
        Update: {
          arrival_at?: string | null
          checker_id?: string | null
          created_at?: string
          departure_at?: string | null
          driver_doc?: string | null
          driver_name?: string | null
          id?: string
          manifest_number?: string
          notes?: string | null
          status?: string
          store_id?: string | null
          temperature_departure?: number | null
          tenant_id?: string
          transfer_order_ids?: Json
          updated_at?: string
          vehicle_plate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cd_shipping_manifests_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "cd_stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_shipping_manifests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_skus: {
        Row: {
          abc_curve: string | null
          avg_unit_cost: number | null
          avg_unit_price: number | null
          brand: string | null
          category: string | null
          created_at: string
          description: string
          ean: string | null
          height_cm: number | null
          id: string
          is_active: boolean
          lead_time_days: number | null
          length_cm: number | null
          pack_size: number
          requires_temp_control: boolean
          sku_code: string
          subcategory: string | null
          temp_max: number | null
          temp_min: number | null
          tenant_id: string
          unit_measure: string
          updated_at: string
          weight_kg: number | null
          width_cm: number | null
        }
        Insert: {
          abc_curve?: string | null
          avg_unit_cost?: number | null
          avg_unit_price?: number | null
          brand?: string | null
          category?: string | null
          created_at?: string
          description: string
          ean?: string | null
          height_cm?: number | null
          id?: string
          is_active?: boolean
          lead_time_days?: number | null
          length_cm?: number | null
          pack_size?: number
          requires_temp_control?: boolean
          sku_code: string
          subcategory?: string | null
          temp_max?: number | null
          temp_min?: number | null
          tenant_id: string
          unit_measure?: string
          updated_at?: string
          weight_kg?: number | null
          width_cm?: number | null
        }
        Update: {
          abc_curve?: string | null
          avg_unit_cost?: number | null
          avg_unit_price?: number | null
          brand?: string | null
          category?: string | null
          created_at?: string
          description?: string
          ean?: string | null
          height_cm?: number | null
          id?: string
          is_active?: boolean
          lead_time_days?: number | null
          length_cm?: number | null
          pack_size?: number
          requires_temp_control?: boolean
          sku_code?: string
          subcategory?: string | null
          temp_max?: number | null
          temp_min?: number | null
          tenant_id?: string
          unit_measure?: string
          updated_at?: string
          weight_kg?: number | null
          width_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cd_skus_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_slotting_configs: {
        Row: {
          created_at: string
          id: string
          max_qty: number | null
          min_qty: number | null
          preferred_zone: string | null
          primary_location_id: string | null
          replenish_trigger_qty: number | null
          secondary_location_id: string | null
          sku_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_qty?: number | null
          min_qty?: number | null
          preferred_zone?: string | null
          primary_location_id?: string | null
          replenish_trigger_qty?: number | null
          secondary_location_id?: string | null
          sku_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          max_qty?: number | null
          min_qty?: number | null
          preferred_zone?: string | null
          primary_location_id?: string | null
          replenish_trigger_qty?: number | null
          secondary_location_id?: string | null
          sku_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cd_slotting_configs_primary_location_id_fkey"
            columns: ["primary_location_id"]
            isOneToOne: false
            referencedRelation: "cd_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_slotting_configs_secondary_location_id_fkey"
            columns: ["secondary_location_id"]
            isOneToOne: false
            referencedRelation: "cd_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_slotting_configs_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "cd_skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_slotting_configs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_stock_lots: {
        Row: {
          batch_number: string | null
          created_at: string
          expiration_date: string | null
          id: string
          location_id: string | null
          origin: string | null
          origin_record_id: string | null
          qty_available: number
          qty_blocked: number
          qty_reserved: number
          sku_id: string
          status: string
          tenant_id: string
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          expiration_date?: string | null
          id?: string
          location_id?: string | null
          origin?: string | null
          origin_record_id?: string | null
          qty_available?: number
          qty_blocked?: number
          qty_reserved?: number
          sku_id: string
          status?: string
          tenant_id: string
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          expiration_date?: string | null
          id?: string
          location_id?: string | null
          origin?: string | null
          origin_record_id?: string | null
          qty_available?: number
          qty_blocked?: number
          qty_reserved?: number
          sku_id?: string
          status?: string
          tenant_id?: string
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cd_stock_lots_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "cd_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_stock_lots_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "cd_skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_stock_lots_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_stores: {
        Row: {
          address: Json | null
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address?: Json | null
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address?: Json | null
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cd_stores_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_suppliers: {
        Row: {
          cnpj: string | null
          code: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          delivery_accuracy_rate: number | null
          id: string
          is_active: boolean
          lead_time_actual_avg_days: number | null
          lead_time_promised_days: number | null
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          code?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          delivery_accuracy_rate?: number | null
          id?: string
          is_active?: boolean
          lead_time_actual_avg_days?: number | null
          lead_time_promised_days?: number | null
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          code?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          delivery_accuracy_rate?: number | null
          id?: string
          is_active?: boolean
          lead_time_actual_avg_days?: number | null
          lead_time_promised_days?: number | null
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cd_suppliers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_transfer_order_items: {
        Row: {
          batch_number: string | null
          created_at: string
          expiration_date: string | null
          id: string
          qty_checked: number
          qty_picked: number
          qty_requested: number
          sku_id: string
          status: string
          stock_lot_id: string | null
          tenant_id: string
          transfer_order_id: string
          updated_at: string
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          expiration_date?: string | null
          id?: string
          qty_checked?: number
          qty_picked?: number
          qty_requested: number
          sku_id: string
          status?: string
          stock_lot_id?: string | null
          tenant_id: string
          transfer_order_id: string
          updated_at?: string
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          expiration_date?: string | null
          id?: string
          qty_checked?: number
          qty_picked?: number
          qty_requested?: number
          sku_id?: string
          status?: string
          stock_lot_id?: string | null
          tenant_id?: string
          transfer_order_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cd_transfer_order_items_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "cd_skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_transfer_order_items_stock_lot_id_fkey"
            columns: ["stock_lot_id"]
            isOneToOne: false
            referencedRelation: "cd_stock_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_transfer_order_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_transfer_order_items_transfer_order_id_fkey"
            columns: ["transfer_order_id"]
            isOneToOne: false
            referencedRelation: "cd_transfer_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      cd_transfer_orders: {
        Row: {
          created_at: string
          delivered_at: string | null
          expected_delivery_date: string | null
          id: string
          notes: string | null
          priority: string | null
          requested_by: string | null
          requested_date: string
          shipped_at: string | null
          status: string
          store_id: string
          tenant_id: string
          total_items: number | null
          total_skus: number | null
          transfer_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          requested_by?: string | null
          requested_date?: string
          shipped_at?: string | null
          status?: string
          store_id: string
          tenant_id: string
          total_items?: number | null
          total_skus?: number | null
          transfer_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          requested_by?: string | null
          requested_date?: string
          shipped_at?: string | null
          status?: string
          store_id?: string
          tenant_id?: string
          total_items?: number | null
          total_skus?: number | null
          transfer_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cd_transfer_orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "cd_stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cd_transfer_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      compras_alerts: {
        Row: {
          auto_generated: boolean | null
          category: string
          created_at: string
          description: string | null
          id: string
          level: string
          related_entity_id: string | null
          related_entity_type: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          tenant_id: string
          title: string
        }
        Insert: {
          auto_generated?: boolean | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          level?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          tenant_id: string
          title: string
        }
        Update: {
          auto_generated?: boolean | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          level?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          tenant_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "compras_alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      compras_audit_log: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          tenant_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          tenant_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          tenant_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compras_audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      compras_divergences: {
        Row: {
          action_taken: string | null
          created_at: string
          id: string
          notes: string | null
          purchase_order_id: string | null
          qty_expected: number | null
          qty_received: number | null
          resolved_at: string | null
          sku_id: string | null
          supplier_id: string
          tenant_id: string
          type: string
          value_impact: number | null
        }
        Insert: {
          action_taken?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          purchase_order_id?: string | null
          qty_expected?: number | null
          qty_received?: number | null
          resolved_at?: string | null
          sku_id?: string | null
          supplier_id: string
          tenant_id: string
          type: string
          value_impact?: number | null
        }
        Update: {
          action_taken?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          purchase_order_id?: string | null
          qty_expected?: number | null
          qty_received?: number | null
          resolved_at?: string | null
          sku_id?: string | null
          supplier_id?: string
          tenant_id?: string
          type?: string
          value_impact?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "compras_divergences_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "compras_purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_divergences_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "compras_skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_divergences_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "compras_suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_divergences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      compras_executive_summary: {
        Row: {
          active_suppliers: number | null
          avg_dpo: number | null
          avg_gmroi: number | null
          avg_otif: number | null
          ccc_days: number | null
          created_at: string
          id: string
          period: string
          ppv_accumulated: number | null
          saving_pct: number | null
          saving_realized: number | null
          semaphore: Json | null
          tenant_id: string
          total_pos_emitted: number | null
          total_purchase_volume: number | null
          updated_at: string
        }
        Insert: {
          active_suppliers?: number | null
          avg_dpo?: number | null
          avg_gmroi?: number | null
          avg_otif?: number | null
          ccc_days?: number | null
          created_at?: string
          id?: string
          period: string
          ppv_accumulated?: number | null
          saving_pct?: number | null
          saving_realized?: number | null
          semaphore?: Json | null
          tenant_id: string
          total_pos_emitted?: number | null
          total_purchase_volume?: number | null
          updated_at?: string
        }
        Update: {
          active_suppliers?: number | null
          avg_dpo?: number | null
          avg_gmroi?: number | null
          avg_otif?: number | null
          ccc_days?: number | null
          created_at?: string
          id?: string
          period?: string
          ppv_accumulated?: number | null
          saving_pct?: number | null
          saving_realized?: number | null
          semaphore?: Json | null
          tenant_id?: string
          total_pos_emitted?: number | null
          total_purchase_volume?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compras_executive_summary_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      compras_kpi_snapshots: {
        Row: {
          created_at: string
          id: string
          metrics: Json
          snapshot_date: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metrics?: Json
          snapshot_date: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metrics?: Json
          snapshot_date?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compras_kpi_snapshots_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      compras_negotiations: {
        Row: {
          closed_at: string | null
          created_at: string
          id: string
          negotiated_by: string | null
          negotiated_value: number | null
          notes: string | null
          original_value: number | null
          saving_pct: number | null
          saving_value: number | null
          status: string | null
          supplier_id: string
          tenant_id: string
          title: string
          type: string | null
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          id?: string
          negotiated_by?: string | null
          negotiated_value?: number | null
          notes?: string | null
          original_value?: number | null
          saving_pct?: number | null
          saving_value?: number | null
          status?: string | null
          supplier_id: string
          tenant_id: string
          title: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          id?: string
          negotiated_by?: string | null
          negotiated_value?: number | null
          notes?: string | null
          original_value?: number | null
          saving_pct?: number | null
          saving_value?: number | null
          status?: string | null
          supplier_id?: string
          tenant_id?: string
          title?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compras_negotiations_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "compras_suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_negotiations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      compras_po_items: {
        Row: {
          coverage_post_days: number | null
          created_at: string
          cta_estimated: number | null
          flags: Json | null
          gmroi_projected: number | null
          id: string
          ppv: number | null
          purchase_order_id: string
          qty: number
          reference_price: number | null
          sku_id: string
          tenant_id: string
          unit_price: number
        }
        Insert: {
          coverage_post_days?: number | null
          created_at?: string
          cta_estimated?: number | null
          flags?: Json | null
          gmroi_projected?: number | null
          id?: string
          ppv?: number | null
          purchase_order_id: string
          qty?: number
          reference_price?: number | null
          sku_id: string
          tenant_id: string
          unit_price?: number
        }
        Update: {
          coverage_post_days?: number | null
          created_at?: string
          cta_estimated?: number | null
          flags?: Json | null
          gmroi_projected?: number | null
          id?: string
          ppv?: number | null
          purchase_order_id?: string
          qty?: number
          reference_price?: number | null
          sku_id?: string
          tenant_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "compras_po_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "compras_purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_po_items_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "compras_skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_po_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      compras_price_history: {
        Row: {
          id: string
          price: number
          recorded_at: string
          sku_id: string
          supplier_id: string
          tenant_id: string
        }
        Insert: {
          id?: string
          price: number
          recorded_at?: string
          sku_id: string
          supplier_id: string
          tenant_id: string
        }
        Update: {
          id?: string
          price?: number
          recorded_at?: string
          sku_id?: string
          supplier_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compras_price_history_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "compras_skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_price_history_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "compras_suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_price_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      compras_purchase_orders: {
        Row: {
          approval_threshold: string | null
          approved_by: string | null
          ccc_impact_days: number | null
          created_at: string
          created_by: string | null
          expected_date: string | null
          id: string
          notes: string | null
          po_number: string
          ppv_total: number | null
          received_date: string | null
          status: string | null
          supplier_id: string
          tenant_id: string
          total_value: number | null
          updated_at: string
        }
        Insert: {
          approval_threshold?: string | null
          approved_by?: string | null
          ccc_impact_days?: number | null
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          po_number: string
          ppv_total?: number | null
          received_date?: string | null
          status?: string | null
          supplier_id: string
          tenant_id: string
          total_value?: number | null
          updated_at?: string
        }
        Update: {
          approval_threshold?: string | null
          approved_by?: string | null
          ccc_impact_days?: number | null
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          po_number?: string
          ppv_total?: number | null
          received_date?: string | null
          status?: string | null
          supplier_id?: string
          tenant_id?: string
          total_value?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compras_purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "compras_suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_purchase_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      compras_skus: {
        Row: {
          avg_cta: number | null
          avg_daily_demand: number | null
          category: string | null
          code: string
          coverage_max_days: number | null
          coverage_min_days: number | null
          created_at: string
          id: string
          is_active: boolean | null
          last_price: number | null
          name: string
          primary_supplier_id: string | null
          tenant_id: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          avg_cta?: number | null
          avg_daily_demand?: number | null
          category?: string | null
          code: string
          coverage_max_days?: number | null
          coverage_min_days?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_price?: number | null
          name: string
          primary_supplier_id?: string | null
          tenant_id: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          avg_cta?: number | null
          avg_daily_demand?: number | null
          category?: string | null
          code?: string
          coverage_max_days?: number | null
          coverage_min_days?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_price?: number | null
          name?: string
          primary_supplier_id?: string | null
          tenant_id?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compras_skus_primary_supplier_id_fkey"
            columns: ["primary_supplier_id"]
            isOneToOne: false
            referencedRelation: "compras_suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_skus_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      compras_supplier_scores: {
        Row: {
          composite_score: number | null
          created_at: string
          id: string
          period: string
          score_comercial: number | null
          score_otif: number | null
          score_preco: number | null
          score_qualidade: number | null
          score_responsividade: number | null
          supplier_id: string
          tenant_id: string
        }
        Insert: {
          composite_score?: number | null
          created_at?: string
          id?: string
          period: string
          score_comercial?: number | null
          score_otif?: number | null
          score_preco?: number | null
          score_qualidade?: number | null
          score_responsividade?: number | null
          supplier_id: string
          tenant_id: string
        }
        Update: {
          composite_score?: number | null
          created_at?: string
          id?: string
          period?: string
          score_comercial?: number | null
          score_otif?: number | null
          score_preco?: number | null
          score_qualidade?: number | null
          score_responsividade?: number | null
          supplier_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compras_supplier_scores_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "compras_suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_supplier_scores_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      compras_suppliers: {
        Row: {
          classification: string | null
          cnpj: string | null
          composite_score: number | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          lead_time_days: number | null
          min_order_value: number | null
          name: string
          notes: string | null
          payment_terms: string | null
          status: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          classification?: string | null
          cnpj?: string | null
          composite_score?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          lead_time_days?: number | null
          min_order_value?: number | null
          name: string
          notes?: string | null
          payment_terms?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          classification?: string | null
          cnpj?: string | null
          composite_score?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          lead_time_days?: number | null
          min_order_value?: number | null
          name?: string
          notes?: string | null
          payment_terms?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compras_suppliers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      compras_trade_allowances: {
        Row: {
          adherence_pct: number | null
          condition_description: string | null
          condition_target: number | null
          created_at: string
          description: string | null
          end_date: string
          fiscal_type: string | null
          id: string
          is_conditional: boolean | null
          planned_value: number | null
          realized_value: number | null
          start_date: string
          status: string | null
          supplier_id: string
          tenant_id: string
          type: string
          updated_at: string
        }
        Insert: {
          adherence_pct?: number | null
          condition_description?: string | null
          condition_target?: number | null
          created_at?: string
          description?: string | null
          end_date: string
          fiscal_type?: string | null
          id?: string
          is_conditional?: boolean | null
          planned_value?: number | null
          realized_value?: number | null
          start_date: string
          status?: string | null
          supplier_id: string
          tenant_id: string
          type: string
          updated_at?: string
        }
        Update: {
          adherence_pct?: number | null
          condition_description?: string | null
          condition_target?: number | null
          created_at?: string
          description?: string | null
          end_date?: string
          fiscal_type?: string | null
          id?: string
          is_conditional?: boolean | null
          planned_value?: number | null
          realized_value?: number | null
          start_date?: string
          status?: string | null
          supplier_id?: string
          tenant_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compras_trade_allowances_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "compras_suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_trade_allowances_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string
          id: string
          last_interaction_at: string | null
          name: string | null
          phone_e164: string
          status: Database["public"]["Enums"]["contact_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_interaction_at?: string | null
          name?: string | null
          phone_e164: string
          status?: Database["public"]["Enums"]["contact_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_interaction_at?: string | null
          name?: string | null
          phone_e164?: string
          status?: Database["public"]["Enums"]["contact_status"]
          updated_at?: string
        }
        Relationships: []
      }
      custom_reports: {
        Row: {
          config: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          last_generated_at: string | null
          name: string
          recipients: Json | null
          schedule: Json | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          config?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_generated_at?: string | null
          name: string
          recipients?: Json | null
          schedule?: Json | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_generated_at?: string | null
          name?: string
          recipients?: Json | null
          schedule?: Json | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_approvals: {
        Row: {
          approver_role: string | null
          approver_user_id: string | null
          created_at: string
          decided_at: string | null
          demand_id: string
          id: string
          note: string | null
          required: boolean
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          approver_role?: string | null
          approver_user_id?: string | null
          created_at?: string
          decided_at?: string | null
          demand_id: string
          id?: string
          note?: string | null
          required?: boolean
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          approver_role?: string | null
          approver_user_id?: string | null
          created_at?: string
          decided_at?: string | null
          demand_id?: string
          id?: string
          note?: string | null
          required?: boolean
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "demand_approvals_demand_id_fkey"
            columns: ["demand_id"]
            isOneToOne: false
            referencedRelation: "marketing_demands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demand_approvals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_comments: {
        Row: {
          content: string
          created_at: string | null
          demand_id: string
          id: string
          tenant_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          demand_id: string
          id?: string
          tenant_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          demand_id?: string
          id?: string
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demand_comments_demand_id_fkey"
            columns: ["demand_id"]
            isOneToOne: false
            referencedRelation: "marketing_demands"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_document_links: {
        Row: {
          created_at: string | null
          created_by: string
          demand_id: string
          id: string
          page_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          demand_id: string
          id?: string
          page_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          demand_id?: string
          id?: string
          page_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demand_document_links_demand_id_fkey"
            columns: ["demand_id"]
            isOneToOne: false
            referencedRelation: "marketing_demands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demand_document_links_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "workspace_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demand_document_links_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_package_items: {
        Row: {
          created_at: string
          demand_id: string
          id: string
          package_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          demand_id: string
          id?: string
          package_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          demand_id?: string
          id?: string
          package_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demand_package_items_demand_id_fkey"
            columns: ["demand_id"]
            isOneToOne: false
            referencedRelation: "marketing_demands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demand_package_items_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "demand_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demand_package_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_packages: {
        Row: {
          context: Json | null
          created_at: string
          created_by: string
          id: string
          name: string
          tenant_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          created_by: string
          id?: string
          name: string
          tenant_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demand_packages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_responses: {
        Row: {
          attachments: Json | null
          content: Json
          created_at: string | null
          deliverable_urls: Json | null
          demand_id: string
          id: string
          is_final: boolean | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          content: Json
          created_at?: string | null
          deliverable_urls?: Json | null
          demand_id: string
          id?: string
          is_final?: boolean | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attachments?: Json | null
          content?: Json
          created_at?: string | null
          deliverable_urls?: Json | null
          demand_id?: string
          id?: string
          is_final?: boolean | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demand_responses_demand_id_fkey"
            columns: ["demand_id"]
            isOneToOne: false
            referencedRelation: "marketing_demands"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_status_history: {
        Row: {
          change_reason: string | null
          changed_by: string
          created_at: string
          demand_id: string
          from_status: string | null
          id: string
          source: string
          tenant_id: string
          to_status: string
        }
        Insert: {
          change_reason?: string | null
          changed_by: string
          created_at?: string
          demand_id: string
          from_status?: string | null
          id?: string
          source?: string
          tenant_id: string
          to_status: string
        }
        Update: {
          change_reason?: string | null
          changed_by?: string
          created_at?: string
          demand_id?: string
          from_status?: string | null
          id?: string
          source?: string
          tenant_id?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "demand_status_history_demand_id_fkey"
            columns: ["demand_id"]
            isOneToOne: false
            referencedRelation: "marketing_demands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demand_status_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_templates: {
        Row: {
          created_at: string
          created_by: string
          default_approvals: Json | null
          default_fields: Json | null
          default_priority: string
          default_steps: Json | null
          default_type: string
          description: string | null
          id: string
          name: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          default_approvals?: Json | null
          default_fields?: Json | null
          default_priority?: string
          default_steps?: Json | null
          default_type?: string
          description?: string | null
          id?: string
          name: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          default_approvals?: Json | null
          default_fields?: Json | null
          default_priority?: string
          default_steps?: Json | null
          default_type?: string
          description?: string | null
          id?: string
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demand_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_workflow_steps: {
        Row: {
          completed_at: string | null
          created_at: string
          demand_id: string
          due_date: string | null
          id: string
          owner_role: string | null
          started_at: string | null
          status: string
          step_key: string
          step_label: string
          step_order: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          demand_id: string
          due_date?: string | null
          id?: string
          owner_role?: string | null
          started_at?: string | null
          status?: string
          step_key?: string
          step_label?: string
          step_order?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          demand_id?: string
          due_date?: string | null
          id?: string
          owner_role?: string | null
          started_at?: string | null
          status?: string
          step_key?: string
          step_label?: string
          step_order?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "demand_workflow_steps_demand_id_fkey"
            columns: ["demand_id"]
            isOneToOne: false
            referencedRelation: "marketing_demands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demand_workflow_steps_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: Json | null
          avatar_url: string | null
          birth_date: string | null
          contact_email: string | null
          contact_phone: string | null
          cpf: string | null
          created_at: string | null
          department: string | null
          documents: Json | null
          full_name: string
          hire_date: string
          id: string
          manager_id: string | null
          position: string | null
          salary: number | null
          status: string | null
          tenant_id: string
          termination_date: string | null
          unit_id: string | null
          updated_at: string | null
          user_id: string | null
          work_schedule: Json | null
        }
        Insert: {
          address?: Json | null
          avatar_url?: string | null
          birth_date?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          cpf?: string | null
          created_at?: string | null
          department?: string | null
          documents?: Json | null
          full_name: string
          hire_date?: string
          id?: string
          manager_id?: string | null
          position?: string | null
          salary?: number | null
          status?: string | null
          tenant_id: string
          termination_date?: string | null
          unit_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          work_schedule?: Json | null
        }
        Update: {
          address?: Json | null
          avatar_url?: string | null
          birth_date?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          cpf?: string | null
          created_at?: string | null
          department?: string | null
          documents?: Json | null
          full_name?: string
          hire_date?: string
          id?: string
          manager_id?: string | null
          position?: string | null
          salary?: number | null
          status?: string | null
          tenant_id?: string
          termination_date?: string | null
          unit_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          work_schedule?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_metrics: {
        Row: {
          created_at: string | null
          id: string
          metric_date: string
          metrics: Json
          period_type: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric_date: string
          metrics?: Json
          period_type: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metric_date?: string
          metrics?: Json
          period_type?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "executive_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      experiments: {
        Row: {
          created_at: string
          created_by: string | null
          decision: string | null
          end_date: string | null
          hypothesis: string | null
          id: string
          linked_campaign_id: string | null
          metric_key: string | null
          results: Json | null
          start_date: string | null
          status: string
          tenant_id: string
          title: string
          updated_at: string
          variants: Json | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          decision?: string | null
          end_date?: string | null
          hypothesis?: string | null
          id?: string
          linked_campaign_id?: string | null
          metric_key?: string | null
          results?: Json | null
          start_date?: string | null
          status?: string
          tenant_id: string
          title: string
          updated_at?: string
          variants?: Json | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          decision?: string | null
          end_date?: string | null
          hypothesis?: string | null
          id?: string
          linked_campaign_id?: string | null
          metric_key?: string | null
          results?: Json | null
          start_date?: string | null
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
          variants?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "experiments_linked_campaign_id_fkey"
            columns: ["linked_campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      expiration_alerts: {
        Row: {
          action_at: string | null
          action_by: string | null
          action_taken: string | null
          batch_number: string | null
          created_at: string | null
          expiration_date: string
          gondola_id: string | null
          id: string
          photo_url: string | null
          product_name: string
          product_sku: string | null
          quantity: number | null
          status: string | null
          tenant_id: string
          unit_id: string
        }
        Insert: {
          action_at?: string | null
          action_by?: string | null
          action_taken?: string | null
          batch_number?: string | null
          created_at?: string | null
          expiration_date: string
          gondola_id?: string | null
          id?: string
          photo_url?: string | null
          product_name: string
          product_sku?: string | null
          quantity?: number | null
          status?: string | null
          tenant_id: string
          unit_id: string
        }
        Update: {
          action_at?: string | null
          action_by?: string | null
          action_taken?: string | null
          batch_number?: string | null
          created_at?: string | null
          expiration_date?: string
          gondola_id?: string | null
          id?: string
          photo_url?: string | null
          product_name?: string
          product_sku?: string | null
          quantity?: number | null
          status?: string | null
          tenant_id?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expiration_alerts_gondola_id_fkey"
            columns: ["gondola_id"]
            isOneToOne: false
            referencedRelation: "gondolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expiration_alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expiration_alerts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      failed_access_attempts: {
        Row: {
          attempted_at: string
          id: string
          ip_address: string
        }
        Insert: {
          attempted_at?: string
          id?: string
          ip_address: string
        }
        Update: {
          attempted_at?: string
          id?: string
          ip_address?: string
        }
        Relationships: []
      }
      fin_alerta_financeiro: {
        Row: {
          action_url: string | null
          categoria: string | null
          created_at: string
          descricao: string | null
          id: string
          kpi_referencia: string | null
          loja_id: string | null
          modulo_origem: string | null
          resolvido_em: string | null
          resolvido_por: string | null
          severidade: string
          tenant_id: string
          tipo: string
          titulo: string
          valor_atual: number | null
          valor_meta: number | null
        }
        Insert: {
          action_url?: string | null
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          kpi_referencia?: string | null
          loja_id?: string | null
          modulo_origem?: string | null
          resolvido_em?: string | null
          resolvido_por?: string | null
          severidade?: string
          tenant_id: string
          tipo: string
          titulo: string
          valor_atual?: number | null
          valor_meta?: number | null
        }
        Update: {
          action_url?: string | null
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          kpi_referencia?: string | null
          loja_id?: string | null
          modulo_origem?: string | null
          resolvido_em?: string | null
          resolvido_por?: string | null
          severidade?: string
          tenant_id?: string
          tipo?: string
          titulo?: string
          valor_atual?: number | null
          valor_meta?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fin_alerta_financeiro_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_alerta_financeiro_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_alocacao_verba: {
        Row: {
          categoria: string
          created_at: string
          id: string
          percentual_alocado: number
          periodo_fim: string
          periodo_inicio: string
          tenant_id: string
          updated_at: string
          valor_alocado: number | null
        }
        Insert: {
          categoria: string
          created_at?: string
          id?: string
          percentual_alocado?: number
          periodo_fim: string
          periodo_inicio: string
          tenant_id: string
          updated_at?: string
          valor_alocado?: number | null
        }
        Update: {
          categoria?: string
          created_at?: string
          id?: string
          percentual_alocado?: number
          periodo_fim?: string
          periodo_inicio?: string
          tenant_id?: string
          updated_at?: string
          valor_alocado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fin_alocacao_verba_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_capital_investido: {
        Row: {
          ativo_operacional: number | null
          capital_investido: number | null
          created_at: string
          id: string
          loja_id: string | null
          nopat: number | null
          passivo_operacional: number | null
          periodo_fim: string
          periodo_inicio: string
          roce: number | null
          roic: number | null
          spread_valor: number | null
          tenant_id: string
        }
        Insert: {
          ativo_operacional?: number | null
          capital_investido?: number | null
          created_at?: string
          id?: string
          loja_id?: string | null
          nopat?: number | null
          passivo_operacional?: number | null
          periodo_fim: string
          periodo_inicio: string
          roce?: number | null
          roic?: number | null
          spread_valor?: number | null
          tenant_id: string
        }
        Update: {
          ativo_operacional?: number | null
          capital_investido?: number | null
          created_at?: string
          id?: string
          loja_id?: string | null
          nopat?: number | null
          passivo_operacional?: number | null
          periodo_fim?: string
          periodo_inicio?: string
          roce?: number | null
          roic?: number | null
          spread_valor?: number | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fin_capital_investido_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_capital_investido_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_configuracao_financeira: {
        Row: {
          aliquota_efetiva: number | null
          created_at: string
          id: string
          limite_caixa_critico_dias: number | null
          moeda: string | null
          tenant_id: string
          updated_at: string
          wacc: number | null
        }
        Insert: {
          aliquota_efetiva?: number | null
          created_at?: string
          id?: string
          limite_caixa_critico_dias?: number | null
          moeda?: string | null
          tenant_id: string
          updated_at?: string
          wacc?: number | null
        }
        Update: {
          aliquota_efetiva?: number | null
          created_at?: string
          id?: string
          limite_caixa_critico_dias?: number | null
          moeda?: string | null
          tenant_id?: string
          updated_at?: string
          wacc?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fin_configuracao_financeira_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_despesa_operacional: {
        Row: {
          created_at: string
          created_by: string | null
          descricao: string | null
          id: string
          loja_id: string | null
          natureza: string
          origem: string | null
          periodicidade: string | null
          periodo_fim: string
          periodo_inicio: string
          tenant_id: string
          updated_at: string
          valor: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          id?: string
          loja_id?: string | null
          natureza: string
          origem?: string | null
          periodicidade?: string | null
          periodo_fim: string
          periodo_inicio: string
          tenant_id: string
          updated_at?: string
          valor?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          id?: string
          loja_id?: string | null
          natureza?: string
          origem?: string | null
          periodicidade?: string | null
          periodo_fim?: string
          periodo_inicio?: string
          tenant_id?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fin_despesa_operacional_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_despesa_operacional_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_margem_contribuicao_categoria: {
        Row: {
          categoria: string
          created_at: string
          custo_variavel: number | null
          id: string
          imc: number | null
          loja_id: string | null
          margem_contribuicao: number | null
          participacao_receita_pct: number | null
          periodo_fim: string
          periodo_inicio: string
          receita_categoria: number | null
          tenant_id: string
          tendencia: string | null
        }
        Insert: {
          categoria: string
          created_at?: string
          custo_variavel?: number | null
          id?: string
          imc?: number | null
          loja_id?: string | null
          margem_contribuicao?: number | null
          participacao_receita_pct?: number | null
          periodo_fim: string
          periodo_inicio: string
          receita_categoria?: number | null
          tenant_id: string
          tendencia?: string | null
        }
        Update: {
          categoria?: string
          created_at?: string
          custo_variavel?: number | null
          id?: string
          imc?: number | null
          loja_id?: string | null
          margem_contribuicao?: number | null
          participacao_receita_pct?: number | null
          periodo_fim?: string
          periodo_inicio?: string
          receita_categoria?: number | null
          tenant_id?: string
          tendencia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fin_margem_contribuicao_categoria_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_margem_contribuicao_categoria_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_meta_financeira: {
        Row: {
          categoria: string | null
          created_at: string
          dimensao: string
          id: string
          kpi: string
          limite_amarelo: number | null
          limite_vermelho: number | null
          loja_id: string | null
          periodo_fim: string
          periodo_inicio: string
          tenant_id: string
          updated_at: string
          valor_meta: number
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          dimensao?: string
          id?: string
          kpi: string
          limite_amarelo?: number | null
          limite_vermelho?: number | null
          loja_id?: string | null
          periodo_fim: string
          periodo_inicio: string
          tenant_id: string
          updated_at?: string
          valor_meta: number
        }
        Update: {
          categoria?: string | null
          created_at?: string
          dimensao?: string
          id?: string
          kpi?: string
          limite_amarelo?: number | null
          limite_vermelho?: number | null
          loja_id?: string | null
          periodo_fim?: string
          periodo_inicio?: string
          tenant_id?: string
          updated_at?: string
          valor_meta?: number
        }
        Relationships: [
          {
            foreignKeyName: "fin_meta_financeira_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_meta_financeira_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_projecao_financeira: {
        Row: {
          cmv_projetado: number | null
          created_at: string
          data_base: string
          despesas_projetadas: number | null
          horizonte_dias: number
          id: string
          loja_id: string | null
          lucro_projetado: number | null
          margem_projetada_pct: number | null
          premissas: Json | null
          receita_projetada: number | null
          tenant_id: string
        }
        Insert: {
          cmv_projetado?: number | null
          created_at?: string
          data_base: string
          despesas_projetadas?: number | null
          horizonte_dias?: number
          id?: string
          loja_id?: string | null
          lucro_projetado?: number | null
          margem_projetada_pct?: number | null
          premissas?: Json | null
          receita_projetada?: number | null
          tenant_id: string
        }
        Update: {
          cmv_projetado?: number | null
          created_at?: string
          data_base?: string
          despesas_projetadas?: number | null
          horizonte_dias?: number
          id?: string
          loja_id?: string | null
          lucro_projetado?: number | null
          margem_projetada_pct?: number | null
          premissas?: Json | null
          receita_projetada?: number | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fin_projecao_financeira_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_projecao_financeira_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_resultado_periodo: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          bonificacoes_recebidas: number | null
          cmv_bruto: number | null
          cmv_liquido: number | null
          created_at: string
          depreciacao_amortizacao: number | null
          descontos_abatimentos: number | null
          despesas_operacionais: number | null
          devolucoes: number | null
          ebit: number | null
          ebitda: number | null
          id: string
          impostos_sobre_vendas: number | null
          justificativa_versao: string | null
          lair: number | null
          loja_id: string | null
          lucro_bruto: number | null
          lucro_bruto_ajustado: number | null
          lucro_liquido: number | null
          margem_bruta_pct: number | null
          margem_ebitda_pct: number | null
          margem_liquida_pct: number | null
          margem_operacional_pct: number | null
          perdas_quebras: number | null
          periodo_fim: string
          periodo_inicio: string
          provisao_ir: number | null
          receita_bruta: number | null
          receita_liquida: number | null
          resultado_financeiro: number | null
          status: string
          tenant_id: string
          updated_at: string
          verbas_comerciais: number | null
          versao: number | null
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          bonificacoes_recebidas?: number | null
          cmv_bruto?: number | null
          cmv_liquido?: number | null
          created_at?: string
          depreciacao_amortizacao?: number | null
          descontos_abatimentos?: number | null
          despesas_operacionais?: number | null
          devolucoes?: number | null
          ebit?: number | null
          ebitda?: number | null
          id?: string
          impostos_sobre_vendas?: number | null
          justificativa_versao?: string | null
          lair?: number | null
          loja_id?: string | null
          lucro_bruto?: number | null
          lucro_bruto_ajustado?: number | null
          lucro_liquido?: number | null
          margem_bruta_pct?: number | null
          margem_ebitda_pct?: number | null
          margem_liquida_pct?: number | null
          margem_operacional_pct?: number | null
          perdas_quebras?: number | null
          periodo_fim: string
          periodo_inicio: string
          provisao_ir?: number | null
          receita_bruta?: number | null
          receita_liquida?: number | null
          resultado_financeiro?: number | null
          status?: string
          tenant_id: string
          updated_at?: string
          verbas_comerciais?: number | null
          versao?: number | null
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          bonificacoes_recebidas?: number | null
          cmv_bruto?: number | null
          cmv_liquido?: number | null
          created_at?: string
          depreciacao_amortizacao?: number | null
          descontos_abatimentos?: number | null
          despesas_operacionais?: number | null
          devolucoes?: number | null
          ebit?: number | null
          ebitda?: number | null
          id?: string
          impostos_sobre_vendas?: number | null
          justificativa_versao?: string | null
          lair?: number | null
          loja_id?: string | null
          lucro_bruto?: number | null
          lucro_bruto_ajustado?: number | null
          lucro_liquido?: number | null
          margem_bruta_pct?: number | null
          margem_ebitda_pct?: number | null
          margem_liquida_pct?: number | null
          margem_operacional_pct?: number | null
          perdas_quebras?: number | null
          periodo_fim?: string
          periodo_inicio?: string
          provisao_ir?: number | null
          receita_bruta?: number | null
          receita_liquida?: number | null
          resultado_financeiro?: number | null
          status?: string
          tenant_id?: string
          updated_at?: string
          verbas_comerciais?: number | null
          versao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fin_resultado_periodo_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_resultado_periodo_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_snapshot_capital_giro: {
        Row: {
          ccc: number | null
          cmv_periodo: number | null
          compras_periodo: number | null
          contas_pagar: number | null
          contas_receber: number | null
          created_at: string
          dio: number | null
          disponibilidades: number | null
          dpo: number | null
          dso: number | null
          estoque_medio: number | null
          icdf: number | null
          id: string
          loja_id: string | null
          ncg: number | null
          receita_periodo: number | null
          snapshot_date: string
          tenant_id: string
        }
        Insert: {
          ccc?: number | null
          cmv_periodo?: number | null
          compras_periodo?: number | null
          contas_pagar?: number | null
          contas_receber?: number | null
          created_at?: string
          dio?: number | null
          disponibilidades?: number | null
          dpo?: number | null
          dso?: number | null
          estoque_medio?: number | null
          icdf?: number | null
          id?: string
          loja_id?: string | null
          ncg?: number | null
          receita_periodo?: number | null
          snapshot_date: string
          tenant_id: string
        }
        Update: {
          ccc?: number | null
          cmv_periodo?: number | null
          compras_periodo?: number | null
          contas_pagar?: number | null
          contas_receber?: number | null
          created_at?: string
          dio?: number | null
          disponibilidades?: number | null
          dpo?: number | null
          dso?: number | null
          estoque_medio?: number | null
          icdf?: number | null
          id?: string
          loja_id?: string | null
          ncg?: number | null
          receita_periodo?: number | null
          snapshot_date?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fin_snapshot_capital_giro_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_snapshot_capital_giro_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transaction_links: {
        Row: {
          created_at: string
          id: string
          linked_id: string
          linked_type: string
          tenant_id: string | null
          transaction_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          linked_id: string
          linked_type: string
          tenant_id?: string | null
          transaction_id: string
        }
        Update: {
          created_at?: string
          id?: string
          linked_id?: string
          linked_type?: string
          tenant_id?: string | null
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transaction_links_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transaction_links_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "financial_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string
          date: string
          description: string
          id: string
          notes: string | null
          payment_method: string | null
          reference_id: string | null
          reference_type: string | null
          status: string
          subcategory: string | null
          tags: string[] | null
          tenant_id: string
          type: string
          updated_at: string
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string
          created_by: string
          date?: string
          description?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          subcategory?: string | null
          tags?: string[] | null
          tenant_id: string
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string
          date?: string
          description?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          subcategory?: string | null
          tags?: string[] | null
          tenant_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      gondolas: {
        Row: {
          category: string | null
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string | null
          planogram_url: string | null
          position: Json | null
          sector: string | null
          tenant_id: string
          unit_id: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          planogram_url?: string | null
          position?: Json | null
          sector?: string | null
          tenant_id: string
          unit_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          planogram_url?: string | null
          position?: Json | null
          sector?: string | null
          tenant_id?: string
          unit_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gondolas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gondolas_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      hiperia_conversations: {
        Row: {
          created_at: string
          id: string
          messages: Json
          tenant_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          tenant_id?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          tenant_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hiperia_conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hiperia_message_feedback: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          feedback_text: string | null
          feedback_type: string
          id: string
          message_index: number
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          feedback_text?: string | null
          feedback_type: string
          id?: string
          message_index: number
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          feedback_text?: string | null
          feedback_type?: string
          id?: string
          message_index?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hiperia_message_feedback_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "hiperia_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      hiperia_scheduled_queries: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          last_run: string | null
          next_run: string | null
          notification_channel: string | null
          query: string
          schedule_day: number | null
          schedule_time: string | null
          schedule_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_run?: string | null
          next_run?: string | null
          notification_channel?: string | null
          query: string
          schedule_day?: number | null
          schedule_time?: string | null
          schedule_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_run?: string | null
          next_run?: string | null
          notification_channel?: string | null
          query?: string
          schedule_day?: number | null
          schedule_time?: string | null
          schedule_type?: string
          user_id?: string
        }
        Relationships: []
      }
      hiperia_shared_conversations: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          share_token: string
          view_count: number | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          share_token?: string
          view_count?: number | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          share_token?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hiperia_shared_conversations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "hiperia_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      hiperia_uploaded_files: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          message_index: number | null
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          message_index?: number | null
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          message_index?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hiperia_uploaded_files_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "hiperia_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      hiperia_user_preferences: {
        Row: {
          context_memory: Json | null
          created_at: string | null
          custom_instructions: string | null
          display_name: string | null
          favorite_topics: Json | null
          id: string
          preferred_language: string | null
          preferred_tone: string | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          context_memory?: Json | null
          created_at?: string | null
          custom_instructions?: string | null
          display_name?: string | null
          favorite_topics?: Json | null
          id?: string
          preferred_language?: string | null
          preferred_tone?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          context_memory?: Json | null
          created_at?: string | null
          custom_instructions?: string | null
          display_name?: string | null
          favorite_topics?: Json | null
          id?: string
          preferred_language?: string | null
          preferred_tone?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      hiperworks_channel_governance: {
        Row: {
          allowed_types: string[] | null
          auto_suggest_comprovacao: boolean | null
          channel_id: string
          created_at: string | null
          id: string
          suggested_template: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          allowed_types?: string[] | null
          auto_suggest_comprovacao?: boolean | null
          channel_id: string
          created_at?: string | null
          id?: string
          suggested_template?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          allowed_types?: string[] | null
          auto_suggest_comprovacao?: boolean | null
          channel_id?: string
          created_at?: string | null
          id?: string
          suggested_template?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hiperworks_channel_governance_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "hiperworks_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hiperworks_channel_governance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hiperworks_channel_members: {
        Row: {
          channel_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hiperworks_channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "hiperworks_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      hiperworks_channels: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_private: boolean
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_private?: boolean
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_private?: boolean
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hiperworks_channels_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hiperworks_dm_conversations: {
        Row: {
          created_at: string
          id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hiperworks_dm_conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hiperworks_dm_messages: {
        Row: {
          attachments: Json | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hiperworks_dm_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "hiperworks_dm_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      hiperworks_dm_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hiperworks_dm_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "hiperworks_dm_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      hiperworks_dm_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hiperworks_dm_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "hiperworks_dm_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      hiperworks_last_read: {
        Row: {
          channel_id: string | null
          dm_conversation_id: string | null
          id: string
          last_message_id: string | null
          last_read_at: string
          user_id: string
        }
        Insert: {
          channel_id?: string | null
          dm_conversation_id?: string | null
          id?: string
          last_message_id?: string | null
          last_read_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string | null
          dm_conversation_id?: string | null
          id?: string
          last_message_id?: string | null
          last_read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hiperworks_last_read_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "hiperworks_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hiperworks_last_read_dm_conversation_id_fkey"
            columns: ["dm_conversation_id"]
            isOneToOne: false
            referencedRelation: "hiperworks_dm_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      hiperworks_mentions: {
        Row: {
          created_at: string
          id: string
          mentioned_user_id: string
          message_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mentioned_user_id: string
          message_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mentioned_user_id?: string
          message_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hiperworks_mentions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "hiperworks_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hiperworks_mentions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hiperworks_messages: {
        Row: {
          attachments: Json | null
          channel_id: string
          content: string
          created_at: string
          edited_at: string | null
          id: string
          is_bot: boolean
          is_pinned: boolean
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          channel_id: string
          content: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_bot?: boolean
          is_pinned?: boolean
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          channel_id?: string
          content?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_bot?: boolean
          is_pinned?: boolean
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hiperworks_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "hiperworks_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hiperworks_messages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "hiperworks_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      hiperworks_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hiperworks_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "hiperworks_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      hiperworks_saved_messages: {
        Row: {
          created_at: string
          id: string
          message_id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hiperworks_saved_messages_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "hiperworks_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hiperworks_saved_messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_achievements: {
        Row: {
          created_at: string
          criteria_type: string
          criteria_value: Json | null
          description: string | null
          icon: string | null
          id: string
          points: number
          tenant_id: string
          title: string
        }
        Insert: {
          created_at?: string
          criteria_type?: string
          criteria_value?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          points?: number
          tenant_id: string
          title: string
        }
        Update: {
          created_at?: string
          criteria_type?: string
          criteria_value?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          points?: number
          tenant_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_achievements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_bulletins: {
        Row: {
          author_id: string
          category: string
          content: string
          created_at: string
          expires_at: string | null
          id: string
          pinned: boolean | null
          priority: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category?: string
          content: string
          created_at?: string
          expires_at?: string | null
          id?: string
          pinned?: boolean | null
          priority?: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          pinned?: boolean | null
          priority?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_bulletins_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_call_participants: {
        Row: {
          call_id: string
          created_at: string
          id: string
          joined_at: string | null
          left_at: string | null
          role: string
          status: string
          user_id: string
        }
        Insert: {
          call_id: string
          created_at?: string
          id?: string
          joined_at?: string | null
          left_at?: string | null
          role?: string
          status?: string
          user_id: string
        }
        Update: {
          call_id?: string
          created_at?: string
          id?: string
          joined_at?: string | null
          left_at?: string | null
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_call_participants_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "hw_calls"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_calls: {
        Row: {
          call_type: string
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          initiated_by: string
          is_group: boolean
          started_at: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          call_type?: string
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          initiated_by: string
          is_group?: boolean
          started_at?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          call_type?: string
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          initiated_by?: string
          is_group?: boolean
          started_at?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_calls_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_candidates: {
        Row: {
          ai_recommended: boolean
          created_at: string
          email: string | null
          id: string
          kanban_stage: string | null
          name: string
          notes: string | null
          phone: string | null
          position: string
          rating: number | null
          resume_path: string | null
          source: string | null
          status: string
          submitted_at: string
          tenant_id: string
        }
        Insert: {
          ai_recommended?: boolean
          created_at?: string
          email?: string | null
          id?: string
          kanban_stage?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          position: string
          rating?: number | null
          resume_path?: string | null
          source?: string | null
          status?: string
          submitted_at?: string
          tenant_id: string
        }
        Update: {
          ai_recommended?: boolean
          created_at?: string
          email?: string | null
          id?: string
          kanban_stage?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          position?: string
          rating?: number | null
          resume_path?: string | null
          source?: string | null
          status?: string
          submitted_at?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_candidates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_climate_responses: {
        Row: {
          answers: Json
          id: string
          submitted_at: string
          survey_id: string
          tenant_id: string
          user_id: string | null
        }
        Insert: {
          answers?: Json
          id?: string
          submitted_at?: string
          survey_id: string
          tenant_id: string
          user_id?: string | null
        }
        Update: {
          answers?: Json
          id?: string
          submitted_at?: string
          survey_id?: string
          tenant_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hw_climate_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "hw_climate_surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hw_climate_responses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_climate_surveys: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          is_anonymous: boolean | null
          questions: Json
          starts_at: string
          tenant_id: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          is_anonymous?: boolean | null
          questions?: Json
          starts_at?: string
          tenant_id: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          is_anonymous?: boolean | null
          questions?: Json
          starts_at?: string
          tenant_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_climate_surveys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_departments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_document_signatures: {
        Row: {
          created_at: string
          document_id: string
          document_title: string
          id: string
          ip_address: string | null
          requested_by: string | null
          signature_hash: string | null
          signed_at: string | null
          signer_id: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_id: string
          document_title?: string
          id?: string
          ip_address?: string | null
          requested_by?: string | null
          signature_hash?: string | null
          signed_at?: string | null
          signer_id: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_id?: string
          document_title?: string
          id?: string
          ip_address?: string | null
          requested_by?: string | null
          signature_hash?: string | null
          signed_at?: string | null
          signer_id?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_document_signatures_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_documents: {
        Row: {
          context_id: string | null
          context_type: string
          created_at: string
          file_path: string
          file_type: string | null
          id: string
          name: string
          tenant_id: string
          uploaded_by: string
        }
        Insert: {
          context_id?: string | null
          context_type?: string
          created_at?: string
          file_path: string
          file_type?: string | null
          id?: string
          name: string
          tenant_id: string
          uploaded_by: string
        }
        Update: {
          context_id?: string | null
          context_type?: string
          created_at?: string
          file_path?: string
          file_type?: string | null
          id?: string
          name?: string
          tenant_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_favorites: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_favorites_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_goal_badges: {
        Row: {
          badge_color: string
          badge_icon: string
          badge_key: string
          badge_label: string
          campaign_id: string | null
          earned_at: string
          goal_id: string | null
          id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          badge_color?: string
          badge_icon?: string
          badge_key: string
          badge_label: string
          campaign_id?: string | null
          earned_at?: string
          goal_id?: string | null
          id?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          badge_color?: string
          badge_icon?: string
          badge_key?: string
          badge_label?: string
          campaign_id?: string | null
          earned_at?: string
          goal_id?: string | null
          id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_goal_badges_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "hw_goal_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hw_goal_badges_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "hw_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_goal_campaign_participants: {
        Row: {
          campaign_id: string
          completed_at: string | null
          goals_created_count: number
          id: string
          joined_at: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          completed_at?: string | null
          goals_created_count?: number
          id?: string
          joined_at?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          completed_at?: string | null
          goals_created_count?: number
          id?: string
          joined_at?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_goal_campaign_participants_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "hw_goal_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_goal_campaigns: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          ends_at: string
          id: string
          min_goals_required: number
          reward_badge_name: string | null
          reward_description: string | null
          scope_required: string
          starts_at: string
          status: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          ends_at: string
          id?: string
          min_goals_required?: number
          reward_badge_name?: string | null
          reward_description?: string | null
          scope_required?: string
          starts_at?: string
          status?: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          ends_at?: string
          id?: string
          min_goals_required?: number
          reward_badge_name?: string | null
          reward_description?: string | null
          scope_required?: string
          starts_at?: string
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_goal_campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_goal_checkins: {
        Row: {
          created_at: string
          goal_id: string
          id: string
          note: string | null
          progress_snapshot: number
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_id: string
          id?: string
          note?: string | null
          progress_snapshot?: number
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          goal_id?: string
          id?: string
          note?: string | null
          progress_snapshot?: number
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_goal_checkins_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "hw_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_goals: {
        Row: {
          assigned_to: string | null
          campaign_id: string | null
          created_at: string
          current_value: number | null
          deadline: string | null
          description: string | null
          id: string
          parent_goal_id: string | null
          period: string
          priority: string
          scope: string
          scope_target_id: string | null
          status: string
          target_value: number | null
          tenant_id: string
          title: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          campaign_id?: string | null
          created_at?: string
          current_value?: number | null
          deadline?: string | null
          description?: string | null
          id?: string
          parent_goal_id?: string | null
          period?: string
          priority?: string
          scope?: string
          scope_target_id?: string | null
          status?: string
          target_value?: number | null
          tenant_id: string
          title: string
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          campaign_id?: string | null
          created_at?: string
          current_value?: number | null
          deadline?: string | null
          description?: string | null
          id?: string
          parent_goal_id?: string | null
          period?: string
          priority?: string
          scope?: string
          scope_target_id?: string | null
          status?: string
          target_value?: number | null
          tenant_id?: string
          title?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_goals_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "hw_goal_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hw_goals_parent_goal_id_fkey"
            columns: ["parent_goal_id"]
            isOneToOne: false
            referencedRelation: "hw_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hw_goals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_incidents: {
        Row: {
          created_at: string | null
          created_by: string
          description: string
          id: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          tenant_id: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description: string
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          tenant_id: string
          type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          tenant_id?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_incidents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_interviews: {
        Row: {
          candidate_id: string
          created_at: string | null
          created_by: string | null
          duration_minutes: number | null
          id: string
          interviewer_id: string | null
          location: string | null
          notes: string | null
          result: string | null
          scheduled_at: string
          tenant_id: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          interviewer_id?: string | null
          location?: string | null
          notes?: string | null
          result?: string | null
          scheduled_at: string
          tenant_id: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          interviewer_id?: string | null
          location?: string | null
          notes?: string | null
          result?: string | null
          scheduled_at?: string
          tenant_id?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hw_interviews_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "hw_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hw_interviews_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_key_results: {
        Row: {
          created_at: string
          current: number
          goal_id: string
          id: string
          target: number
          tenant_id: string
          title: string
          unit: string
          updated_at: string
          weight: number
        }
        Insert: {
          created_at?: string
          current?: number
          goal_id: string
          id?: string
          target?: number
          tenant_id: string
          title: string
          unit?: string
          updated_at?: string
          weight?: number
        }
        Update: {
          created_at?: string
          current?: number
          goal_id?: string
          id?: string
          target?: number
          tenant_id?: string
          title?: string
          unit?: string
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "hw_key_results_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "hw_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hw_key_results_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_member_transfers: {
        Row: {
          created_at: string | null
          from_team_id: string | null
          id: string
          reason: string | null
          tenant_id: string
          to_team_id: string
          transferred_at: string | null
          transferred_by: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          from_team_id?: string | null
          id?: string
          reason?: string | null
          tenant_id: string
          to_team_id: string
          transferred_at?: string | null
          transferred_by: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          from_team_id?: string | null
          id?: string
          reason?: string | null
          tenant_id?: string
          to_team_id?: string
          transferred_at?: string | null
          transferred_by?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_member_transfers_from_team_id_fkey"
            columns: ["from_team_id"]
            isOneToOne: false
            referencedRelation: "hw_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hw_member_transfers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hw_member_transfers_to_team_id_fkey"
            columns: ["to_team_id"]
            isOneToOne: false
            referencedRelation: "hw_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_notification_preferences: {
        Row: {
          created_at: string
          digest_enabled: boolean
          dnd_active: boolean
          dnd_end: string | null
          dnd_start: string | null
          id: string
          mute_channels: boolean
          mute_mentions: boolean
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          digest_enabled?: boolean
          dnd_active?: boolean
          dnd_end?: string | null
          dnd_start?: string | null
          id?: string
          mute_channels?: boolean
          mute_mentions?: boolean
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          digest_enabled?: boolean
          dnd_active?: boolean
          dnd_end?: string | null
          dnd_start?: string | null
          id?: string
          mute_channels?: boolean
          mute_mentions?: boolean
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_notification_preferences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_notifications: {
        Row: {
          created_at: string
          id: string
          message: string | null
          read_at: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          tenant_id: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          tenant_id: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          tenant_id?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_off_hours_access_terms: {
        Row: {
          accessed_at: string
          created_at: string
          id: string
          ip_address: string | null
          tenant_id: string
          term_hash: string
          term_text: string
          user_agent: string | null
          user_id: string
          work_schedule: Json | null
        }
        Insert: {
          accessed_at?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          tenant_id: string
          term_hash: string
          term_text: string
          user_agent?: string | null
          user_id: string
          work_schedule?: Json | null
        }
        Update: {
          accessed_at?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          tenant_id?: string
          term_hash?: string
          term_text?: string
          user_agent?: string | null
          user_id?: string
          work_schedule?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "hw_off_hours_access_terms_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_poll_votes: {
        Row: {
          created_at: string | null
          id: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_index?: number
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "hw_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_polls: {
        Row: {
          closes_at: string | null
          created_at: string | null
          id: string
          options: Json
          post_id: string
          question: string
          tenant_id: string
        }
        Insert: {
          closes_at?: string | null
          created_at?: string | null
          id?: string
          options?: Json
          post_id: string
          question: string
          tenant_id: string
        }
        Update: {
          closes_at?: string | null
          created_at?: string | null
          id?: string
          options?: Json
          post_id?: string
          question?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_polls_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "hw_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hw_polls_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_post_acks: {
        Row: {
          acked_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          acked_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          acked_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_post_acks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "hw_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "hw_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_post_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "hw_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_post_reads: {
        Row: {
          id: string
          post_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          post_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          post_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_post_reads_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "hw_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          file_url: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          pinned_until: string | null
          read_count: number
          requires_ack: boolean | null
          scheduled_at: string | null
          team_id: string | null
          tenant_id: string
          title: string | null
          type: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          file_url?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          pinned_until?: string | null
          read_count?: number
          requires_ack?: boolean | null
          scheduled_at?: string | null
          team_id?: string | null
          tenant_id: string
          title?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          file_url?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          pinned_until?: string | null
          read_count?: number
          requires_ack?: boolean | null
          scheduled_at?: string | null
          team_id?: string | null
          tenant_id?: string
          title?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_posts_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "hw_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hw_posts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          tenant_id: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          tenant_id: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          tenant_id?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_push_subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_recent_views: {
        Row: {
          entity_id: string
          entity_type: string
          id: string
          tenant_id: string | null
          user_id: string
          viewed_at: string
        }
        Insert: {
          entity_id: string
          entity_type: string
          id?: string
          tenant_id?: string | null
          user_id: string
          viewed_at?: string
        }
        Update: {
          entity_id?: string
          entity_type?: string
          id?: string
          tenant_id?: string | null
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_recent_views_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_recognitions: {
        Row: {
          category: string
          created_at: string
          emoji: string | null
          from_user_id: string
          id: string
          message: string
          tenant_id: string
          to_user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          emoji?: string | null
          from_user_id: string
          id?: string
          message: string
          tenant_id: string
          to_user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          emoji?: string | null
          from_user_id?: string
          id?: string
          message?: string
          tenant_id?: string
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_recognitions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_shifts: {
        Row: {
          created_at: string | null
          created_by: string | null
          end_time: string | null
          id: string
          notes: string | null
          shift_date: string
          shift_type: string
          start_time: string | null
          team_id: string
          tenant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          shift_date: string
          shift_type?: string
          start_time?: string | null
          team_id: string
          tenant_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          shift_date?: string
          shift_type?: string
          start_time?: string | null
          team_id?: string
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_shifts_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "hw_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hw_shifts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_team_members: {
        Row: {
          availability_status:
            | Database["public"]["Enums"]["hw_availability_status"]
            | null
          id: string
          joined_at: string
          team_id: string
          user_id: string
        }
        Insert: {
          availability_status?:
            | Database["public"]["Enums"]["hw_availability_status"]
            | null
          id?: string
          joined_at?: string
          team_id: string
          user_id: string
        }
        Update: {
          availability_status?:
            | Database["public"]["Enums"]["hw_availability_status"]
            | null
          id?: string
          joined_at?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "hw_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_teams: {
        Row: {
          created_at: string
          department_id: string
          id: string
          leader_id: string | null
          name: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          department_id: string
          id?: string
          leader_id?: string | null
          name: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          department_id?: string
          id?: string
          leader_id?: string | null
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_teams_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "hw_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hw_teams_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "hw_teams_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_training_assignments: {
        Row: {
          academy_course_id: string | null
          assigned_at: string
          assigned_by: string
          completed_at: string | null
          id: string
          mandatory: boolean
          materials: Json
          source: string
          status: string
          team_id: string | null
          tenant_id: string
          training_description: string | null
          training_title: string
          user_id: string
        }
        Insert: {
          academy_course_id?: string | null
          assigned_at?: string
          assigned_by: string
          completed_at?: string | null
          id?: string
          mandatory?: boolean
          materials?: Json
          source?: string
          status?: string
          team_id?: string | null
          tenant_id: string
          training_description?: string | null
          training_title: string
          user_id: string
        }
        Update: {
          academy_course_id?: string | null
          assigned_at?: string
          assigned_by?: string
          completed_at?: string | null
          id?: string
          mandatory?: boolean
          materials?: Json
          source?: string
          status?: string
          team_id?: string | null
          tenant_id?: string
          training_description?: string | null
          training_title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_training_assignments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "hw_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hw_training_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_user_badges: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_user_badges_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "hw_achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hw_user_badges_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_user_layout: {
        Row: {
          bottom_tabs: string[] | null
          home_widgets_order: string[] | null
          id: string
          pinned_actions: Json | null
          pinned_pages: Json | null
          pinned_widgets: Json | null
          right_widgets_order: Json | null
          sidebar_order: string[] | null
          tenant_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bottom_tabs?: string[] | null
          home_widgets_order?: string[] | null
          id?: string
          pinned_actions?: Json | null
          pinned_pages?: Json | null
          pinned_widgets?: Json | null
          right_widgets_order?: Json | null
          sidebar_order?: string[] | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bottom_tabs?: string[] | null
          home_widgets_order?: string[] | null
          id?: string
          pinned_actions?: Json | null
          pinned_pages?: Json | null
          pinned_widgets?: Json | null
          right_widgets_order?: Json | null
          sidebar_order?: string[] | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_user_layout_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hw_user_settings: {
        Row: {
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hw_user_shortcuts: {
        Row: {
          created_at: string
          icon: string
          id: string
          label: string
          shortcut_type: string
          sort_order: number
          target: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          label: string
          shortcut_type?: string
          sort_order?: number
          target: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          label?: string
          shortcut_type?: string
          sort_order?: number
          target?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hw_user_shortcuts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hyperworks_entity_links: {
        Row: {
          channel_id: string | null
          created_at: string
          created_by: string
          entity_id: string
          entity_type: string
          excerpt: string | null
          id: string
          label: string | null
          media_urls: string[] | null
          message_id: string
          relation_type: string
          tenant_id: string
          workspace_id: string | null
        }
        Insert: {
          channel_id?: string | null
          created_at?: string
          created_by: string
          entity_id: string
          entity_type: string
          excerpt?: string | null
          id?: string
          label?: string | null
          media_urls?: string[] | null
          message_id: string
          relation_type?: string
          tenant_id: string
          workspace_id?: string | null
        }
        Update: {
          channel_id?: string | null
          created_at?: string
          created_by?: string
          entity_id?: string
          entity_type?: string
          excerpt?: string | null
          id?: string
          label?: string | null
          media_urls?: string[] | null
          message_id?: string
          relation_type?: string
          tenant_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hyperworks_entity_links_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_configs: {
        Row: {
          config: Json
          created_at: string
          created_by: string | null
          credentials: Json | null
          id: string
          integration_name: string
          integration_type: string
          is_configured: boolean
          is_enabled: boolean
          last_error: string | null
          last_sync_at: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by?: string | null
          credentials?: Json | null
          id?: string
          integration_name: string
          integration_type: string
          is_configured?: boolean
          is_enabled?: boolean
          last_error?: string | null
          last_sync_at?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string | null
          credentials?: Json | null
          id?: string
          integration_name?: string
          integration_type?: string
          is_configured?: boolean
          is_enabled?: boolean
          last_error?: string | null
          last_sync_at?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_configs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      job_candidates: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          interview_date: string | null
          name: string
          notes: string | null
          phone: string | null
          position_applied: string
          resume_url: string | null
          source: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          interview_date?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          position_applied: string
          resume_url?: string | null
          source?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          interview_date?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          position_applied?: string
          resume_url?: string | null
          source?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_candidates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          attachment_url: string | null
          created_at: string | null
          employee_id: string
          end_date: string
          id: string
          notes: string | null
          start_date: string
          status: string | null
          tenant_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          attachment_url?: string | null
          created_at?: string | null
          employee_id: string
          end_date: string
          id?: string
          notes?: string | null
          start_date: string
          status?: string | null
          tenant_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          attachment_url?: string | null
          created_at?: string | null
          employee_id?: string
          end_date?: string
          id?: string
          notes?: string | null
          start_date?: string
          status?: string | null
          tenant_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      loja_alerta_loja: {
        Row: {
          codigo_alerta: string
          created_at: string
          descricao: string | null
          id: string
          kpi_nome: string | null
          link_acao: string | null
          loja_id: string | null
          loja_nome: string | null
          modulo_origem: string | null
          nivel: string
          reconhecido_em: string | null
          reconhecido_por: string | null
          resolvido_em: string | null
          resolvido_por: string | null
          sla_horas: number | null
          status: string
          tenant_id: string
          titulo: string
          updated_at: string
          valor_atual: number | null
          valor_limite: number | null
        }
        Insert: {
          codigo_alerta: string
          created_at?: string
          descricao?: string | null
          id?: string
          kpi_nome?: string | null
          link_acao?: string | null
          loja_id?: string | null
          loja_nome?: string | null
          modulo_origem?: string | null
          nivel: string
          reconhecido_em?: string | null
          reconhecido_por?: string | null
          resolvido_em?: string | null
          resolvido_por?: string | null
          sla_horas?: number | null
          status?: string
          tenant_id: string
          titulo: string
          updated_at?: string
          valor_atual?: number | null
          valor_limite?: number | null
        }
        Update: {
          codigo_alerta?: string
          created_at?: string
          descricao?: string | null
          id?: string
          kpi_nome?: string | null
          link_acao?: string | null
          loja_id?: string | null
          loja_nome?: string | null
          modulo_origem?: string | null
          nivel?: string
          reconhecido_em?: string | null
          reconhecido_por?: string | null
          resolvido_em?: string | null
          resolvido_por?: string | null
          sla_horas?: number | null
          status?: string
          tenant_id?: string
          titulo?: string
          updated_at?: string
          valor_atual?: number | null
          valor_limite?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "loja_alerta_loja_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      loja_area_secao: {
        Row: {
          area_m2: number
          created_at: string
          created_by: string | null
          id: string
          loja_id: string
          loja_nome: string
          secao_nome: string
          tenant_id: string
          updated_at: string
          vigencia_fim: string | null
          vigencia_inicio: string
        }
        Insert: {
          area_m2: number
          created_at?: string
          created_by?: string | null
          id?: string
          loja_id: string
          loja_nome: string
          secao_nome: string
          tenant_id: string
          updated_at?: string
          vigencia_fim?: string | null
          vigencia_inicio: string
        }
        Update: {
          area_m2?: number
          created_at?: string
          created_by?: string | null
          id?: string
          loja_id?: string
          loja_nome?: string
          secao_nome?: string
          tenant_id?: string
          updated_at?: string
          vigencia_fim?: string | null
          vigencia_inicio?: string
        }
        Relationships: [
          {
            foreignKeyName: "loja_area_secao_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      loja_configuracao_ipc: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          kpi_nome: string
          peso: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          kpi_nome: string
          peso: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          kpi_nome?: string
          peso?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loja_configuracao_ipc_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      loja_configuracao_loja: {
        Row: {
          created_at: string
          created_by: string | null
          iap_limite_amarelo: number | null
          iap_limite_verde: number | null
          id: string
          ip_limite_amarelo: number | null
          ip_limite_verde: number | null
          ipe_variacao_alerta: number | null
          loja_id: string
          loja_nome: string
          markup_tolerancia_pct: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          iap_limite_amarelo?: number | null
          iap_limite_verde?: number | null
          id?: string
          ip_limite_amarelo?: number | null
          ip_limite_verde?: number | null
          ipe_variacao_alerta?: number | null
          loja_id: string
          loja_nome: string
          markup_tolerancia_pct?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          iap_limite_amarelo?: number | null
          iap_limite_verde?: number | null
          id?: string
          ip_limite_amarelo?: number | null
          ip_limite_verde?: number | null
          ipe_variacao_alerta?: number | null
          loja_id?: string
          loja_nome?: string
          markup_tolerancia_pct?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loja_configuracao_loja_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      loja_consolidado_perda_periodo: {
        Row: {
          created_at: string
          desvio_padrao_diario: number | null
          id: string
          ip_percentual: number | null
          loja_id: string
          loja_nome: string
          perda_furto_externo: number | null
          perda_furto_interno: number | null
          perda_operacional: number | null
          perda_vencimento: number | null
          periodo_fim: string
          periodo_inicio: string
          receita_liquida_periodo: number
          secao_nome: string | null
          tenant_id: string
          total_perda: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          desvio_padrao_diario?: number | null
          id?: string
          ip_percentual?: number | null
          loja_id: string
          loja_nome: string
          perda_furto_externo?: number | null
          perda_furto_interno?: number | null
          perda_operacional?: number | null
          perda_vencimento?: number | null
          periodo_fim: string
          periodo_inicio: string
          receita_liquida_periodo?: number
          secao_nome?: string | null
          tenant_id: string
          total_perda?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          desvio_padrao_diario?: number | null
          id?: string
          ip_percentual?: number | null
          loja_id?: string
          loja_nome?: string
          perda_furto_externo?: number | null
          perda_furto_interno?: number | null
          perda_operacional?: number | null
          perda_vencimento?: number | null
          periodo_fim?: string
          periodo_inicio?: string
          receita_liquida_periodo?: number
          secao_nome?: string | null
          tenant_id?: string
          total_perda?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loja_consolidado_perda_periodo_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      loja_historico_preco: {
        Row: {
          created_at: string
          created_by: string | null
          custo_unitario: number
          id: string
          loja_id: string
          loja_nome: string
          margem_real: number | null
          markup_real: number | null
          origem: string | null
          preco_venda: number
          sku_id: string
          sku_nome: string
          tenant_id: string
          vigencia_inicio: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          custo_unitario: number
          id?: string
          loja_id: string
          loja_nome: string
          margem_real?: number | null
          markup_real?: number | null
          origem?: string | null
          preco_venda: number
          sku_id: string
          sku_nome: string
          tenant_id: string
          vigencia_inicio?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          custo_unitario?: number
          id?: string
          loja_id?: string
          loja_nome?: string
          margem_real?: number | null
          markup_real?: number | null
          origem?: string | null
          preco_venda?: number
          sku_id?: string
          sku_nome?: string
          tenant_id?: string
          vigencia_inicio?: string
        }
        Relationships: [
          {
            foreignKeyName: "loja_historico_preco_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      loja_ipc_loja: {
        Row: {
          created_at: string
          id: string
          ipc_score: number
          kpis_detalhados: Json | null
          loja_id: string
          loja_nome: string
          periodo_referencia: string
          ranking_posicao: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          ipc_score?: number
          kpis_detalhados?: Json | null
          loja_id: string
          loja_nome: string
          periodo_referencia: string
          ranking_posicao?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          ipc_score?: number
          kpis_detalhados?: Json | null
          loja_id?: string
          loja_nome?: string
          periodo_referencia?: string
          ranking_posicao?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loja_ipc_loja_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      loja_markup_meta: {
        Row: {
          categoria_nome: string | null
          created_at: string
          created_by: string | null
          id: string
          loja_id: string | null
          markup_objetivo: number
          secao_nome: string | null
          sku_id: string | null
          tenant_id: string
          tolerancia_pct: number
          updated_at: string
          vigencia_fim: string | null
          vigencia_inicio: string
        }
        Insert: {
          categoria_nome?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          loja_id?: string | null
          markup_objetivo: number
          secao_nome?: string | null
          sku_id?: string | null
          tenant_id: string
          tolerancia_pct?: number
          updated_at?: string
          vigencia_fim?: string | null
          vigencia_inicio?: string
        }
        Update: {
          categoria_nome?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          loja_id?: string | null
          markup_objetivo?: number
          secao_nome?: string | null
          sku_id?: string | null
          tenant_id?: string
          tolerancia_pct?: number
          updated_at?: string
          vigencia_fim?: string | null
          vigencia_inicio?: string
        }
        Relationships: [
          {
            foreignKeyName: "loja_markup_meta_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      loja_registro_perda: {
        Row: {
          created_at: string
          created_by: string | null
          custo_unitario: number
          data_registro: string
          id: string
          loja_id: string
          loja_nome: string
          observacao: string | null
          quantidade: number
          reclassificavel_ate: string | null
          secao_nome: string
          sku_id: string | null
          sku_nome: string | null
          tenant_id: string
          tipo_perda: string
          updated_at: string
          valor_perda: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          custo_unitario: number
          data_registro?: string
          id?: string
          loja_id: string
          loja_nome: string
          observacao?: string | null
          quantidade: number
          reclassificavel_ate?: string | null
          secao_nome: string
          sku_id?: string | null
          sku_nome?: string | null
          tenant_id: string
          tipo_perda: string
          updated_at?: string
          valor_perda?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          custo_unitario?: number
          data_registro?: string
          id?: string
          loja_id?: string
          loja_nome?: string
          observacao?: string | null
          quantidade?: number
          reclassificavel_ate?: string | null
          secao_nome?: string
          sku_id?: string | null
          sku_nome?: string | null
          tenant_id?: string
          tipo_perda?: string
          updated_at?: string
          valor_perda?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "loja_registro_perda_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      loja_rentabilidade_espaco_periodo: {
        Row: {
          area_m2: number
          created_at: string
          id: string
          ipe: number | null
          loja_id: string
          loja_nome: string
          margem_por_m2: number | null
          margem_secao: number
          periodo_fim: string
          periodo_inicio: string
          receita_por_m2: number | null
          receita_secao: number
          secao_nome: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          area_m2?: number
          created_at?: string
          id?: string
          ipe?: number | null
          loja_id: string
          loja_nome: string
          margem_por_m2?: number | null
          margem_secao?: number
          periodo_fim: string
          periodo_inicio: string
          receita_por_m2?: number | null
          receita_secao?: number
          secao_nome: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          area_m2?: number
          created_at?: string
          id?: string
          ipe?: number | null
          loja_id?: string
          loja_nome?: string
          margem_por_m2?: number | null
          margem_secao?: number
          periodo_fim?: string
          periodo_inicio?: string
          receita_por_m2?: number | null
          receita_secao?: number
          secao_nome?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loja_rentabilidade_espaco_periodo_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      loja_snapshot_precificacao: {
        Row: {
          created_at: string
          data_snapshot: string
          iap_percentual: number | null
          id: string
          impacto_financeiro_desvio: number | null
          loja_id: string
          loja_nome: string
          skus_conformes: number
          skus_pac: number
          tenant_id: string
          total_skus: number
        }
        Insert: {
          created_at?: string
          data_snapshot?: string
          iap_percentual?: number | null
          id?: string
          impacto_financeiro_desvio?: number | null
          loja_id: string
          loja_nome: string
          skus_conformes?: number
          skus_pac?: number
          tenant_id: string
          total_skus?: number
        }
        Update: {
          created_at?: string
          data_snapshot?: string
          iap_percentual?: number | null
          id?: string
          impacto_financeiro_desvio?: number | null
          loja_id?: string
          loja_nome?: string
          skus_conformes?: number
          skus_pac?: number
          tenant_id?: string
          total_skus?: number
        }
        Relationships: [
          {
            foreignKeyName: "loja_snapshot_precificacao_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_ai_insights: {
        Row: {
          confidence_score: number | null
          context_data: Json
          created_at: string
          expires_at: string | null
          id: string
          insight_text: string
          insight_type: string
          is_dismissed: boolean | null
          suggestions: Json | null
          tenant_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          context_data: Json
          created_at?: string
          expires_at?: string | null
          id?: string
          insight_text: string
          insight_type: string
          is_dismissed?: boolean | null
          suggestions?: Json | null
          tenant_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          context_data?: Json
          created_at?: string
          expires_at?: string | null
          id?: string
          insight_text?: string
          insight_type?: string
          is_dismissed?: boolean | null
          suggestions?: Json | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_ai_insights_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_alerts: {
        Row: {
          action_link: string | null
          ai_suggestion: string | null
          created_at: string
          data: Json | null
          description: string | null
          evidence: string | null
          id: string
          impact: string | null
          is_read: boolean | null
          is_resolved: boolean | null
          related_entity_id: string | null
          related_entity_type: string | null
          resolved_at: string | null
          resolved_by: string | null
          rule_key: string | null
          severity: string
          tenant_id: string | null
          title: string
          type: string
        }
        Insert: {
          action_link?: string | null
          ai_suggestion?: string | null
          created_at?: string
          data?: Json | null
          description?: string | null
          evidence?: string | null
          id?: string
          impact?: string | null
          is_read?: boolean | null
          is_resolved?: boolean | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          rule_key?: string | null
          severity: string
          tenant_id?: string | null
          title: string
          type: string
        }
        Update: {
          action_link?: string | null
          ai_suggestion?: string | null
          created_at?: string
          data?: Json | null
          description?: string | null
          evidence?: string | null
          id?: string
          impact?: string | null
          is_read?: boolean | null
          is_resolved?: boolean | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          rule_key?: string | null
          severity?: string
          tenant_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_briefing_links: {
        Row: {
          briefing_id: string
          created_at: string
          id: string
          linked_id: string
          linked_type: string
          tenant_id: string
        }
        Insert: {
          briefing_id: string
          created_at?: string
          id?: string
          linked_id: string
          linked_type: string
          tenant_id: string
        }
        Update: {
          briefing_id?: string
          created_at?: string
          id?: string
          linked_id?: string
          linked_type?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_briefing_links_briefing_id_fkey"
            columns: ["briefing_id"]
            isOneToOne: false
            referencedRelation: "marketing_briefings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_briefing_links_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_briefings: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          assigned_to: string | null
          channels: Json | null
          constraints: string | null
          context: string | null
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          kpi_baseline: string | null
          kpi_target: Json | null
          objective: string | null
          priority: string
          reference_urls: Json | null
          status: string
          stores: Json | null
          target_audience: string | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          assigned_to?: string | null
          channels?: Json | null
          constraints?: string | null
          context?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          kpi_baseline?: string | null
          kpi_target?: Json | null
          objective?: string | null
          priority?: string
          reference_urls?: Json | null
          status?: string
          stores?: Json | null
          target_audience?: string | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          assigned_to?: string | null
          channels?: Json | null
          constraints?: string | null
          context?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          kpi_baseline?: string | null
          kpi_target?: Json | null
          objective?: string | null
          priority?: string
          reference_urls?: Json | null
          status?: string
          stores?: Json | null
          target_audience?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_briefings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_budget_allocations: {
        Row: {
          campaign_id: string | null
          category_id: string | null
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          period_end: string
          period_start: string
          planned_amount: number
          tenant_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          period_end: string
          period_start: string
          planned_amount?: number
          tenant_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          planned_amount?: number
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_budget_allocations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_budget_allocations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "marketing_budget_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_budget_allocations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_budget_categories: {
        Row: {
          allocated_amount: number
          budget_id: string
          color: string | null
          created_at: string
          id: string
          name: string
          spent_amount: number
          updated_at: string
        }
        Insert: {
          allocated_amount?: number
          budget_id: string
          color?: string | null
          created_at?: string
          id?: string
          name: string
          spent_amount?: number
          updated_at?: string
        }
        Update: {
          allocated_amount?: number
          budget_id?: string
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          spent_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_budget_categories_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "marketing_budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_budget_transactions: {
        Row: {
          amount: number
          category_id: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          reference_id: string | null
          reference_type: string | null
          transaction_date: string
        }
        Insert: {
          amount: number
          category_id: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_date?: string
        }
        Update: {
          amount?: number
          category_id?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_budget_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "marketing_budget_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_budgets: {
        Row: {
          created_at: string
          id: string
          tenant_id: string | null
          total_budget: number
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          tenant_id?: string | null
          total_budget?: number
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          tenant_id?: string | null
          total_budget?: number
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "marketing_budgets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaign_stores: {
        Row: {
          campaign_id: string | null
          created_at: string
          execution_date: string | null
          id: string
          notes: string | null
          proof_url: string | null
          status: string | null
          unit_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          execution_date?: string | null
          id?: string
          notes?: string | null
          proof_url?: string | null
          status?: string | null
          unit_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          execution_date?: string | null
          id?: string
          notes?: string | null
          proof_url?: string | null
          status?: string | null
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaign_stores_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_campaign_stores_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          actual_conversions: number | null
          actual_reach: number | null
          actual_roi: number | null
          approval_deadline: string | null
          approved_at: string | null
          approved_budget: number | null
          approved_by: string | null
          assets: Json | null
          briefing: string | null
          coop_fund_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          expected_conversions: number | null
          expected_reach: number | null
          expected_roi: number | null
          id: string
          learnings: string | null
          name: string
          planned_budget: number | null
          priority: string | null
          rejection_reason: string | null
          spent_amount: number | null
          start_date: string | null
          status: string | null
          supplier_id: string | null
          tenant_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          actual_conversions?: number | null
          actual_reach?: number | null
          actual_roi?: number | null
          approval_deadline?: string | null
          approved_at?: string | null
          approved_budget?: number | null
          approved_by?: string | null
          assets?: Json | null
          briefing?: string | null
          coop_fund_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          expected_conversions?: number | null
          expected_reach?: number | null
          expected_roi?: number | null
          id?: string
          learnings?: string | null
          name: string
          planned_budget?: number | null
          priority?: string | null
          rejection_reason?: string | null
          spent_amount?: number | null
          start_date?: string | null
          status?: string | null
          supplier_id?: string | null
          tenant_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          actual_conversions?: number | null
          actual_reach?: number | null
          actual_roi?: number | null
          approval_deadline?: string | null
          approved_at?: string | null
          approved_budget?: number | null
          approved_by?: string | null
          assets?: Json | null
          briefing?: string | null
          coop_fund_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          expected_conversions?: number | null
          expected_reach?: number | null
          expected_roi?: number | null
          id?: string
          learnings?: string | null
          name?: string
          planned_budget?: number | null
          priority?: string | null
          rejection_reason?: string | null
          spent_amount?: number | null
          start_date?: string | null
          status?: string | null
          supplier_id?: string | null
          tenant_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_coop_fund_id_fkey"
            columns: ["coop_fund_id"]
            isOneToOne: false
            referencedRelation: "marketing_coop_funds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_campaigns_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_coop_funds: {
        Row: {
          contract_reference: string | null
          created_at: string
          executed_amount: number | null
          id: string
          negotiated_amount: number
          negotiated_by: string | null
          notes: string | null
          pending_proof_amount: number | null
          proven_amount: number | null
          quarter: number | null
          status: string | null
          supplier_id: string | null
          tenant_id: string | null
          updated_at: string
          utilization_rate: number | null
          year: number
        }
        Insert: {
          contract_reference?: string | null
          created_at?: string
          executed_amount?: number | null
          id?: string
          negotiated_amount?: number
          negotiated_by?: string | null
          notes?: string | null
          pending_proof_amount?: number | null
          proven_amount?: number | null
          quarter?: number | null
          status?: string | null
          supplier_id?: string | null
          tenant_id?: string | null
          updated_at?: string
          utilization_rate?: number | null
          year: number
        }
        Update: {
          contract_reference?: string | null
          created_at?: string
          executed_amount?: number | null
          id?: string
          negotiated_amount?: number
          negotiated_by?: string | null
          notes?: string | null
          pending_proof_amount?: number | null
          proven_amount?: number | null
          quarter?: number | null
          status?: string | null
          supplier_id?: string | null
          tenant_id?: string | null
          updated_at?: string
          utilization_rate?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "marketing_coop_funds_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_coop_funds_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_demands: {
        Row: {
          activity_log: Json | null
          actual_hours: number | null
          assigned_to: string | null
          attachments: Json | null
          blocked_reason: string | null
          budget_id: string | null
          campaign_id: string | null
          channels: Json | null
          comments_count: number | null
          completed_at: string | null
          completion_requirements: Json | null
          created_at: string
          created_by: string | null
          deliverable_kind: string | null
          description: string | null
          destination_scope: Json | null
          document_id: string | null
          due_date: string | null
          estimated_hours: number | null
          governance_mode: string | null
          id: string
          last_status_change_at: string | null
          priority: string
          started_at: string | null
          status: string
          tags: Json | null
          tenant_id: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          activity_log?: Json | null
          actual_hours?: number | null
          assigned_to?: string | null
          attachments?: Json | null
          blocked_reason?: string | null
          budget_id?: string | null
          campaign_id?: string | null
          channels?: Json | null
          comments_count?: number | null
          completed_at?: string | null
          completion_requirements?: Json | null
          created_at?: string
          created_by?: string | null
          deliverable_kind?: string | null
          description?: string | null
          destination_scope?: Json | null
          document_id?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          governance_mode?: string | null
          id?: string
          last_status_change_at?: string | null
          priority?: string
          started_at?: string | null
          status?: string
          tags?: Json | null
          tenant_id: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          activity_log?: Json | null
          actual_hours?: number | null
          assigned_to?: string | null
          attachments?: Json | null
          blocked_reason?: string | null
          budget_id?: string | null
          campaign_id?: string | null
          channels?: Json | null
          comments_count?: number | null
          completed_at?: string | null
          completion_requirements?: Json | null
          created_at?: string
          created_by?: string | null
          deliverable_kind?: string | null
          description?: string | null
          destination_scope?: Json | null
          document_id?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          governance_mode?: string | null
          id?: string
          last_status_change_at?: string | null
          priority?: string
          started_at?: string | null
          status?: string
          tags?: Json | null
          tenant_id?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_demands_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "marketing_budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_demands_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_demands_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "workspace_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_demands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_executions: {
        Row: {
          channel: string
          created_at: string
          created_by: string | null
          entity_id: string
          entity_type: string
          evidence_urls: Json | null
          execution_date: string
          id: string
          link_url: string | null
          metadata: Json | null
          notes: string | null
          tenant_id: string
        }
        Insert: {
          channel?: string
          created_at?: string
          created_by?: string | null
          entity_id: string
          entity_type?: string
          evidence_urls?: Json | null
          execution_date?: string
          id?: string
          link_url?: string | null
          metadata?: Json | null
          notes?: string | null
          tenant_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          created_by?: string | null
          entity_id?: string
          entity_type?: string
          evidence_urls?: Json | null
          execution_date?: string
          id?: string
          link_url?: string | null
          metadata?: Json | null
          notes?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_executions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_goals: {
        Row: {
          baseline_value: number | null
          created_at: string
          created_by: string | null
          current_value: number | null
          id: string
          kpi_type: string
          name: string
          notes: string | null
          period_end: string
          period_start: string
          period_type: string
          status: string | null
          target_value: number
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          baseline_value?: number | null
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          id?: string
          kpi_type: string
          name: string
          notes?: string | null
          period_end: string
          period_start: string
          period_type: string
          status?: string | null
          target_value: number
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          baseline_value?: number | null
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          id?: string
          kpi_type?: string
          name?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          period_type?: string
          status?: string | null
          target_value?: number
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_goals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_kpis: {
        Row: {
          average_ticket: number | null
          cac: number | null
          clicks: number | null
          conversion_rate: number | null
          conversions: number | null
          created_at: string
          id: string
          impressions: number | null
          leads: number | null
          ltv: number | null
          nps: number | null
          period_end: string
          period_start: string
          period_type: string
          revenue: number | null
          roi: number | null
          tenant_id: string | null
          updated_at: string
          visits: number | null
        }
        Insert: {
          average_ticket?: number | null
          cac?: number | null
          clicks?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string
          id?: string
          impressions?: number | null
          leads?: number | null
          ltv?: number | null
          nps?: number | null
          period_end: string
          period_start: string
          period_type: string
          revenue?: number | null
          roi?: number | null
          tenant_id?: string | null
          updated_at?: string
          visits?: number | null
        }
        Update: {
          average_ticket?: number | null
          cac?: number | null
          clicks?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string
          id?: string
          impressions?: number | null
          leads?: number | null
          ltv?: number | null
          nps?: number | null
          period_end?: string
          period_start?: string
          period_type?: string
          revenue?: number | null
          roi?: number | null
          tenant_id?: string | null
          updated_at?: string
          visits?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_kpis_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_kpis_by_channel: {
        Row: {
          cac: number | null
          channel: string
          conversion_rate: number | null
          conversions: number | null
          created_at: string
          id: string
          investment: number | null
          kpi_id: string
          leads: number | null
          revenue: number | null
          roi: number | null
        }
        Insert: {
          cac?: number | null
          channel: string
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string
          id?: string
          investment?: number | null
          kpi_id: string
          leads?: number | null
          revenue?: number | null
          roi?: number | null
        }
        Update: {
          cac?: number | null
          channel?: string
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string
          id?: string
          investment?: number | null
          kpi_id?: string
          leads?: number | null
          revenue?: number | null
          roi?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_kpis_by_channel_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "marketing_kpis"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_plans: {
        Row: {
          budget: number | null
          color: string | null
          created_at: string
          created_by: string | null
          current_value: string | null
          description: string | null
          end_date: string | null
          id: string
          progress: number | null
          responsible: string | null
          start_date: string | null
          status: string | null
          target_value: string | null
          tenant_id: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          current_value?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          progress?: number | null
          responsible?: string | null
          start_date?: string | null
          status?: string | null
          target_value?: string | null
          tenant_id?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          current_value?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          progress?: number | null
          responsible?: string | null
          start_date?: string | null
          status?: string | null
          target_value?: string | null
          tenant_id?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_store_performance: {
        Row: {
          average_ticket: number | null
          clicks: number | null
          conversion_rate: number | null
          conversions: number | null
          created_at: string
          foot_traffic: number | null
          id: string
          impressions: number | null
          investment: number | null
          period_end: string
          period_start: string
          period_type: string
          revenue: number | null
          roi: number | null
          tenant_id: string | null
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          average_ticket?: number | null
          clicks?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string
          foot_traffic?: number | null
          id?: string
          impressions?: number | null
          investment?: number | null
          period_end: string
          period_start: string
          period_type: string
          revenue?: number | null
          roi?: number | null
          tenant_id?: string | null
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          average_ticket?: number | null
          clicks?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string
          foot_traffic?: number | null
          id?: string
          impressions?: number | null
          investment?: number | null
          period_end?: string
          period_start?: string
          period_type?: string
          revenue?: number | null
          roi?: number | null
          tenant_id?: string | null
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_store_performance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_store_performance_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_templates: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          definition: Json
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          tenant_id: string
          type: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          definition?: Json
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          tenant_id: string
          type?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          definition?: Json
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          tenant_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      message_logs: {
        Row: {
          campaign_id: string
          contact_id: string
          created_at: string
          error_code: string | null
          error_message: string | null
          id: string
          resolved_unit_id: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["message_log_status"]
          updated_at: string
        }
        Insert: {
          campaign_id: string
          contact_id: string
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          resolved_unit_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_log_status"]
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          contact_id?: string
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          resolved_unit_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_log_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_logs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_logs_resolved_unit_id_fkey"
            columns: ["resolved_unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      metric_records: {
        Row: {
          campaign_id: string | null
          catalog_id: string
          channel: string | null
          created_at: string
          created_by: string | null
          id: string
          period_end: string
          period_start: string
          quality_flag: string | null
          quality_notes: string | null
          tenant_id: string
          unit_id: string | null
          updated_at: string
          value: number
        }
        Insert: {
          campaign_id?: string | null
          catalog_id: string
          channel?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          period_end: string
          period_start: string
          quality_flag?: string | null
          quality_notes?: string | null
          tenant_id: string
          unit_id?: string | null
          updated_at?: string
          value: number
        }
        Update: {
          campaign_id?: string | null
          catalog_id?: string
          channel?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          period_end?: string
          period_start?: string
          quality_flag?: string | null
          quality_notes?: string | null
          tenant_id?: string
          unit_id?: string | null
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "metric_records_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metric_records_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "metrics_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metric_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metric_records_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      metric_snapshots: {
        Row: {
          created_at: string | null
          data: Json
          id: string
          snapshot_date: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json
          id?: string
          snapshot_date: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
          snapshot_date?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "metric_snapshots_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics_catalog: {
        Row: {
          created_at: string
          description: string | null
          display_name_pt: string
          formula_hint: string | null
          frequency: string
          id: string
          is_active: boolean
          is_system: boolean
          metric_key: string
          tenant_id: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name_pt: string
          formula_hint?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          is_system?: boolean
          metric_key: string
          tenant_id?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name_pt?: string
          formula_hint?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          is_system?: boolean
          metric_key?: string
          tenant_id?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "metrics_catalog_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read: boolean
          resource_id: string | null
          resource_type: string | null
          severity: string | null
          tenant_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          resource_id?: string | null
          resource_type?: string | null
          severity?: string | null
          tenant_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          resource_id?: string | null
          resource_type?: string | null
          severity?: string | null
          tenant_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pdi_cycles: {
        Row: {
          created_at: string
          cycle_code: string
          done_criteria: string | null
          expected_result: string | null
          id: string
          observations: string | null
          owner: string | null
          period: string | null
          progress: number
          sort_order: number
          status: string
          tenant_id: string | null
          top_initiatives: string | null
          updated_at: string
          why_now: string | null
        }
        Insert: {
          created_at?: string
          cycle_code: string
          done_criteria?: string | null
          expected_result?: string | null
          id?: string
          observations?: string | null
          owner?: string | null
          period?: string | null
          progress?: number
          sort_order?: number
          status?: string
          tenant_id?: string | null
          top_initiatives?: string | null
          updated_at?: string
          why_now?: string | null
        }
        Update: {
          created_at?: string
          cycle_code?: string
          done_criteria?: string | null
          expected_result?: string | null
          id?: string
          observations?: string | null
          owner?: string | null
          period?: string | null
          progress?: number
          sort_order?: number
          status?: string
          tenant_id?: string | null
          top_initiatives?: string | null
          updated_at?: string
          why_now?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pdi_cycles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pdi_phases: {
        Row: {
          cadence: string | null
          created_at: string
          deliverables: string | null
          duration_days: number | null
          end_date: string | null
          evidence_links: string | null
          gate_name: string | null
          id: string
          name: string
          objective: string | null
          observations: string | null
          operational_owner: string | null
          phase_number: number
          priority: string | null
          progress: number
          sort_order: number
          sponsor: string | null
          start_date: string | null
          status: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          cadence?: string | null
          created_at?: string
          deliverables?: string | null
          duration_days?: number | null
          end_date?: string | null
          evidence_links?: string | null
          gate_name?: string | null
          id?: string
          name: string
          objective?: string | null
          observations?: string | null
          operational_owner?: string | null
          phase_number: number
          priority?: string | null
          progress?: number
          sort_order?: number
          sponsor?: string | null
          start_date?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          cadence?: string | null
          created_at?: string
          deliverables?: string | null
          duration_days?: number | null
          end_date?: string | null
          evidence_links?: string | null
          gate_name?: string | null
          id?: string
          name?: string
          objective?: string | null
          observations?: string | null
          operational_owner?: string | null
          phase_number?: number
          priority?: string | null
          progress?: number
          sort_order?: number
          sponsor?: string | null
          start_date?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdi_phases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_reviews: {
        Row: {
          created_at: string | null
          employee_id: string
          goals: Json | null
          id: string
          improvements: string | null
          overall_rating: number | null
          review_cycle: string
          reviewer_id: string | null
          scores: Json | null
          status: string | null
          strengths: string | null
          submitted_at: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          goals?: Json | null
          id?: string
          improvements?: string | null
          overall_rating?: number | null
          review_cycle: string
          reviewer_id?: string | null
          scores?: Json | null
          status?: string | null
          strengths?: string | null
          submitted_at?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          goals?: Json | null
          id?: string
          improvements?: string | null
          overall_rating?: number | null
          review_cycle?: string
          reviewer_id?: string | null
          scores?: Json | null
          status?: string | null
          strengths?: string | null
          submitted_at?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_approvals: {
        Row: {
          comments: string | null
          created_at: string
          created_by: string | null
          decided_at: string | null
          decided_by: string | null
          entity_id: string
          entity_type: string
          id: string
          status: string | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          comments?: string | null
          created_at?: string
          created_by?: string | null
          decided_at?: string | null
          decided_by?: string | null
          entity_id: string
          entity_type: string
          id?: string
          status?: string | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          comments?: string | null
          created_at?: string
          created_by?: string | null
          decided_at?: string | null
          decided_by?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          status?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pmo_approvals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_decisions: {
        Row: {
          created_at: string
          created_by: string | null
          decision_date: string | null
          id: string
          impact: string | null
          justification: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          responsible: string | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          decision_date?: string | null
          id?: string
          impact?: string | null
          justification?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          responsible?: string | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          decision_date?: string | null
          id?: string
          impact?: string | null
          justification?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          responsible?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pmo_decisions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_evidence_links: {
        Row: {
          created_at: string
          created_by: string | null
          entity_id: string
          entity_type: string
          hyperworks_message_id: string | null
          id: string
          label: string | null
          tenant_id: string
          url: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          entity_id: string
          entity_type: string
          hyperworks_message_id?: string | null
          id?: string
          label?: string | null
          tenant_id: string
          url?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          entity_id?: string
          entity_type?: string
          hyperworks_message_id?: string | null
          id?: string
          label?: string | null
          tenant_id?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pmo_evidence_links_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_immersions: {
        Row: {
          area: string
          created_at: string
          created_by: string | null
          decisions: string | null
          id: string
          immersion_date: string | null
          mapped_processes: string | null
          next_steps: string | null
          objective: string | null
          requirements: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          area: string
          created_at?: string
          created_by?: string | null
          decisions?: string | null
          id?: string
          immersion_date?: string | null
          mapped_processes?: string | null
          next_steps?: string | null
          objective?: string | null
          requirements?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          area?: string
          created_at?: string
          created_by?: string | null
          decisions?: string | null
          id?: string
          immersion_date?: string | null
          mapped_processes?: string | null
          next_steps?: string | null
          objective?: string | null
          requirements?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pmo_immersions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_incidents: {
        Row: {
          affected_system: string | null
          created_at: string
          created_by: string | null
          id: string
          impact: string | null
          opened_at: string | null
          postmortem: string | null
          resolution: string | null
          resolved_at: string | null
          severity: string | null
          status: string | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          affected_system?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          impact?: string | null
          opened_at?: string | null
          postmortem?: string | null
          resolution?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          affected_system?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          impact?: string | null
          opened_at?: string | null
          postmortem?: string | null
          resolution?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pmo_incidents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_initiatives: {
        Row: {
          archive_reason: string | null
          area: string | null
          block_reason: string | null
          block_responsible: string | null
          calculated_score: number | null
          created_at: string
          created_by: string | null
          dependencies: string | null
          description: string | null
          due_date: string | null
          effort_score: number | null
          id: string
          impact_score: number | null
          kpi_expected: string | null
          owner_name: string | null
          owner_user_id: string | null
          priority: string | null
          risks: string | null
          stage: string | null
          status: string | null
          tags: string[] | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          archive_reason?: string | null
          area?: string | null
          block_reason?: string | null
          block_responsible?: string | null
          calculated_score?: number | null
          created_at?: string
          created_by?: string | null
          dependencies?: string | null
          description?: string | null
          due_date?: string | null
          effort_score?: number | null
          id?: string
          impact_score?: number | null
          kpi_expected?: string | null
          owner_name?: string | null
          owner_user_id?: string | null
          priority?: string | null
          risks?: string | null
          stage?: string | null
          status?: string | null
          tags?: string[] | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          archive_reason?: string | null
          area?: string | null
          block_reason?: string | null
          block_responsible?: string | null
          calculated_score?: number | null
          created_at?: string
          created_by?: string | null
          dependencies?: string | null
          description?: string | null
          due_date?: string | null
          effort_score?: number | null
          id?: string
          impact_score?: number | null
          kpi_expected?: string | null
          owner_name?: string | null
          owner_user_id?: string | null
          priority?: string | null
          risks?: string | null
          stage?: string | null
          status?: string | null
          tags?: string[] | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pmo_initiatives_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_internal_owners: {
        Row: {
          area: string | null
          created_at: string
          created_by: string | null
          goals: string | null
          id: string
          maturity_level: string | null
          person_name: string
          role_title: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          area?: string | null
          created_at?: string
          created_by?: string | null
          goals?: string | null
          id?: string
          maturity_level?: string | null
          person_name: string
          role_title?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          area?: string | null
          created_at?: string
          created_by?: string | null
          goals?: string | null
          id?: string
          maturity_level?: string | null
          person_name?: string
          role_title?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pmo_internal_owners_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_monthly_metrics: {
        Row: {
          baseline: number | null
          created_at: string
          created_by: string | null
          current_value: number | null
          data_source: string | null
          delta: number | null
          estimated_value_brl: number | null
          id: string
          initiative_id: string | null
          kpi_name: string
          month: string
          solution: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          baseline?: number | null
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          data_source?: string | null
          delta?: number | null
          estimated_value_brl?: number | null
          id?: string
          initiative_id?: string | null
          kpi_name: string
          month: string
          solution: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          baseline?: number | null
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          data_source?: string | null
          delta?: number | null
          estimated_value_brl?: number | null
          id?: string
          initiative_id?: string | null
          kpi_name?: string
          month?: string
          solution?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pmo_monthly_metrics_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "pmo_initiatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pmo_monthly_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_owner_reviews: {
        Row: {
          created_at: string
          created_by: string | null
          current_level: string | null
          evolution_plan: string | null
          id: string
          observations: string | null
          owner_id: string
          previous_level: string | null
          review_cycle: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_level?: string | null
          evolution_plan?: string | null
          id?: string
          observations?: string | null
          owner_id: string
          previous_level?: string | null
          review_cycle: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_level?: string | null
          evolution_plan?: string | null
          id?: string
          observations?: string | null
          owner_id?: string
          previous_level?: string | null
          review_cycle?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pmo_owner_reviews_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "pmo_internal_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pmo_owner_reviews_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_playbooks: {
        Row: {
          category: string | null
          content: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          status: string | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          status?: string | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          status?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pmo_playbooks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_quarterly_reviews: {
        Row: {
          created_at: string
          created_by: string | null
          cycle: string
          diagnosis: string | null
          governance_audit: string | null
          id: string
          roadmap_changes: Json | null
          status: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          cycle: string
          diagnosis?: string | null
          governance_audit?: string | null
          id?: string
          roadmap_changes?: Json | null
          status?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          cycle?: string
          diagnosis?: string | null
          governance_audit?: string | null
          id?: string
          roadmap_changes?: Json | null
          status?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pmo_quarterly_reviews_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_release_items: {
        Row: {
          created_at: string
          description: string
          id: string
          initiative_id: string | null
          modules_impacted: string[] | null
          release_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          initiative_id?: string | null
          modules_impacted?: string[] | null
          release_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          initiative_id?: string | null
          modules_impacted?: string[] | null
          release_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pmo_release_items_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "pmo_initiatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pmo_release_items_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "pmo_releases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pmo_release_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_releases: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          release_date: string | null
          status: string | null
          summary: string | null
          tenant_id: string
          updated_at: string
          version: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          release_date?: string | null
          status?: string | null
          summary?: string | null
          tenant_id: string
          updated_at?: string
          version: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          release_date?: string | null
          status?: string | null
          summary?: string | null
          tenant_id?: string
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "pmo_releases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_settings: {
        Row: {
          created_at: string
          id: string
          mmr_template: Json | null
          qbr_template: Json | null
          semaphore_rules: Json | null
          sprint_cadence: string | null
          tenant_id: string
          updated_at: string
          wbr_template: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          mmr_template?: Json | null
          qbr_template?: Json | null
          semaphore_rules?: Json | null
          sprint_cadence?: string | null
          tenant_id: string
          updated_at?: string
          wbr_template?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          mmr_template?: Json | null
          qbr_template?: Json | null
          semaphore_rules?: Json | null
          sprint_cadence?: string | null
          tenant_id?: string
          updated_at?: string
          wbr_template?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "pmo_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_sprint_items: {
        Row: {
          created_at: string
          id: string
          initiative_id: string
          notes: string | null
          sprint_id: string
          status: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          initiative_id: string
          notes?: string | null
          sprint_id: string
          status?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          initiative_id?: string
          notes?: string | null
          sprint_id?: string
          status?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pmo_sprint_items_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "pmo_initiatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pmo_sprint_items_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "pmo_sprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pmo_sprint_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_sprints: {
        Row: {
          created_at: string
          created_by: string | null
          end_date: string | null
          goals: string | null
          id: string
          name: string
          start_date: string | null
          status: string | null
          summary: Json | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          goals?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string | null
          summary?: Json | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          goals?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string | null
          summary?: Json | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pmo_sprints_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_tools_costs: {
        Row: {
          actual_cost: number | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          estimated_cost: number | null
          id: string
          name: string
          reason: string | null
          responsible: string | null
          status: string | null
          tenant_id: string
          updated_at: string
          vendor: string | null
        }
        Insert: {
          actual_cost?: number | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          estimated_cost?: number | null
          id?: string
          name: string
          reason?: string | null
          responsible?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          actual_cost?: number | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          estimated_cost?: number | null
          id?: string
          name?: string
          reason?: string | null
          responsible?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pmo_tools_costs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_training_sessions: {
        Row: {
          attendance: Json | null
          audience: string | null
          created_at: string
          created_by: string | null
          id: string
          materials: Json | null
          objectives: string | null
          post_tasks: string | null
          session_date: string | null
          tenant_id: string
          topic: string
          updated_at: string
        }
        Insert: {
          attendance?: Json | null
          audience?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          materials?: Json | null
          objectives?: string | null
          post_tasks?: string | null
          session_date?: string | null
          tenant_id: string
          topic: string
          updated_at?: string
        }
        Update: {
          attendance?: Json | null
          audience?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          materials?: Json | null
          objectives?: string | null
          post_tasks?: string | null
          session_date?: string | null
          tenant_id?: string
          topic?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pmo_training_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_weekly_reports: {
        Row: {
          content: Json | null
          created_at: string
          created_by: string | null
          edition: number
          id: string
          status: string | null
          tenant_id: string
          updated_at: string
          week_end: string
          week_start: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          created_by?: string | null
          edition: number
          id?: string
          status?: string | null
          tenant_id: string
          updated_at?: string
          week_end: string
          week_start: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          created_by?: string | null
          edition?: number
          id?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string
          week_end?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "pmo_weekly_reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_work_agenda: {
        Row: {
          attendance: Json | null
          created_at: string
          created_by: string | null
          end_time: string | null
          event_date: string
          event_type: string
          id: string
          results: string | null
          start_time: string | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          attendance?: Json | null
          created_at?: string
          created_by?: string | null
          end_time?: string | null
          event_date: string
          event_type: string
          id?: string
          results?: string | null
          start_time?: string | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          attendance?: Json | null
          created_at?: string
          created_by?: string | null
          end_time?: string | null
          event_date?: string
          event_type?: string
          id?: string
          results?: string | null
          start_time?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pmo_work_agenda_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          created_at: string
          email: string
          full_name: string | null
          hired_at: string | null
          id: string
          last_online_at: string | null
          location: string | null
          phone: string | null
          skills: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          hired_at?: string | null
          id?: string
          last_online_at?: string | null
          location?: string | null
          phone?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          hired_at?: string | null
          id?: string
          last_online_at?: string | null
          location?: string | null
          phone?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      replenishment_proofs: {
        Row: {
          captured_at: string | null
          captured_by: string | null
          id: string
          notes: string | null
          photo_type: string | null
          photo_url: string
          task_id: string
          tenant_id: string
        }
        Insert: {
          captured_at?: string | null
          captured_by?: string | null
          id?: string
          notes?: string | null
          photo_type?: string | null
          photo_url: string
          task_id: string
          tenant_id: string
        }
        Update: {
          captured_at?: string | null
          captured_by?: string | null
          id?: string
          notes?: string | null
          photo_type?: string | null
          photo_url?: string
          task_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "replenishment_proofs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "replenishment_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replenishment_proofs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      replenishment_tasks: {
        Row: {
          assigned_to: string | null
          checklist: Json | null
          completed_at: string | null
          created_at: string | null
          gondola_id: string | null
          id: string
          notes: string | null
          priority: string | null
          started_at: string | null
          status: string | null
          task_date: string
          tenant_id: string
          type: string | null
          unit_id: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          checklist?: Json | null
          completed_at?: string | null
          created_at?: string | null
          gondola_id?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          started_at?: string | null
          status?: string | null
          task_date?: string
          tenant_id: string
          type?: string | null
          unit_id: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          checklist?: Json | null
          completed_at?: string | null
          created_at?: string | null
          gondola_id?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          started_at?: string | null
          status?: string | null
          task_date?: string
          tenant_id?: string
          type?: string | null
          unit_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "replenishment_tasks_gondola_id_fkey"
            columns: ["gondola_id"]
            isOneToOne: false
            referencedRelation: "gondolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replenishment_tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replenishment_tasks_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      report_definitions: {
        Row: {
          blocks: Json
          created_at: string
          created_by: string | null
          description: string | null
          filters: Json
          id: string
          name: string
          schedule: Json | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          blocks?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          filters?: Json
          id?: string
          name: string
          schedule?: Json | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          blocks?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          filters?: Json
          id?: string
          name?: string
          schedule?: Json | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_definitions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      report_runs: {
        Row: {
          created_at: string
          definition_id: string
          file_url: string | null
          generated_at: string
          generated_by: string | null
          id: string
          output_meta: Json | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          definition_id: string
          file_url?: string | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          output_meta?: Json | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          definition_id?: string
          file_url?: string | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          output_meta?: Json | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_runs_definition_id_fkey"
            columns: ["definition_id"]
            isOneToOne: false
            referencedRelation: "report_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_runs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      retail_action_links: {
        Row: {
          created_at: string
          id: string
          linked_id: string
          linked_type: string
          retail_action_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          linked_id: string
          linked_type: string
          retail_action_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          linked_id?: string
          linked_type?: string
          retail_action_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "retail_action_links_retail_action_id_fkey"
            columns: ["retail_action_id"]
            isOneToOne: false
            referencedRelation: "retail_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retail_action_links_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      retail_action_metrics: {
        Row: {
          baseline_value: number | null
          created_at: string
          during_value: number | null
          id: string
          metric_key: string
          post_value: number | null
          recorded_at: string
          retail_action_id: string
          source: string
          store_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          baseline_value?: number | null
          created_at?: string
          during_value?: number | null
          id?: string
          metric_key?: string
          post_value?: number | null
          recorded_at?: string
          retail_action_id: string
          source?: string
          store_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          baseline_value?: number | null
          created_at?: string
          during_value?: number | null
          id?: string
          metric_key?: string
          post_value?: number | null
          recorded_at?: string
          retail_action_id?: string
          source?: string
          store_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retail_action_metrics_retail_action_id_fkey"
            columns: ["retail_action_id"]
            isOneToOne: false
            referencedRelation: "retail_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retail_action_metrics_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retail_action_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      retail_actions: {
        Row: {
          categories_scope: Json | null
          channels: Json | null
          created_at: string
          id: string
          mechanics: string | null
          notes: string | null
          owner_user_id: string | null
          period_end: string | null
          period_start: string | null
          products_scope: Json | null
          status: string
          stores_scope: Json | null
          tenant_id: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          categories_scope?: Json | null
          channels?: Json | null
          created_at?: string
          id?: string
          mechanics?: string | null
          notes?: string | null
          owner_user_id?: string | null
          period_end?: string | null
          period_start?: string | null
          products_scope?: Json | null
          status?: string
          stores_scope?: Json | null
          tenant_id: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          categories_scope?: Json | null
          channels?: Json | null
          created_at?: string
          id?: string
          mechanics?: string | null
          notes?: string | null
          owner_user_id?: string | null
          period_end?: string | null
          period_start?: string | null
          products_scope?: Json | null
          status?: string
          stores_scope?: Json | null
          tenant_id?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retail_actions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      retail_execution_issues: {
        Row: {
          created_at: string
          description: string
          evidence_urls: Json | null
          execution_run_id: string
          id: string
          issue_type: string
          resolved: boolean
          severity: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          description?: string
          evidence_urls?: Json | null
          execution_run_id: string
          id?: string
          issue_type?: string
          resolved?: boolean
          severity?: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          description?: string
          evidence_urls?: Json | null
          execution_run_id?: string
          id?: string
          issue_type?: string
          resolved?: boolean
          severity?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "retail_execution_issues_execution_run_id_fkey"
            columns: ["execution_run_id"]
            isOneToOne: false
            referencedRelation: "retail_execution_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retail_execution_issues_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      retail_execution_items: {
        Row: {
          category: string
          evidence_urls: Json | null
          execution_run_id: string
          id: string
          item_key: string
          notes: string | null
          required: boolean
          status: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          evidence_urls?: Json | null
          execution_run_id: string
          id?: string
          item_key?: string
          notes?: string | null
          required?: boolean
          status?: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          evidence_urls?: Json | null
          execution_run_id?: string
          id?: string
          item_key?: string
          notes?: string | null
          required?: boolean
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retail_execution_items_execution_run_id_fkey"
            columns: ["execution_run_id"]
            isOneToOne: false
            referencedRelation: "retail_execution_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retail_execution_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      retail_execution_runs: {
        Row: {
          completed_at: string | null
          compliance_score: number | null
          created_at: string
          id: string
          issues_count: number | null
          retail_action_id: string
          status: string
          store_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          compliance_score?: number | null
          created_at?: string
          id?: string
          issues_count?: number | null
          retail_action_id: string
          status?: string
          store_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          compliance_score?: number | null
          created_at?: string
          id?: string
          issues_count?: number | null
          retail_action_id?: string
          status?: string
          store_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retail_execution_runs_retail_action_id_fkey"
            columns: ["retail_action_id"]
            isOneToOne: false
            referencedRelation: "retail_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retail_execution_runs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retail_execution_runs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      retail_store_kits: {
        Row: {
          created_at: string
          generated_at: string
          id: string
          kit_document_page_id: string | null
          retail_action_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          generated_at?: string
          id?: string
          kit_document_page_id?: string | null
          retail_action_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          generated_at?: string
          id?: string
          kit_document_page_id?: string | null
          retail_action_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retail_store_kits_kit_document_page_id_fkey"
            columns: ["kit_document_page_id"]
            isOneToOne: false
            referencedRelation: "workspace_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retail_store_kits_retail_action_id_fkey"
            columns: ["retail_action_id"]
            isOneToOne: false
            referencedRelation: "retail_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retail_store_kits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rupture_records: {
        Row: {
          created_at: string | null
          detected_at: string | null
          detected_by: string | null
          gondola_id: string | null
          id: string
          notes: string | null
          photo_url: string | null
          product_name: string
          product_sku: string | null
          reason: string | null
          resolved_at: string | null
          resolved_by: string | null
          tenant_id: string
          unit_id: string
        }
        Insert: {
          created_at?: string | null
          detected_at?: string | null
          detected_by?: string | null
          gondola_id?: string | null
          id?: string
          notes?: string | null
          photo_url?: string | null
          product_name: string
          product_sku?: string | null
          reason?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          tenant_id: string
          unit_id: string
        }
        Update: {
          created_at?: string | null
          detected_at?: string | null
          detected_by?: string | null
          gondola_id?: string | null
          id?: string
          notes?: string | null
          photo_url?: string | null
          product_name?: string
          product_sku?: string | null
          reason?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          tenant_id?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rupture_records_gondola_id_fkey"
            columns: ["gondola_id"]
            isOneToOne: false
            referencedRelation: "gondolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rupture_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rupture_records_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_jobs: {
        Row: {
          created_at: string
          created_by: string | null
          cron_expression: string | null
          id: string
          is_active: boolean
          job_config: Json
          job_name: string
          job_type: string
          last_error: string | null
          last_result: Json | null
          last_run_at: string | null
          max_retries: number
          next_run_at: string | null
          retry_count: number
          schedule_type: string
          scheduled_at: string | null
          status: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          cron_expression?: string | null
          id?: string
          is_active?: boolean
          job_config?: Json
          job_name: string
          job_type: string
          last_error?: string | null
          last_result?: Json | null
          last_run_at?: string | null
          max_retries?: number
          next_run_at?: string | null
          retry_count?: number
          schedule_type: string
          scheduled_at?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          cron_expression?: string | null
          id?: string
          is_active?: boolean
          job_config?: Json
          job_name?: string
          job_type?: string
          last_error?: string | null
          last_result?: Json | null
          last_run_at?: string | null
          max_retries?: number
          next_run_at?: string | null
          retry_count?: number
          schedule_type?: string
          scheduled_at?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      social_media_connections: {
        Row: {
          access_token: string | null
          account_id: string | null
          account_name: string | null
          connected_at: string | null
          created_at: string
          id: string
          is_connected: boolean | null
          last_sync_at: string | null
          platform: string
          profile_image_url: string | null
          refresh_token: string | null
          tenant_id: string | null
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          account_id?: string | null
          account_name?: string | null
          connected_at?: string | null
          created_at?: string
          id?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          platform: string
          profile_image_url?: string | null
          refresh_token?: string | null
          tenant_id?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          account_id?: string | null
          account_name?: string | null
          connected_at?: string | null
          created_at?: string
          id?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          platform?: string
          profile_image_url?: string | null
          refresh_token?: string | null
          tenant_id?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_media_connections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      social_media_metrics: {
        Row: {
          comments: number | null
          connection_id: string | null
          created_at: string
          engagement_rate: number | null
          followers: number | null
          following: number | null
          id: string
          impressions: number | null
          likes: number | null
          metric_date: string
          posts_count: number | null
          raw_data: Json | null
          reach: number | null
          shares: number | null
          subscribers: number | null
          video_views: number | null
          watch_time_hours: number | null
        }
        Insert: {
          comments?: number | null
          connection_id?: string | null
          created_at?: string
          engagement_rate?: number | null
          followers?: number | null
          following?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          metric_date?: string
          posts_count?: number | null
          raw_data?: Json | null
          reach?: number | null
          shares?: number | null
          subscribers?: number | null
          video_views?: number | null
          watch_time_hours?: number | null
        }
        Update: {
          comments?: number | null
          connection_id?: string | null
          created_at?: string
          engagement_rate?: number | null
          followers?: number | null
          following?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          metric_date?: string
          posts_count?: number | null
          raw_data?: Json | null
          reach?: number | null
          shares?: number | null
          subscribers?: number | null
          video_views?: number | null
          watch_time_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "social_media_metrics_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "social_media_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      sorteios_coupons: {
        Row: {
          created_at: string
          cupom_numero: string
          data_compra: string | null
          erp_resposta: Json | null
          erp_validado_em: string | null
          id: string
          participant_id: string
          sorteio_id: string | null
          status: Database["public"]["Enums"]["sorteios_coupon_status"]
          tenant_id: string
          validacao_erp: string
          validated_at: string | null
          validated_by: string | null
          valor_compra: number | null
        }
        Insert: {
          created_at?: string
          cupom_numero: string
          data_compra?: string | null
          erp_resposta?: Json | null
          erp_validado_em?: string | null
          id?: string
          participant_id: string
          sorteio_id?: string | null
          status?: Database["public"]["Enums"]["sorteios_coupon_status"]
          tenant_id: string
          validacao_erp?: string
          validated_at?: string | null
          validated_by?: string | null
          valor_compra?: number | null
        }
        Update: {
          created_at?: string
          cupom_numero?: string
          data_compra?: string | null
          erp_resposta?: Json | null
          erp_validado_em?: string | null
          id?: string
          participant_id?: string
          sorteio_id?: string | null
          status?: Database["public"]["Enums"]["sorteios_coupon_status"]
          tenant_id?: string
          validacao_erp?: string
          validated_at?: string | null
          validated_by?: string | null
          valor_compra?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sorteios_coupons_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "sorteios_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sorteios_coupons_sorteio_id_fkey"
            columns: ["sorteio_id"]
            isOneToOne: false
            referencedRelation: "sorteios_sweepstakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sorteios_coupons_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sorteios_fraud_logs: {
        Row: {
          coupon_id: string | null
          created_at: string
          detalhes: string | null
          id: string
          participant_id: string | null
          tenant_id: string
          tipo: Database["public"]["Enums"]["sorteios_fraud_type"]
        }
        Insert: {
          coupon_id?: string | null
          created_at?: string
          detalhes?: string | null
          id?: string
          participant_id?: string | null
          tenant_id: string
          tipo: Database["public"]["Enums"]["sorteios_fraud_type"]
        }
        Update: {
          coupon_id?: string | null
          created_at?: string
          detalhes?: string | null
          id?: string
          participant_id?: string | null
          tenant_id?: string
          tipo?: Database["public"]["Enums"]["sorteios_fraud_type"]
        }
        Relationships: [
          {
            foreignKeyName: "sorteios_fraud_logs_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "sorteios_coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sorteios_fraud_logs_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "sorteios_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sorteios_fraud_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sorteios_participants: {
        Row: {
          cpf: string
          created_at: string
          id: string
          nome: string
          senha_hash: string | null
          status: Database["public"]["Enums"]["sorteios_participant_status"]
          tenant_id: string
          whatsapp: string
        }
        Insert: {
          cpf: string
          created_at?: string
          id?: string
          nome: string
          senha_hash?: string | null
          status?: Database["public"]["Enums"]["sorteios_participant_status"]
          tenant_id: string
          whatsapp: string
        }
        Update: {
          cpf?: string
          created_at?: string
          id?: string
          nome?: string
          senha_hash?: string | null
          status?: Database["public"]["Enums"]["sorteios_participant_status"]
          tenant_id?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "sorteios_participants_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sorteios_prizes: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          imagem_url: string | null
          nome: string
          quantidade: number
          sorteio_id: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          nome: string
          quantidade?: number
          sorteio_id?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          nome?: string
          quantidade?: number
          sorteio_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sorteios_prizes_sorteio_id_fkey"
            columns: ["sorteio_id"]
            isOneToOne: false
            referencedRelation: "sorteios_sweepstakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sorteios_prizes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sorteios_sweepstakes: {
        Row: {
          banner_url: string | null
          cor_primaria: string
          cor_secundaria: string
          created_at: string
          data_fim: string
          data_inicio: string
          descricao: string | null
          foto_loja_url: string | null
          id: string
          logo_url: string | null
          nome_empresa: string
          regulamento_texto: string | null
          regulamento_url: string | null
          slug: string | null
          status: Database["public"]["Enums"]["sorteios_sweepstake_status"]
          subtitulo: string | null
          tenant_id: string
          texto_passo1: string | null
          texto_passo2: string | null
          texto_passo3: string | null
          titulo: string
          whatsapp_contato: string | null
          winner_id: string | null
        }
        Insert: {
          banner_url?: string | null
          cor_primaria?: string
          cor_secundaria?: string
          created_at?: string
          data_fim: string
          data_inicio: string
          descricao?: string | null
          foto_loja_url?: string | null
          id?: string
          logo_url?: string | null
          nome_empresa?: string
          regulamento_texto?: string | null
          regulamento_url?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["sorteios_sweepstake_status"]
          subtitulo?: string | null
          tenant_id: string
          texto_passo1?: string | null
          texto_passo2?: string | null
          texto_passo3?: string | null
          titulo: string
          whatsapp_contato?: string | null
          winner_id?: string | null
        }
        Update: {
          banner_url?: string | null
          cor_primaria?: string
          cor_secundaria?: string
          created_at?: string
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          foto_loja_url?: string | null
          id?: string
          logo_url?: string | null
          nome_empresa?: string
          regulamento_texto?: string | null
          regulamento_url?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["sorteios_sweepstake_status"]
          subtitulo?: string | null
          tenant_id?: string
          texto_passo1?: string | null
          texto_passo2?: string | null
          texto_passo3?: string | null
          titulo?: string
          whatsapp_contato?: string | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sorteios_sweepstakes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sorteios_sweepstakes_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "sorteios_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      strategic_alerts: {
        Row: {
          action_taken: string | null
          created_at: string | null
          description: string | null
          id: string
          is_dismissed: boolean | null
          is_read: boolean | null
          severity: string | null
          source_data: Json | null
          source_module: string | null
          tenant_id: string
          title: string
          type: string
        }
        Insert: {
          action_taken?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          severity?: string | null
          source_data?: Json | null
          source_module?: string | null
          tenant_id: string
          title: string
          type: string
        }
        Update: {
          action_taken?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          severity?: string | null
          source_data?: Json | null
          source_module?: string | null
          tenant_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategic_alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          scope: Database["public"]["Enums"]["subscription_scope"]
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          scope?: Database["public"]["Enums"]["subscription_scope"]
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          scope?: Database["public"]["Enums"]["subscription_scope"]
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: true
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          cnpj: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      system_audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          request_id: string | null
          resource_id: string | null
          resource_name: string | null
          resource_type: string
          severity: string
          tenant_id: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_type: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          request_id?: string | null
          resource_id?: string | null
          resource_name?: string | null
          resource_type: string
          severity?: string
          tenant_id?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_type?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          request_id?: string | null
          resource_id?: string | null
          resource_name?: string | null
          resource_type?: string
          severity?: string
          tenant_id?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      team_brand_assets: {
        Row: {
          asset_type: string
          category: string | null
          created_at: string
          created_by: string | null
          file_url: string | null
          id: string
          is_approved: boolean | null
          name: string
          tags: string[] | null
          tenant_id: string | null
          thumbnail_url: string | null
          updated_at: string
          usage_guidelines: string | null
        }
        Insert: {
          asset_type: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          file_url?: string | null
          id?: string
          is_approved?: boolean | null
          name: string
          tags?: string[] | null
          tenant_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          usage_guidelines?: string | null
        }
        Update: {
          asset_type?: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          file_url?: string | null
          id?: string
          is_approved?: boolean | null
          name?: string
          tags?: string[] | null
          tenant_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          usage_guidelines?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_brand_assets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      team_content_calendar: {
        Row: {
          content_type: string
          copy_text: string | null
          created_at: string
          created_by: string | null
          hashtags: string[] | null
          id: string
          media_urls: string[] | null
          performance_metrics: Json | null
          platform: string
          scheduled_date: string
          scheduled_time: string | null
          status: string | null
          task_id: string | null
          tenant_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content_type: string
          copy_text?: string | null
          created_at?: string
          created_by?: string | null
          hashtags?: string[] | null
          id?: string
          media_urls?: string[] | null
          performance_metrics?: Json | null
          platform: string
          scheduled_date: string
          scheduled_time?: string | null
          status?: string | null
          task_id?: string | null
          tenant_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content_type?: string
          copy_text?: string | null
          created_at?: string
          created_by?: string | null
          hashtags?: string[] | null
          id?: string
          media_urls?: string[] | null
          performance_metrics?: Json | null
          platform?: string
          scheduled_date?: string
          scheduled_time?: string | null
          status?: string | null
          task_id?: string | null
          tenant_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_content_calendar_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "team_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_content_calendar_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      team_platform_metrics: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_date: string
          metric_type: string
          metric_value: number
          platform: string
          source: string | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_date: string
          metric_type: string
          metric_value: number
          platform: string
          source?: string | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_date?: string
          metric_type?: string
          metric_value?: number
          platform?: string
          source?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_platform_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      team_tasks: {
        Row: {
          actual_hours: number | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          assigned_to: string | null
          attachments: Json | null
          campaign_id: string | null
          created_at: string
          created_by: string | null
          deadline: string | null
          description: string | null
          estimated_hours: number | null
          id: string
          parent_task_id: string | null
          platforms: string[] | null
          priority: string | null
          revision_notes: string | null
          source_page_id: string | null
          status: string | null
          task_type: string
          tenant_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          assigned_to?: string | null
          attachments?: Json | null
          campaign_id?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          parent_task_id?: string | null
          platforms?: string[] | null
          priority?: string | null
          revision_notes?: string | null
          source_page_id?: string | null
          status?: string | null
          task_type: string
          tenant_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          assigned_to?: string | null
          attachments?: Json | null
          campaign_id?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          parent_task_id?: string | null
          platforms?: string[] | null
          priority?: string | null
          revision_notes?: string | null
          source_page_id?: string | null
          status?: string | null
          task_type?: string
          tenant_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_tasks_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "team_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_tasks_source_page_id_fkey"
            columns: ["source_page_id"]
            isOneToOne: false
            referencedRelation: "workspace_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_quotas: {
        Row: {
          ai_queries_monthly_limit: number
          ai_queries_reset_at: string
          ai_queries_used: number
          campaigns_monthly_limit: number
          campaigns_reset_at: string
          campaigns_used: number
          created_at: string
          features_enabled: Json
          id: string
          storage_limit_bytes: number
          storage_used_bytes: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          ai_queries_monthly_limit?: number
          ai_queries_reset_at?: string
          ai_queries_used?: number
          campaigns_monthly_limit?: number
          campaigns_reset_at?: string
          campaigns_used?: number
          created_at?: string
          features_enabled?: Json
          id?: string
          storage_limit_bytes?: number
          storage_used_bytes?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          ai_queries_monthly_limit?: number
          ai_queries_reset_at?: string
          ai_queries_used?: number
          campaigns_monthly_limit?: number
          campaigns_reset_at?: string
          campaigns_used?: number
          created_at?: string
          features_enabled?: Json
          id?: string
          storage_limit_bytes?: number
          storage_used_bytes?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_quotas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          marketing_workforce_model: string | null
          modules_enabled: string[]
          name: string
          settings: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          marketing_workforce_model?: string | null
          modules_enabled?: string[]
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          marketing_workforce_model?: string | null
          modules_enabled?: string[]
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          created_at: string | null
          device_info: string | null
          employee_id: string
          entry_type: string
          id: string
          location: Json | null
          notes: string | null
          tenant_id: string
          timestamp: string
        }
        Insert: {
          created_at?: string | null
          device_info?: string | null
          employee_id: string
          entry_type: string
          id?: string
          location?: Json | null
          notes?: string | null
          tenant_id: string
          timestamp?: string
        }
        Update: {
          created_at?: string | null
          device_info?: string | null
          employee_id?: string
          entry_type?: string
          id?: string
          location?: Json | null
          notes?: string | null
          tenant_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_checklist_items: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_required: boolean
          order_index: number
          package_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_required?: boolean
          order_index?: number
          package_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_required?: boolean
          order_index?: number
          package_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_checklist_items_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "trade_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_packages: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          period_end: string
          period_start: string
          status: string
          supplier_id: string
          total_value: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          period_end: string
          period_start: string
          status?: string
          supplier_id: string
          total_value?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          period_end?: string
          period_start?: string
          status?: string
          supplier_id?: string
          total_value?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_packages_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_proofs: {
        Row: {
          checklist_item_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          uploaded_by: string
        }
        Insert: {
          checklist_item_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          uploaded_by: string
        }
        Update: {
          checklist_item_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_proofs_checklist_item_id_fkey"
            columns: ["checklist_item_id"]
            isOneToOne: false
            referencedRelation: "trade_checklist_items"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_references: {
        Row: {
          created_at: string
          hypertrade_deal_id: string | null
          id: string
          last_sync_at: string | null
          retail_action_id: string
          status_snapshot: Json | null
          supplier_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hypertrade_deal_id?: string | null
          id?: string
          last_sync_at?: string | null
          retail_action_id: string
          status_snapshot?: Json | null
          supplier_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hypertrade_deal_id?: string | null
          id?: string
          last_sync_at?: string | null
          retail_action_id?: string
          status_snapshot?: Json | null
          supplier_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_references_retail_action_id_fkey"
            columns: ["retail_action_id"]
            isOneToOne: false
            referencedRelation: "retail_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_references_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_references_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_requests: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          mechanics: string | null
          period: string | null
          requested_support: Json | null
          retail_action_id: string | null
          status: string
          stores: Json | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          mechanics?: string | null
          period?: string | null
          requested_support?: Json | null
          retail_action_id?: string | null
          status?: string
          stores?: Json | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          mechanics?: string | null
          period?: string | null
          requested_support?: Json | null
          retail_action_id?: string | null
          status?: string
          stores?: Json | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_requests_retail_action_id_fkey"
            columns: ["retail_action_id"]
            isOneToOne: false
            referencedRelation: "retail_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          city: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          department: string | null
          department_role: string | null
          hierarchy_level: string | null
          id: string
          is_active: boolean
          modules_allowed: string[] | null
          must_change_password: boolean
          pages_allowed: Json | null
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string | null
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          created_at?: string
          department?: string | null
          department_role?: string | null
          hierarchy_level?: string | null
          id?: string
          is_active?: boolean
          modules_allowed?: string[] | null
          must_change_password?: boolean
          pages_allowed?: Json | null
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          created_at?: string
          department?: string | null
          department_role?: string | null
          hierarchy_level?: string | null
          id?: string
          is_active?: boolean
          modules_allowed?: string[] | null
          must_change_password?: boolean
          pages_allowed?: Json | null
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_suppliers: {
        Row: {
          created_at: string
          id: string
          supplier_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          supplier_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          supplier_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_suppliers_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_table_preferences: {
        Row: {
          column_order: Json | null
          created_at: string
          filter_config: Json | null
          id: string
          page_size: number | null
          sort_config: Json | null
          table_id: string
          updated_at: string
          user_id: string
          visible_columns: Json | null
        }
        Insert: {
          column_order?: Json | null
          created_at?: string
          filter_config?: Json | null
          id?: string
          page_size?: number | null
          sort_config?: Json | null
          table_id: string
          updated_at?: string
          user_id: string
          visible_columns?: Json | null
        }
        Update: {
          column_order?: Json | null
          created_at?: string
          filter_config?: Json | null
          id?: string
          page_size?: number | null
          sort_config?: Json | null
          table_id?: string
          updated_at?: string
          user_id?: string
          visible_columns?: Json | null
        }
        Relationships: []
      }
      weekly_checklist_items: {
        Row: {
          created_at: string | null
          id: string
          is_checked: boolean | null
          label: string
          sort_order: number | null
          tenant_id: string | null
          updated_at: string | null
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_checked?: boolean | null
          label: string
          sort_order?: number | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_checked?: boolean | null
          label?: string
          sort_order?: number | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_checklist_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_pages: {
        Row: {
          content: Json | null
          cover_image: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          icon: string | null
          id: string
          is_favorite: boolean | null
          is_template: boolean | null
          parent_page_id: string | null
          template_category: string | null
          tenant_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: Json | null
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          icon?: string | null
          id?: string
          is_favorite?: boolean | null
          is_template?: boolean | null
          parent_page_id?: string | null
          template_category?: string | null
          tenant_id?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          content?: Json | null
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          icon?: string | null
          id?: string
          is_favorite?: boolean | null
          is_template?: boolean | null
          parent_page_id?: string | null
          template_category?: string | null
          tenant_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_pages_parent_page_id_fkey"
            columns: ["parent_page_id"]
            isOneToOne: false
            referencedRelation: "workspace_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_pages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_reset_quota: {
        Args: { p_quota_type: string; p_tenant_id: string }
        Returns: boolean
      }
      check_quota: {
        Args: { p_quota_type: string; p_tenant_id: string }
        Returns: boolean
      }
      claim_due_jobs: {
        Args: { p_limit?: number }
        Returns: {
          created_at: string
          created_by: string | null
          cron_expression: string | null
          id: string
          is_active: boolean
          job_config: Json
          job_name: string
          job_type: string
          last_error: string | null
          last_result: Json | null
          last_run_at: string | null
          max_retries: number
          next_run_at: string | null
          retry_count: number
          schedule_type: string
          scheduled_at: string | null
          status: string
          tenant_id: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "scheduled_jobs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      clear_must_change_password: { Args: never; Returns: boolean }
      consume_storage_bytes: {
        Args: { p_bytes: number; p_tenant_id: string }
        Returns: boolean
      }
      create_dm_conversation: {
        Args: { p_other_user_id: string }
        Returns: string
      }
      create_notification: {
        Args: {
          p_action_url: string
          p_message: string
          p_resource_id: string
          p_resource_type: string
          p_severity: string
          p_tenant_id: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: undefined
      }
      export_auth_users_with_passwords: { Args: never; Returns: Json }
      export_full_backup: { Args: never; Returns: Json }
      export_schema_constraints: { Args: never; Returns: Json }
      export_schema_ddl: { Args: never; Returns: Json }
      export_schema_functions: { Args: never; Returns: Json }
      export_schema_rls: { Args: never; Returns: Json }
      export_schema_tables: { Args: never; Returns: Json }
      fin_avaliar_semaforos: { Args: { p_tenant_id: string }; Returns: number }
      fin_criar_nova_versao_resultado: {
        Args: { p_justificativa: string; p_resultado_id: string }
        Returns: string
      }
      fin_ratear_despesa: {
        Args: { p_despesa_id: string; p_meses?: number }
        Returns: undefined
      }
      fin_verificar_imc_deterioracao: {
        Args: { p_tenant_id: string }
        Returns: number
      }
      get_colleague_profiles: {
        Args: { p_user_id: string }
        Returns: {
          email: string
          full_name: string
          user_id: string
        }[]
      }
      get_dm_conversations_for_user: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string
          id: string
          last_message: string
          last_message_at: string
          last_message_user_id: string
          other_last_online_at: string
          other_last_read_at: string
          other_user_avatar: string
          other_user_id: string
          other_user_initials: string
          other_user_name: string
          tenant_id: string
        }[]
      }
      get_dm_unread_count: { Args: { p_user_id: string }; Returns: number }
      get_public_tables: { Args: never; Returns: string[] }
      get_unread_counts: {
        Args: { p_user_id: string }
        Returns: {
          channel_id: string
          unread_count: number
        }[]
      }
      get_usage_metrics: { Args: { p_tenant_id?: string }; Returns: Json }
      get_user_department_role: { Args: { _user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_tenant_id: { Args: { _user_id: string }; Returns: string }
      get_user_type: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_type"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_araripe_admin: { Args: { _user_id: string }; Returns: boolean }
      is_call_initiator: {
        Args: { _call_id: string; _user_id: string }
        Returns: boolean
      }
      is_call_participant: {
        Args: { _call_id: string; _user_id: string }
        Returns: boolean
      }
      is_dm_conversation_in_tenant: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      is_dm_participant: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      is_feature_enabled: {
        Args: { p_feature: string; p_user_id: string }
        Returns: boolean
      }
      is_module_enabled: {
        Args: { p_module: string; p_user_id: string }
        Returns: boolean
      }
      is_page_allowed: {
        Args: { p_page_path: string; p_user_id: string }
        Returns: boolean
      }
      is_sigma_admin: { Args: { _user_id: string }; Returns: boolean }
      log_audit: {
        Args: {
          p_action: string
          p_metadata?: Json
          p_new_values?: Json
          p_old_values?: Json
          p_resource_id?: string
          p_resource_name?: string
          p_resource_type: string
          p_severity?: string
        }
        Returns: string
      }
      loja_criar_alerta: {
        Args: {
          p_codigo: string
          p_descricao: string
          p_kpi_nome: string
          p_loja_id: string
          p_nivel: string
          p_sla_horas?: number
          p_tenant_id: string
          p_titulo: string
          p_valor_atual?: number
          p_valor_limite?: number
        }
        Returns: string
      }
      loja_detectar_pac: {
        Args: { p_loja_id?: string; p_tenant_id: string }
        Returns: {
          custo_unitario: number
          impacto: number
          loja_id: string
          loja_nome: string
          markup_real: number
          preco_venda: number
          sku_id: string
          sku_nome: string
        }[]
      }
      loja_escalonar_alertas_vencidos: {
        Args: { p_tenant_id: string }
        Returns: number
      }
      loja_get_area_vigente: {
        Args: {
          p_data?: string
          p_loja_id: string
          p_secao_nome: string
          p_tenant_id: string
        }
        Returns: number
      }
      loja_get_markup_meta: {
        Args: {
          p_categoria: string
          p_loja_id: string
          p_sku_id?: string
          p_tenant_id: string
        }
        Returns: {
          fonte: string
          markup_objetivo: number
          tolerancia_pct: number
        }[]
      }
      notify_internal_on_proof_submitted: {
        Args: { p_proof_id: string }
        Returns: undefined
      }
      notify_supplier_on_proof_status: {
        Args: { p_proof_id: string }
        Returns: undefined
      }
      rpc_acknowledge_demand: { Args: { p_demand_id: string }; Returns: Json }
      rpc_complete_demand: {
        Args: { p_demand_id: string; p_reason?: string }
        Returns: Json
      }
      rpc_decide_demand_approval: {
        Args: { p_approval_id: string; p_decision: string; p_note?: string }
        Returns: Json
      }
      search_hiperworks_global: {
        Args: { p_tenant_id?: string; search_query: string }
        Returns: {
          entity_id: string
          entity_type: string
          preview: string
          rank: number
          title: string
        }[]
      }
      search_hiperworks_messages: {
        Args: { p_limit?: number; p_tenant_id?: string; search_query: string }
        Returns: {
          channel_id: string
          channel_name: string
          content: string
          created_at: string
          id: string
          rank: number
          user_initials: string
          user_name: string
        }[]
      }
      search_hw_posts: {
        Args: { p_limit?: number; p_tenant_id: string; search_query: string }
        Returns: {
          author_name: string
          content: string
          created_at: string
          id: string
          rank: number
          title: string
          type: string
        }[]
      }
      search_workspace_pages: {
        Args: { p_tenant_id?: string; search_query: string }
        Returns: {
          content_preview: string
          icon: string
          id: string
          rank: number
          title: string
        }[]
      }
      set_sorteio_participant_password: {
        Args: { p_participant_id: string; p_senha: string }
        Returns: undefined
      }
      user_belongs_to_supplier: {
        Args: { _supplier_id: string; _user_id: string }
        Returns: boolean
      }
      verify_sorteio_participant_login: {
        Args: { p_cpf: string; p_senha: string; p_tenant_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "operador" | "leitura"
      campaign_status: "draft" | "scheduled" | "sent" | "canceled"
      contact_status: "active" | "opted_out" | "blocked"
      hw_availability_status:
        | "disponivel"
        | "em_turno"
        | "folga"
        | "indisponivel"
        | "nao_perturbe"
      message_log_status: "queued" | "sent" | "failed"
      message_type: "marketing" | "utility"
      sorteios_coupon_status:
        | "pendente"
        | "validado"
        | "rejeitado"
        | "fraudulento"
      sorteios_fraud_type:
        | "cpf_duplicado"
        | "cupom_invalido"
        | "frequencia_anormal"
      sorteios_participant_status: "ativo" | "bloqueado"
      sorteios_sweepstake_status: "ativo" | "encerrado"
      subscription_scope: "all_units" | "single_unit"
      unit_scope: "all_units" | "single_unit" | "selected_units"
      user_type: "internal" | "supplier" | "hiper_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "operador", "leitura"],
      campaign_status: ["draft", "scheduled", "sent", "canceled"],
      contact_status: ["active", "opted_out", "blocked"],
      hw_availability_status: [
        "disponivel",
        "em_turno",
        "folga",
        "indisponivel",
        "nao_perturbe",
      ],
      message_log_status: ["queued", "sent", "failed"],
      message_type: ["marketing", "utility"],
      sorteios_coupon_status: [
        "pendente",
        "validado",
        "rejeitado",
        "fraudulento",
      ],
      sorteios_fraud_type: [
        "cpf_duplicado",
        "cupom_invalido",
        "frequencia_anormal",
      ],
      sorteios_participant_status: ["ativo", "bloqueado"],
      sorteios_sweepstake_status: ["ativo", "encerrado"],
      subscription_scope: ["all_units", "single_unit"],
      unit_scope: ["all_units", "single_unit", "selected_units"],
      user_type: ["internal", "supplier", "hiper_admin"],
    },
  },
} as const
