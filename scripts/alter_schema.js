const { Client } = require("pg");

async function run() {
  const client = new Client({
    host: "aws-0-ap-southeast-2.pooler.supabase.com",
    port: 6543,
    user: "postgres.mtrxcnshuwndfhnnlnve",
    password: "iavegetables@#&123",
    database: "postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connecting to Supabase...");
    await client.connect();
    console.log("Connected!");

    // Check foreign key constraints
    console.log("Altering categories and products columns to TEXT...");
    await client.query(`
      -- Drop foreign key constraints temporarily
      ALTER TABLE IF EXISTS public.products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
      ALTER TABLE IF EXISTS public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
      ALTER TABLE IF EXISTS public.order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

      -- Alter columns to TEXT so both custom IDs and UUIDs are accepted
      ALTER TABLE public.categories ALTER COLUMN id TYPE TEXT;
      ALTER TABLE public.products ALTER COLUMN id TYPE TEXT;
      ALTER TABLE public.products ALTER COLUMN category_id TYPE TEXT;
      ALTER TABLE public.orders ALTER COLUMN id TYPE TEXT;
      ALTER TABLE public.order_items ALTER COLUMN id TYPE TEXT;
      ALTER TABLE public.order_items ALTER COLUMN order_id TYPE TEXT;
      ALTER TABLE public.order_items ALTER COLUMN product_id TYPE TEXT;
      ALTER TABLE public.coupons ALTER COLUMN id TYPE TEXT;
    `);

    console.log("Columns successfully altered to TEXT!");

    // Check existing categories in DB
    const cats = await client.query("SELECT id, name, slug, icon FROM public.categories;");
    console.log("Existing categories:", cats.rows);

    // Check existing products in DB
    const prods = await client.query("SELECT id, name, slug, category_id FROM public.products LIMIT 5;");
    console.log("Existing products sample:", prods.rows);

  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await client.end();
  }
}

run();
