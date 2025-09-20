import { FirestoreService } from '@/firebase/firestoreService';
import { Order } from '@/types/backend/models';
import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

async function getOrders(storeId: string) {
  const orders = (await FirestoreService.getByConditions('Orders', [
    { field: 'storeId', operator: '==', value: storeId },
    { field: 'status.delivered', operator: '!=', value: null },
  ])) as Order[];

  let totalNetAmount = 0;
  const filteredOrders = orders
    .map((order) => {
      // if (!order.products || order.products.length === 0) return null;

      const baseCommission =
        order.products[0].price * order.products[0].quantity * 0.075;
      const commission = Math.ceil(baseCommission);
      const totalAmount = order.products[0].price * order.products[0].quantity;
      const netAmount = totalAmount - commission;

      // Add to total
      totalNetAmount += netAmount;

      return {
        orderId: order.orderId,
        orderAt: order.orderAt,
        totalAmount: totalAmount,
        commission: commission,
        netAmount: netAmount,
        product: order.products[0],
      };
    })
    .filter(Boolean);

  return {
    orders: filteredOrders,
    totalNetAmount: totalNetAmount
  };
}

export async function GET() {

  const {  orders , totalNetAmount  } = await getOrders('nOxFROaDwelLBzFkcqSS'); // clock 

  // const orders = await getOrders('024456399v43146532r9'); // brew 

  // const orders = await getOrders('nOxFROaDwelLBzFkcqSS'); // lockup 

  const storeName = "Lockup Cafe"


  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([600, 800]);

  // Use a monospaced font for better alignment
  const font = await pdfDoc.embedFont(StandardFonts.Courier);
  const fontSize = 10;

  let y = 750;
  const margin = 20;
  const lineHeight = 20;

  // Table column positions
  const nameX = margin;
  const orderAtX = 200;
  const priceX = 280;
  const totalX = 370;
  const commissionX = 420;
  const netX = 500;




  // Title
  page.drawText(`Orders Report For ${storeName}`, {
    x: margin,
    y,
    size: 18,
    font,
    color: rgb(0, 0, 0),
  });
  y -= 40;

  // Table Header
  page.drawText('Name', { x: nameX, y, size: fontSize, font });
  page.drawText('Order At', { x: orderAtX, y, size: fontSize, font });
  page.drawText('Price X Qty', { x: priceX, y, size: fontSize, font });
  page.drawText('Total', { x: totalX, y, size: fontSize, font });
  page.drawText('Commission', { x: commissionX, y, size: fontSize, font });
  page.drawText('Net Total', { x: netX, y, size: fontSize, font });



  y -= lineHeight;

  page.drawText('-'.repeat(95), {
    x: margin,
    y,
    size: fontSize,
    font,
  });
  y -= lineHeight;

  // Table Rows
  orders.forEach((order) => {
    const orderAtFormatted = order.orderAt.toDate().toLocaleDateString();

    // Add new page if y is too low
    if (y < margin) {
      page = pdfDoc.addPage([600, 800]);
      y = 750;

      // Re-draw table header on new page
      page.drawText('Name', { x: nameX, y, size: fontSize, font });
      page.drawText('Order At', { x: orderAtX, y, size: fontSize, font });
      page.drawText('Price X Qty', { x: priceX, y, size: fontSize, font });
      page.drawText('Total', { x: totalX, y, size: fontSize, font });
      page.drawText('Commission', { x: commissionX, y, size: fontSize, font });
      page.drawText('Net Total', { x: netX, y, size: fontSize, font });



      y -= lineHeight;

      page.drawText('-'.repeat(95), { x: margin, y, size: fontSize, font });
      y -= lineHeight;
    }

    page.drawText(order.product.name.slice(0, 28), { x: nameX, y, size: fontSize, font });
    page.drawText(orderAtFormatted, { x: orderAtX, y, size: fontSize, font });
    page.drawText(order.product.price.toString() + " X " + order.product.quantity.toString(), { x: priceX, y, size: fontSize, font });
    page.drawText(order.totalAmount.toString(), { x: totalX, y, size: fontSize, font });
    page.drawText(order.commission.toString(), { x: commissionX, y, size: fontSize, font });
    page.drawText(order.netAmount.toString(), { x: netX, y, size: fontSize, font });




    y -= lineHeight;
  });

  y -= lineHeight;
page.drawText('-'.repeat(95), {
  x: margin,
  y,
  size: fontSize,
  font,
});
y -= lineHeight;

// Add total net amount with bold formatting
page.drawText('TOTAL NET AMOUNT:', {
  x: commissionX - 50, // Position in the commission column area
  y,
  size: fontSize,
  font,
  color: rgb(0, 0, 0),
});

page.drawText(totalNetAmount.toString(), {
  x: netX,
  y,
  size: fontSize,
  font,
  color: rgb(0, 0, 0),
});

y -= lineHeight * 2;

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${storeName}.pdf`,
    },
  });
};
