import { NextRequest, NextResponse } from 'next/server';
import { getOrderByGatewayId, getOrderByInvoice, getOrderById, updateOrderStatus } from '@/src/lib/db.js';
import { buatQrisRequest } from '@/src/lib/buatqris.js';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const transactionId = searchParams.get('transaction_id') || searchParams.get('transactionId');

  if (!transactionId) {
    return NextResponse.json(
      { success: false, error: 'transaction_id is required.' },
      { status: 400 }
    );
  }

  let order =
    getOrderByGatewayId(transactionId) ||
    getOrderById(transactionId) ||
    getOrderByInvoice(transactionId);

  if (!order) {
    return NextResponse.json(
      { success: false, status: 'failed', error: 'Order not found.' },
      { status: 404 }
    );
  }

  if (order.paymentStatus === 'PENDING' && new Date(order.expiredAt).getTime() < Date.now()) {
    order = updateOrderStatus(order.gatewayTransactionId, 'EXPIRED') || order;
  }

  const accountId = process.env.BUATQRIS_ACCOUNT_ID;
  const secretToken = process.env.BUATQRIS_SECRET_TOKEN;

  if (accountId && secretToken && order.paymentStatus === 'PENDING') {
    try {
      const gwStatus = await buatQrisRequest({
        action: 'api_check_status',
        transaction_id: order.gatewayTransactionId,
      });
      if (gwStatus && (gwStatus.status === 'success' || gwStatus.status === 'paid')) {
        order = updateOrderStatus(order.gatewayTransactionId, 'PAID', new Date().toISOString()) || order;
      }
    } catch {
      // ignore
    }
  }

  // Response frontend only safe data
  return NextResponse.json({
    success: true,
    transaction_id: order.gatewayTransactionId,
    invoice: order.invoice,
    status: order.paymentStatus.toLowerCase(),
    totalAmount: order.totalAmount,
    paidAt: order.paidAt,
  });
}
