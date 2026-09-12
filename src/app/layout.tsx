import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import ClientLayout from '../components/ClientLayout';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.iavegetables.com'),
  title: {
    default: 'I.A Vegetables Supplier Karachi | Fresh Farm Produce & Wholesale Mandi Rates',
    template: '%s | I.A Vegetables Supplier Karachi',
  },
  description: 'Karachi wholesale & retail fresh vegetable supplier since 1990. Hand-picked morning mandi produce, sorted and delivered fresh daily across SITE Town, Clifton, DHA, Gulshan, Malir and all Karachi areas. NTN # 4260196-7.',
  applicationName: 'I.A Vegetables Supplier',
  authors: [{ name: 'I.A Vegetables Supplier', url: 'https://www.iavegetables.com/' }],
  generator: 'Next.js',
  keywords: [
    'vegetable supplier karachi',
    'fresh vegetables delivery karachi',
    'sabzi mandi karachi online',
    'wholesale vegetable supplier karachi',
    'buy vegetables online karachi',
    'fresh farm vegetables karachi',
    'daily mandi rates karachi',
    'aloo piyaz tamatar delivery karachi',
    'vegetable delivery clifton dha',
    'vegetable delivery gulshan karachi',
    'site town vegetable supplier',
    'I.A vegetables supplier',
    'تازہ سبزیاں کراچی',
    'آن لائن سبزی منڈی کراچی',
    'سبزی منڈی ہول سیل ریٹ'
  ],
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'I.A Vegetables Supplier Karachi | Fresh Farm Produce & Wholesale Mandi Rates',
    description: 'Trusted fresh vegetable supplier in Karachi since 1990. Fresh morning harvest delivered daily across Karachi with 100% quality guarantee. NTN # 4260196-7.',
    url: 'https://www.iavegetables.com/',
    siteName: 'I.A Vegetables Supplier',
    images: [
      {
        url: '/images/logo.png',
        width: 600,
        height: 600,
        alt: 'I.A Vegetables Supplier Karachi - Fresh Farm Produce',
      },
    ],
    locale: 'en_PK',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'I.A Vegetables Supplier Karachi | Fresh Farm Produce',
    description: 'Fresh farm-picked vegetables delivered daily across Karachi at wholesale mandi rates. NTN # 4260196-7.',
    images: ['/images/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#16a34a',
};

const jsonLdData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['GroceryStore', 'LocalBusiness'],
      '@id': 'https://www.iavegetables.com/#organization',
      name: 'I.A Vegetables Supplier',
      alternateName: 'I.A Vegetables Shop Karachi',
      legalName: 'I.A Vegetables Supplier',
      url: 'https://www.iavegetables.com/',
      logo: 'https://www.iavegetables.com/images/logo.png',
      image: 'https://www.iavegetables.com/images/shop-front.jpg',
      description: 'Karachi trusted fresh farm vegetable supplier since 1990. Providing daily morning mandi harvest with doorstep delivery to households, restaurants, caterers, and canteens across Karachi.',
      taxID: '4260196-7',
      telephone: '+923413989260',
      priceRange: 'PKR',
      currenciesAccepted: 'PKR',
      paymentAccepted: 'Cash on Delivery, JazzCash, EasyPaisa, Bank Transfer',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'I.A vegetables shop, SITE Town, Keamari District, Near Bizabay',
        addressLocality: 'Karachi',
        addressRegion: 'Sindh',
        postalCode: '75020',
        addressCountry: 'PK',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 24.8882505,
        longitude: 66.9850563,
      },
      hasMap: 'https://www.google.com/maps/place/I.A+vegetables+shop/@24.8882505,66.9850563,21z/data=!4m6!3m5!1s0x3eb3150079cc1185:0x28632361d3a85fb9!8m2!3d24.8882505!4d66.9850563!16s%2Fg%2F11yx7kv0rs',
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '07:00',
          closes: '22:00',
        },
      ],
      areaServed: [
        { '@type': 'City', name: 'Karachi' },
        { '@type': 'Place', name: 'SITE Town' },
        { '@type': 'Place', name: 'Clifton' },
        { '@type': 'Place', name: 'DHA' },
        { '@type': 'Place', name: 'Gulshan-e-Iqbal' },
        { '@type': 'Place', name: 'North Nazimabad' },
        { '@type': 'Place', name: 'Saddar' },
        { '@type': 'Place', name: 'Malir' },
        { '@type': 'Place', name: 'Korangi' },
        { '@type': 'Place', name: 'PECHS' },
        { '@type': 'Place', name: 'Gulistan-e-Johar' },
        { '@type': 'Place', name: 'Bahria Town Karachi' },
      ],
      sameAs: [
        'https://www.facebook.com/p/IA-Vegetables-Supplier-61585790161272/',
        'https://www.tiktok.com/@i.a.vegetables.su',
        'https://www.instagram.com/imranabbasi6184',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.iavegetables.com/#website',
      url: 'https://www.iavegetables.com/',
      name: 'I.A Vegetables Supplier',
      description: 'Karachi fresh farm vegetable supplier online delivery and wholesale mandi rates',
      publisher: {
        '@id': 'https://www.iavegetables.com/#organization',
      },
      inLanguage: ['en-PK', 'ur-PK'],
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://www.iavegetables.com/shop/?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" />
        {/* Local Karachi GEO Meta Tags */}
        <meta name="geo.region" content="PK-SD" />
        <meta name="geo.placename" content="Karachi, Sindh, Pakistan" />
        <meta name="geo.position" content="24.88825;66.985056" />
        <meta name="ICBM" content="24.88825, 66.985056" />

        {/* Global Structured Data (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
  const SITE_KEY = "site_iavegetables";
  const SUPABASE_URL = "https://pggolsqtamtkafrpigfo.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZ29sc3F0YW10a2FmcnBpZ2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNDE3ODgsImV4cCI6MjEwMDgxNzc4OH0.98_YWbdZ6hlpMiujbiWLYPRYlrvnx2_I31FyGILixHs";
  const WHATSAPP_NUM = "03222685868";
  const WHATSAPP_LINK = "https://wa.me/923222685868?text=Hi%20Nader%20Habib,%20I%20want%20to%20unlock%20my%20website.";
  const isTestLock = typeof window !== 'undefined' && window.location && window.location.search && window.location.search.includes('lock=true');

  async function checkAccess() {
    if (isTestLock) {
      execLockOverlay('monthly');
      return;
    }

    try {
      const url = \`\${SUPABASE_URL}/rest/v1/client_websites?site_key=eq.\${encodeURIComponent(SITE_KEY)}&select=*\`;
      const res = await fetch(url, {
        headers: { 
          'apikey': SUPABASE_KEY, 
          'Authorization': 'Bearer ' + SUPABASE_KEY 
        }
      });
      if (!res.ok) return;
      const data = await res.json();
      
      if (data && data.length > 0) {
        const item = data[0];
        const now = new Date();
        const expiry = new Date(item.expiry_date);
        const isExpired = now > expiry;
        const isDisabled = item.status === false;

        if (isExpired || isDisabled) {
          execLockOverlay(item.billing_cycle || 'monthly');
        }
      }
    } catch (e) {
      console.error('[Website-Controller] Access check failed:', e);
    }
  }

  function execLockOverlay(billingCycle) {
    function inject() {
      if (document.getElementById('nader-habib-lock-overlay')) return;
      document.documentElement.style.overflow = 'hidden';
      if (document.body) document.body.style.overflow = 'hidden';

      const overlay = document.createElement('div');
      overlay.id = 'nader-habib-lock-overlay';
      overlay.style.cssText = 'position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;background:#030712!important;color:#ffffff!important;z-index:999999999!important;display:flex!important;align-items:center!important;justify-content:center!important;font-family:system-ui,-apple-system,sans-serif!important;text-align:center!important;padding:20px!important;box-sizing:border-box!important;';

      const cycle = billingCycle === 'yearly' ? 'Yearly' : 'Monthly';

      overlay.innerHTML = \`
        <div style="max-width:520px;width:100%;background:rgba(17,24,39,0.95);border:1px solid rgba(239,68,68,0.4);border-radius:24px;padding:40px 32px;box-shadow:0 25px 50px -12px rgba(239,68,68,0.25);backdrop-filter:blur(16px);">
          <div style="width:72px;height:72px;margin:0 auto 24px;background:rgba(239,68,68,0.15);border:2px solid rgba(239,68,68,0.5);border-radius:50%;display:flex;align-items:center;justify-content:center;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <span style="background:rgba(239,68,68,0.2);color:#f87171;border:1px solid rgba(239,68,68,0.3);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;padding:6px 14px;border-radius:9999px;display:inline-block;margin-bottom:16px;">
            Website Access Locked • \${cycle} Payment Remaining
          </span>
          <h1 style="font-size:26px;font-weight:800;color:#ffffff;margin:0 0 12px 0;">Nader Habib Payment Remaining</h1>
          <p style="font-size:15px;color:#9ca3af;line-height:1.6;margin:0 0 24px 0;">
            Your hosting subscription access is locked. Please contact Nader Habib on WhatsApp to pay remaining dues and restore access.
          </p>
          <div style="background:#1f2937;border:1px solid #374151;border-radius:16px;padding:16px;margin-bottom:24px;">
            <div style="font-size:13px;color:#9ca3af;margin-bottom:4px;">Direct WhatsApp Support</div>
            <div style="font-size:20px;font-weight:700;color:#10b981;">\${WHATSAPP_NUM}</div>
          </div>
          <a href="\${WHATSAPP_LINK}" target="_blank" rel="noreferrer" style="display:flex;align-items:center;justify-content:center;gap:10px;background:#10b981;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 24px;border-radius:14px;box-shadow:0 10px 20px -5px rgba(16,185,129,0.4);">
            Contact Nader Habib on WhatsApp
          </a>
        </div>
      \`;
      document.documentElement.appendChild(overlay);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', inject);
    } else {
      inject();
    }
  }

  checkAccess();
})();`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-800 antialiased selection:bg-brand-500 selection:text-white" suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
