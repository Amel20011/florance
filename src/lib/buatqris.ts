export interface BuatQrisCreateResponse {
  status: boolean | string;
  message?: string;
  data?: {
    transaction_id?: string;
    amount?: number | string;
    qris_string?: string;
    qr_image_url?: string;
    expired_at?: string;
    invoice?: string;
  };
  // Some versions return flat fields:
  transaction_id?: string;
  amount?: number | string;
  qris_string?: string;
  qr_image_url?: string;
  qr_url?: string;
}

export interface BuatQrisStatusResponse {
  status: 'pending' | 'success' | 'failed' | 'expired' | string;
  transaction_id?: string;
  amount?: number | string;
  paid_at?: string;
  message?: string;
}

/**
 * Server-side helper to communicate with BuatQris API.
 * Never exposes credentials to client.
 */
export async function buatQrisRequest(params: Record<string, string>): Promise<any> {
  const BASE_URL = process.env.BUATQRIS_BASE_URL || 'https://api.buatqris.site';
  const ACCOUNT_ID = process.env.BUATQRIS_ACCOUNT_ID;
  const SECRET_TOKEN = process.env.BUATQRIS_SECRET_TOKEN;

  if (!ACCOUNT_ID || !SECRET_TOKEN) {
    return null;
  }

  const payload = {
    ...params,
    account_id: ACCOUNT_ID,
    secret_token: SECRET_TOKEN,
  };

  const body = new URLSearchParams(payload);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body,
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const text = await response.text();

    try {
      return JSON.parse(text);
    } catch {
      // If endpoint returns direct string or key-value
      if (text.includes('00020101')) {
        return { status: true, qris_string: text.trim() };
      }
      return null;
    }
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

