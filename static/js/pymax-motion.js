/* ═══════════════════════════════════════════════════════════════
   PYMAX MOTION ENGINE — Powered by GSAP
   Emil Kowalski × Impeccable Design × Taste Skill
   Uso: incluir DESPUÉS de gsap CDN en el <head>
═══════════════════════════════════════════════════════════════ */

const PymaxMotion = (() => {

  /* ── SPRING CONFIG ── */
  const SPRING     = { ease: 'back.out(1.4)', duration: .6 };
  const SPRING_SOFT= { ease: 'power3.out',     duration: .55 };
  const EASE_OUT   = { ease: 'power2.out',      duration: .4 };

  /* ────────────────────────────────────────
     INIT — llama esto en DOMContentLoaded
  ──────────────────────────────────────── */
  function init() {
    if (typeof gsap === 'undefined') {
      console.warn('[PymaxMotion] GSAP no cargado. Asegúrate de incluir el CDN.');
      return;
    }
    _entrance();
    _addButtons();
    _addMagnetic();
  }

  /* ────────────────────────────────────────
     ENTRANCE — stagger orquestado al cargar
  ──────────────────────────────────────── */
  function _entrance() {
    // Elementos con .pm-enter se animan en cascada
    const els = document.querySelectorAll('.pm-enter');
    if (!els.length) return;

    gsap.fromTo(els,
      { opacity: 0, y: 18 },
      {
        opacity: 1, y: 0,
        duration: .65,
        ease: 'power3.out',
        stagger: {
          each: .07,
          from: 'start'
        },
        clearProps: 'all'
      }
    );
  }

  /* ────────────────────────────────────────
     STAGGER custom — para usar con JS
     PymaxMotion.stagger('.kpi', .08)
  ──────────────────────────────────────── */
  function stagger(selector, delay = .06, opts = {}) {
    if (typeof gsap === 'undefined') return;
    const els = typeof selector === 'string'
      ? document.querySelectorAll(selector)
      : selector;
    if (!els.length) return;

    gsap.fromTo(els,
      { opacity: 0, y: 14, scale: .98 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: .55,
        ease: 'back.out(1.3)',
        stagger: { each: delay, from: 'start' },
        delay: opts.delay || 0,
        clearProps: 'all'
      }
    );
  }

  /* ────────────────────────────────────────
     COUNT UP — números que cuentan
     PymaxMotion.countUp(el, targetValue, prefix, decimals)
  ──────────────────────────────────────── */
  function countUp(el, target, prefix = '$', decimals = 0, duration = 1.2) {
    if (!el || typeof gsap === 'undefined') return;
    const isNeg = target < 0;
    const abs = Math.abs(target);
    const obj = { val: 0 };

    gsap.to(obj, {
      val: abs,
      duration,
      ease: 'power2.out',
      delay: .1,
      onUpdate() {
        const n = decimals > 0
          ? obj.val.toFixed(decimals)
          : Math.round(obj.val);
        el.textContent = (isNeg ? '-' : '') + prefix + formatNumber(n);
      },
      onComplete() {
        const final = decimals > 0 ? abs.toFixed(decimals) : Math.round(abs);
        el.textContent = (isNeg ? '-' : '') + prefix + formatNumber(final);
      }
    });
  }

  /* Count up sin prefix (para porcentajes, etc.) */
  function countUpRaw(el, target, suffix = '', duration = 1.0) {
    if (!el || typeof gsap === 'undefined') return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration,
      ease: 'power2.out',
      delay: .15,
      onUpdate() { el.textContent = Math.round(obj.val) + suffix; },
      onComplete() { el.textContent = Math.round(target) + suffix; }
    });
  }

  /* ────────────────────────────────────────
     MAGNETIC BUTTONS
     Se aplica a elementos con [data-magnetic]
  ──────────────────────────────────────── */
  function _addMagnetic() {
    document.querySelectorAll('[data-magnetic]').forEach(el => magnetic(el));
  }

  function magnetic(el, strength = .35) {
    if (!el || typeof gsap === 'undefined') return;

    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top  + r.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      gsap.to(el, { x: dx, y: dy, duration: .3, ease: 'power2.out' });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: .5, ease: 'elastic.out(1,.4)' });
    });
  }

  /* ────────────────────────────────────────
     BUTTON MICRO-ANIMATIONS
     Todos los .pm-btn
  ──────────────────────────────────────── */
  function _addButtons() {
    document.querySelectorAll('.pm-btn, [data-btn]').forEach(el => {
      el.addEventListener('mousedown', () => {
        if (typeof gsap !== 'undefined')
          gsap.to(el, { scale: .94, duration: .1, ease: 'power2.in' });
      });
      el.addEventListener('mouseup mouseleave', () => {
        if (typeof gsap !== 'undefined')
          gsap.to(el, { scale: 1, duration: .35, ease: 'back.out(2)' });
      });
    });
  }

  /* ────────────────────────────────────────
     CARD HOVER — lift con GSAP
     PymaxMotion.cardHover(selector)
  ──────────────────────────────────────── */
  function cardHover(selector) {
    if (typeof gsap === 'undefined') return;
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener('mouseenter', () => {
        gsap.to(el, { y: -4, scale: 1.007, duration: .4, ease: 'back.out(1.5)' });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { y: 0, scale: 1, duration: .35, ease: 'power2.out' });
      });
    });
  }

  /* ────────────────────────────────────────
     PAGE TRANSITION — fade out salida
  ──────────────────────────────────────── */
  function pageOut(href) {
    if (typeof gsap === 'undefined') { window.location.href = href; return; }
    gsap.to('body', {
      opacity: 0,
      y: -8,
      duration: .22,
      ease: 'power2.in',
      onComplete() { window.location.href = href; }
    });
  }

  /* ────────────────────────────────────────
     PAGE IN — entrada suave
  ──────────────────────────────────────── */
  function pageIn() {
    if (typeof gsap === 'undefined') return;
    gsap.fromTo('body',
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: .4, ease: 'power2.out', clearProps: 'all' }
    );
  }

  /* ────────────────────────────────────────
     PULSE — efecto de pulso en elemento
  ──────────────────────────────────────── */
  function pulse(el, color = 'rgba(59,130,246,.4)') {
    if (!el || typeof gsap === 'undefined') return;
    gsap.fromTo(el,
      { boxShadow: `0 0 0 0 ${color}` },
      { boxShadow: `0 0 0 12px rgba(0,0,0,0)`, duration: .7, ease: 'power2.out' }
    );
  }

  /* ────────────────────────────────────────
     TOAST NOTIFICATION
  ──────────────────────────────────────── */
  function toast(msg, type = 'success', duration = 3200) {
    const colors = {
      success: { bg: 'rgba(52,211,153,.12)', border: 'rgba(52,211,153,.25)', dot: '#34D399' },
      error:   { bg: 'rgba(248,113,113,.12)', border: 'rgba(248,113,113,.25)', dot: '#F87171' },
      info:    { bg: 'rgba(59,130,246,.12)', border: 'rgba(59,130,246,.25)',  dot: '#3B82F6' },
      warning: { bg: 'rgba(252,211,77,.1)',  border: 'rgba(252,211,77,.2)',   dot: '#FCD34D' }
    };
    const c = colors[type] || colors.info;

    const t = document.createElement('div');
    t.style.cssText = `
      position:fixed;bottom:24px;right:24px;z-index:99999;
      display:flex;align-items:center;gap:10px;
      padding:12px 16px;border-radius:10px;
      background:${c.bg};border:1px solid ${c.border};
      backdrop-filter:blur(16px);
      font-family:'Inter',sans-serif;font-size:13px;font-weight:600;
      color:#F0F6FC;box-shadow:0 8px 32px rgba(0,0,0,.4);
      transform:translateY(16px);opacity:0;
    `;
    t.innerHTML = `<div style="width:5px;height:5px;border-radius:50%;background:${c.dot};flex-shrink:0"></div>${msg}`;
    document.body.appendChild(t);

    if (typeof gsap !== 'undefined') {
      gsap.to(t, { y: 0, opacity: 1, duration: .35, ease: 'back.out(1.5)' });
      setTimeout(() => {
        gsap.to(t, { y: 8, opacity: 0, duration: .25, ease: 'power2.in', onComplete: () => t.remove() });
      }, duration);
    } else {
      t.style.opacity = '1'; t.style.transform = 'none';
      setTimeout(() => t.remove(), duration);
    }
  }

  /* ── HELPERS ── */
  function formatNumber(n) {
    return Number(n).toLocaleString('es-CL');
  }

  /* ── PUBLIC API ── */
  return { init, stagger, countUp, countUpRaw, magnetic, cardHover, pageOut, pageIn, pulse, toast };

})();

/* Auto-init en DOMContentLoaded si GSAP está disponible */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => PymaxMotion.init());
} else {
  PymaxMotion.init();
}
