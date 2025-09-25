function initCursor() {
  const cursor = document.getElementById('cursor');
  const cursorPt = document.getElementById('cursorPt');
  
  if (!cursor || !cursorPt) return;

  const CURSOR_WIDTH = 30;
  const CURSOR_PT_WIDTH = 7;

  let isOverTarget = false;
  let rotationTween;
  let exitTween = null;
  let enterTween = null;

  function startRotation() {
    if (isOverTarget) return; 
    gsap.set(cursor, { rotation: 0 });
    rotationTween = gsap.to(cursor, {
      rotation: 180,
      duration: 1.2,
      repeat: -1,
      ease: "linear",
      transformOrigin: "center center"
    });
  }

  function stopRotation() {
    if (rotationTween) {
      rotationTween.kill();
      rotationTween = null;
    }
  }

  // egér mozgatás esemény
  document.addEventListener("mousemove", (e) => {
    gsap.to(cursor, {autoAlpha: 1});
    gsap.to(cursorPt, {autoAlpha: 1});
    
    if (!isOverTarget) {
      gsap.to(cursor, {
        x: e.clientX - CURSOR_WIDTH / 2,
        y: e.clientY - CURSOR_WIDTH / 2,
        duration: 0.1,
        ease: "expo.out"
      });
    }
    gsap.to(cursorPt, {
      x: e.clientX - CURSOR_PT_WIDTH/2,
      y: e.clientY - CURSOR_PT_WIDTH/2,
      duration: 0.1,
      ease: "expo.out"
    });
  });

  let currentTarget = null;

  function getInteractiveTargetFromPoint(x, y) {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;

    const insideCard = el.closest('.card');
    if (insideCard) return insideCard;

    const interactive = el.closest('a, button, .nav-toggle, [role="button"]');
    return interactive;
  }

  function handleEnterTarget(target) {
    if (!target) return;
    isOverTarget = true;
    stopRotation();

    const rect = target.getBoundingClientRect();

    if (exitTween) { exitTween.kill(); exitTween = null; }
    if (enterTween) { enterTween.kill(); enterTween = null; }

    gsap.killTweensOf(cursor, 'rotation');
    gsap.set(cursor, { rotation: 0 });

    enterTween = gsap.to(cursor, {
      width: rect.width + 4,
      height: rect.height + 4,
      duration: 0.18,
      ease: 'power2.out'
    });

    if (target.classList && target.classList.contains('btn-primary')) {
      gsap.to(cursor, { '--color': '#3e58ffff', duration: 0.18 });
    } else if (target.classList && target.classList.contains('card')) {
      gsap.to(cursor, { '--color': '#ffffffbd', duration: 0.18 });
    } else {
      gsap.to(cursor, { '--color': '#ffffffbd', duration: 0.18 });
    }
  }

  function handleLeaveTarget(target) {
    if (!target) return;
    isOverTarget = false;

    gsap.killTweensOf(cursor);

    exitTween = gsap.to(cursor, {
      width: 30,
      height: 30,
      scale: 1,
      rotation: 0,
      '--color': '#ffffffff',
      duration: 0.28,
      ease: 'elastic.out(1, .9)',
      onComplete: () => {
        if (!isOverTarget) {
          setTimeout(startRotation, 120);
        }
      }
    });
  }

  // pointer mozgatás követés
  document.addEventListener('pointermove', (e) => {
    const newTarget = getInteractiveTargetFromPoint(e.clientX, e.clientY);

    if (newTarget !== currentTarget) {
      if (currentTarget) handleLeaveTarget(currentTarget);
      if (newTarget) handleEnterTarget(newTarget);
      currentTarget = newTarget;
    }

    if (currentTarget) {
      const rect = currentTarget.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      gsap.to(cursor, {
        x: rect.left + dx * 0.1 - 2,
        y: rect.top + dy * 0.1 - 2,
        scale: 1.05,
        rotation: 0,
        duration: 0.09,
        ease: 'power2.out'
      });
    }
  });

  // dokumentum pointerleave kezelése
  document.addEventListener('pointerleave', () => {
    if (currentTarget) { handleLeaveTarget(currentTarget); currentTarget = null; }
  });

  // ablak elhagyás/megérkezés kezelése
  document.addEventListener('mouseleave', () => {
    gsap.to(cursor, { autoAlpha: 0 });
    gsap.to(cursorPt, { autoAlpha: 0 });
  });

  document.addEventListener('mouseenter', () => {
    gsap.to(cursor, { autoAlpha: 1 });
    gsap.to(cursorPt, { autoAlpha: 1 });
  });

  startRotation();
}

// navigáció ikon és menü
function initNavigation() {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  
  if (!navToggle || !navMenu) return;

  navToggle.addEventListener('click', () => {
    const isActive = navToggle.classList.contains('active');
    
    if (isActive) {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
    } else {
      navToggle.classList.add('active');
      navMenu.classList.add('active');
    }
  });

  // menü bezárása
  document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
    }
  });

  // kattintva bezárás
  const navLinks = navMenu.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });
}


function initSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// scroll animációk
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  const animatedElements = document.querySelectorAll('.card, .section > div');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// vágólap másolás
function initClipboard() {
  const copyButtons = document.querySelectorAll('[data-copy]');
  
  copyButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const textToCopy = button.getAttribute('data-copy') || button.textContent;
      
      try {
        await navigator.clipboard.writeText(textToCopy);
        
        const originalText = button.textContent;
        button.textContent = '✓ Copied!';
        button.style.background = 'var(--success-color)';
        
        setTimeout(() => {
          button.textContent = originalText;
          button.style.background = '';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    });
  });
}

// csillagmező generálása
function generateStarField() {
  const configs = [
    { id: 'stars', count: 700, size: 1, afterTop: 2000, duration: 50, opacity: 0.85 },
    { id: 'stars2', count: 200, size: 2, afterTop: 2000, duration: 100, opacity: 0.5 },
    { id: 'stars3', count: 100, size: 3, afterTop: 2000, duration: 150, opacity: 0.25 }
  ];

  const MAX_TOTAL = 1200;
  let total = configs.reduce((s, c) => s + c.count, 0);
  if (total > MAX_TOTAL) {
    const scale = MAX_TOTAL / total;
    configs.forEach(c => c.count = Math.max(20, Math.round(c.count * scale)));
  }

  function build() {
    const vw = Math.max(window.innerWidth || document.documentElement.clientWidth, 1200);
    const vh = Math.max(window.innerHeight || document.documentElement.clientHeight, 800);

    configs.forEach(cfg => {
      let container = document.getElementById(cfg.id);
      if (!container) {
        container = document.createElement('div');
        container.id = cfg.id;
        document.body.appendChild(container);
      }

      const widthLimit = Math.ceil(vw * 1.2); 
      const heightLimit = Math.ceil(vh * 1.6);

      const shadows = [];
      for (let i = 0; i < cfg.count; i++) {
        const x = Math.floor(Math.random() * widthLimit);
        const y = Math.floor(Math.random() * heightLimit);
        shadows.push(`${x}px ${y}px #FFF`);
      }

      // alap stílusok
      container.style.width = `${cfg.size}px`;
      container.style.height = `${cfg.size}px`;
      container.style.background = 'transparent';
      container.style.boxShadow = shadows.join(', ');
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '0';
      container.style.animation = `animStar ${cfg.duration}s linear infinite`;
      container.style.willChange = 'transform';
      container.style.opacity = cfg.opacity;


      let after = document.getElementById(cfg.id + '-after');
      if (!after) {
        after = document.createElement('div');
        after.id = cfg.id + '-after';
        document.body.appendChild(after);
      }

      after.style.position = 'fixed';
      after.style.left = '0';
      after.style.top = cfg.afterTop + 'px';
      after.style.width = `${cfg.size}px`;
      after.style.height = `${cfg.size}px`;
      after.style.background = 'transparent';
      after.style.pointerEvents = 'none';
      after.style.zIndex = '0';
      after.style.boxShadow = container.style.boxShadow;
      after.style.animation = container.style.animation;
      after.style.willChange = 'transform';
      after.style.opacity = cfg.opacity;
    });
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      build();
    }, 180);
  });

  // első gen.
  build();
}


document.addEventListener('DOMContentLoaded', () => {
  try { generateStarField(); } catch (e) { console.warn('generateStarField failed', e); }

  initCursor();
  initNavigation();
  initSmoothScrolling();
  initScrollAnimations();
  initClipboard();
});


window.mainScript = {
  initCursor,
  initNavigation,
  initSmoothScrolling,
  initScrollAnimations,
  initClipboard
};
