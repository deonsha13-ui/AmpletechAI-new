import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('index.html', 'utf8');
const $ = cheerio.load(html);

// Find all script tags
const scripts = $('script');
console.log(`Found ${scripts.length} script tags in index.html`);

scripts.each((i, script) => {
  const $s = $(script);
  console.log(`Script ${i + 1}: src=${$s.attr('src')} / type=${$s.attr('type')} / content=${$s.text().substring(0, 300)}`);
});
