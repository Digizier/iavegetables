import { supabase } from '../src/lib/supabase';
import fs from 'fs';
import path from 'path';

async function main() {
  const outDir = path.join(process.cwd(), 'public', 'images', 'vegetables');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log('Querying all products with base64 data...');
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, thumbnail_url, images')
    .order('name');

  if (error || !data) {
    console.error('Error querying products:', error);
    process.exit(1);
  }

  let convertedCount = 0;
  let totalSavedBytes = 0;

  for (const p of data) {
    const isThumbBase64 = (p.thumbnail_url || '').startsWith('data:image/');
    const hasBase64Images = Array.isArray(p.images) && p.images.some((img: string) => img.startsWith('data:image/'));

    if (isThumbBase64 || hasBase64Images) {
      let publicThumbUrl = p.thumbnail_url;
      const newImagesList: string[] = [];

      // Process thumbnail
      if (isThumbBase64) {
        const match = p.thumbnail_url.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (match) {
          const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
          const fileName = `${p.slug}.${ext}`;
          const filePath = path.join(outDir, fileName);
          const buf = Buffer.from(match[2], 'base64');
          fs.writeFileSync(filePath, buf);
          publicThumbUrl = `/images/vegetables/${fileName}`;
          totalSavedBytes += p.thumbnail_url.length;
          console.log(`Saved ${p.name} -> ${fileName} (${(buf.length / 1024).toFixed(1)} KB)`);
        }
      }

      // Process images array
      if (Array.isArray(p.images)) {
        let imgIdx = 0;
        for (const img of p.images) {
          if (img.startsWith('data:image/')) {
            const match = img.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
            if (match) {
              const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
              const suffix = imgIdx === 0 ? '' : `-${imgIdx}`;
              const fileName = `${p.slug}${suffix}.${ext}`;
              const filePath = path.join(outDir, fileName);
              const buf = Buffer.from(match[2], 'base64');
              fs.writeFileSync(filePath, buf);
              newImagesList.push(`/images/vegetables/${fileName}`);
              totalSavedBytes += img.length;
            }
          } else {
            newImagesList.push(img);
          }
          imgIdx++;
        }
      }

      if (newImagesList.length === 0 && publicThumbUrl) {
        newImagesList.push(publicThumbUrl);
      }

      // Update in Supabase
      const { error: updErr } = await supabase
        .from('products')
        .update({
          thumbnail_url: publicThumbUrl,
          images: newImagesList
        })
        .eq('id', p.id);

      if (updErr) {
        console.error(`Failed to update DB for ${p.name}:`, updErr);
      } else {
        convertedCount++;
      }
    }
  }

  console.log(`\nMigration completed!`);
  console.log(`Successfully converted ${convertedCount} products.`);
  console.log(`Saved ${(totalSavedBytes / 1024 / 1024).toFixed(2)} MB of text payload from DB!`);
}

main().catch(console.error);
