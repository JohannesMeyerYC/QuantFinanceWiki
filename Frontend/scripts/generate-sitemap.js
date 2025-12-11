import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const BASE_URL = 'https://quantfinancewiki.com';
const API_URL = 'https://quantfinancewiki-backend-806112613063.us-central1.run.app'; // Ensure this matches your production API
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml');

const staticPaths = [
  '/',
  '/roadmaps',
  '/blog',
  '/resources',
  '/firms',
  '/faq'
];

async function fetchData(endpoint) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error.message);
    return [];
  }
}

async function generateSitemap() {
  console.log('Fetching dynamic data...');

  const [posts, roadmaps, firms] = await Promise.all([
    fetchData('/api/blog'),
    fetchData('/api/roadmaps'),
    fetchData('/api/firms')
  ]);

  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  staticPaths.forEach(url => {
    xml += `
  <url>
    <loc>${BASE_URL}${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;
  });

  if (Array.isArray(posts)) {
    posts.forEach(post => {
      xml += `
  <url>
    <loc>${BASE_URL}/blog/${post.id}</loc>
    <lastmod>${post.date || today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });
  }

  if (Array.isArray(roadmaps)) {
    roadmaps.forEach(map => {
      xml += `
  <url>
    <loc>${BASE_URL}/roadmaps/${map.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    });
  }

  xml += `
</urlset>`;

  const publicDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(publicDir)){
      fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, xml);
  console.log(`✅ Sitemap generated successfully at: ${OUTPUT_PATH}`);
}

generateSitemap();