import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('case-studies.html', 'utf8');
const $ = cheerio.load(html);

// Remove the Smart Retail Forecasting case study completely.
// These are probably contained in 'a' tags or some wrappers.
const smartRetailElements = $('a[href*="smart-retail-forecasting"]');
console.log('Found smart retail links:', smartRetailElements.length);
smartRetailElements.each((i, el) => {
    // The 'a' tag might be the root of the card, or wrapped in a div. Let's see if we should remove the parent 'ssr-variant' container
    // Framer usually has a structure like: div.ssr-variant > div > a.framer-...
    // Let's remove the .ssr-variant wrapper if it exists, or the parent of the anchor if the anchor is the direct child of the grid
    let toRemove = $(el);
    if ($(el).parent().parent().hasClass('ssr-variant')) {
        toRemove = $(el).parent().parent();
    } else if ($(el).parent().hasClass('ssr-variant')) {
        toRemove = $(el).parent();
    } else if ($(el).parent().hasClass('framer-180e0c1-container') || $(el).parent().attr('class')?.includes('-container')) {
        toRemove = $(el).parent();
        if (toRemove.parent().hasClass('ssr-variant')) {
            toRemove = toRemove.parent();
        }
    }
    
    console.log('Removing element with class:', toRemove.attr('class'));
    toRemove.remove();
});

// For Load More, the button is button.framer-3N06V
const loadMoreBtn = $('button:contains("Load More"), button:contains("Load more"), p:contains("Load more"), p:contains("Load More")');
console.log('Found Load More elements:', loadMoreBtn.length);
loadMoreBtn.each((i, el) => {
    let toRemove = $(el).closest('.framer-ykctyd-container');
    if (toRemove.length === 0) {
        toRemove = $(el).closest('button').parent();
    }
    if (toRemove.length > 0) {
        console.log('Removing Load More container:', toRemove.attr('class'));
        toRemove.remove();
    }
});

fs.writeFileSync('case-studies-modified.html', $.html());
console.log('Done modifying case-studies-modified.html');
