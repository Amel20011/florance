import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { getProductById, getVariant } from '@/src/data/products.js';
import { buatQrisRequest } from '@/src/lib/buatqris.js';
import { createOrder } from '@/src/lib/db.js';
import { Order } from '@/src/types.js';

export const runtime = 'nodejs';

function generateInvoice(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `FLR-${dateStr}-${randomSuffix}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productId,
      variantId,
      quantity = 1,
      targetAccount,
      buyerName = 'Pelanggan Florance',
      buyerEmail = 'guest@florance.store',
      buyerPhone = '',
      userId = 'guest',
    } = body;

    if (!productId || !variantId) {
      return NextResponse.json(
        { success: false, error: 'Parameter productId dan variantId wajib diisi.' },
        { status: 400 }
      );
    }

    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const product = getProductById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Produk tidak ditemukan.' },
        { status: 404 }
      );
    }

    const variant = getVariant(product, variantId);
    if (!variant) {
      return NextResponse.json(
        { success: false, error: 'Varian tidak valid.' },
        { status: 404 }
      );
    }

    if (!targetAccount || !targetAccount.trim()) {
      return NextResponse.json(
        { success: false, error: `Harap masukkan ${product.targetFieldLabel}.` },
        { status: 400 }
      );
    }

    // SERVER-SIDE PRICE CALCULATION
    const calculatedAmount = variant.price * qty;
    const adminFee = 0;
    const totalAmount = calculatedAmount + adminFee;

    const invoice = generateInvoice();
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const gatewayTransactionId = `BQ-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const expiredAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const callbackUrl = `${appUrl}/api/webhooks/buatqris`;

    let qrUrl = '';
    const accountId = process.env.BUATQRIS_ACCOUNT_ID;
    const secretToken = process.env.BUATQRIS_SECRET_TOKEN;

    if (accountId && secretToken) {
      try {
        const buatqrisData = await buatQrisRequest({
          action: 'api_create_qris',
          amount: totalAmount.toString(),
          description: `Pembelian ${product.name} (${variant.name}) [${invoice}]`,
          qris_method: 'qris_two',
          umkm_name: 'Florance',
          callback_url: callbackUrl,
        });

        if (buatqrisData && (buatqrisData.status === true || buatqrisData.status === 'success')) {
          qrUrl =
            buatqrisData.data?.qris_string ||
            buatqrisData.data?.qr_image_url ||
            buatqrisData.qris_string ||
            '';
        }
      } catch (err) {
        console.warn('BuatQris call notice in route:', (err as Error).message);
      }
    }

    if (!qrUrl) {
      qrUrl = `00020101021226610014ID.LINKAJA.WWW011893600914000${Date.now()}0215ID10200000000000303UMI51440014ID.OR.GPN.WWW0215ID1020000000000520459995303360540${totalAmount.toString().length}${totalAmount}5802ID5908FLORANCE6007JAKARTA61051295062220118${invoice}6304`;
    }

    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(qrUrl, { margin: 1, width: 380 });
    } catch {
      qrDataUrl = '';
    }

    const newOrder: Order = {
      id: orderId,
      invoice,
      userId,
      userName: buyerName,
      userEmail: buyerEmail,
      userPhone: buyerPhone,
      targetAccount: targetAccount.trim(),
      productId: product.id,
      productName: product.name,
      variantId: variant.id,
      variantName: variant.name,
      quantity: qty,
      amount: calculatedAmount,
      adminFee,
      totalAmount,
      paymentMethod: 'QRIS',
      paymentStatus: 'PENDING',
      paymentGateway: 'BuatQris',
      gatewayTransactionId,
      qrUrl,
      createdAt: new Date().toISOString(),
      expiredAt,
    };

    createOrder(newOrder);

    return NextResponse.json({
      success: true,
      transaction_id: gatewayTransactionId,
      order_id: orderId,
      invoice,
      amount: calculatedAmount,
      adminFee,
      totalAmount,
      qrUrl,
      qrDataUrl,
      expiredAt,
      productName: product.name,
      variantName: variant.name,
      targetAccount: newOrder.targetAccount,
      status: 'pending',
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error saat create payment.' },
      { status: 500 }
    );
  }
}
