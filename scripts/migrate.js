const { Client } = require("pg");

async function migrate() {
  const client = new Client({
    host: "aws-0-ap-southeast-2.pooler.supabase.com",
    port: 6543,
    user: "postgres.mtrxcnshuwndfhnnlnve",
    password: "iavegetables@#&123",
    database: "postgres",
    ssl: { rejectUnauthorized: false }
  });

  console.log("Connecting to Supabase PostgreSQL via Pooler...");
  await client.connect();
  console.log("Connected successfully!");

  console.log("Creating database tables and indexes...");
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      name_urdu TEXT,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      name_urdu TEXT,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      price NUMERIC(10,2) NOT NULL,
      unit TEXT DEFAULT 'kg',
      weight_options JSONB DEFAULT '["0.5", "1", "2", "5"]'::jsonb,
      stock INT DEFAULT 100,
      is_active BOOLEAN DEFAULT true,
      is_featured BOOLEAN DEFAULT false,
      badge TEXT DEFAULT 'Fresh Today',
      thumbnail_url TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_products_cat ON public.products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
    CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);

    CREATE TABLE IF NOT EXISTS public.orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      delivery_area TEXT DEFAULT 'Karachi',
      delivery_fee NUMERIC(10,2) DEFAULT 150,
      discount_amount NUMERIC(10,2) DEFAULT 0,
      coupon_code TEXT,
      total_amount NUMERIC(10,2) NOT NULL,
      payment_method TEXT DEFAULT 'Cash on Delivery',
      status TEXT DEFAULT 'pending',
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.order_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
      product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
      product_name TEXT NOT NULL,
      quantity NUMERIC(10,2) NOT NULL,
      weight_label TEXT NOT NULL,
      unit_price NUMERIC(10,2) NOT NULL,
      subtotal NUMERIC(10,2) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS public.shop_settings (
      id TEXT PRIMARY KEY DEFAULT 'main_settings',
      shop_name TEXT DEFAULT 'I.A Vegetables Supplier',
      shop_subtitle TEXT DEFAULT 'Fresh Farm Produce • Since 1990',
      ntn_number TEXT DEFAULT '4260196-7',
      phone_number TEXT DEFAULT '+92 341 3989260',
      whatsapp_number TEXT DEFAULT '+92 341 3989260',
      shop_address TEXT DEFAULT 'I.A vegetables shop, SITE Town, Keamari District, Karachi 75020',
      google_maps_url TEXT DEFAULT 'https://www.google.com/maps/place/I.A+vegetables+shop/@24.8882505,66.9850563,21z/data=!4m6!3m5!1s0x3eb3150079cc1185:0x28632361d3a85fb9!8m2!3d24.8882505!4d66.9850563!16s%2Fg%2F11yx7kv0rs',
      plus_code TEXT DEFAULT '7JP8VXQP+82',
      latitude NUMERIC(10,7) DEFAULT 24.8882505,
      longitude NUMERIC(10,7) DEFAULT 66.9850563,
      delivery_fee NUMERIC(10,2) DEFAULT 150,
      free_delivery_threshold NUMERIC(10,2) DEFAULT 1500,
      delivery_zones JSONB DEFAULT '["SITE Town", "Clifton / DHA", "Gulshan-e-Iqbal", "North Nazimabad", "Saddar", "Malir", "Korangi", "PECHS", "Bahria Town Karachi", "Gulistan-e-Johar", "Orangi Town", "Keamari Area"]'::jsonb,
      payment_methods JSONB DEFAULT '{"cod_enabled": true, "jazzcash_enabled": true, "jazzcash_title": "I.A Vegetables", "jazzcash_number": "0341-3989260", "easypaisa_enabled": true, "easypaisa_title": "I.A Vegetables", "easypaisa_number": "0341-3989260", "bank_enabled": true, "bank_name": "Meezan Bank", "bank_title": "I.A Vegetables Supplier", "bank_account": "0101-0102030405"}'::jsonb,
      admin_pin TEXT DEFAULT 'admi@iavegetables123@#',
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.hero_banners (
      id TEXT PRIMARY KEY DEFAULT 'main_hero',
      headline TEXT DEFAULT 'Fresh Farm Vegetables Delivered Across Karachi',
      subheadline TEXT DEFAULT 'Direct from the mandi to your kitchen. Hand-picked, sorted, and delivered fresh daily.',
      ticker_announcement TEXT DEFAULT '🚚 Free delivery across Karachi on all orders above Rs. 1,500! Fresh morning harvest arrived.',
      badge_text TEXT DEFAULT '100% Fresh Daily Harvest • Serving Since 1990',
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.coupons (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT DEFAULT 'fixed',
      discount_value NUMERIC(10,2) NOT NULL,
      min_spend NUMERIC(10,2) DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

    -- Permissive policies
    DO $$ BEGIN
      DROP POLICY IF EXISTS "Public read categories" ON public.categories;
      CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Public read products" ON public.products;
      CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Public read settings" ON public.shop_settings;
      CREATE POLICY "Public read settings" ON public.shop_settings FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Public read hero" ON public.hero_banners;
      CREATE POLICY "Public read hero" ON public.hero_banners FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Public read coupons" ON public.coupons;
      CREATE POLICY "Public read coupons" ON public.coupons FOR SELECT USING (is_active = true);

      DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
      CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true);

      DROP POLICY IF EXISTS "Public insert items" ON public.order_items;
      CREATE POLICY "Public insert items" ON public.order_items FOR INSERT WITH CHECK (true);

      DROP POLICY IF EXISTS "Full access admin categories" ON public.categories;
      CREATE POLICY "Full access admin categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS "Full access admin products" ON public.products;
      CREATE POLICY "Full access admin products" ON public.products FOR ALL USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS "Full access admin orders" ON public.orders;
      CREATE POLICY "Full access admin orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS "Full access admin items" ON public.order_items;
      CREATE POLICY "Full access admin items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS "Full access admin settings" ON public.shop_settings;
      CREATE POLICY "Full access admin settings" ON public.shop_settings FOR ALL USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS "Full access admin hero" ON public.hero_banners;
      CREATE POLICY "Full access admin hero" ON public.hero_banners FOR ALL USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS "Full access admin coupons" ON public.coupons;
      CREATE POLICY "Full access admin coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);
    END $$;
  `);
  console.log("Tables and RLS policies created successfully!");

  console.log("Seeding settings & coupons...");
  await client.query(`
    INSERT INTO public.shop_settings (id, shop_name)
    VALUES ('main_settings', 'I.A Vegetables Supplier')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.hero_banners (id, headline)
    VALUES ('main_hero', 'Fresh Farm Vegetables Delivered Across Karachi')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.coupons (code, discount_type, discount_value, min_spend)
    VALUES 
      ('FREESHIP', 'fixed', 150, 1000),
      ('SUBZI100', 'fixed', 100, 1200),
      ('RAMADAN10', 'percentage', 10, 1500)
    ON CONFLICT (code) DO NOTHING;
  `);

  console.log("Seeding categories...");
  const catRes = await client.query(`
    INSERT INTO public.categories (name, name_urdu, slug, icon, sort_order)
    VALUES
      ('Daily Essentials', 'روزمرہ سبزیاں', 'daily-essentials', '🥔', 1),
      ('Fresh Greens', 'ہری سبزیاں', 'fresh-greens', '🥬', 2),
      ('Salad & Herbs', 'سلاد اور مصالحہ جات', 'salad-herbs', '🥒', 3),
      ('Seasonal Specials', 'موسمی سبزیاں', 'seasonal-specials', '🌽', 4),
      ('Family Bundles', 'فیملی کریٹس اور بنڈلز', 'family-bundles', '🧺', 5)
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, name_urdu = EXCLUDED.name_urdu, icon = EXCLUDED.icon
    RETURNING id, slug;
  `);

  const catMap = {};
  for (const row of catRes.rows) {
    catMap[row.slug] = row.id;
  }

  console.log("Seeding produce items...");
  const products = [
    {
      cat: 'daily-essentials',
      name: 'Red Potatoes (Aloo)',
      name_urdu: 'لال آلو',
      slug: 'red-potatoes-aloo',
      price: 90,
      unit: 'kg',
      weights: ["0.5", "1", "2", "5"],
      badge: 'Fresh Daily',
      featured: true,
      desc: 'Firm, fresh farm-harvested red potatoes perfect for daily cooking, handi, and fries.',
      img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80'
    },
    {
      cat: 'daily-essentials',
      name: 'Sindhi Onions (Piyaz)',
      name_urdu: 'سندھی پیاز',
      slug: 'sindhi-onions-piyaz',
      price: 130,
      unit: 'kg',
      weights: ["0.5", "1", "2", "5"],
      badge: 'Best Seller',
      featured: true,
      desc: 'Dry, premium quality Sindh onions with strong flavor and rich layers.',
      img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80'
    },
    {
      cat: 'daily-essentials',
      name: 'Fresh Farm Tomatoes (Tamatar)',
      name_urdu: 'تازہ ٹماٹر',
      slug: 'fresh-farm-tomatoes-tamatar',
      price: 140,
      unit: 'kg',
      weights: ["0.5", "1", "2", "5"],
      badge: 'Top Pick',
      featured: true,
      desc: 'Plump, juicy, naturally ripened red tomatoes. Ideal for salan, gravy, and fresh salads.',
      img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'
    },
    {
      cat: 'daily-essentials',
      name: 'Desi Garlic (Lehsan)',
      name_urdu: 'دیسی لہسن',
      slug: 'desi-garlic-lehsan',
      price: 380,
      unit: 'kg',
      weights: ["0.25", "0.5", "1"],
      badge: 'Aroma Rich',
      featured: false,
      desc: 'Strong aroma desi garlic cloves with intense flavor and natural medicinal qualities.',
      img: 'https://images.unsplash.com/photo-1615477032219-bc1881ba87ab?w=600&auto=format&fit=crop&q=80'
    },
    {
      cat: 'daily-essentials',
      name: 'Fresh Ginger (Adrak)',
      name_urdu: 'تازہ ادرک',
      slug: 'fresh-ginger-adrak',
      price: 480,
      unit: 'kg',
      weights: ["0.25", "0.5", "1"],
      badge: 'Crisp & Zesty',
      featured: false,
      desc: 'Clean, spicy ginger roots without excess fiber. Essential for Pakistani curries and chai.',
      img: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80'
    },
    {
      cat: 'fresh-greens',
      name: 'Tender Spinach (Palak)',
      name_urdu: 'تازہ پالک',
      slug: 'tender-spinach-palak',
      price: 60,
      unit: 'kg',
      weights: ["0.5", "1", "2"],
      badge: 'Iron Rich',
      featured: true,
      desc: 'Crisp green organic spinach leaves, washed and bundled fresh every morning from Malir farms.',
      img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80'
    },
    {
      cat: 'fresh-greens',
      name: 'Fresh Green Okra (Bhindi)',
      name_urdu: 'بھنڈی',
      slug: 'fresh-green-okra-bhindi',
      price: 160,
      unit: 'kg',
      weights: ["0.5", "1", "2"],
      badge: 'Tender Pick',
      featured: true,
      desc: 'Soft, tender ladyfingers without hard seeds. Cooks quickly into delicious bhindi masala.',
      img: 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=600&auto=format&fit=crop&q=80'
    },
    {
      cat: 'fresh-greens',
      name: 'Sweet Green Peas (Matar)',
      name_urdu: 'مٹر',
      slug: 'sweet-green-peas-matar',
      price: 180,
      unit: 'kg',
      weights: ["0.5", "1", "2"],
      badge: 'Seasonal Sweet',
      featured: false,
      desc: 'Sweet, full pods filled with tender green peas. Perfect for pulao, keema, and aloo matar.',
      img: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&auto=format&fit=crop&q=80'
    },
    {
      cat: 'salad-herbs',
      name: 'Farm Cucumbers (Kheera)',
      name_urdu: 'دیسی کھیرا',
      slug: 'farm-cucumbers-kheera',
      price: 90,
      unit: 'kg',
      weights: ["0.5", "1", "2"],
      badge: 'Hydrating',
      featured: true,
      desc: 'Crunchy, refreshing salad cucumbers picked at optimal maturity.',
      img: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=600&auto=format&fit=crop&q=80'
    },
    {
      cat: 'salad-herbs',
      name: 'Aromatic Mint (Podina)',
      name_urdu: 'تازہ پودینہ',
      slug: 'aromatic-mint-podina',
      price: 30,
      unit: 'bunch',
      weights: ["1", "2", "5"],
      badge: 'Garden Fresh',
      featured: false,
      desc: 'Fragrant garden mint bunches for chutney, raita, and refreshing summer drinks.',
      img: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=600&auto=format&fit=crop&q=80'
    },
    {
      cat: 'salad-herbs',
      name: 'Fresh Coriander (Hara Dhaniya)',
      name_urdu: 'ہرا دھنیا',
      slug: 'fresh-coriander-dhaniya',
      price: 40,
      unit: 'bunch',
      weights: ["1", "2", "5"],
      badge: 'Essential Garnish',
      featured: false,
      desc: 'Vibrant green cilantro leaves with deep aroma for everyday garnishing.',
      img: 'https://images.unsplash.com/photo-1589135233689-d56214555815?w=600&auto=format&fit=crop&q=80'
    },
    {
      cat: 'salad-herbs',
      name: 'Spicy Green Chillies (Hari Mirch)',
      name_urdu: 'ہری مرچ',
      slug: 'spicy-green-chillies-hari-mirch',
      price: 150,
      unit: 'kg',
      weights: ["0.25", "0.5", "1"],
      badge: 'Hot & Zesty',
      featured: false,
      desc: 'Crisp green chillies with the right kick of heat.',
      img: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80'
    },
    {
      cat: 'seasonal-specials',
      name: 'Fresh Cauliflower (Phool Gobi)',
      name_urdu: 'پھول گوبھی',
      slug: 'fresh-cauliflower-phool-gobi',
      price: 110,
      unit: 'kg',
      weights: ["1", "2", "3"],
      badge: 'Snow White',
      featured: false,
      desc: 'Dense, clean white cauliflower heads with crisp green protection leaves.',
      img: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600&auto=format&fit=crop&q=80'
    },
    {
      cat: 'seasonal-specials',
      name: 'Glossy Eggplant (Baingan)',
      name_urdu: 'بینگن',
      slug: 'glossy-eggplant-baingan',
      price: 100,
      unit: 'kg',
      weights: ["0.5", "1", "2"],
      badge: 'Tender Flesh',
      featured: false,
      desc: 'Smooth, shiny dark purple brinjals great for baingan bharta and pakoras.',
      img: 'https://images.unsplash.com/photo-1615484477778-ca3b783256fd?w=600&auto=format&fit=crop&q=80'
    },
    {
      cat: 'family-bundles',
      name: 'Weekly Kitchen Vegetable Box (10 KG)',
      name_urdu: 'ہفتہ وار فیملی سبزی کریٹ',
      slug: 'weekly-kitchen-vegetable-box',
      price: 1250,
      unit: 'crate',
      weights: ["1", "2"],
      badge: 'Save 15% • Best Value',
      featured: true,
      desc: 'Complete weekly family vegetable pack: 3kg Aloo, 2kg Piyaz, 2kg Tamatar, 1kg Palak, 1kg Kheera, plus free Dhaniya, Podina & Hari Mirch pack!',
      img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80'
    }
  ];

  for (const p of products) {
    const catId = catMap[p.cat] || null;
    await client.query(`
      INSERT INTO public.products (
        category_id, name, name_urdu, slug, description, price, unit, weight_options, stock, is_featured, badge, thumbnail_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 100, $9, $10, $11)
      ON CONFLICT (slug) DO UPDATE SET
        price = EXCLUDED.price,
        weight_options = EXCLUDED.weight_options,
        badge = EXCLUDED.badge,
        thumbnail_url = EXCLUDED.thumbnail_url,
        is_featured = EXCLUDED.is_featured;
    `, [catId, p.name, p.name_urdu, p.slug, p.desc, p.price, p.unit, JSON.stringify(p.weights), p.featured, p.badge, p.img]);
  }

  console.log("All 15 produce items seeded successfully!");
  await client.end();
  console.log("ALL SUPABASE DATABASE MIGRATIONS COMPLETED SUCCESSFULLY!");
}

migrate().catch(e => {
  console.error("Migration failed:", e);
  process.exit(1);
});
