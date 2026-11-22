// Constants for WebGL Digit Field (I-05) per docs/01-design/interaction-motion.md.
// All values derived strictly from tokens or architectural constants.
import { motionMs } from '../../styles/tokens/generated/tokens';

export const DIGIT_FIELD = {
  cellSize: 28,
  cellSizeLowPower: 40,
  flipRadius: 110,
  falloffRadius: 240,
  flipIntervalMs: motionMs['digit-flip'], // 160ms
  flipIntervalSec: motionMs['digit-flip'] / 1000,
  ambientOpacity: 0.4,
  minFalloff: 0.12,
  blurPx: 0.7,
} as const;
