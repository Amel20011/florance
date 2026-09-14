import { NextRequest, NextResponse } from 'next/server';
import { verifyHmacSignature } from '@/src/lib/webhook-signature.js';
import {
  getOrderByGatewayId,
  isWebhookEventProcessed,
  recordWebhookEvent,
  updateOrderStatus,
} from '@/src/lib/db.js';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // 1. Receive raw body text before parsing JSON
    const rawBody = await req.text();

    // 2. Read headers
    const signature =
      req.headers.get('x-buatqris-signature') || req.headers.get('x-signature');
    const deliveryId =
      req.headers.get('x-buatqris-delivery') || `del_${Date.now()}`;

    const secretToken = process.env.BUATQRIS_SECRET_TOKEN;

    // 3. Verify HMAC-SHA256 signature
    if (secretToken) {
      if (!signature) {
        return NextResponse.json(
          { success: false, error: 'Missing webhook signature header.' },
          { status: 401 }
        );
      }

      const isValid = verifyHmacSignature(rawBody, signature, secretToken);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid HMAC-SHA256 signature.' },
          { status: 401 }
        );
      }
    }

    // 4. Validate idempotency
    if (deliveryId && isWebhookEventProcessed(deliveryId)) {
      return NextResponse.json(
        { success: true, duplicate: true, message: 'Event already processed.' },
        { status: 200 }
      );
    }

    // 5. Parse JSON payload
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload.' },
        { status: 400 }
      );
    }

    const transactionId = payload.transaction_id || payload.data?.transaction_id;
    const webhookAmount = Number(payload.amount ?? payload.data?.amount);
    const status = (payload.status || payload.data?.status || 'success').toString().toLowerCase();

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'Missing transaction_id.' },
        { status: 400 }
      );
    }

    // 6. Find order
    const order = getOrderByGatewayId(transactionId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found.' },
        { status: 404 }
      );
    }

    // 7. Verify Amount
    if (!isNaN(webhookAmount) && webhookAmount > 0) {
      if (Number(order.totalAmount) !== webhookAmount) {
        return NextResponse.json(
          { success: false, error: 'Payment amount mismatch.' },
          { status: 400 }
        );
      }
    }

    // 8. Payment State Protection
    if (order.paymentStatus === 'PAID') {
      if (deliveryId) recordWebhookEvent(deliveryId, transactionId);
      return NextResponse.json({ success: true, message: 'Order was already PAID.' });
    }

    // 9. Process transaction
    if (status === 'success' || status === 'paid' || status === 'settlement') {
      updateOrderStatus(order.gatewayTransactionId, 'PAID', new Date().toISOString());
    } else if (status === 'expired') {
      updateOrderStatus(order.gatewayTransactionId, 'EXPIRED');
    } else if (status === 'failed') {
      updateOrderStatus(order.gatewayTransactionId, 'FAILED');
    }

    // 10. Mark webhook as processed
    if (deliveryId) {
      recordWebhookEvent(deliveryId, transactionId);
    }

    // 11. Return HTTP 200
    return NextResponse.json({ success: true, status: 'processed' }, { status: 200 });
  } catch (error) {
    console.error('Webhook route error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal webhook error.' },
      { status: 500 }
    );
  }
}
