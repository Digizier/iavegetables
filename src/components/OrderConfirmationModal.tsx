'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, MessageCircle, ArrowRight, Package, MapPin, Phone, Home } from 'lucide-react';
import { Order, ShopSettings } from '../lib/types';

interface OrderConfirmationModalProps {
  order: Order | null;
  settings: ShopSettings;
  onClose: () => void;
}

export default function OrderConfirmationModal({
  order,
  settings,
  onClose
}: OrderConfirmationModalProps) {
  if (!order) return null;

  const cleanPhone = settings.whatsapp_number?.replace(/[^0-9]/g, '') || '923413989260';

  const generateWhatsAppMessage = () => {
    let msg = `*🛒 Order Confirmed - I.A Vegetables Supplier*\n\n`;
    msg += `*Order #:* ${order.order_number}\n`;
    msg += `*Customer:* ${order.customer_name}\n`;
    msg += `*Phone:* ${order.customer_phone}\n`;
    msg += `*Delivery Area:* ${order.delivery_area}\n`;
    msg += `*Address:* ${order.delivery_address}\n`;
    msg += `*Payment:* ${order.payment_method}\n\n`;
    msg += `*--- Items Ordered ---*\n`;

    if (order.items && order.items.length > 0) {
      order.items.forEach((item, idx) => {
        msg += `${idx + 1}. ${item.product_name} (${item.weight_label}) × ${item.quantity} = Rs. ${item.subtotal}\n`;
      });
    }

    if (order.discount_amount > 0) {
      msg += `\n*Discount Applied:* -Rs. ${order.discount_amount}\n`;
    }
    msg += `*Delivery Fee:* Rs. ${order.delivery_fee === 0 ? 'FREE' : order.delivery_fee}\n`;
    msg += `*Grand Total:* *Rs. ${order.total_amount}*\n\n`;
    msg += `Assalam o Alaikum, I have placed this order on your website. Please confirm delivery timing!`;

    return encodeURIComponent(msg);
  };

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${generateWhatsAppMessage()}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 animate-scale-in">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="text-center mb-6">
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Order Placed Successfully!
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Thank you for shopping with <strong>I.A Vegetables Supplier</strong>.
          </p>
          <div className="inline-block bg-brand-50 border border-brand-200 text-brand-800 font-mono font-bold text-xs sm:text-sm px-3 py-1 rounded-full mt-3">
            Tracking ID: {order.order_number}
          </div>
        </div>

        {/* Order Details Summary */}
        <div className="bg-gray-50 rounded-2xl p-4 text-xs space-y-3 border border-gray-200/60 mb-6">
          <div className="flex items-start gap-2 text-gray-700">
            <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gray-900">{order.customer_name}</span> ({order.customer_phone})
              <div className="text-gray-500">{order.delivery_address}, {order.delivery_area}</div>
            </div>
          </div>

          <div className="border-t border-gray-200/80 pt-2 space-y-1.5">
            <div className="font-bold text-gray-700">Order Items:</div>
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-gray-600">
                <span>{item.product_name} ({item.weight_label}) × {item.quantity}</span>
                <span className="font-semibold text-gray-900">Rs. {item.subtotal}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200/80 pt-2 flex justify-between items-center text-sm font-black text-gray-900">
            <span>Grand Total ({order.payment_method})</span>
            <span className="text-brand-700 text-base">Rs. {order.total_amount}</span>
          </div>
        </div>

        {/* Prominent WhatsApp Dispatch Buttons as requested */}
        <div className="space-y-2.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-full flex items-center justify-center gap-2 text-sm shadow-lg hover:shadow-xl transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Send Order via WhatsApp Now</span>
          </a>

          <div className="flex items-center gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-semibold py-2 rounded-full text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Quick Chat</span>
            </a>

            <Link
              href="/"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-full text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
