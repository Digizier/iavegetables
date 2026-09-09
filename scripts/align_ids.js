const { Client } = require("pg");

async function alignIds() {
  const client = new Client({
    host: "aws-0-ap-southeast-2.pooler.supabase.com",
    port: 6543,
    user: "postgres.mtrxcnshuwndfhnnlnve",
    password: "iavegetables@#&123",
    database: "postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to Supabase!");

    // Update category IDs to clean standard IDs
    await client.query(`
      UPDATE public.categories SET id = 'cat-1' WHERE slug = 'daily-essentials';
      UPDATE public.categories SET id = 'cat-2' WHERE slug = 'fresh-greens';
      UPDATE public.categories SET id = 'cat-3' WHERE slug = 'salad-herbs';
      UPDATE public.categories SET id = 'cat-4' WHERE slug = 'seasonal-specials';
      UPDATE public.categories SET id = 'cat-5' WHERE slug = 'family-bundles';

      UPDATE public.products SET category_id = 'cat-1' WHERE slug IN ('red-potatoes-aloo', 'sindhi-onions-piyaz', 'fresh-farm-tomatoes-tamatar', 'desi-garlic-lehsan', 'fresh-ginger-adrak');
      UPDATE public.products SET category_id = 'cat-2' WHERE slug IN ('farm-fresh-spinach-palak', 'crisp-okra-bhindi', 'fresh-green-peas-matar');
      UPDATE public.products SET category_id = 'cat-3' WHERE slug IN ('farm-cucumbers-kheera', 'fresh-coriander-hara-dhaniya', 'aromatic-mint-podina', 'spicy-green-chillies-hari-mirch');
      UPDATE public.products SET category_id = 'cat-4' WHERE slug IN ('fresh-cauliflower-phool-gobi', 'glossy-eggplant-baingan');
      UPDATE public.products SET category_id = 'cat-5' WHERE slug = 'weekly-kitchen-vegetable-box-10kg';
    `);

    const cats = await client.query("SELECT id, name, slug FROM public.categories ORDER BY id;");
    console.log("Updated categories in Supabase:", cats.rows);

    const prods = await client.query("SELECT id, name, category_id FROM public.products LIMIT 5;");
    console.log("Updated products in Supabase:", prods.rows);

  } catch (err) {
    console.error("Error aligning IDs:", err);
  } finally {
    await client.end();
  }
}

alignIds();
