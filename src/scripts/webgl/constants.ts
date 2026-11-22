// Constants for WebGL Digit Field (I-05) per docs/01-design/interaction-motion.md.
// All values derived strictly from tokens or architectural constants.
import { motionMs, digitFieldTokens } from '../../styles/tokens/generated/tokens';

export const DIGIT_FIELD = {
  cellSize: digitFieldTokens.cellSize,
  cellSizeLowPower: 40,
  glyphSize: digitFieldTokens.glyphSize,
  flipRadius: digitFieldTokens.flipRadius,
  falloffRadius: digitFieldTokens.falloffRadius,
  peakOpacity: digitFieldTokens.peakOpacity,
  minAlpha: digitFieldTokens.minAlpha,
  minAlphaRatio: digitFieldTokens.minAlpha / digitFieldTokens.peakOpacity, // 0.12 of peak
  flipIntervalMs: motionMs['digit-flip'], // 160ms
  flipIntervalSec: motionMs['digit-flip'] / 1000,
  blurPx: 0.7,
} as const;
