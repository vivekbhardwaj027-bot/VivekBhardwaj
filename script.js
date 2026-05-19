/* ═══════════════════════════════════════════════════════════
   VIVEK BHARDWAJ – PORTFOLIO JAVASCRIPT
   Handles: Navbar, Scroll animations, Carousel, Form, etc.
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ─── Utility: DOM selector shortcuts ───
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ─── Run on DOM ready ───
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollAnimations();
  initSmoothScroll();
  initCarousel();
  initScrollTop();
  initForm();
  initYear();
});

/* ══════════════════════════════════════
   1. NAVBAR
══════════════════════════════════════ */
function initNavbar() {
  const navbar    = $('#navbar');
  const hamburger = $('#hamburger');
  const navLinks  = $('#navLinks');
  const navLinkItems = $$('.nav-link');
  const sections  = $$('section[id]');

  // ── Scroll → Add .scrolled class ──
  function onScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    highlightActiveLink();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // ── Hamburger toggle ──
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // ── Close menu when a link is clicked ──
  navLinkItems.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // ── Close menu on outside click ──
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // ── Active section highlighting ──
  function highlightActiveLink() {
    let currentSection = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      if (section.offsetTop <= scrollPos) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinkItems.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }
}

/* ══════════════════════════════════════
   2. SCROLL ANIMATIONS (Intersection Observer)
══════════════════════════════════════ */
function initScrollAnimations() {
  const fadeEls = $$('.fade-up');

  if (!fadeEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // animate once
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  fadeEls.forEach(el => observer.observe(el));
}

/* ══════════════════════════════════════
   3. SMOOTH SCROLL (for anchor links)
══════════════════════════════════════ */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navbarHeight = document.querySelector('#navbar').offsetHeight;
      const targetPos = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 12;

      window.scrollTo({
        top: targetPos,
        behavior: 'smooth'
      });
    });
  });
}

/* ══════════════════════════════════════
   4. TESTIMONIALS CAROUSEL
══════════════════════════════════════ */
function initCarousel() {
  const track    = $('#testimonialsTrack');
  const cards    = $$('.testimonial-card');
  const dotsWrap = $('#carouselDots');
  const prevBtn  = $('#prevBtn');
  const nextBtn  = $('#nextBtn');

  if (!track || !cards.length) return;

  let current = 0;
  let autoInterval;
  const visibleCards = getVisibleCount();

  // ── Create dots ──
  const totalSlides = cards.length - visibleCards + 1;

  for (let i = 0; i < Math.max(1, totalSlides); i++) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  }

  function getVisibleCount() {
    return window.innerWidth <= 768 ? 1 : 2;
  }

  function goTo(index) {
    const total = cards.length;
    const visible = getVisibleCount();
    const maxIndex = Math.max(0, total - visible);

    current = Math.min(Math.max(index, 0), maxIndex);

    const cardWidth = cards[0].getBoundingClientRect().width + 24; // gap = 24px
    track.style.transform = `translateX(-${current * cardWidth}px)`;

    $$('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  }

  function prev() { goTo(current - 1); resetAuto(); }
  function next() {
    const visible = getVisibleCount();
    const maxIndex = cards.length - visible;
    goTo(current < maxIndex ? current + 1 : 0);
    resetAuto();
  }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // ── Touch/swipe support ──
  let touchStart = 0;
  track.addEventListener('touchstart', e => {
    touchStart = e.changedTouches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? next() : prev();
    }
  });

  // ── Auto-advance ──
  function startAuto() {
    autoInterval = setInterval(next, 5000);
  }
  function resetAuto() {
    clearInterval(autoInterval);
    startAuto();
  }
  startAuto();

  // ── Recalculate on resize ──
  window.addEventListener('resize', () => {
    goTo(0);
  });
}

/* ══════════════════════════════════════
   5. SCROLL-TO-TOP BUTTON
══════════════════════════════════════ */
function initScrollTop() {
  const btn = $('#scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ══════════════════════════════════════
   6. BOOKING FORM
══════════════════════════════════════ */
function initForm() {
  const submitBtn = $('#submitBooking');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', () => {
    const name    = $('#clientName').value.trim();
    const phone   = $('#clientPhone').value.trim();
    const service = $('#clientService').value;
    const message = $('#clientMessage').value.trim();

    // Basic validation
    if (!name) {
      showAlert('Please enter your name.', 'error');
      $('#clientName').focus();
      return;
    }
    if (!phone || phone.length < 7) {
      showAlert('Please enter a valid phone number.', 'error');
      $('#clientPhone').focus();
      return;
    }
    if (!service) {
      showAlert('Please select a service.', 'error');
      $('#clientService').focus();
      return;
    }

    // Send via WhatsApp (primary channel)
    const whatsappMsg = encodeURIComponent(
      `Hello Vivek! 👋\n\nI want to book a free consultation.\n\n` +
      `*Name:* ${name}\n` +
      `*Phone:* ${phone}\n` +
      `*Service:* ${service}\n` +
      `*Message:* ${message || 'No additional message'}\n\n` +
      `Please get back to me. Thank you!`
    );

    // Show success state
    submitBtn.textContent = '✅ Sending...';
    submitBtn.disabled = true;

    setTimeout(() => {
      // Open WhatsApp
      window.open(`https://wa.me/919661376862?text=${whatsappMsg}`, '_blank');

      // Reset form
      $('#clientName').value = '';
      $('#clientPhone').value = '';
      $('#clientService').value = '';
      $('#clientMessage').value = '';

      submitBtn.textContent = 'Book Free Consultation →';
      submitBtn.disabled = false;

      showAlert('Your consultation request has been sent via WhatsApp! Vivek will respond within 24 hours.', 'success');
    }, 800);
  });
}

/* Alert helper */
function showAlert(msg, type = 'success') {
  // Remove any existing alert
  const existing = document.querySelector('.form-alert');
  if (existing) existing.remove();

  const alert = document.createElement('div');
  alert.className = 'form-alert';
  alert.setAttribute('role', 'alert');
  alert.setAttribute('aria-live', 'polite');
  alert.style.cssText = `
    position: fixed;
    top: 90px;
    right: 24px;
    z-index: 9999;
    max-width: 360px;
    padding: 16px 20px;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 500;
    line-height: 1.5;
    box-shadow: 0 8px 32px rgba(0,0,0,0.35);
    animation: slideInRight 0.35s ease;
    background: ${type === 'success' ? '#064e3b' : '#450a0a'};
    border: 1px solid ${type === 'success' ? '#10b981' : '#ef4444'};
    color: ${type === 'success' ? '#6ee7b7' : '#fca5a5'};
  `;
  alert.textContent = msg;
  document.body.appendChild(alert);

  // Add animation keyframe once
  if (!document.querySelector('#alertStyles')) {
    const style = document.createElement('style');
    style.id = 'alertStyles';
    style.textContent = `
      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(30px); }
        to   { opacity: 1; transform: translateX(0); }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => {
    alert.style.opacity = '0';
    alert.style.transition = 'opacity 0.4s ease';
    setTimeout(() => alert.remove(), 450);
  }, 5000);
}

/* ══════════════════════════════════════
   7. DYNAMIC YEAR IN FOOTER
══════════════════════════════════════ */
function initYear() {
  const el = document.querySelector('#currentYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* ══════════════════════════════════════
   8. LAZY LOADING IMAGES
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const lazyImages = $$('img[data-src]');
  if (!lazyImages.length) return;

  const imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imgObserver.unobserve(img);
      }
    });
  });

  lazyImages.forEach(img => imgObserver.observe(img));
});
