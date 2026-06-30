import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('case-studies.html', 'utf8');
const $ = cheerio.load(html);

console.log('--- HEADINGS ---');
$('h2').each((i, el) => {
    console.log($(el).text());
});

console.log('--- LOAD MORE ---');
$('*').each((i, el) => {
    if ($(el).text().toUpperCase().includes('LOAD MORE')) {
        console.log('Found Load More text in:', el.tagName, 'class:', $(el).attr('class'));
    }
});
