(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const blocks = [...document.querySelectorAll('.story, .charity-heading, .gift-section, .support-flow, .understanding-inner, .ending')];
  let observer;
  const animations = new Set();
  function reset() {
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
  window.addEventListener('pagehide', () => { observer?.disconnect(); animations.forEach(a => a.cancel()); });
})();