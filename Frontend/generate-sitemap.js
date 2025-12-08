const fs = require('fs');
const path = require('path');
const glob = require('glob');

const BASE_URL = 'https://quantfinancewiki.com';

const PAGES_DIR = path.join(__dirname, 'src/pages');

const OUTPUT_PATH = path.join(__dirname, 'sitemap.xml');

function filenameToPath(filename) {
  const name = path.basename(filename, path.extname(filename));
  if (name.toLowerCase() === 'home') return '/';
  if (name.startsWith('RoadmapDetail') || name.startsWith('BlogPost')) return null; 
  return '/' + name.toLowerCase();
}

glob(`${PAGES_DIR}/*.jsx`, (err, files) => {
  if (err) throw err;

  const urls = files
    .map(filenameToPath)
    .filter(Boolean) 
    .map(urlPath => `
  <url>
    <loc>${BASE_URL}${urlPath}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`;

  fs.writeFileSync(OUTPUT_PATH, sitemap);
  console.log(`Sitemap generated at ${OUTPUT_PATH}`);
});
