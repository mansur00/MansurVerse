// Case study page interactions (I-25 scroll-spy, I-26 compare slider, I-27 parallax & device scroll, I-28 pull to next)
// Loaded dynamically only on /work/[slug].
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isReducedMotion } from './context';
import { isFeatureDisabled } from '../debug/features';
import { getLenis } from './lenis';

gsap.registerPlugin(ScrollTrigger);

let caseStudyCleanup: (() => void) | null = null;

export function cleanupCaseStudyPage(): void {
  if (caseStudyCleanup) {
    caseStudyCleanup();
    caseStudyCleanup = null;
  }
}

export function initCaseStudyPage(): void {
  if (typeof document === 'undefined') return;

  const root = document.querySelector<HTMLElement>('.case-body-section');
  if (!root || root.dataset['caseMotionInitialized'] === 'true') {
    return;
  }

  // Clean up any prior instance
  cleanupCaseStudyPage();
  root.dataset['caseMotionInitialized'] = 'true';

  const abortController = new AbortController();
  const { signal } = abortController;
  const triggers: ScrollTrigger[] = [];

  // 1. Scroll-spy (I-25)
  if (!isFeatureDisabled('scrollspy')) {
    const sectionLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.sections-list .section-link'),
    );
    const headings = sectionLinks
      .map((link) => {
        const hash = link.getAttribute('href');
        if (!hash || !hash.startsWith('#')) return null;
        const targetId = hash.slice(1);
        const heading = document.getElementById(targetId);
        return heading ? { link, heading, id: targetId } : null;
      })
      .filter((item): item is { link: HTMLAnchorElement; heading: HTMLElement; id: string } =>
        Boolean(item),
      );

    const setActiveSection = (activeId: string) => {
      sectionLinks.forEach((link) => {
        const hash = link.hash || link.getAttribute('href') || '';
        const linkId = hash.startsWith('#') ? hash.slice(1) : hash.split('#')[1] || '';
        const isActive = linkId === activeId;
        link.classList.toggle('is-active', isActive);
        if (isActive) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    };

    let isClickScrolling = false;

    headings.forEach((item) => {
      const st = ScrollTrigger.create({
        trigger: item.heading,
        start: 'top 40%',
        end: 'bottom 40%',
        onEnter: () => {
          if (!isClickScrolling) setActiveSection(item.id);
        },
        onEnterBack: () => {
          if (!isClickScrolling) setActiveSection(item.id);
        },
      });
      triggers.push(st);

      // Smooth scroll on sidebar link click
      item.link.addEventListener(
        'click',
        (e) => {
          e.preventDefault();
          setActiveSection(item.id);
          isClickScrolling = true;
          const lenis = getLenis();
          if (lenis) {
            lenis.scrollTo(item.heading, { offset: -80 });
          } else {
            item.heading.scrollIntoView({ behavior: 'smooth' });
          }
          setTimeout(() => {
            isClickScrolling = false;
          }, 800);
        },
        { signal },
      );
    });
  }

  // 2. Compare slider (I-26)
  if (!isFeatureDisabled('compare')) {
    const sliders = Array.from(
      document.querySelectorAll<HTMLElement>('.compare-slider[data-motion="compare-slider"]'),
    );

    sliders.forEach((slider) => {
      const input = slider.querySelector<HTMLInputElement>('.compare-range-input');
      if (!input) return;

      const setPosition = (val: number) => {
        const clamped = Math.min(Math.max(val, 0), 100);
        slider.style.setProperty('--slider-pos', `${clamped}%`);
        input.value = String(clamped);
        input.setAttribute('aria-valuenow', String(clamped));
      };

      input.addEventListener(
        'input',
        () => {
          setPosition(Number(input.value));
        },
        { signal },
      );

      // Keyboard arrow stepping (step 1, Shift + arrow step 10)
      input.addEventListener(
        'keydown',
        (e) => {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            if (e.shiftKey) {
              e.preventDefault();
              setPosition(Number(input.value) - 10);
            }
          } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            if (e.shiftKey) {
              e.preventDefault();
              setPosition(Number(input.value) + 10);
            }
          }
        },
        { signal },
      );
    });
  }

  // 3. Image parallax and device mockup scroll (I-27)
  if (!isReducedMotion() && !isFeatureDisabled('parallax')) {
    const parallaxImages = Array.from(
      document.querySelectorAll<HTMLElement>('.case-content img, [data-parallax]'),
    );

    parallaxImages.forEach((img) => {
      const tween = gsap.fromTo(
        img,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: img,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      );
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    });

    const mockups = Array.from(document.querySelectorAll<HTMLElement>('[data-mockup-scroll]'));
    mockups.forEach((mockup) => {
      const scrollInner = mockup.querySelector<HTMLElement>('.mockup-inner-img');
      if (scrollInner) {
        const tween = gsap.to(scrollInner, {
          yPercent: -50,
          duration: 6,
          ease: 'power1.inOut',
          scrollTrigger: {
            trigger: mockup,
            start: 'top 80%',
            toggleActions: 'play pause resume reset',
          },
        });
        if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
      }
    });
  }

  // 4. Pull to next project (I-28)
  if (!isReducedMotion() && !isFeatureDisabled('pull')) {
    const nextSection = document.querySelector<HTMLElement>('.case-next-section[data-pull-next]');
    if (nextSection) {
      let hasNavigated = false;
      const targetUrl = nextSection.dataset['nextUrl'];

      const st = ScrollTrigger.create({
        trigger: nextSection,
        start: 'top 90%',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const progress = Math.min(Math.max(self.progress, 0), 1);
          nextSection.style.setProperty('--pull-progress', `${(progress * 100).toFixed(1)}%`);
          if (progress >= 0.98 && !hasNavigated && targetUrl) {
            hasNavigated = true;
            window.location.href = targetUrl;
          }
        },
      });
      triggers.push(st);
    }
  }

  // Teardown registration
  caseStudyCleanup = () => {
    abortController.abort();
    triggers.forEach((st) => st.kill());
    triggers.length = 0;
    delete root.dataset['caseMotionInitialized'];
  };
}

if (typeof document !== 'undefined') {
  document.addEventListener('astro:before-swap', cleanupCaseStudyPage);
}
