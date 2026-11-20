// Pixel-art Minecraft world (fallback when no photo is supplied)
(function() {
  const c = document.getElementById('world');
  if (!c || !c.getContext) return;
  const ctx = c.getContext('2d');
  const W = c.width = 256;
  const H = c.height = 144;
  
  // Seeded RNG (same algorithm as original)
  let rngState = 11;
  function rng() {
    rngState |= 0;
    rngState = rngState + 0x6D2B79F5 | 0;
    let t = Math.imul(rngState ^ (rngState >>> 15), 1 | rngState);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  
  // Initialize background colors
  const bgColors = ['#0a111d', '#0d1a2b', '#112238', '#162d46', '#1c3a57'];
  for (let i = 0; i < 80; i++) {
    ctx.fillStyle = bgColors[Math.floor(rng() * bgColors.length)];
    ctx.fillRect(0, i * 29, W, 29);
  }
  
  // Draw pixel-art world details
  ctx.fillStyle = '#e6eef5';
  ctx.fillRect(206, 16, 10, 10);
  ctx.fillStyle = '#c5d3df';
  ctx.fillRect(209, 19, 4, 4);
  
  let h = 88;
  for (let cx = 0; cx < W; cx += 4) {
    h = Math.max(76, Math.min(100, h + [-4, 0, 0, 4][Math.floor(rng() * 4)]));
    for (let y = h; y < H; y += 4) {
      const d = (y - h) / 4;
      let k;
      if (d === 0) {
        k = rng() > 0.5 ? '#4f9a3a' : '#58a843';
      } else if (d < 3) {
        k = rng() > 0.5 ? '#6b4a2f' : '#775236';
      } else {
        const types = ['#6e6e6e', '#777', '#656565', '#7d7d7d'];
        k = types[Math.floor(rng() * 4)];
        if (d > 6 && rng() < 0.025) k = '#4de8e0';
        else if (rng() < 0.09) k = '#2d2d2d';
      }
      ctx.fillStyle = k;
      ctx.fillRect(cx, y, 4, 4);
      ctx.fillStyle = 'rgba(0,0,0,.2)';
      ctx.fillRect(cx, y, 4, 1);
      ctx.fillRect(cx, y, 1, 4);
    }
  }
  
  // Cursor parallax (respect reduced-motion)
  if (!matchMedia('(prefers-reduced-motion:reduce)').matches) {
    addEventListener('mousemove', e => {
      c.style.transform = `translate(${(e.clientX / innerWidth - 0.5) * -14}px, ${(e.clientY / innerHeight - 0.5) * -8}px)`);
    });
  }
})();

// Mineable diamond ore interaction
const oreBtn = document.getElementById('oreBtn');
const ore = document.getElementById('ore');
const oreWrap = document.getElementById('oreWrap');
const countEl = document.getElementById('count');
const hintEl = document.getElementById('hint');
const ctx = ore.getContext('2d');

let hits = 0;
let mined = 0;
let busy = false;

function drawOre() {
  const rng = (a) => {
    a |= 0;
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  
  ctx.clearRect(0, 0, 16, 16);
  
  // Fill base pattern
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const c = ['#6e6e6e', '#7a7a7a', '#656565', '#838383'][Math.floor(rng() * 4)];
      ctx.fillStyle = c;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  
  // Draw diamond crystals
  const crystalPositions = [[3,3],[10,2],[6,9],[11,10],[2,10]];
  ctx.fillStyle = '#4de8e0';
  crystalPositions.forEach(([x, y]) => {
    ctx.fillRect(x, y, 2, 2);
    ctx.fillStyle = '#bffaf6';
    ctx.fillRect(x, y, 1, 1);
    ctx.fillStyle = '#1fb5b0';
    ctx.fillRect(x + 1, y + 1, 1, 1);
  });
  
  // Draw crack progression
  const crack = [[8,0],[8,1],[7,2],[7,3],[8,4],[9,5],[9,6],[8,7],[7,8],[7,9],[6,10],[6,11],[5,12],[5,13],[4,14],[4,15],[9,7],[10,8],[11,8],[12,9],[13,9],[14,10],[8,5],[7,6],[6,6],[5,7],[4,7],[3,8],[2,8],[1,9],[10,3],[11,4]];
  ctx.fillStyle = 'rgba(0,0,0,.7)';
  crack.slice(0, hits * 6).forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
}

drawOre();

if (oreBtn) {
  oreBtn.addEventListener('click', () => {
    if (busy) return;
    oreBtn.classList.remove('shake');
    void oreBtn.offsetWidth;
    oreBtn.classList.add('shake');
    
    hits++;
    if (hits < 5) {
      drawOre();
      return;
    }
    
    busy = true;
    ctx.clearRect(0, 0, 16, 16);
    drawOre();
    
    // Send chips flying
    for (let i = 0; i < 14; i++) {
      const chip = document.createElement('div');
      chip.className = 'chip';
      chip.style.setProperty('--dx', (Math.random() - 0.5) * 300 + 'px');
      chip.style.setProperty('--dy', (Math.random() * 160 - 70) + 'px');
      chip.style.background = i % 3 ? '#4de8e0' : '#7a7a7a';
      oreWrap.appendChild(chip);
      setTimeout(() => chip.remove(), 800);
    }
    
    mined++;
    countEl.textContent = mined;
    hintEl.textContent = mined > 2 ? 'You\'d win this round.' : 'Five hits per diamond';
    
    setTimeout(() => {
      hits = 0;
      drawOre();
      busy = false;
    }, 450);
  });
}

// Responsive navigation
const navToggle = document.querySelector('.nav-toggle');
const siteMenu = document.getElementById('site-menu');

function closeNav() {
  if (navToggle) {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation');
  }
  if (siteMenu) siteMenu.classList.remove('is-open');
  if (document.body) document.body.classList.remove('nav-open');
}

if (navToggle && siteMenu) {
  navToggle.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') !== 'true';
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    }
    if (siteMenu) siteMenu.classList.toggle('is-open', open);
    if (document.body) document.body.classList.toggle('nav-open', open);
  });
  
  // Close nav on link click
  const navLinks = siteMenu ? siteMenu.querySelectorAll('a') : [];
  navLinks.forEach(a => {
    a.addEventListener('click', closeNav);
  });
  
  // Close on Escape
  addEventListener('keydown', e => {
    if (e.key === 'Escape') closeNav();
  });
  
  // Close on resize above 980px
  addEventListener('resize', () => {
    if (innerWidth > 980) closeNav();
  });
}

// Active section marker on scroll
const navLinks = document.querySelectorAll('.nav-link[data-section]');
const navSections = Array.from(navLinks).map(a => document.getElementById(a.dataset.section)).filter(Boolean);

let navTicking = false;
function syncNav() {
  let current = navSections[0]?.id || 'home';
  const marker = scrollY + Math.min(innerHeight * 0.38, 300);
  
  navSections.forEach(section => {
    if (section.offsetTop <= marker) current = section.id;
  });
  
  navLinks.forEach(a => {
    a.classList.toggle('is-active', a.dataset.section === current);
  });
  
  navTicking = false;
}

addEventListener('scroll', () => {
  if (!navTicking) {
    requestAnimationFrame(syncNav);
    navTicking = true;
  }
}, { passive: true });

syncNav();

// Block reveal on scroll
const revealItems = document.querySelectorAll('.reveal');
if (!matchMedia('(prefers-reduced-motion:reduce)').matches && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -35px' });
  
  revealItems.forEach(item => revealObserver.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('is-visible'));
}

// Install tabs
const installTabs = document.querySelectorAll('.install-tab');
function selectInstallTab(tab) {
  installTabs.forEach(t => t.setAttribute('aria-selected', String(t === tab)));
  document.querySelectorAll('#srv, #cli').forEach(panel => {
    panel.hidden = panel.id !== tab.dataset.target;
  });
}

installTabs.forEach(tab => {
  tab.addEventListener('click', () => selectInstallTab(tab));
});

installTabs.forEach((tab, index) => {
  tab.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = installTabs[(index + (e.key === 'ArrowRight' ? 1 : -1) + installTabs.length) % installTabs.length];
    selectInstallTab(next);
    next.focus();
  });
});

// Copy command with toast
let toastTimer;
const toastEl = document.getElementById('toast');

function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('on'), 1600);
}

document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    const text = button.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.append(area);
      area.select();
      try { document.execCommand('copy') } catch (_) {}
      area.remove();
    }
    showToast('Command copied');
  });
});