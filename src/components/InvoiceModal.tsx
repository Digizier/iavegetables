'use client';

import React from 'react';
import { X, Printer, Download, CheckCircle2, FileText } from 'lucide-react';
import { Order, ShopSettings } from '../lib/types';

interface InvoiceModalProps {
  order: Order | null;
  settings: ShopSettings;
  onClose: () => void;
}

export default function InvoiceModal({ order, settings, onClose }: InvoiceModalProps) {
  if (!order) return null;

  const subtotal =
    order.items?.reduce((sum, item) => sum + item.subtotal, 0) ||
    order.total_amount - order.delivery_fee + order.discount_amount;

  const INVOICE_CSS = `
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 24px;
      color: #111827;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .no-print { display: none !important; }
    .flex { display: flex !important; }
    .flex-col { flex-direction: column !important; }
    @media (min-width: 640px) {
      .sm\\:flex-row { flex-direction: row !important; }
      .sm\\:grid-cols-2 { grid-template-columns: 1fr 1fr !important; }
      .sm\\:text-right { text-align: right !important; }
      .sm\\:w-64 { width: 280px !important; }
    }
    .justify-between { justify-content: space-between !important; }
    .justify-end { justify-content: flex-end !important; }
    .items-start { align-items: flex-start !important; }
    .items-center { align-items: center !important; }
    .grid { display: grid !important; }
    .grid-cols-1 { grid-template-columns: 1fr !important; }
    .gap-1 { gap: 4px !important; }
    .gap-2 { gap: 8px !important; }
    .gap-4 { gap: 16px !important; }
    .text-left { text-align: left !important; }
    .text-center { text-align: center !important; }
    .text-right { text-align: right !important; }
    .font-bold { font-weight: 700 !important; }
    .font-black { font-weight: 900 !important; }
    .font-semibold { font-weight: 600 !important; }
    .font-medium { font-weight: 500 !important; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important; }
    .font-sans { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; }
    .text-\\[10px\\] { font-size: 10px !important; }
    .text-\\[11px\\] { font-size: 11px !important; }
    .text-xs { font-size: 12px !important; }
    .text-sm { font-size: 14px !important; }
    .text-base { font-size: 16px !important; }
    .text-lg { font-size: 18px !important; }
    .text-xl { font-size: 20px !important; }
    .uppercase { text-transform: uppercase !important; }
    .tracking-tight { letter-spacing: -0.025em !important; }
    .tracking-wider { letter-spacing: 0.05em !important; }
    .text-black { color: #000000 !important; }
    .text-white { color: #ffffff !important; }
    .text-gray-400 { color: #9ca3af !important; }
    .text-gray-500 { color: #6b7280 !important; }
    .text-gray-600 { color: #4b5563 !important; }
    .text-gray-700 { color: #374151 !important; }
    .text-emerald-700 { color: #047857 !important; }
    .bg-black { background-color: #000000 !important; }
    .bg-white { background-color: #ffffff !important; }
    .bg-gray-50 { background-color: #f9fafb !important; }
    .bg-gray-100 { background-color: #f3f4f6 !important; }
    .border { border: 1px solid #e5e7eb !important; }
    .border-b { border-bottom: 1px solid #e5e7eb !important; }
    .border-b-2 { border-bottom: 2px solid #111827 !important; }
    .border-t { border-top: 1px solid #e5e7eb !important; }
    .border-t-2 { border-top: 2px solid #111827 !important; }
    .border-dashed { border-style: dashed !important; }
    .border-gray-200 { border-color: #e5e7eb !important; }
    .border-gray-300 { border-color: #d1d5db !important; }
    .border-gray-900 { border-color: #111827 !important; }
    .border-black { border-color: #000000 !important; }
    .rounded-xl { border-radius: 12px !important; }
    .rounded-lg { border-radius: 8px !important; }
    .rounded { border-radius: 4px !important; }
    .p-4 { padding: 16px !important; }
    .p-6 { padding: 24px !important; }
    .px-3 { padding-left: 12px !important; padding-right: 12px !important; }
    .py-1 { padding-top: 4px !important; padding-bottom: 4px !important; }
    .py-2\\.5 { padding-top: 10px !important; padding-bottom: 10px !important; }
    .pb-6 { padding-bottom: 24px !important; }
    .pt-2 { padding-top: 8px !important; }
    .pt-3 { padding-top: 12px !important; }
    .pt-4 { padding-top: 16px !important; }
    .mb-1 { margin-bottom: 4px !important; }
    .mb-2 { margin-bottom: 8px !important; }
    .mb-6 { margin-bottom: 24px !important; }
    .mb-8 { margin-bottom: 32px !important; }
    .mt-1 { margin-top: 4px !important; }
    .space-y-1 > * + * { margin-top: 4px !important; }
    .space-y-2 > * + * { margin-top: 8px !important; }
    .h-10 { height: 40px !important; }
    .h-12 { height: 48px !important; }
    .w-24 { width: 96px !important; }
    .w-auto { width: auto !important; }
    .w-full { width: 100% !important; }
    .inline-block { display: inline-block !important; }
    .shrink-0 { flex-shrink: 0 !important; }
    table { width: 100% !important; border-collapse: collapse !important; margin: 16px 0 !important; }
    th, td { padding: 9px 12px !important; font-size: 12px !important; }
    th { background: #f3f4f6 !important; font-weight: 800 !important; border-top: 2px solid #111827 !important; border-bottom: 2px solid #111827 !important; }
    td { border-bottom: 1px solid #e5e7eb !important; }
    @media print {
      body { padding: 0 !important; }
      @page { size: A4 portrait; margin: 12mm; }
    }
  `;

  const handlePrint = () => {
    if (typeof window === 'undefined') return;

    const printContent = document.getElementById('printable-invoice');
    if (!printContent) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice_${order.order_number}</title>
          <style>${INVOICE_CSS}</style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.focus();
              window.print();
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  const handleDownloadInvoice = () => {
    const printContent = document.getElementById('printable-invoice');
    if (!printContent) return;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice_${order.order_number}</title>
  <style>${INVOICE_CSS}</style>
</head>
<body>
  ${printContent.innerHTML}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${order.order_number}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative overflow-hidden my-6 border border-gray-200 animate-scale-in">
        {/* Modal Action Bar (Hidden on Print) */}
        <div className="no-print bg-slate-50 px-6 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs sm:text-sm text-gray-800">
              Official Tax Invoice • {order.order_number}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Download File */}
            <button
              type="button"
              onClick={handleDownloadInvoice}
              className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Save Invoice File"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Invoice</span>
            </button>

            {/* Print / Save PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
              aria-label="Close invoice"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable White A4 Container */}
        <div id="printable-invoice" className="p-6 sm:p-10 bg-white text-black font-sans">
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-gray-900 pb-6 mb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <img
                  src="/images/logo.png"
                  alt="I.A Vegetables"
                  className="h-10 w-auto object-contain"
                />
                <h1 className="font-black text-xl tracking-tight text-black uppercase">
                  {settings.shop_name || 'I.A VEGETABLES SUPPLIER'}
                </h1>
              </div>
              <p className="text-xs text-gray-600 font-medium">
                Fresh Produce Mandi Direct • Serving Karachi Since 1990
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {settings.shop_address || 'SITE Town, Keamari District, Karachi 75020'}
              </p>
              <p className="text-xs text-gray-600">
                Phone / WhatsApp: <strong>{settings.phone_number || '+92 341 3989260'}</strong>
              </p>
            </div>

            <div className="sm:text-right">
              <div className="inline-block bg-black text-white text-xs font-mono font-bold px-3 py-1 rounded mb-2">
                SALES TAX INVOICE
              </div>
              <div className="text-xs space-y-1">
                <div><strong>Invoice #:</strong> {order.order_number}</div>
                <div><strong>NTN #:</strong> {settings.ntn_number || '4260196-7'}</div>
                <div><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString('en-PK', { dateStyle: 'medium' })}</div>
                <div><strong>Status:</strong> <span className="uppercase font-bold text-emerald-700">{order.status}</span></div>
              </div>
            </div>
          </div>

          {/* Customer & Delivery Address */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="font-bold text-gray-500 uppercase text-[10px] tracking-wider mb-1">Billed & Delivered To:</div>
              <div className="font-bold text-sm text-black">{order.customer_name}</div>
              <div className="text-gray-700">Phone: <strong>{order.customer_phone}</strong></div>
              <div className="text-gray-700 mt-1">{order.delivery_address}</div>
              <div className="text-gray-600 font-semibold">{order.delivery_area}, Karachi</div>
            </div>

            <div className="sm:text-right space-y-1">
              <div className="font-bold text-gray-500 uppercase text-[10px] tracking-wider mb-1">Payment & Courier:</div>
              <div>Payment Method: <strong>{order.payment_method}</strong></div>
              <div>Delivery Type: <strong>Karachi Same-Day Doorstep</strong></div>
              {order.notes && (
                <div className="text-gray-600 italic">Notes: &quot;{order.notes}&quot;</div>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-black bg-gray-100">
                  <th className="py-2.5 px-3 font-black text-black">#</th>
                  <th className="py-2.5 px-3 font-black text-black">Vegetable Item</th>
                  <th className="py-2.5 px-3 font-black text-black">Pack / Weight</th>
                  <th className="py-2.5 px-3 font-black text-black text-center">Qty</th>
                  <th className="py-2.5 px-3 font-black text-black text-right">Price (PKR)</th>
                  <th className="py-2.5 px-3 font-black text-black text-right">Total (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 text-gray-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-black">{item.product_name}</td>
                      <td className="py-2.5 px-3 text-gray-700">{item.weight_label}</td>
                      <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right">Rs. {item.unit_price}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-black">Rs. {item.subtotal}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-3 text-center text-gray-500">Produce line items</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex justify-end mb-8">
            <div className="w-full sm:w-64 space-y-2 text-xs border-t-2 border-black pt-3">
              <div className="flex justify-between text-gray-700">
                <span>Produce Subtotal:</span>
                <span className="font-semibold text-black">Rs. {subtotal}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount Applied:</span>
                  <span>-Rs. {order.discount_amount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-700">
                <span>Karachi Delivery Fee:</span>
                <span className="font-semibold text-black">
                  {order.delivery_fee === 0 ? 'FREE' : `Rs. ${order.delivery_fee}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-black border-t border-gray-300 pt-2">
                <span>Grand Total:</span>
                <span className="text-base">Rs. {order.total_amount}</span>
              </div>
            </div>
          </div>

          {/* Freshness Policy & Stamp */}
          <div className="border-t border-gray-200 pt-4 text-[11px] text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-700">100% Quality & Freshness Guarantee:</p>
              <p>Vegetables are sourced fresh daily from Karachi Mandi. For any concerns, contact us within 2 hours of delivery on <strong>{settings.whatsapp_number || '+92 341 3989260'}</strong>.</p>
            </div>
            <div className="text-center sm:text-right shrink-0">
              <div className="w-24 h-12 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-[10px] text-gray-400 font-mono">
                Official Stamp
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
