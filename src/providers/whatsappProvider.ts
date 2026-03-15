/**
 * WhatsApp Integration Provider
 * 
 * STUB: This is a placeholder for future WhatsApp Business API integration.
 * The actual implementation will connect to the WhatsApp Cloud API or
 * a third-party provider like Twilio.
 * 
 * Feature flag: whatsapp_integration
 */

export interface WhatsAppConfig {
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string; // Will be stored encrypted in integration_configs
  webhookVerifyToken: string;
}

export interface WhatsAppMessage {
  to: string; // Phone number in E.164 format
  type: 'text' | 'image' | 'document' | 'template';
  content: string | WhatsAppTemplateContent;
}

export interface WhatsAppTemplateContent {
  name: string;
  language: { code: string };
  components?: WhatsAppTemplateComponent[];
}

export interface WhatsAppTemplateComponent {
  type: 'header' | 'body' | 'button';
  parameters: Array<{
    type: 'text' | 'image' | 'document';
    text?: string;
    image?: { link: string };
    document?: { link: string; filename: string };
  }>;
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface WhatsAppProvider {
  /**
   * Check if the integration is configured and enabled
   */
  isConfigured(): Promise<boolean>;

  /**
   * Send a single message
   */
  sendMessage(message: WhatsAppMessage): Promise<WhatsAppSendResult>;

  /**
   * Send bulk messages (with rate limiting)
   */
  sendBulkMessages(messages: WhatsAppMessage[]): Promise<WhatsAppSendResult[]>;

  /**
   * Get message templates
   */
  getTemplates(): Promise<WhatsAppTemplate[]>;

  /**
   * Verify webhook signature
   */
  verifyWebhook(signature: string, payload: string): boolean;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  language: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  category: string;
  components: WhatsAppTemplateComponent[];
}

/**
 * Stub implementation - returns not configured
 */
export class WhatsAppProviderStub implements WhatsAppProvider {
  async isConfigured(): Promise<boolean> {
    return false;
  }

  async sendMessage(_message: WhatsAppMessage): Promise<WhatsAppSendResult> {
    return {
      success: false,
      error: 'WhatsApp integration not configured. Enable via Integrations settings.',
    };
  }

  async sendBulkMessages(messages: WhatsAppMessage[]): Promise<WhatsAppSendResult[]> {
    return messages.map(() => ({
      success: false,
      error: 'WhatsApp integration not configured.',
    }));
  }

  async getTemplates(): Promise<WhatsAppTemplate[]> {
    return [];
  }

  verifyWebhook(_signature: string, _payload: string): boolean {
    return false;
  }
}

// Export singleton instance
export const whatsappProvider: WhatsAppProvider = new WhatsAppProviderStub();

/**
 * Factory to create provider based on configuration
 * Will be extended when actual integration is implemented
 */
export async function createWhatsAppProvider(
  _config: WhatsAppConfig
): Promise<WhatsAppProvider> {
  // TODO: Implement actual provider when WhatsApp integration is enabled
  // This will check feature flags and return appropriate implementation
  return new WhatsAppProviderStub();
}
