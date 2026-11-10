import { logger } from '../utils/logger';

export interface SendAlertEmailPayload {
  toEmail: string;
  cityName: string;
  aqi: number;
  category: string;
  categoryColor?: string;
  dominantPollutant?: string;
  pm25?: number;
  recommendations?: {
    outdoorExercise?: string;
    ventilation?: string;
    maskRequired?: boolean;
    airPurifier?: string;
  };
  triggerReason?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Dispatches an automated email alert via the secure serverless backend (/api/send-alert-email).
 * SMTP credentials never leave the server environment.
 */
export async function sendAqiAlertEmail(payload: SendAlertEmailPayload): Promise<SendEmailResult> {
  try {
    const res = await fetch('/api/send-alert-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      let errorMsg = `HTTP ${res.status}: Failed to send alert email.`;
      try {
        const text = await res.text();
        try {
          const errData = JSON.parse(text);
          errorMsg = errData.error || errData.details || errorMsg;
          if (errData.details && errData.error && errData.details !== errData.error) {
            errorMsg = `${errData.error} (${errData.details})`;
          }
        } catch {
          if (text) {
            errorMsg = `Server error (${res.status}): ${text.slice(0, 150)}`;
          }
        }
      } catch {
        // use default errorMsg
      }
      logger.warn('Send alert email failed:', errorMsg);
      return { success: false, error: errorMsg };
    }

    const data = await res.json();
    return {
      success: true,
      messageId: data.messageId
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error dispatching alert email';
    logger.warn('Email dispatch network error:', msg);
    return { success: false, error: msg };
  }
}
