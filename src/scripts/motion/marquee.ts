// Marquee interaction (I-18) per docs/01-design/interaction-motion.md.
// CSS linear infinite loop at --motion-marquee. Speed responds to scroll velocity, eased back.
// Decorative (aria-hidden). Static under reduced motion.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { MotionModule } from './registry';

gsap.registerPlugin(ScrollTrigger);

let scrollTriggerInstance: ScrollTrigger | null = null;
let easeBackTween: gsap.core.Tween | null = null;

export const marqueeModule: MotionModule = {
  init(root, ctx) {
    const tracks = root.querySelectorAll<HTMLElement>('.marquee-track');
    if (tracks.length === 0) return;

    if (ctx.reduced) {
      tracks.forEach((track) => {
        track.style.animation = 'none';
      });
      return;
    }

    const currentRate = { value: 1 };

    scrollTriggerInstance = ScrollTrigger.create({
      onUpdate: (self) => {
        const velocity = Math.abs(self.getVelocity() || 0);
        // Multiply speed up to 3x with scroll velocity
        const targetRate = 1 + Math.min(2, velocity / 600);

        if (easeBackTween) easeBackTween.kill();

        currentRate.value = targetRate;
        tracks.forEach((track) => {
          const anims = track.getAnimations();
          anims.forEach((a) => (a.playbackRate = currentRate.value));
        });

        // Ease back to normal 1x speed over --motion-base (400ms)
        easeBackTween = gsap.to(currentRate, {
          value: 1,
          duration: 0.6,
          ease: 'power2.out',
          onUpdate: () => {
            tracks.forEach((track) => {
              const anims = track.getAnimations();
              anims.forEach((a) => (a.playbackRate = currentRate.value));
            });
          },
        });
      },
    });
  },

  cleanup() {
    if (scrollTriggerInstance) {
      scrollTriggerInstance.kill();
      scrollTriggerInstance = null;
    }
    if (easeBackTween) {
      easeBackTween.kill();
      easeBackTween = null;
    }
  },
};
