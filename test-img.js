import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('case-studies.html', 'utf8');
const $ = cheerio.load(html, { _useHtmlParser2: true, decodeEntities: false });

const leadFollowUpLinks = $('a:contains("Lead Follow-Up Automation")');
console.log('Lead Follow-Up Automation links:', leadFollowUpLinks.length);
leadFollowUpLinks.each((i, el) => {
    const img = $(el).find('img');
    console.log('Current src:', img.attr('src'));
    img.attr('src', '/assets/case-study-realestate.png');
    img.attr('srcset', '/assets/case-study-realestate.png 512w,/assets/case-study-realestate.png 1024w,/assets/case-study-realestate.png 1200w');
});

const supportMvpLinks = $('a:contains("AI Support Assistant MVP")');
console.log('AI Support Assistant MVP links:', supportMvpLinks.length);
supportMvpLinks.each((i, el) => {
    const img = $(el).find('img');
    console.log('Current src:', img.attr('src'));
    img.attr('src', '/assets/case-study-ecommerce.png');
    img.attr('srcset', '/assets/case-study-ecommerce.png 512w,/assets/case-study-ecommerce.png 1024w,/assets/case-study-ecommerce.png 1200w');
});

fs.writeFileSync('case-studies-modified-2.html', $.html());
console.log('Saved to case-studies-modified-2.html');
