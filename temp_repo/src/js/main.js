/**
 * AmpleAI — v12 DEFINITIVE
 *
 * Scopes scroll-pinned interactive animations strictly to desktop viewport (min-width: 1200px)
 * and animates accordion flex properties directly for perfect reliability.
 */
import '../styles/index.css';

const IMAGE_MAP = {
    'OR4te0XAqQp3f22sxMboTobp5w': '/assets/team-ethan.png',
    'RiB4JVDNfxz4HhK8vki0WzV5c8M': '/assets/team-ethan.png',
    'tYeMIbQoz3vIw3JkGIgJO3aAOk': '/assets/team-ava.png',
    'EEYaHcqogk3IyHDryrKLPdSzk': '/assets/team-ava.png',
    'vIculIPqr7lCDLJUfsY7ks1Zw': '/assets/team-noah.png',
    'dCtkpnoE7qEITkDuDvst22PaAOU': '/assets/team-noah.png',
    'Sg9QXajgT380oA1yHySylazfGs': '/assets/team-sarah.png',
    'nTPaXeQZ8UlpaJbZOVt7Cvmkjq0': '/assets/team-sarah.png',
    'jWmFga0Em87djh62ANoLFTFZ7G4': '/assets/team-liam.png'
};

const SECTION_MAP = {
    'Hero': 'hero', 'About': 'about', 'Services': 'services',
    'Cases': 'case-studies', 'Step': 'process', 'Clients': 'clients',
    'Why Choose': 'why-choose', 'Journey': 'journey', 'Team': 'team',
    'Pricing': 'pricing', 'Stat': 'stats', 'Client Voices': 'testimonials',
    'Blog': 'blog',
};

/* ─────────────────────────────────────────────────────────
   DOM PATH & HYDRATION EXCLUSION SETUP
   ───────────────────────────────────────────────────────── */
const excludedPaths = new Set();
const excludedElements = new WeakSet();

function getDomPath(el) {
    const stack = [];
    let current = el;
    while (current && current.nodeType === Node.ELEMENT_NODE) {
        let sibCount = 0;
        let sibIndex = 0;
        if (current.parentNode) {
            for (let i = 0; i < current.parentNode.childNodes.length; i++) {
                let sib = current.parentNode.childNodes[i];
                if (sib.nodeName === current.nodeName) {
                    if (sib === current) {
                        sibIndex = sibCount;
                    }
                    sibCount++;
                }
            }
        }
        const tagName = current.nodeName.toLowerCase();
        const classes = Array.from(current.classList)
            .filter(c => c !== 'amp-card-hover' && c !== 'amp-hover-active')
            .join('.');
        const classStr = classes ? `.${classes}` : '';
        const indexStr = sibCount > 1 ? `:nth-of-type(${sibIndex + 1})` : '';
        stack.unshift(`${tagName}${classStr}${indexStr}`);
        current = current.parentNode;
    }
    return stack.join(' > ');
}

function setupExclusions() {
    const cards = document.querySelectorAll('[data-border="true"]');
    cards.forEach(card => {
        if (card.tagName === 'INPUT' || card.tagName === 'TEXTAREA') {
            excludedElements.add(card);
            excludedPaths.add(getDomPath(card));
            return;
        }
        
        const name = (card.getAttribute('data-framer-name') || '').toLowerCase();
        const nameExcluded = ['nav', 'menu', 'header', 'footer', 'white', 'dark', 'wrap', 'center', 'default', 'divider', 'button', 'toggle', 'indicator', 'badge'].some(k => name.includes(k));
        
        const sec = card.closest('section');
        const secName = sec ? (sec.getAttribute('data-framer-name') || '').toLowerCase() : '';
        const secExcluded = ['services', 'hero', 'clients', 'step', 'why choose', 'team', 'stat', 'client voices'].some(k => secName.includes(k));
        
        if (nameExcluded || secExcluded) {
            excludedElements.add(card);
            excludedPaths.add(getDomPath(card));
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupExclusions);
} else {
    setupExclusions();
}

const MENU_LINKS = [
    { label: 'HOME',         slug: 'hero' },
    { label: 'ABOUT US',     slug: 'about' },
    { label: 'SERVICES',     slug: 'services' },
    { label: 'CASE STUDIES', slug: 'case-studies' },
    { label: 'CONTACT US',   slug: 'contact' },
];

function init() {
    assignSectionIds();
    unlockHiddenElements();
    buildAndInjectMenu();
    wireHamburger();
    initBentoSpotlight();
    initAmbientGlowBlobs();
    initHeroCanvas();

    // Inject accordion HTML at all screen sizes (mobile gets stacked layout via CSS)
    // MUST BE RUN BEFORE GSAP to allow ScrollTrigger querying to succeed
    initServicesAccordion();

    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        initLenisScroll();

        // Delay scroll and interactive animations slightly until React hydration has finished
        const runAnimInit = () => {
            setTimeout(() => {
                initHeroParallax();
                initProcessReveal();
                initClientsBgZoom();

                // Scope scroll-pinned interactive animations strictly to desktop viewports (min-width: 1200px)
                const mm = gsap.matchMedia();
                mm.add("(min-width: 1200px)", () => {
                    initAboutScattering();
                });

                // Refresh ScrollTrigger to ensure all layout offsets are accurate
                ScrollTrigger.refresh();
                console.log('[AmpleAI] ✓ Delayed GSAP animations initialized');
            }, 800);
        };

        if (document.readyState === 'complete') {
            runAnimInit();
        } else {
            window.addEventListener('load', runAnimInit);
        }
    }


    // Patch testimonials section to show single Lumothrive client
    patchTestimonialsSection();
    initVoicesTicker();
    patchPricingSection();

    // Initialize MutationObserver to intercept branding, images, and counters
    // Delayed until after window load + 500ms to prevent React hydration mismatch crashes
    if (document.readyState === 'complete') {
        setTimeout(initRuntimeInterceptors, 500);
    } else {
        window.addEventListener('load', () => {
            setTimeout(initRuntimeInterceptors, 500);
        });
    }

    // Double RAF: let hidden CSS state render for 1 frame before observing
    // This ensures CSS transitions actually play (not instant snap)
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            initScrollAnimations();
        });
    });

    document.body.classList.add('js-loaded');
    console.log('%c✦ AmpletechAI v12', 'color:#a8ff78;font-weight:bold;font-size:14px');
}

// Bypasses HMR DOMContentLoaded racing condition in Vite
if (document.readyState !== 'loading') {
    init();
} else {
    document.addEventListener('DOMContentLoaded', init);
}


/* ─────────────────────────────────────────────────────────
   SECTION IDs
   ───────────────────────────────────────────────────────── */
function assignSectionIds() {
    document.querySelectorAll('[data-framer-name]').forEach(el => {
        const slug = SECTION_MAP[el.getAttribute('data-framer-name')];
        if (slug && !el.id) el.id = slug;
    });
}


/* ─────────────────────────────────────────────────────────
   UNLOCK FRAMER HIDDEN ELEMENTS
   ───────────────────────────────────────────────────────── */
function unlockHiddenElements() {
    document.querySelectorAll('[data-framer-appear-id]').forEach(el => {
        el.removeAttribute('data-framer-appear-id');
        if (el.style.opacity === '0') el.style.opacity = '';
        el.style.visibility = '';
    });
}


/* ─────────────────────────────────────────────────────────
   LENIS
   ───────────────────────────────────────────────────────── */
function initLenisScroll() {
    if (typeof Lenis === 'undefined') return;
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true, autoRaf: false });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
}


/* ─────────────────────────────────────────────────────────
   HERO VIDEO BACKGROUND — Altrion's actual looping video
   ───────────────────────────────────────────────────────── */
function initHeroCanvas() {
    const hero = document.querySelector('section.framer-17rykba[data-framer-name="Hero"]');
    if (!hero) return;

    // Check if video is already statically injected in index.html to avoid duplicates
    const existingVid = document.getElementById('ampleai-hero-video');
    if (existingVid) {
        existingVid.play().catch(() => console.log('[AmpleAI] Autoplay deferred'));
        console.log('[AmpleAI] ✓ Existing hero video found and playing');
        return;
    }

    // STEP 2: Create the video element (fallback if not in HTML)
    const vid = document.createElement('video');
    vid.id = 'ampleai-hero-video';
    vid.autoplay = true;
    vid.muted = true;
    vid.loop = true;
    vid.playsInline = true;
    vid.setAttribute('aria-hidden', 'true');

    const src = document.createElement('source');
    src.src = '/hero-bg.mp4';
    src.type = 'video/mp4';
    vid.appendChild(src);

    // STEP 3: Position BEHIND all Framer content (z-index: 0)
    // Framer's content divs naturally stack above at higher z-index
    Object.assign(vid.style, {
        position:       'absolute',
        top:            '0',
        left:           '0',
        width:          '100%',
        height:         '100%',
        objectFit:      'cover',
        objectPosition: 'center',
        zIndex:         '0',       // behind Framer content, above section bg color
        pointerEvents:  'none',
        opacity:        '1',       // full opacity — no double-layering now
    });

    // Make hero relatively positioned
    if (getComputedStyle(hero).position === 'static') hero.style.position = 'relative';

    // Insert as FIRST child so Framer content is naturally above it
    hero.insertBefore(vid, hero.firstChild);

    vid.play().catch(() => console.log('[AmpleAI] Autoplay deferred'));
    console.log('[AmpleAI] ✓ Hero video injected, Framer BG hidden');
}


/* ─────────────────────────────────────────────────────────
   HERO PARALLAX
   ───────────────────────────────────────────────────────── */
function initHeroParallax() {
    const bgEl = document.querySelector(
        '[data-framer-name="BG Image"],[data-framer-name="BG"],[data-framer-name="Robot"]'
    );
    if (!bgEl) return;
    let mx = 0, my = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', e => {
        mx = (e.clientX / window.innerWidth  - .5) * 14;
        my = (e.clientY / window.innerHeight - .5) * 14;
    });
    (function tick() {
        cx += (mx - cx) * .055; cy += (my - cy) * .055;
        gsap.set(bgEl, { x: cx, y: cy, force3D: true });
        requestAnimationFrame(tick);
    })();
}


/* ─────────────────────────────────────────────────────────
   BENTO SPOTLIGHT
   ───────────────────────────────────────────────────────── */
function applyCardHoverClasses() {
    const cards = document.querySelectorAll('[data-border="true"]');
    cards.forEach(card => {
        if (card.tagName === 'INPUT' || card.tagName === 'TEXTAREA') return;
        
        // Exclude nested sub-cards/sub-borders inside link tags to prevent inner blocks from popping out independently
        if (card.parentElement && card.parentElement.closest('a')) return;
        
        // Exclude specific text/list tag names
        const excludeTags = ['LI', 'P', 'SPAN', 'IMG', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'INPUT', 'TEXTAREA', 'BUTTON', 'A'];
        if (excludeTags.includes(card.tagName)) return;
        
        // Exclude elements inside FAQ accordion/questions/answers
        const isFaq = card.closest('[class*="faq" i], [class*="accordion" i], [class*="question" i], [class*="answer" i]');
        if (isFaq) return;
        
        // Exclude list items or elements inside list items (e.g. features list)
        if (card.closest('li')) return;
        
        // Exclude elements inside forms or headers/navs/footers
        if (card.closest('form') || card.closest('header, footer, nav') || card.closest('[class*="nav" i], [class*="menu" i], [class*="header" i], [class*="footer" i]')) return;
        
        const path = getDomPath(card);
        if (excludedElements.has(card) || excludedPaths.has(path)) {
            if (card.classList.contains('amp-card-hover')) {
                card.classList.remove('amp-card-hover');
            }
            return;
        }

        const name = (card.getAttribute('data-framer-name') || '').toLowerCase();
        const nameExcluded = ['nav', 'menu', 'header', 'footer', 'white', 'dark', 'wrap', 'center', 'default', 'divider', 'button', 'toggle', 'indicator', 'badge'].some(k => name.includes(k));
        
        const sec = card.closest('section');
        const secName = sec ? (sec.getAttribute('data-framer-name') || '').toLowerCase() : '';
        const secExcluded = ['services', 'hero', 'clients', 'step', 'why choose', 'team', 'stat', 'client voices', 'faq', 'question', 'pricing', 'contact', 'legal', 'footer', 'nav'].some(k => secName.includes(k));
        
        if (nameExcluded || secExcluded) {
            excludedElements.add(card);
            excludedPaths.add(path);
            if (card.classList.contains('amp-card-hover')) {
                card.classList.remove('amp-card-hover');
            }
            return;
        }

        if (!card.classList.contains('amp-card-hover')) {
            card.classList.add('amp-card-hover');
        }
        
        // Mark card as clickable if it is a link or contains a link/button
        const isClickable = card.tagName === 'A' || 
                            card.closest('a') !== null || 
                            card.querySelector('a, button, [role="button"]') !== null;
                            
        if (isClickable) {
            card.classList.add('amp-clickable');
        } else {
            card.classList.remove('amp-clickable');
        }
    });
}

function initBentoSpotlight() {
    applyCardHoverClasses();
    
    let activeCard = null;
    document.addEventListener('mousemove', e => {
        const card = e.target.closest('.amp-card-hover');
        if (card) {
            if (activeCard && activeCard !== card) {
                activeCard.style.setProperty('--mouse-x', '-9999px');
                activeCard.style.setProperty('--mouse-y', '-9999px');
            }
            activeCard = card;
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
        } else if (activeCard) {
            activeCard.style.setProperty('--mouse-x', '-9999px');
            activeCard.style.setProperty('--mouse-y', '-9999px');
            activeCard = null;
        }
    });
}


/* ─────────────────────────────────────────────────────────
   AMBIENT GLOW BLOBS
   ───────────────────────────────────────────────────────── */
function initAmbientGlowBlobs() {
    if (document.querySelector('.ambient-glow-blob')) return;
    const b1 = document.createElement('div');
    b1.className = 'ambient-glow-blob blob-1';
    const b2 = document.createElement('div');
    b2.className = 'ambient-glow-blob blob-2';
    document.body.appendChild(b1);
    document.body.appendChild(b2);
}


/* ─────────────────────────────────────────────────────────
   SCROLL ANIMATIONS — IntersectionObserver + CSS transitions
   Double-RAF ensures hidden state renders before observe starts
   ───────────────────────────────────────────────────────── */
function initScrollAnimations() {
    const hero = document.querySelector('[data-framer-name="Hero"]');

    // ── Step tiles: each section[data-framer-name="Step"] (Excluded from overall section fade to allow step-by-step card reveals) ──
    const steps = [...document.querySelectorAll('section[data-framer-name="Step"]')];
    console.log(`[AmpleAI] Step tiles found: ${steps.length}`);
    // addFade(steps); // Excluded to prevent the whole section from popping up together


    // ── Cards / bordered elements (not in hero) ──
    const cards = [...document.querySelectorAll('[data-border="true"]')]
        .filter(c => !hero?.contains(c) && 
                    !c.closest('#process') && // Filter out process cards to use GSAP ScrollTrigger instead
                    !c.classList.contains('ample-service-col') && 
                    !c.classList.contains('ample-services-desktop') && 
                    !c.classList.contains('ample-card-scatter') && 
                    !c.classList.contains('ample-card-center') && 
                    !c.classList.contains('ample-about-right'));
    cards.forEach((c, i) => { c.style.transitionDelay = `${(i % 4) * 0.09}s`; });
    addFade(cards);

    // ── Section headings ──
    const headings = [...document.querySelectorAll(
        'section[data-framer-name]:not([data-framer-name="Hero"]) h2,' +
        'section[data-framer-name]:not([data-framer-name="Hero"]) h3'
    )];
    addFade(headings);

    // ── Text blocks (first 6 per section) ──
    const seen = new Set();
    const texts = [];
    document.querySelectorAll(
        'section[data-framer-name]:not([data-framer-name="Hero"]) [data-framer-component-type="RichTextContainer"]'
    ).forEach(t => {
        const sec = t.closest('section[data-framer-name]');
        const key = sec?.getAttribute('data-framer-name');
        if (!key) return;
        if (!seen.has(key)) seen.set ? seen.set(key, 0) : (seen[key] = 0); // fallback
        const count = seen[key] || 0;
        if (count < 6) { texts.push(t); seen[key] = count + 1; }
    });
    addFade(texts);
}

function addFade(elements) {
    if (!elements.length) return;
    elements.forEach(el => el.classList.add('amp-fade'));

    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('amp-visible');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    elements.forEach(el => io.observe(el));
}


/* ─────────────────────────────────────────────────────────
   MENU
   ───────────────────────────────────────────────────────── */
function buildAndInjectMenu() {
    if (document.getElementById('ampleai-menu-drawer')) return;
    const d = document.createElement('div');
    d.id = 'ampleai-menu-drawer';
    d.setAttribute('aria-hidden', 'true');
    d.setAttribute('role', 'dialog');
    d.innerHTML = `
        <div id="ampleai-menu-topbar">
            <button id="ampleai-menu-close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg><span>CLOSE</span></button>
            <div id="ampleai-menu-logo-center">AmpletechAI</div>
            <a href="https://cal.com/" target="_blank" rel="noopener" id="ampleai-menu-book-btn">BOOK A CALL <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 10L10 1M10 1H4M10 1v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></a>
        </div>
        <div id="ampleai-menu-body">
            <div id="ampleai-menu-left"><nav id="ampleai-menu-links">
                ${MENU_LINKS.map(l => {
                    const href = l.href || `#${l.slug||''}`;
                    return `<a href="${href}" class="ampleai-menu-link" ${l.href?'target="_blank" rel="noopener" data-external="true"':`data-slug="${l.slug||''}"`}><span>${l.label}</span><span class="ampleai-menu-link-arrow">↗</span></a>`;
                }).join('')}
            </nav></div>
            <div id="ampleai-menu-right">
                <div id="ampleai-menu-tagline"><h3>DISCOVER THE VISION AND VALUES DRIVING AMPLETECHAI FORWARD</h3>
                    <div id="ampleai-menu-globe"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="1.2"/><path d="M2 12h20M12 2a14 14 0 010 20M12 2a14 14 0 000 20" stroke="rgba(255,255,255,0.3)" stroke-width="1.2"/></svg>
                    <span>10.850° N · 76.271° E</span></div>
                </div>
                <div id="ampleai-menu-info">
                    <div class="ampleai-menu-info-block"><h4>LOCATION</h4><p>Enterprise Hub, Kakkanad<br>Kochi, Kerala<br>India 682 030</p></div>
                    <div class="ampleai-menu-info-block"><h4>CONTACT ON</h4><p>+91 7XXXXXXXXX</p><a href="mailto:hello@ampletechai.com">HELLO@AMPLETECHAI.COM</a></div>
                </div>
            </div>
        </div>`;
    document.body.appendChild(d);
    document.getElementById('ampleai-menu-close').addEventListener('click', closeMenu);
    d.querySelectorAll('.ampleai-menu-link').forEach(a => {
        a.addEventListener('click', e => {
            if (a.dataset.external === 'true') { closeMenu(); return; }
            e.preventDefault();
            const slug = a.dataset.slug;
            closeMenu();
            setTimeout(() => {
                const t = slug ? document.getElementById(slug) : null;
                if (t) {
                    if (window.__lenis) window.__lenis.scrollTo(t, { offset: -80 });
                    else t.scrollIntoView({ behavior: 'smooth' });
                } else if (slug) {
                    if (slug === 'about') {
                        window.location.href = '/about-us.html';
                    } else if (slug === 'case-studies') {
                        window.location.href = '/case-studies.html';
                    } else if (slug === 'contact') {
                        window.location.href = '/contact.html';
                    } else if (slug === 'blog') {
                        window.location.href = '/blog.html';
                    } else {
                        window.location.href = `/index.html#${slug}`;
                    }
                }
            }, 350);
        });
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
}

function wireHamburger() {
    document.querySelectorAll('.framer-kl0AZ').forEach(h => {
        h.style.cursor = 'pointer';
        h.setAttribute('role', 'button');
        h.setAttribute('tabindex', '0');
        h.addEventListener('click', openMenu);
        h.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openMenu(); });
    });
}

function openMenu() {
    const d = document.getElementById('ampleai-menu-drawer');
    if (!d) return;
    document.body.classList.add('ampleai-menu-open');
    d.setAttribute('aria-hidden', 'false');
    d.style.display = 'block';
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(d, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
        gsap.fromTo('#ampleai-menu-topbar', { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.35, delay: 0.05 });
        gsap.fromTo('.ampleai-menu-link', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.07, delay: 0.1 });
        gsap.fromTo('#ampleai-menu-right', { opacity: 0 }, { opacity: 1, duration: 0.45, delay: 0.2 });
    }
    document.getElementById('ampleai-menu-close')?.focus();
}

function closeMenu() {
    const d = document.getElementById('ampleai-menu-drawer');
    if (!d) return;
    document.body.classList.remove('ampleai-menu-open');
    d.setAttribute('aria-hidden', 'true');
    if (typeof gsap !== 'undefined') {
        gsap.to(d, { opacity: 0, duration: 0.25, onComplete: () => { d.style.display = 'none'; } });
    } else { d.style.display = 'none'; }
}


/* ─────────────────────────────────────────────────────────
   PROCESS REVEAL — Cards fade and slide up one-by-one on scroll
   ───────────────────────────────────────────────────────── */
function initProcessReveal() {
    if (!window.gsap || !window.ScrollTrigger) return;

    const mm = gsap.matchMedia();

    // Helper to find the active element (desktop vs mobile)
    const getActiveEl = (selector) => {
        const elements = document.querySelectorAll(selector);
        for (let el of elements) {
            const parent = el.closest('.ssr-variant');
            if (parent && window.getComputedStyle(parent).display !== 'none') {
                return el;
            }
        }
        return elements[0];
    };

    // Desktop: Pin and stack cards sequentially
    mm.add("(min-width: 1200px)", () => {
        const stepsContainer = document.querySelector('.framer-ly6508');
        if (!stepsContainer) return;

        const card1 = getActiveEl('.framer-9hd1tq-container');
        const card2 = getActiveEl('.framer-sb1e2m-container');
        const card3 = getActiveEl('.framer-1qzupzc-container');
        const card4 = getActiveEl('.framer-sc5l4v-container');

        if (!card1 || !card2 || !card3 || !card4) return;

        // Reset any inline styles first to prevent conflicts
        gsap.killTweensOf([card1, card2, card3, card4]);

        // Card 1 starts visible (Step 1). Cards 2, 3, 4 start hidden and scaled down.
        gsap.set(card1, { opacity: 1, scale: 1, y: 0 });
        gsap.set([card2, card3, card4], { opacity: 0, scale: 0.9, y: 80 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: stepsContainer,
                start: "top 270px",          // Align with CSS top: 270px sticky offset
                end: "bottom 620px",         // Duration maps to the native scroll height of the container
                scrub: 1,                    // Smooth scrub tied to scroll velocity
                invalidateOnRefresh: true
            }
        });

        // 1. Reveal Step 2 (Card 2) on the right
        tl.to(card2, { opacity: 1, scale: 1, y: 0, duration: 1, ease: "power2.out" });

        // 2. Dim Step 1 (Card 1) and overlap Step 3 (Card 3) on the left
        tl.to(card1, { opacity: 0.25, scale: 0.96, duration: 0.5, ease: "power2.out" }, "+=0.3")
          .to(card3, { opacity: 1, scale: 1, y: 0, duration: 1, ease: "power2.out" }, "<");

        // 3. Dim Step 2 (Card 2) and overlap Step 4 (Card 4) on the right
        tl.to(card2, { opacity: 0.25, scale: 0.96, duration: 0.5, ease: "power2.out" }, "+=0.3")
          .to(card4, { opacity: 1, scale: 1, y: 0, duration: 1, ease: "power2.out" }, "<");
          
        // Add a small pause at the end for user convenience
        tl.to({}, { duration: 0.3 });
    });

    // Mobile/Tablet: Single-column normal scroll reveals
    mm.add("(max-width: 1199.98px)", () => {
        const containers = [
            '.framer-9hd1tq-container',
            '.framer-sb1e2m-container',
            '.framer-1qzupzc-container',
            '.framer-sc5l4v-container'
        ];

        containers.forEach(sel => {
            const elements = document.querySelectorAll(sel);
            elements.forEach(card => {
                const parent = card.closest('.ssr-variant');
                if (parent && window.getComputedStyle(parent).display === 'none') return;

                // Ensure initial visible state on mobile since they flow vertically
                gsap.set(card, { opacity: 0, y: 50, scale: 0.95 });

                gsap.to(card, {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                        toggleActions: "play none none none"
                    }
                });
            });
        });
    });

    console.log('[AmpleAI] ✓ Process step reveals initialized');
}


/* ─────────────────────────────────────────────────────────
   ABOUT CARD DISPERSAL (Cinematic Scroll Pinning & Scattering)
   ───────────────────────────────────────────────────────── */
function initAboutScattering() {
    const sec = document.querySelector('[data-framer-name="About"]');
    const container = document.querySelector('.ample-about-container');
    const leftCol = document.querySelector('.ample-about-left');
    const centerCard = document.querySelector('.ample-card-center');
    const rightList = document.querySelector('.ample-about-right');
    const scatterCards = document.querySelectorAll('.ample-card-scatter');

    if (!sec || !container || !centerCard || !rightList || scatterCards.length === 0) return;

    // Create a ScrollTrigger timeline to pin the About section
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: sec,
            start: "top top",
            end: "+=220%",
            pin: true,
            pinSpacing: true,
            scrub: 0.5,
            anticipatePin: 1,
            invalidateOnRefresh: true,
        }
    });

    // Phase 1: Fade out the right bullet advantages list
    tl.to(rightList, {
        opacity: 0,
        x: 60,
        pointerEvents: 'none',
        duration: 0.8,
        ease: "power2.inOut"
    }, "start");

    // Phase 2: Disperse / scatter the cards from behind Amanda Reed's card!
    // Card 1: Mannequin Visual Card (right visual) -> rotates + moves to right
    tl.fromTo('.ample-card-scatter-1', {
        opacity: 0,
        x: 0,
        y: 0,
        scale: 0.8,
        rotation: 0
    }, {
        opacity: 1,
        x: 350,
        y: 20,
        scale: 1,
        rotation: 8,
        duration: 1.2,
        ease: "power3.out",
        onComplete: () => {
            const el = document.querySelector('.ample-card-scatter-1');
            if (el) el.classList.add('amp-active');
        },
        onReverseComplete: () => {
            const el = document.querySelector('.ample-card-scatter-1');
            if (el) el.classList.remove('amp-active');
        }
    }, "scatter");

    // Card 2: Partner logos / consulting card (left milestone) -> rotates + moves to left
    tl.fromTo('.ample-card-scatter-2', {
        opacity: 0,
        x: 0,
        y: 0,
        scale: 0.8,
        rotation: 0
    }, {
        opacity: 1,
        x: -330,
        y: 60,
        scale: 1,
        rotation: -8,
        duration: 1.2,
        ease: "power3.out",
        onComplete: () => {
            const el = document.querySelector('.ample-card-scatter-2');
            if (el) el.classList.add('amp-active');
        },
        onReverseComplete: () => {
            const el = document.querySelector('.ample-card-scatter-2');
            if (el) el.classList.remove('amp-active');
        }
    }, "scatter");

    // Card 3: Glossy render card (outer top) -> moves to outer top or stays hidden / small offset
    tl.fromTo('.ample-card-scatter-3', {
        opacity: 0,
        x: 0,
        y: 0,
        scale: 0.8,
        rotation: 0
    }, {
        opacity: 1,
        x: 100,
        y: -180,
        scale: 0.95,
        rotation: 4,
        duration: 1.2,
        ease: "power3.out",
        onComplete: () => {
            const el = document.querySelector('.ample-card-scatter-3');
            if (el) el.classList.add('amp-active');
        },
        onReverseComplete: () => {
            const el = document.querySelector('.ample-card-scatter-3');
            if (el) el.classList.remove('amp-active');
        }
    }, "scatter");

    // Card 4: Retainer stats / 95% client rate card (bottom right) -> moves to bottom right
    tl.fromTo('.ample-card-scatter-4', {
        opacity: 0,
        x: 0,
        y: 0,
        scale: 0.8,
        rotation: 0
    }, {
        opacity: 1,
        x: 320,
        y: 350,
        scale: 1,
        rotation: -4,
        duration: 1.2,
        ease: "power3.out",
        onComplete: () => {
            const el = document.querySelector('.ample-card-scatter-4');
            if (el) el.classList.add('amp-active');
        },
        onReverseComplete: () => {
            const el = document.querySelector('.ample-card-scatter-4');
            if (el) el.classList.remove('amp-active');
        }
    }, "scatter");

    // Slightly rotate the main Center Amanda Card too for organic depth!
    tl.to(centerCard, {
        rotation: 2,
        y: -20,
        duration: 1.2,
        ease: "power3.out"
    }, "scatter");
}

/* ─────────────────────────────────────────────────────────
   SERVICES ACCORDION — Part 1: Custom HTML Injection
   Runs at ALL screen sizes. Mobile gets stacked CSS layout.
   Desktop gets the horizontal accordion via Part 2 GSAP.
   ───────────────────────────────────────────────────────── */function initServicesAccordion() {
    const sec = document.querySelector('[data-framer-name="Services"]');
    if (!sec) return;
    // Guard: only inject once
    if (sec.querySelector('.as-wrapper')) return;

    // ── Service data ──────────────────────────────────────────
    const SERVICES = [
        {
            num: '00-1',
            title: 'AI Strategy & Roadmap',
            desc: 'We help you identify the most impactful areas for AI adoption and create a clear path to get there.',
            pills: ['Competitive benchmarking', 'Strategic planning', 'Opportunity analysis', 'Scalable roadmap'],
            bg: 'https://framerusercontent.com/images/i2SBWnvwttbCZ7DYLasXh0Eu2Lc.jpg'
        },
        {
            num: '00-2',
            title: 'Workflow Automation',
            desc: 'We streamline your daily operations with AI-driven workflows that reduce manual effort, minimize errors, and accelerate business efficiency.',
            pills: ['Process optimization', 'Task automation', 'Workflow scalability'],
            bg: 'https://framerusercontent.com/images/kX6UGNrNBUlQcVx3r8UK6341ocg.jpg'
        },
        {
            num: '00-3',
            title: 'AI agents & systems',
            desc: 'We build AI agents — voice, chat, and workflow-based — that plug directly into your existing tools and handle real tasks end-to-end.',
            pills: ['Voice & chat AI agents', 'System integrations', 'Autonomous task handling'],
            bg: 'https://framerusercontent.com/images/dtjDJ9jrNxrPfsdEAjTDnyuOP4g.jpg'
        },
        {
            num: '00-4',
            title: 'Data Strategy & Management',
            desc: 'We help you build a strong data foundation — from collection to analysis — ensuring accuracy, accessibility, and actionable insights.',
            pills: ['Data governance', 'Quality assurance'],
            bg: 'https://framerusercontent.com/images/LzbCZTNq3OFIQ6xvgQSummbSDg.jpg'
        }
    ];

    // ── Build HTML ────────────────────────────────────────────
    const panelsHTML = SERVICES.map((s, i) => `
        <div class="as-panel${i === 0 ? ' as-active' : ''}" data-idx="${i}">
            <div class="as-panel-bg" style="background-image: url('${s.bg}');"></div>
            <div class="as-panel-overlay"></div>
            <div class="as-panel-content">
                <span class="as-panel-num">${s.num}</span>
                <div class="as-panel-expanded-top">
                    <h3 class="as-expanded-title">${s.title}</h3>
                    <p class="as-desc">${s.desc}</p>
                </div>
                <div class="as-panel-expanded-bottom">
                    <div class="as-includes-label">Includes</div>
                    <div class="as-pills">${s.pills.map(p => `<span class="as-pill">${p}</span>`).join('')}</div>
                </div>
                <div class="as-collapsed-title">${s.title}</div>
            </div>
        </div>
    `).join('');

    const ctaHTML = `
        <div class="as-panel as-cta">
            <div class="as-panel-content">
                <div class="as-cta-logo">AmpletechAI</div>
                <div class="as-cta-content">
                    <h3 class="as-cta-heading">Start your AI journey with us</h3>
                    <a href="contact.html" class="as-cta-btn">
                        Let's Talk
                        <svg viewBox="0 0 11 11" fill="none"><path d="M1 10L10 1M10 1H4M10 1v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                    </a>
                </div>
            </div>
        </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.className = 'as-wrapper';
    wrapper.innerHTML = `<div class="as-track">${panelsHTML}${ctaHTML}</div>`;

    // Inject into the Framer Wrap container, or directly into the section
    const wrapEl = sec.querySelector('[data-framer-name="Wrap"]');
    if (wrapEl) {
        wrapEl.appendChild(wrapper);
    } else {
        sec.appendChild(wrapper);
    }

    // Add hover and click interactions for accordion panels
    const track = wrapper.querySelector('.as-track');
    const panels = Array.from(wrapper.querySelectorAll('.as-panel:not(.as-cta)'));

    if (track && panels.length > 0) {
        panels.forEach(panel => {
            // Mouse hover for desktop
            panel.addEventListener('mouseenter', () => {
                if (window.innerWidth >= 1200) {
                    panels.forEach(p => p.classList.remove('as-active'));
                    panel.classList.add('as-active');
                }
            });

            // Tap/Click for mobile and touch devices
            panel.addEventListener('click', () => {
                if (window.innerWidth < 1200) {
                    panels.forEach(p => p.classList.remove('as-active'));
                    panel.classList.add('as-active');
                }
            });
        });

        // Mouse leave track resets to first panel (desktop only)
        track.addEventListener('mouseleave', () => {
            if (window.innerWidth >= 1200) {
                panels.forEach(p => p.classList.remove('as-active'));
                panels[0].classList.add('as-active');
            }
        });
    }

    console.log('[AmpletechAI] ✓ Custom Services accordion injected and hover handlers bound');
}
/* ─────────────────────────────────────────────────────────
   DYNAMIC RUNTIME INTERCEPTORS
   ───────────────────────────────────────────────────────── */

function fixStatsCounters() {
    // ONLY run on the homepage — skip on all other pages
    const isHomepage = window.location.pathname === '/' || 
                       window.location.pathname === '/index.html' ||
                       window.location.pathname.endsWith('/index.html');
    if (!isHomepage) return;

    // Direct targeted replacements for the 3 homepage stat columns
    const fasterAIEls = document.querySelectorAll('.framer-gcuxec-container .framer-cmyx3u-container');
    const uptimeEls = document.querySelectorAll('.framer-1ta63gf-container .framer-cmyx3u-container');
    const businessesEls = document.querySelectorAll('.framer-g534p2-container .framer-cmyx3u-container');

    let patched = 0;
    fasterAIEls.forEach(el => {
        if (el.querySelector('.amp-counter-fixed')) return;
        el.innerHTML = '<div class="amp-counter-fixed"><span>5</span><span class="amp-counter-unit">X</span></div>';
        patched++;
    });

    uptimeEls.forEach(el => {
        if (el.querySelector('.amp-counter-fixed')) return;
        el.innerHTML = '<div class="amp-counter-fixed"><span>99</span><span class="amp-counter-unit">%</span></div>';
        patched++;
    });

    businessesEls.forEach(el => {
        if (el.querySelector('.amp-counter-fixed')) return;
        el.innerHTML = '<div class="amp-counter-fixed"><span>62</span><span class="amp-counter-unit">+</span></div>';
        patched++;
    });

    return patched;
}

function swapWatermarkedImages() {
    document.querySelectorAll('img').forEach(img => {
        for (const [key, localSrc] of Object.entries(IMAGE_MAP)) {
            if (img.src.includes(key) && img.getAttribute('data-swapped') !== key) {
                img.src = localSrc;
                img.setAttribute('data-swapped', key);
                break;
            }
        }
    });
}

function swapWatermarkedBackgrounds() {
    document.querySelectorAll('[style*="framerusercontent.com"]').forEach(el => {
        const bg = el.style.backgroundImage;
        if (bg) {
            for (const [key, localSrc] of Object.entries(IMAGE_MAP)) {
                if (bg.includes(key) && el.getAttribute('data-bg-swapped') !== key) {
                    el.style.backgroundImage = `url("${localSrc}")`;
                    el.setAttribute('data-bg-swapped', key);
                    break;
                }
            }
        }
    });
}

function replaceTextBranding(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        let text = node.nodeValue;
        let changed = false;
        
        if (text.includes('Altrion')) {
            text = text.replace(/Altrion/g, 'AmpletechAI');
            changed = true;
        }
        if (text.includes('ALTRION')) {
            text = text.replace(/ALTRION/g, 'AMPLETECHAI');
            changed = true;
        }
        if (text.includes('altrion')) {
            text = text.replace(/altrion/g, 'ampletechai');
            changed = true;
        }
        if (text.includes('AmpleAI')) {
            text = text.replace(/AmpleAI/g, 'AmpletechAI');
            changed = true;
        }
        if (text.includes('AMPLEAI')) {
            text = text.replace(/AMPLEAI/g, 'AMPLETECHAI');
            changed = true;
        }
        if (text.includes('ampleai')) {
            text = text.replace(/ampleai/g, 'ampletechai');
            changed = true;
        }
        
        if (changed) {
            node.nodeValue = text;
        }
    } else {
        if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE' && node.nodeName !== 'IFRAME') {
            for (let child of node.childNodes) {
                replaceTextBranding(child);
            }
        }
    }
}


function updateKochiClock() {
    const clocks = document.querySelectorAll('[data-code-component-plugin-id="84d4c1"]');
    clocks.forEach(el => {
        const text = el.textContent.trim();
        if (text.includes('AM') || text.includes('PM') || text.includes(':')) {
            const kochiTime = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000) + (new Date().getTimezoneOffset() * 60 * 1000));
            const dayName = kochiTime.toLocaleDateString('en-US', { weekday: 'long' });
            let hours = kochiTime.getHours();
            const minutes = String(kochiTime.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const timeStr = `${dayName}, ${hours}:${minutes} ${ampm}`;
            
            const targetChild = el.querySelector('div') || el;
            if (targetChild.textContent !== timeStr) {
                targetChild.textContent = timeStr;
            }
        }
    });
}


function initWhatWeBuildInteractions() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    const totalSteps = 5;

    // Timeline mapping scroll scrub to dot movement & step activation
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".showcase-scroll-container",
            start: "top top",
            end: "+=3200",
            scrub: true,
            pin: true,
            anticipatePin: 1
        }
    });

    // Animate glowing indicator dot down the vertical line
    tl.to(".showcase-timeline-dot", {
        y: "280px",
        ease: "none",
        duration: totalSteps - 1
    }, 0);

    // Stagger step activations & panel crossfades
    for (let i = 1; i < totalSteps; i++) {
        const timeOffset = i; // Maps scroll progress intervals
        
        tl.to(`.showcase-step-item[data-step='${i}']`, { opacity: 0.25, duration: 0.3 }, timeOffset - 0.2)
          .to(`.showcase-step-item[data-step='${i+1}']`, { opacity: 1, duration: 0.3 }, timeOffset - 0.2)
          
          .to(`.showcase-panel[data-panel='${i}']`, { opacity: 0, scale: 0.96, duration: 0.3 }, timeOffset - 0.2)
          .to(`.showcase-panel[data-panel='${i+1}']`, { opacity: 1, scale: 1, duration: 0.3 }, timeOffset - 0.2)
          
          .to(`.showcase-dot[data-dot='${i}']`, { backgroundColor: "rgba(255,255,255,0.15)", scale: 1, duration: 0.2 }, timeOffset - 0.2)
          .to(`.showcase-dot[data-dot='${i+1}']`, { backgroundColor: "#ffffff", scale: 1.2, duration: 0.2 }, timeOffset - 0.2);
      }

    // explore solutions scroll binder
    const exploreBtn = document.getElementById('btn-explore-solutions-new');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById('expertise') || document.querySelector('[data-framer-name="Services"]');
            if (target) {
                if (window.__lenis) {
                    window.__lenis.scrollTo(target, { offset: -80 });
                } else {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }
}

function ensureGradientBeam() {
    // ONLY run on the homepage — skip on all other pages
    const isHomepage = window.location.pathname === '/' || 
                       window.location.pathname === '/index.html' ||
                       window.location.pathname.endsWith('/index.html');
    if (!isHomepage) return;

    const statsEl = document.querySelector('.framer-1v6c2xt') || document.querySelector('[data-framer-name="Stats"]');
    if (statsEl) {
        let beam = statsEl.querySelector('.framer-bt8dal');
        if (!beam) {
            beam = document.createElement('div');
            beam.className = 'framer-bt8dal';
            beam.setAttribute('data-framer-name', 'Vector');
            beam.style.height = 'auto';
            beam.style.aspectRatio = '5.049019607843137';
            beam.innerHTML = `
                <div style="position:absolute; border-radius:inherit; corner-shape:inherit; top:0; right:0; bottom:0; left:0" data-framer-background-image-wrapper="true">
                    <img decoding="async" width="1030" height="204" src="https://framerusercontent.com/images/Rm9MgzczWnTc9jYB5lgdVxdMXA.png?width=1030&height=204" alt="Vector" style="display:block; width:100%; height:100%; border-radius:inherit; corner-shape:inherit; object-position:center; object-fit:cover">
                </div>
            `;
            statsEl.appendChild(beam);
            console.log('[AmpletechAI] ✓ Gradient beam created and appended to Stats container');
        }
    }
}

function moveStatsBelowAccordion() {
    // ONLY run on the homepage — skip on all other pages
    const isHomepage = window.location.pathname === '/' || 
                       window.location.pathname === '/index.html' ||
                       window.location.pathname.endsWith('/index.html');
    if (!isHomepage) return;

    const servicesSec = document.querySelector('[data-framer-name="Services"]');
    const statsEl = document.querySelector('.framer-1v6c2xt') || document.querySelector('[data-framer-name="Stats"]');
    if (servicesSec && statsEl) {
        const wrapEl = servicesSec.querySelector('[data-framer-name="Wrap"]') || servicesSec;
        // Check if statsEl is already a direct child of wrapEl and is positioned at the end
        if (statsEl.parentElement !== wrapEl || statsEl.nextSibling !== null) {
            wrapEl.appendChild(statsEl);
            console.log('[AmpletechAI] ✓ Stats container moved below the custom Services accordion in DOM');
        }
    }
}

function initRuntimeInterceptors() {
    // Run initial scan
    moveStatsBelowAccordion();
    ensureGradientBeam();
    fixStatsCounters();
    swapWatermarkedImages();
    swapWatermarkedBackgrounds();
    replaceTextBranding(document.body);
    applyCardHoverClasses();
    patchPricingSection();
    updateKochiClock();
    setInterval(updateKochiClock, 10000);
    initWhatWeBuildInteractions();

    // Retry stats replacements after Framer hydration (it renders async)
    const retryDelays = [500, 1500, 3000, 5000];
    retryDelays.forEach(delay => {
        setTimeout(() => {
            moveStatsBelowAccordion();
            ensureGradientBeam();
            const patched = fixStatsCounters();
            swapWatermarkedImages();
            if (patched) console.log(`[AmpletechAI] ✓ Stats patched after ${delay}ms delay (${patched} elements)`);
        }, delay);
    });
    
    // Setup MutationObserver for dynamic updates
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(m => {
            if (m.type === 'childList') {
                m.addedNodes.forEach(node => {
                    replaceTextBranding(node); 
                });
            } else if (m.type === 'characterData') {
                replaceTextBranding(m.target);
            }
        });
        
        applyCardHoverClasses();
        patchPricingSection();
        moveStatsBelowAccordion();
        ensureGradientBeam();
        fixStatsCounters();
        swapWatermarkedImages();
        swapWatermarkedBackgrounds();
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
}

/* ─────────────────────────────────────────────────────────
   CLIENTS SECTION BACKGROUND ZOOM (Scroll-driven Zoom)
   ───────────────────────────────────────────────────────── */
function initClientsBgZoom() {
    if (!window.gsap || !window.ScrollTrigger) return;

    const bgImgs = document.querySelectorAll('.framer-beuh1o img');
    const triggerSection = document.querySelector('.framer-x5sepb');

    if (bgImgs.length === 0 || !triggerSection) return;

    bgImgs.forEach(bgImg => {
        gsap.set(bgImg, { transformOrigin: "center center" });

        gsap.fromTo(bgImg, 
            { scale: 1.02 },
            {
                scale: 1.15,
                ease: "none",
                scrollTrigger: {
                    trigger: triggerSection,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            }
        );
    });
    console.log('[AmpleAI] ✓ Clients background zoom initialized');
}

/* ─────────────────────────────────────────────────────────
   TESTIMONIALS SECTION — Single Client Patch (Lumothrive)
   ───────────────────────────────────────────────────────── */
function patchTestimonialsSection() {
    if (!document.getElementById('amp-testimonials-patch')) {
        const style = document.createElement('style');
        style.id = 'amp-testimonials-patch';
        style.textContent = [
            '#testimonials [data-framer-name="Left"],',
            '#testimonials [data-framer-name="Right"],',
            '#testimonials [data-framer-name="Center"] { display:none !important; }',
            '#testimonials [data-framer-name="Testimonial 02"],',
            '#testimonials [data-framer-name="Testimonial 03"],',
            '#testimonials [data-framer-name="Testimonial 04"],',
            '#testimonials [data-framer-name="Testimonial 05"] { display:none !important; }',
            '#testimonials [data-framer-name^="Avatar 0"],',
            '#testimonials [name^="Avatar 0"] { display:none !important; }',
        ].join('\n');
        document.head.appendChild(style);
    }

    const apply = () => {
        const section = document.querySelector('section[id="testimonials"]');
        if (!section) return;

        const hiddenCards = [
            '[data-framer-name="Testimonial 02"]',
            '[data-framer-name="Testimonial 03"]',
            '[data-framer-name="Testimonial 04"]',
            '[data-framer-name="Testimonial 05"]',
        ];
        hiddenCards.forEach(sel => {
            section.querySelectorAll(sel).forEach(el => {
                el.style.display = 'none';
            });
        });

        section.querySelectorAll('[data-framer-name="Testimonial 01"]').forEach(card => {
            const avatarImg = card.querySelector('img[alt="Avatar"]') ||
                              card.querySelector('[data-framer-name="Top"] img');
            if (avatarImg) {
                avatarImg.src = '/assets/nevis-avatar.png';
                avatarImg.srcset = '';
                avatarImg.alt = 'Nevis, Co-Founder of Lumothrive';
            }

            const logoImg = card.querySelector('img[alt="Logo"]') ||
                            card.querySelector('[data-framer-name="Brand Logo"] img');
            if (logoImg) {
                logoImg.src = '/assets/lumothrive.png';
                logoImg.srcset = '';
                logoImg.alt = 'Lumothrive';
                logoImg.style.objectFit = 'contain';
                logoImg.style.filter = 'brightness(0) invert(1)';
                const logoWrap = card.querySelector('[data-framer-name="Brand Logo"]');
                if (logoWrap) {
                    logoWrap.style.width = '175px';
                    logoWrap.style.height = '31px';
                    logoWrap.style.aspectRatio = 'unset';
                }
            }

            const quoteEl = card.querySelector('p.framer-text') ||
                            card.querySelector('[data-framer-name="Bottom"] .framer-1w1whxo p') ||
                            card.querySelector('[data-framer-name="Bottom"] .framer-text');
            if (quoteEl) {
                quoteEl.textContent = '\u201cThe AI consulting process in AmpletechAI was smooth and transparent. From strategy to implementation, every step was handled with real expertise and a focus on business outcomes.\u201d';
            }

            const nameEl = card.querySelector('[data-framer-name="Profile Info"] h2.framer-text') ||
                           card.querySelector('[data-framer-name="Profile Info"] h2');
            if (nameEl) nameEl.textContent = 'Nevis';

            const titleEl = card.querySelector('[data-framer-name="Job Title"] p.framer-text') ||
                            card.querySelector('[data-framer-name="Job Title"] p');
            if (titleEl) titleEl.textContent = 'Co-Founder, Lumothrive';
        });

        section.querySelectorAll('[data-framer-name="Left"], [data-framer-name="Right"], [data-framer-name="Center"]').forEach(el => {
            el.style.display = 'none';
        });

        for (let i = 1; i <= 5; i++) {
            section.querySelectorAll(`[data-framer-name="Avatar 0${i}"], [name="Avatar 0${i}"]`).forEach(el => {
                el.style.display = 'none';
                const container = el.closest('[class*="container"]');
                if (container) container.style.display = 'none';
            });
        }

        section.querySelectorAll('[data-framer-name="Testimonial 01"]').forEach(card => {
            card.style.margin = '0 auto';
        });

        console.log('[AmpleAI] ✓ Testimonials patched — single Lumothrive client');
    };

    apply();
    setTimeout(apply, 500);
    setTimeout(apply, 1500);
    setTimeout(apply, 3000);
}

/* ─────────────────────────────────────────────────────────
   VOICES OF TRUST BACKGROUND TICKER — Horizontal Scrolling
   ───────────────────────────────────────────────────────── */
function initVoicesTicker() {
    const apply = () => {
        const section = document.querySelector('section[id="testimonials"]');
        if (!section) return;

        const container = document.querySelector('.framer-1d8cjmj');
        if (!container) return;

        if (container.parentElement !== section) {
            section.insertBefore(container, section.firstChild);
        }

        const ul = container.querySelector('ul');
        if (!ul || ul.classList.contains('ample-marquee-ready')) return;

        ul.classList.add('ample-marquee-ready');
        container.style.setProperty('display', 'flex', 'important');

        const children = Array.from(ul.children);
        children.forEach(child => {
            const clone = child.cloneNode(true);
            ul.appendChild(clone);
        });

        console.log('[AmpleAI] ✓ Ticker cloned and moved to section root');
    };

    if (!document.getElementById('ample-marquee-style')) {
        const style = document.createElement('style');
        style.id = 'ample-marquee-style';
        style.textContent = `
            .framer-1d8cjmj {
                position: absolute !important;
                display: flex !important;
                justify-content: flex-start !important;
                overflow: hidden !important;
                width: 100% !important;
                max-width: 100% !important;
                left: 0 !important;
                right: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                z-index: 0 !important;
                transform: none !important;
            }
            .framer-1d8cjmj ul {
                display: flex !important;
                justify-content: flex-start !important;
                flex-direction: row !important;
                width: max-content !important;
                max-width: none !important;
                gap: 100px !important;
                margin: 0 !important;
                padding: 0 !important;
                animation: ample-marquee-scroll 45s linear infinite !important;
                will-change: transform;
            }
            .framer-1d8cjmj .ticker-item {
                flex-shrink: 0 !important;
            }
            .framer-1d8cjmj .framer-8aqped {
                opacity: 1 !important;
            }
            @keyframes ample-marquee-scroll {
                0% {
                    transform: translate3d(0, 0, 0);
                }
                100% {
                    transform: translate3d(-50%, 0, 0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    apply();
    setTimeout(apply, 600);
    setTimeout(apply, 1500);
    setTimeout(apply, 3000);
}

/* ─────────────────────────────────────────────────────────
   PRICING plans — Hide toggle & unused empty bullet points
   ───────────────────────────────────────────────────────── */
function patchPricingSection() {
    const apply = () => {
        const section = document.getElementById('pricing') || 
                        document.querySelector('[data-framer-name*="Pricing" i]') ||
                        document.body;
        if (!section) return;

        const toggles = section.querySelectorAll('[data-framer-name="Toggle"]');
        toggles.forEach(el => {
            el.style.setProperty('display', 'none', 'important');
        });

        const bullets = section.querySelectorAll('[data-framer-name^="SM -"]');
        bullets.forEach(el => {
            const text = (el.innerText || el.textContent || '').trim();
            if (text === '') {
                el.style.setProperty('display', 'none', 'important');
            }
        });
    };

    apply();
    setTimeout(apply, 400);
    setTimeout(apply, 1000);
    setTimeout(apply, 2000);
    setTimeout(apply, 3500);
}
