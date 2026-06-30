import fs from 'fs';
import path from 'path';

function fixQueryParams(filename) {
    if (!fs.existsSync(filename)) return;
    let html = fs.readFileSync(filename, 'utf8');
    
    // Remove query params from /assets/ images in src and srcset
    html = html.replace(/(\/assets\/[^"'\s\?]+)\?[^"'\s]*/g, '$1');
    
    fs.writeFileSync(filename, html);
    console.log('Fixed query params in', filename);
}

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
files.forEach(fixQueryParams);

if (fs.existsSync('case-studies')) {
    fs.readdirSync('case-studies').filter(f => f.endsWith('.html')).forEach(f => {
        fixQueryParams(path.join('case-studies', f));
    });
}
