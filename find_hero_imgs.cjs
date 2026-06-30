const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

// Search for the section tag that starts the Hero block
const heroStart = content.indexOf('<section class="framer-17rykba"');
if (heroStart !== -1) {
  // Find the end tag of this section, matching nested sections if any
  let bracketCount = 0;
  let sectionEnd = -1;
  let searchPos = heroStart;
  
  // Actually let's just grab a large chunk (e.g. 150,000 chars) that represents the Hero section
  const chunk = content.substring(heroStart, heroStart + 150000);
  
  console.log('Searching in Hero Chunk (length ' + chunk.length + ')...');
  
  // Find all images in this chunk
  let pos = 0;
  while (true) {
    const imgIdx = chunk.indexOf('<img', pos);
    if (imgIdx === -1) break;
    
    const nextClose = chunk.indexOf('>', imgIdx);
    const imgTag = chunk.substring(imgIdx, nextClose + 1);
    
    // Find the enclosing divs or parents
    const startContext = Math.max(0, imgIdx - 400);
    const context = chunk.substring(startContext, imgIdx + imgTag.length + 100);
    
    console.log(`--- IMAGE FOUND ---`);
    console.log(`Tag: ${imgTag}`);
    console.log(`Context:\n${context}\n`);
    
    pos = nextClose + 1;
  }
} else {
  console.log('No framer-17rykba section found!');
}
