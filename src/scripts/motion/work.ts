// Work page interactions (I-22 filter chips, I-23 view toggle & preview follower, I-24 card tilt)
// Loaded dynamically only on /work. Uses GSAP and GSAP Flip.
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { isReducedMotion, isFinePointer } from './context';
import { isFeatureDisabled } from '../debug/features';

gsap.registerPlugin(Flip);

let workCleanup: (() => void) | null = null;

export function cleanupWorkPage(): void {
  if (workCleanup) {
    workCleanup();
    workCleanup = null;
  }
}

export function initWorkPage(): void {
  if (typeof document === 'undefined') return;

  const container = document.querySelector<HTMLElement>('.projects-grid-section');
  if (!container || container.dataset['workMotionInitialized'] === 'true') {
    return;
  }

  // Clean up any prior instance before re-initializing
  cleanupWorkPage();
  container.dataset['workMotionInitialized'] = 'true';

  const cards = Array.from(container.querySelectorAll<HTMLElement>('.project-card'));
  const filterChips = Array.from(
    document.querySelectorAll<HTMLButtonElement>('[data-filter-chip]'),
  );
  const viewToggleButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>('[data-view-toggle]'),
  );
  const emptyState = document.querySelector<HTMLElement>('.empty-state');
  const resetBtn = document.querySelector<HTMLButtonElement>('[data-reset-filter]');
  const countWrapper = document.querySelector<HTMLElement>('.count-wrapper');
  const follower = document.querySelector<HTMLElement>('.list-preview-follower');
  const followerImg = follower?.querySelector<HTMLImageElement>('.follower-image');

  const abortController = new AbortController();
  const { signal } = abortController;

  let currentView: 'grid' | 'list' = 'grid';

  // 1. Live count updater
  const updateCount = (count: number) => {
    if (!countWrapper) return;
    const padStr = count < 10 ? `0${count}` : `${count}`;
    countWrapper.innerHTML = `<span class="superscript-number superscript-surface-base" aria-hidden="true">${padStr}</span>`;
  };

  // 2. Filter logic (I-22)
  const applyFilter = (category: string) => {
    // Update chip styling
    filterChips.forEach((chip) => {
      const chipCat = chip.dataset['filterChip'];
      const isActive = chipCat === category;
      chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      if (isActive) {
        chip.classList.add('chip-accent', 'is-active');
        chip.classList.remove('chip-outlined');
      } else {
        chip.classList.remove('chip-accent', 'is-active');
        chip.classList.add('chip-outlined');
      }
    });

    const reduced = isReducedMotion() || isFeatureDisabled('filter');
    const state = reduced ? null : Flip.getState(cards);

    let visibleCount = 0;
    cards.forEach((card) => {
      const cardCategory = card.dataset['category'] ?? '';
      const matches = category === 'All' || cardCategory === category;
      if (matches) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    updateCount(visibleCount);

    if (visibleCount === 0) {
      if (emptyState) emptyState.hidden = false;
    } else {
      if (emptyState) emptyState.hidden = true;
    }

    if (!reduced && state) {
      Flip.from(state, {
        duration: 0.6,
        ease: 'power2.out',
        absolute: true,
      });
    }
  };

  (window as unknown as { __setWorkFilter?: (cat: string) => void }).__setWorkFilter = applyFilter;

  filterChips.forEach((chip) => {
    chip.addEventListener(
      'click',
      () => {
        const cat = chip.dataset['filterChip'] ?? 'All';
        applyFilter(cat);
      },
      { signal },
    );
  });

  if (resetBtn) {
    resetBtn.addEventListener(
      'click',
      () => {
        applyFilter('All');
      },
      { signal },
    );
  }

  // 3. View toggle logic (I-23)
  const setView = (view: 'grid' | 'list') => {
    if (view === currentView) return;
    currentView = view;

    viewToggleButtons.forEach((btn) => {
      const btnView = btn.dataset['viewToggle'];
      const isActive = btnView === view;
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      btn.classList.toggle('is-active', isActive);
    });

    const reduced = isReducedMotion() || isFeatureDisabled('view');
    const state = reduced ? null : Flip.getState(cards);

    container.classList.toggle('is-list-view', view === 'list');

    if (!reduced && state) {
      Flip.from(state, {
        duration: 0.5,
        ease: 'power2.out',
      });
    }
  };

  viewToggleButtons.forEach((btn) => {
    btn.addEventListener(
      'click',
      () => {
        const view = (btn.dataset['viewToggle'] as 'grid' | 'list') || 'grid';
        setView(view);
      },
      { signal },
    );
  });

  // 4. List preview follower on fine pointer (I-23)
  if (follower && followerImg && isFinePointer() && !isReducedMotion()) {
    const xTo = gsap.quickTo(follower, 'x', { duration: 0.25, ease: 'power2.out' });
    const yTo = gsap.quickTo(follower, 'y', { duration: 0.25, ease: 'power2.out' });

    cards.forEach((card) => {
      card.addEventListener(
        'pointerenter',
        (e) => {
          if (currentView !== 'list') return;
          const previewSrc = card.dataset['previewSrc'];
          if (previewSrc) {
            followerImg.src = previewSrc;
            gsap.killTweensOf(follower);
            xTo(e.clientX + 16);
            yTo(e.clientY - 60);
            gsap.to(follower, {
              opacity: 1,
              scale: 1,
              duration: 0.2,
              ease: 'power2.out',
            });
          }
        },
        { signal },
      );

      card.addEventListener(
        'pointermove',
        (e) => {
          if (currentView !== 'list') return;
          xTo(e.clientX + 16);
          yTo(e.clientY - 60);
        },
        { signal },
      );

      card.addEventListener(
        'pointerleave',
        () => {
          if (currentView !== 'list') return;
          gsap.to(follower, {
            opacity: 0,
            scale: 0.95,
            duration: 0.15,
            ease: 'power2.in',
          });
        },
        { signal },
      );
    });
  }

  // 5. Card tilt on fine pointer only (I-24)
  if (isFinePointer() && !isReducedMotion() && !isFeatureDisabled('tilt')) {
    cards.forEach((card) => {
      card.addEventListener(
        'pointermove',
        (e) => {
          if (currentView === 'list') return;
          const rect = card.getBoundingClientRect();
          const normX = (e.clientX - rect.left) / rect.width - 0.5;
          const normY = (e.clientY - rect.top) / rect.height - 0.5;
          const tiltX = -normY * 8; // ±4 deg
          const tiltY = normX * 8; // ±4 deg

          gsap.to(card, {
            transform: `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-6px)`,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        },
        { signal },
      );

      card.addEventListener(
        'pointerleave',
        () => {
          if (currentView === 'list') return;
          gsap.to(card, {
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)',
            duration: 0.4,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        },
        { signal },
      );
    });
  }

  // Teardown registration
  workCleanup = () => {
    abortController.abort();
    if (follower) {
      gsap.killTweensOf(follower);
      follower.style.opacity = '0';
    }
    cards.forEach((card) => {
      gsap.killTweensOf(card);
      card.style.transform = '';
      card.style.display = '';
    });
    delete container.dataset['workMotionInitialized'];
    delete (window as unknown as { __setWorkFilter?: unknown }).__setWorkFilter;
  };
}

if (typeof document !== 'undefined') {
  document.addEventListener('astro:before-swap', cleanupWorkPage);
}
