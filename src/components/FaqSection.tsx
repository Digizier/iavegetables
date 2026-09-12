'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Sparkles, MapPin, Truck, ShieldCheck, Phone } from 'lucide-react';

interface FaqItem {
  question: string;
  questionUrdu: string;
  answer: string;
  answerUrdu: string;
  category: 'delivery' | 'pricing' | 'quality' | 'wholesale';
}

const FAQ_DATA: FaqItem[] = [
  {
    question: 'How can I order fresh vegetables online in Karachi from I.A Vegetables?',
    questionUrdu: 'میں آئی اے ویجیٹیبلز کراچی سے تازہ سبزیاں آن لائن کیسے آرڈر کر سکتا ہوں؟',
    answer: 'You can easily order online through our website by adding fresh farm produce to your basket and choosing Cash on Delivery (COD) or online payment. Alternatively, you can place an instant order on WhatsApp at +92 341 3989260. We hand-pick your vegetables fresh every morning and deliver straight to your doorstep across Karachi.',
    answerUrdu: 'آپ ہماری ویب سائٹ پر اپنی پسند کی سبزیاں باسکٹ میں شامل کر کے کیش آن ڈیلیوری کے ذریعے یا براہ راست واٹس ایپ (0341-3989260) پر آرڈر دے سکتے ہیں۔ ہماری ٹیم صبح سویرے تازہ سبزیاں تیار کر کے آپ کے گھر پہنچاتی ہے۔',
    category: 'delivery',
  },
  {
    question: 'Which areas and towns across Karachi do you deliver to?',
    questionUrdu: 'آپ کراچی کے کن کن علاقوں میں سبزیاں ڈیلیور کرتے ہیں؟',
    answer: 'We deliver across all major localities in Karachi, including SITE Town, Clifton, Defence (DHA phases 1–8), Gulshan-e-Iqbal, North Nazimabad, Saddar, Malir, Korangi, PECHS, Gulistan-e-Johar, Bahria Town Karachi, Orangi Town, and Keamari. Orders placed before 1:00 PM are delivered the same day.',
    answerUrdu: 'ہم کراچی کے تمام علاقوں بشمول سائٹ ٹاؤن، کلفٹن، ڈیفنس (DHA)، گلشن اقبال، نارتھ ناظم آباد، صدر، ملیر، کورنگی، پی ای سی ایچ ایس، گلستان جوہر، اور بحریہ ٹاؤن میں ڈیلیوری فراہم کرتے ہیں۔',
    category: 'delivery',
  },
  {
    question: 'What is the delivery fee and minimum order amount?',
    questionUrdu: 'ڈلیوری فیس کتنی ہے اور کم سے کم آرڈر کی حد کیا ہے؟',
    answer: 'Doorstep delivery is 100% FREE on all orders of Rs. 1,500 and above anywhere in Karachi! For orders below Rs. 1,500, a flat nominal delivery fee of only Rs. 150 is charged to cover transport costs. There is no minimum order requirement.',
    answerUrdu: '1500 روپے یا اس سے زائد کے تمام آرڈرز پر پورے کراچی میں ڈلیوری بالکل مفت ہے! 1500 روپے سے کم کے آرڈرز پر صرف 150 روپے فلیٹ ڈلیوری چارجز لاگو ہوتے ہیں۔',
    category: 'delivery',
  },
  {
    question: 'How do you guarantee farm-fresh quality and wholesale Mandi rates?',
    questionUrdu: 'سبزیوں کی تازگی اور ہول سیل منڈی ریٹ کی کیا ضمانت ہے؟',
    answer: 'Since 1990, our sourcing team arrives at dawn at Karachi’s main Sabzi Mandi (Super Highway) and partner farms in Malir. We personally grade, clean, and inspect every vegetable (potatoes, onions, tomatoes, spinach, herbs). Because we buy directly from source auctions with zero middlemen, our prices match genuine wholesale mandi rates without supermarket markups.',
    answerUrdu: '1990 سے ہماری ٹیم روزانہ صبح سویرے کراچی کی مرکزی سبزی منڈی اور ملیر کے فارمز سے تازہ مال خود منتخب کرتی ہے۔ براہ راست خریداری کی وجہ سے ہمارے ریٹس منڈی ہول سیل کے مطابق انتہائی مناسب ہوتے ہیں۔',
    category: 'pricing',
  },
  {
    question: 'Do you supply bulk or wholesale vegetables for restaurants, caterers, and events?',
    questionUrdu: 'کیا آپ ہوٹلوں، ریسٹورنٹس اور کیٹرنگ کے لیے ہول سیل میں سبزیاں فراہم کرتے ہیں؟',
    answer: 'Yes, absolutely. We are a registered commercial supplier (NTN # 4260196-7). We supply bulk vegetable sacks and crates daily to hotels, restaurants, industrial canteens, catering companies, and marriage functions across Karachi. Wholesale commercial buyers can contact us directly via WhatsApp (+92 341 3989260) for tailored volume discounts and formal sales invoices.',
    answerUrdu: 'جی ہاں، ہم گورنمنٹ رجسٹرڈ سپلائر (NTN # 4260196-7) ہیں اور کراچی بھر کے ہوٹلوں، شادی ہالوں، کیٹرنگ سروسز اور کینٹینز کو روزانہ ہول سیل ریٹ پر بڑی مقدار میں سبزیاں فراہم کرتے ہیں۔',
    category: 'wholesale',
  },
  {
    question: 'What payment methods do you accept in Karachi?',
    questionUrdu: 'ادائیگی کے کون کون سے طریقے دستیاب ہیں؟',
    answer: 'We provide maximum flexibility: Cash on Delivery (COD) allows you to inspect the freshness of your vegetables before paying. We also accept instant mobile payments via JazzCash, EasyPaisa, and Direct Bank Transfer (Meezan Bank).',
    answerUrdu: 'ہم کیش آن ڈیلیوری (COD) پیش کرتے ہیں تاکہ آپ پہلے سبزی کی تازگی چیک کریں اور پھر رقم ادا کریں۔ اس کے علاوہ جاز کیش، ایزی پیسہ اور بینک ٹرانسفر کی سہولت بھی موجود ہے۔',
    category: 'pricing',
  },
  {
    question: 'What is your freshness guarantee and return policy?',
    questionUrdu: 'تازگی کی کیا ضمانت ہے اور اگر سبزی پسند نہ آئے تو کیا ہوگا؟',
    answer: 'We offer a 100% Doorstep Quality Guarantee. When our delivery rider arrives, you are encouraged to inspect your vegetables. If any item does not meet your high standards, you can return it instantly to the rider for an immediate deduction from your bill or request a free same-day replacement.',
    answerUrdu: 'ہم 100 فیصد کوالٹی گارنٹی دیتے ہیں۔ پارسل موصول ہونے پر آپ سبزی چیک کر سکتے ہیں، اگر کوئی چیز معیار کے مطابق نہ ہو تو آپ اسی وقت واپس کر سکتے ہیں اور بل سے رقم منہا کر دی جائے گی۔',
    category: 'quality',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex((current) => (current === idx ? null : idx));
  };

  // Structured Data Schema for Google, Perplexity, Gemini, ChatGPT (AEO)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_DATA.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${item.answer} (اردو: ${item.answerUrdu})`,
      },
    })),
  };

  return (
    <section id="faqs" className="py-12 bg-gray-50 border-t border-gray-200/80">
      {/* Embedded JSON-LD schema for AEO bots */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-brand-100 text-brand-800 text-xs font-bold px-3 py-1 rounded-full">
            <HelpCircle className="w-3.5 h-3.5 text-brand-700" />
            <span>Frequently Asked Questions • سوالات و جوابات</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Common Questions About Vegetable Delivery in Karachi
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Everything you need to know about our daily mandi rates, free Karachi delivery, wholesale catering supply, and 100% freshness guarantee.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {FAQ_DATA.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all shadow-xs hover:border-brand-300"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
                  aria-expanded={isOpen}
                >
                  <div className="space-y-1 pr-2">
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 leading-snug">
                      {faq.question}
                    </h3>
                    <p className="text-xs text-brand-700 font-urdu">{faq.questionUrdu}</p>
                  </div>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'bg-brand-600 text-white rotate-180' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-gray-100 text-xs sm:text-sm text-gray-600 leading-relaxed space-y-2">
                    <p>{faq.answer}</p>
                    <div className="bg-brand-50/70 border border-brand-100 rounded-xl p-3 text-xs text-brand-900 font-urdu leading-relaxed">
                      {faq.answerUrdu}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Contact Help Card */}
        <div className="mt-8 bg-white border border-brand-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xs">
          <div className="space-y-0.5">
            <h4 className="font-black text-sm sm:text-base text-gray-900">
              Have a special wholesale question or need custom bulk vegetable crates?
            </h4>
            <p className="text-xs text-gray-500">
              Our Karachi mandi procurement team is available 7:00 AM – 10:00 PM daily.
            </p>
          </div>
          <a
            href="https://wa.me/923413989260?text=Assalam%20o%20Alaikum%2C%20I%20have%20a%20question%20about%20vegetable%20orders."
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all inline-flex items-center gap-2 shadow-xs active:scale-95"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}
