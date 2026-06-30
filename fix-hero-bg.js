const fs = require('fs');
let mainjs = fs.readFileSync('src/js/main.js', 'utf8');
mainjs = mainjs.replace(
    "console.log('[AmpleAI] ✓ Existing hero video found and playing');",
    `console.log('[AmpleAI] ✓ Existing hero video found and playing');
        // Hide the Framer background image which would otherwise cover the video
        const framerBg = hero.querySelector('[data-framer-name="BG Item"]');
        if (framerBg) {
            framerBg.style.display = 'none';
        }`
);
fs.writeFileSync('src/js/main.js', mainjs);
