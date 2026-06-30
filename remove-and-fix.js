import fs from 'fs';
import * as cheerio from 'cheerio';

function processHtmlFile(filename) {
    if (!fs.existsSync(filename)) return;
    
    let html = fs.readFileSync(filename, 'utf8');
    const $ = cheerio.load(html, { _useHtmlParser2: true, decodeEntities: false });

    // Remove Smart Retail
    const smartRetailElements = $('a:contains("Smart Retail Forecasting")');
    smartRetailElements.each((i, el) => {
        let toRemove = $(el);
        if (toRemove.parent().parent().hasClass('ssr-variant')) {
            toRemove = toRemove.parent().parent();
        } else if (toRemove.parent().hasClass('ssr-variant')) {
            toRemove = toRemove.parent();
        } else if (toRemove.parent().attr('class') && toRemove.parent().attr('class').includes('-container')) {
            toRemove = toRemove.parent();
            if (toRemove.parent().hasClass('ssr-variant')) {
                toRemove = toRemove.parent();
            }
        }
        toRemove.remove();
    });

    // Remove Load More button
    const loadMoreBtn = $('button:contains("Load More"), button:contains("Load more"), p:contains("Load more"), p:contains("Load More")');
    loadMoreBtn.each((i, el) => {
        let toRemove = $(el).closest('.framer-ykctyd-container');
        if (toRemove.length === 0) {
            toRemove = $(el).closest('button').parent();
        }
        if (toRemove.length > 0) {
            toRemove.remove();
        }
    });

    // Update images for Lead Follow Up and AI Support MVP
    const leadFollowUpLinks = $('a:contains("Lead Follow-Up Automation")');
    leadFollowUpLinks.each((i, el) => {
        const img = $(el).find('img');
        img.attr('src', '/assets/case-study-realestate.png');
        img.attr('srcset', '/assets/case-study-realestate.png 512w, /assets/case-study-realestate.png 1024w, /assets/case-study-realestate.png 1200w');
    });

    const supportMvpLinks = $('a:contains("AI Support Assistant MVP")');
    supportMvpLinks.each((i, el) => {
        const img = $(el).find('img');
        img.attr('src', '/assets/case-study-ecommerce.png');
        img.attr('srcset', '/assets/case-study-ecommerce.png 512w, /assets/case-study-ecommerce.png 1024w, /assets/case-study-ecommerce.png 1200w');
    });

    fs.writeFileSync(filename, $.html());
    console.log('Modified', filename);
}

processHtmlFile('case-studies.html');
processHtmlFile('index.html');
