require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixBrokenImages() {
  console.log('Fetching products with geilicdn.com images...');

  // Fetch all products where image contains "geilicdn.com"
  let allProducts = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, image')
      .like('image', '%geilicdn.com%')
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('Error fetching products:', error.message);
      process.exit(1);
    }
    if (!data || data.length === 0) break;
    allProducts = allProducts.concat(data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  console.log(`Found ${allProducts.length} products with geilicdn.com images`);

  let brokenCount = 0;
  let okCount = 0;

  for (let i = 0; i < allProducts.length; i++) {
    const product = allProducts[i];
    const { id, name, image } = product;

    try {
      const response = await fetch(image, { method: 'HEAD', signal: AbortSignal.timeout(10000) });

      if (!response.ok) {
        console.log(`[${i + 1}/${allProducts.length}] BROKEN (${response.status}): ${name} (id=${id})`);
        const { error: updateError } = await supabase
          .from('products')
          .update({ image: '' })
          .eq('id', id);

        if (updateError) {
          console.error(`  Failed to update id=${id}:`, updateError.message);
        }
        brokenCount++;
      } else {
        okCount++;
        if ((i + 1) % 50 === 0) {
          console.log(`[${i + 1}/${allProducts.length}] Progress... (${okCount} ok, ${brokenCount} broken)`);
        }
      }
    } catch (err) {
      console.log(`[${i + 1}/${allProducts.length}] ERROR (${err.message}): ${name} (id=${id})`);
      const { error: updateError } = await supabase
        .from('products')
        .update({ image: '' })
        .eq('id', id);

      if (updateError) {
        console.error(`  Failed to update id=${id}:`, updateError.message);
      }
      brokenCount++;
    }
  }

  console.log(`\nDone! ${okCount} OK, ${brokenCount} broken (cleared to empty string)`);
}

fixBrokenImages();
