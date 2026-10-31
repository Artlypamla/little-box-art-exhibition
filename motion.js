(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const blocks = [...document.querySelectorAll('.story, .charity-heading, .gift-section, .support-flow, .understanding-inner, .ending')];
  let observer;
  const animations = new Set();
  const root = document.documentElement;
  const magneticStyle = document.createElement('style');
  magneticStyle.textContent = 'html.magnetic-scroll{scroll-snap-type:none!important}';
  document.head.append(magneticStyle);
  const boundaries = [...document.querySelectorAll('.hero, .story-band, .charity-heading, .support-flow, .understanding, .ending')];
  let settleTimer, frame, snapping = false, touching = false;
  let direction = 0, lastInput = -Infinity, suppressUntil = 0;
  function cancelSnap() {
    clearTimeout(settleTimer);
    cancelAnimationFrame(frame);
    snapping = false;
  }
  function userInput(nextDirection) {
    cancelSnap();
    direction = nextDirection;
    lastInput = performance.now();
  }
  // A long, slow pull; acceleration toward the boundary; a short settling tail.
  function magneticEase(t) {
    if (t < .82) return .86 * Math.pow(t / .82, 3.2);
    const tail = (t - .82) / .18;
    return .86 + .14 * (1 - (1 - tail) ** 2);
  }
  function settle() {
    if (preference.matches || snapping || touching || !direction || document.querySelector('dialog[open]') || performance.now() < suppressUntil || performance.now() - lastInput > 1600) return;
    const start = window.scrollY;
    const padding = innerWidth <= 760 ? 20 : 28;
    const max = Math.max(0, root.scrollHeight - innerHeight);
    const points = boundaries.map(block => Math.max(0, Math.min(max, block.getBoundingClientRect().top + start - padding)));
    const threshold = Math.min(300, innerHeight * .32);
    const candidates = points.filter(y => direction > 0 ? y > start + 3 && y - start <= threshold : y < start - 3 && start - y <= threshold);
    if (!candidates.length) return;
    const target = candidates.reduce((a, b) => Math.abs(a - start) < Math.abs(b - start) ? a : b);
    const distance = target - start;
    const duration = 740;
    let began;
    snapping = true;
    function tick(now) {
      if (!snapping) return;
      began ??= now;
      const t = Math.min(1, (now - began) / duration);
      window.scrollTo({ top: start + distance * magneticEase(t), behavior: 'instant' });
      if (t < 1) frame = requestAnimationFrame(tick);
      else {
        direction = 0;
        frame = requestAnimationFrame(() => { snapping = false; });
      }
    }
    frame = requestAnimationFrame(tick);
  }
  window.addEventListener('wheel', e => {
    if (!e.ctrlKey && Math.abs(e.deltaY) > Math.abs(e.deltaX)) userInput(Math.sign(e.deltaY));
  }, { passive: true });
  let touchY;
  window.addEventListener('touchstart', e => { cancelSnap(); touching = true; touchY = e.touches[0]?.clientY; }, { passive: true });
  window.addEventListener('touchmove', e => {
    const next = e.touches[0]?.clientY;
    if (Number.isFinite(next) && Number.isFinite(touchY)) userInput(Math.sign(touchY - next));
    touchY = next;
  }, { passive: true });
  const releaseTouch = () => { touching = false; clearTimeout(settleTimer); settleTimer = setTimeout(settle, 160); };
  window.addEventListener('touchend', releaseTouch, { passive: true });
  window.addEventListener('touchcancel', () => { touching = false; cancelSnap(); direction = 0; }, { passive: true });
  window.addEventListener('scroll', () => {
    if (snapping) return;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, 150);
  }, { passive: true });
  window.addEventListener('keydown', e => {
    if (e.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) userInput(e.shiftKey ? -1 : 1);
    else if (['ArrowUp', 'PageUp'].includes(e.key)) userInput(-1);
    else { cancelSnap(); direction = 0; }
  });
  document.addEventListener('click', e => {
    if (e.target.closest('a,button')) { cancelSnap(); direction = 0; suppressUntil = performance.now() + 1200; }
  });
  window.addEventListener('resize', () => { cancelSnap(); direction = 0; });
  function reset() {
    cancelSnap();
    direction = 0;
    root.classList.toggle('magnetic-scroll', !preference.matches);
    observer?.disconnect();
    animations.forEach(animation => animation.cancel());
    animations.clear();
    if (preference.matches || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const animation = entry.target.animate(
          [{ transform: 'translateY(24px)', opacity: .82 }, { transform: 'translateY(0)', opacity: 1 }],
          { duration: 520, easing: 'cubic-bezier(.22,.61,.36,1)' }
        );
        animations.add(animation);
        animation.finished.catch(() => {}).finally(() => animations.delete(animation));
        observer.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: '0px 0px -28px 0px' });
    blocks.forEach(block => observer.observe(block));
  }
  preference.addEventListener('change', reset);
  document.fonts.ready.then(reset);
  window.addEventListener('pagehide', () => { cancelSnap(); observer?.disconnect(); animations.forEach(a => a.cancel()); });
})();