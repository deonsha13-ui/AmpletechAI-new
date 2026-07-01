import fs from 'fs';
import * as cheerio from 'cheerio';

const content = fs.readFileSync('index.html', 'utf8');
const $ = cheerio.load(content);

console.log('=== CASE STUDY CARDS IN INDEX.HTML ===');
$('img').each((i, el) => {
    const alt = $(el).attr('alt') || '';
    const src = $(el).attr('src') || '';
    if (alt.includes('Case') || src.includes('case-study') || src.includes('robotic-arm')) {
        console.log(`\nImage #${i}: alt="${alt}", src="${src}"`);
        // Let's find the nearest heading text in the parent container
        let parent = $(el).parent();
        for (let depth = 0; depth < 8; depth++) {
            if (parent.length) {
                const headings = parent.find('h1, h2, h3, h4, p').map((i, h) => $(h).text().trim()).get();
                const textWithTarget = headings.filter(t => t.length > 5 && t.length < 200);
                if (textWithTarget.length > 0) {
                    console.log(`  Nearest texts:`, textWithTarget.slice(0, 4));
                    break;
                }
                parent = parent.parent();
            }
        }
    }
});
