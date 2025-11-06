import { AIResponse, WebhookResponse } from '../types';

const WEBHOOK_URL = 'https://n8n-c4bluags.n8x.my.id/webhook/33fa276a-328c-43d9-be9c-4e3f9d1e95ad';

export class AIService {
  private static instance: AIService;

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async sendMessage(message: string, context?: {
    userType?: 'doctor' | 'hospital';
    country?: string;
    specialty?: string;
    category?: string;
  }): Promise<AIResponse> {
    try {
      const payload = {
        message: message.trim(),
        context: {
          timestamp: new Date().toISOString(),
          ...context
        }
      };

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const webhookResponse: WebhookResponse = await response.json();

      if (!webhookResponse.success) {
        throw new Error(webhookResponse.error || 'Unknown API error');
      }

      if (!webhookResponse.data) {
        throw new Error('No data received from AI service');
      }

      return webhookResponse.data;
    } catch (error) {
      console.error('AI Service Error:', error);
      
      // Return a fallback response for network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          message: "I'm having trouble connecting to the AI service. Please check your internet connection and try again.",
          actions: [
            {
              label: 'Try again',
              type: 'action',
              target: 'retry_message',
              parameters: { originalMessage: message }
            }
          ]
        };
      }

      // Return error message for other types of errors
      return {
        message: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try rephrasing your request.`,
        actions: [
          {
            label: 'Try again',
            type: 'action',
            target: 'retry_message',
            parameters: { originalMessage: message }
          }
        ]
      };
    }
  }

  // Helper method to format messages with special characters
  formatMessage(text: string): string {
    return text
      .replace(/⭐/g, '⭐') // Ensure star ratings display correctly
      .replace(/🏥/g, '🏥') // Hospital emoji
      .replace(/👨‍⚕️/g, '👨‍⚕️') // Doctor emoji
      .replace(/•/g, '•') // Bullet points
      .replace(/\n/g, '\n'); // Preserve line breaks
  }
}

export const aiService = AIService.getInstance();