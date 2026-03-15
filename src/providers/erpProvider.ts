/**
 * ERP Integration Provider
 * 
 * STUB: This is a placeholder for future ERP integration.
 * Primary targets: TOTVS Winthor, Protheus
 * 
 * Feature flags: erp_integration
 */

export type ERPType = 'winthor' | 'protheus' | 'sap' | 'custom';

export interface ERPConfig {
  type: ERPType;
  baseUrl: string;
  credentials: {
    username?: string;
    password?: string;
    apiKey?: string;
    token?: string;
  };
  options?: {
    companyCode?: string;
    branchCode?: string;
    timeout?: number;
  };
}

// Common ERP entities
export interface ERPProduct {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  cost?: number;
  stock?: number;
  unit?: string;
  barcode?: string;
  metadata?: Record<string, unknown>;
}

export interface ERPSupplier {
  code: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: ERPAddress;
  metadata?: Record<string, unknown>;
}

export interface ERPAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

export interface ERPSalesData {
  date: string;
  storeCode: string;
  products: Array<{
    sku: string;
    quantity: number;
    revenue: number;
    cost?: number;
  }>;
  totals: {
    quantity: number;
    revenue: number;
    cost?: number;
  };
}

export interface ERPSyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsFailed: number;
  errors?: string[];
  lastSyncAt: string;
}

export interface ERPProvider {
  /**
   * Check if the integration is configured and enabled
   */
  isConfigured(): Promise<boolean>;

  /**
   * Test connection to ERP
   */
  testConnection(): Promise<{ success: boolean; message: string }>;

  /**
   * Sync products from ERP
   */
  syncProducts(options?: { since?: string; category?: string }): Promise<ERPSyncResult>;

  /**
   * Sync suppliers from ERP
   */
  syncSuppliers(options?: { since?: string }): Promise<ERPSyncResult>;

  /**
   * Get sales data for a period
   */
  getSalesData(params: {
    startDate: string;
    endDate: string;
    storeCode?: string;
  }): Promise<ERPSalesData[]>;

  /**
   * Get stock levels
   */
  getStockLevels(params: {
    skus?: string[];
    storeCode?: string;
  }): Promise<Array<{ sku: string; stock: number; lastUpdate: string }>>;

  /**
   * Push promotion/campaign to ERP
   */
  pushCampaign(campaign: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    products: Array<{ sku: string; discountPercent?: number; promoPrice?: number }>;
  }): Promise<{ success: boolean; erpCampaignId?: string; error?: string }>;
}

/**
 * Stub implementation - returns not configured
 */
export class ERPProviderStub implements ERPProvider {
  async isConfigured(): Promise<boolean> {
    return false;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    return {
      success: false,
      message: 'ERP integration not configured. Enable via Integrations settings.',
    };
  }

  async syncProducts(_options?: { since?: string; category?: string }): Promise<ERPSyncResult> {
    return {
      success: false,
      recordsProcessed: 0,
      recordsFailed: 0,
      errors: ['ERP integration not configured.'],
      lastSyncAt: new Date().toISOString(),
    };
  }

  async syncSuppliers(_options?: { since?: string }): Promise<ERPSyncResult> {
    return {
      success: false,
      recordsProcessed: 0,
      recordsFailed: 0,
      errors: ['ERP integration not configured.'],
      lastSyncAt: new Date().toISOString(),
    };
  }

  async getSalesData(_params: {
    startDate: string;
    endDate: string;
    storeCode?: string;
  }): Promise<ERPSalesData[]> {
    return [];
  }

  async getStockLevels(_params: {
    skus?: string[];
    storeCode?: string;
  }): Promise<Array<{ sku: string; stock: number; lastUpdate: string }>> {
    return [];
  }

  async pushCampaign(_campaign: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    products: Array<{ sku: string; discountPercent?: number; promoPrice?: number }>;
  }): Promise<{ success: boolean; erpCampaignId?: string; error?: string }> {
    return {
      success: false,
      error: 'ERP integration not configured.',
    };
  }
}

// Export singleton instance
export const erpProvider: ERPProvider = new ERPProviderStub();

/**
 * Factory to create provider based on configuration
 * Will be extended when actual integration is implemented
 */
export async function createERPProvider(_config: ERPConfig): Promise<ERPProvider> {
  // TODO: Implement actual providers when ERP integration is enabled
  // This will check config.type and return appropriate implementation
  return new ERPProviderStub();
}

/**
 * Winthor-specific types for future implementation
 */
export interface WinthorConfig extends ERPConfig {
  type: 'winthor';
  options: ERPConfig['options'] & {
    databaseName?: string;
    oracleVersion?: string;
  };
}

/**
 * Protheus-specific types for future implementation
 */
export interface ProtheusConfig extends ERPConfig {
  type: 'protheus';
  options: ERPConfig['options'] & {
    environment?: string;
    restPort?: number;
  };
}
