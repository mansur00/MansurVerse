// Digit Field (I-05) WebGL implementation using OGL per docs/01-design/interaction-motion.md.
// Renders an interactive quiet grid of "0" and "1" glyphs behind the hero section.
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';
import { gsap } from 'gsap';
import { isLowPower, isReducedMotion, isFinePointer, MOTION_CHANGE_EVENT } from '../motion/context';
import { DIGIT_FIELD } from './constants';

const vertexShader = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform float uTime;
  uniform float uCellSize;
  uniform float uFlipRadius;
  uniform float uFlipInterval;
  uniform float uFalloffRadius;
  uniform float uMinAlphaRatio;
  uniform vec4 uColor;
  uniform sampler2D uAtlas;
  uniform float uIsCoarse;
  uniform float uReducedMotion;

  varying vec2 vUv;

  void main() {
    vec2 pixelCoord = vec2(vUv.x * uResolution.x, (1.0 - vUv.y) * uResolution.y);
    vec2 cell = floor(pixelCoord / uCellSize);
    vec2 cellOffset = fract(pixelCoord / uCellSize);

    // Hash per cell
    float h = fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);

    float falloff = uMinAlphaRatio;
    float flip = 0.0;

    if (uReducedMotion < 0.5 && uIsCoarse < 0.5 && uPointer.x > -500.0) {
      float d = length(pixelCoord - uPointer);
      falloff = max(uMinAlphaRatio, 1.0 - (d / uFalloffRadius));

      if (d < uFlipRadius) {
        flip = mod(floor(uTime / uFlipInterval), 2.0) * 0.5;
      }
    }

    float isOne = step(0.5, fract(h + flip));
    vec2 atlasUv = vec2(isOne * 0.5 + cellOffset.x * 0.5, 1.0 - cellOffset.y);
    vec4 glyph = texture2D(uAtlas, atlasUv);

    // Premultiplied alpha output for WebGL compositor with transparent canvas
    float alpha = glyph.a * falloff;
    gl_FragColor = vec4(uColor.rgb * alpha, alpha);
  }
`;

function parseColor(cssColor: string): [number, number, number, number] {
  if (!cssColor) return [0.0, 0.0, 0.0, 1.0];
  const rgbaMatch = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbaMatch && rgbaMatch[1] && rgbaMatch[2] && rgbaMatch[3]) {
    return [
      parseInt(rgbaMatch[1], 10) / 255,
      parseInt(rgbaMatch[2], 10) / 255,
      parseInt(rgbaMatch[3], 10) / 255,
      1.0,
    ];
  }
  const hexMatch = cssColor.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (hexMatch && hexMatch[1] && hexMatch[2] && hexMatch[3]) {
    return [
      parseInt(hexMatch[1], 16) / 255,
      parseInt(hexMatch[2], 16) / 255,
      parseInt(hexMatch[3], 16) / 255,
      1.0,
    ];
  }
  return [0.0, 0.0, 0.0, 1.0];
}

export interface DigitSampleResult {
  alpha: number;
  effectiveAlpha: number;
  luminance: number;
  digit: '0' | '1';
  cell: [number, number];
}

declare global {
  interface Window {
    __sampleDigitCanvas?: (cssX: number, cssY: number) => DigitSampleResult | null;
  }
}

let activeCleanup: (() => void) | null = null;

export async function initDigitField(canvas: HTMLCanvasElement): Promise<(() => void) | null> {
  if (!canvas) return null;

  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }

  // Detect low power / coarse pointer capabilities
  const lowPower = isLowPower();
  const dprCap = lowPower ? 1.0 : 1.5;
  const cellSizeVal =
    (lowPower ? DIGIT_FIELD.cellSizeLowPower : DIGIT_FIELD.cellSize) *
    (window.devicePixelRatio > 1 ? 1.0 : 1.0);

  let renderer: Renderer | null = null;
  try {
    renderer = new Renderer({
      canvas,
      dpr: Math.min(window.devicePixelRatio || 1, dprCap),
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      powerPreference: 'low-power',
      preserveDrawingBuffer: import.meta.env.PUBLIC_E2E === 'true',
    });
  } catch {
    canvas.classList.add('no-webgl');
    return null;
  }

  const gl = renderer?.gl;
  if (!gl) {
    canvas.classList.add('no-webgl');
    return null;
  }

  const handleContextLost = (e: Event) => {
    e.preventDefault();
    canvas.classList.add('no-webgl');
    cleanup();
  };
  canvas.addEventListener('webglcontextlost', handleContextLost);

  // Wait for Stack Sans Notch font before drawing glyph atlas
  if (document.fonts) {
    try {
      await Promise.race([
        document.fonts.load('600 14px "Stack Sans Notch"'),
        new Promise((resolve) => setTimeout(resolve, 300)),
      ]);
    } catch {
      // Continue even if font load fails
    }
  }

  // Draw 64x32 glyph atlas: left 32x32 is "0", right 32x32 is "1"
  const atlasCanvas = document.createElement('canvas');
  atlasCanvas.width = 64;
  atlasCanvas.height = 32;
  const actx = atlasCanvas.getContext('2d');
  if (actx) {
    actx.clearRect(0, 0, 64, 32);
    actx.fillStyle = '#ffffff';
    actx.font = '600 14px "Stack Sans Notch", monospace';
    actx.textAlign = 'center';
    actx.textBaseline = 'middle';
    actx.fillText('0', 16, 16);
    actx.fillText('1', 48, 16);
  }

  const texture = new Texture(gl, {
    image: atlasCanvas,
    generateMipmaps: false,
    minFilter: gl.LINEAR,
    magFilter: gl.LINEAR,
  });

  const getComputedDigitColor = (): [number, number, number, number] => {
    const style = getComputedStyle(canvas);
    const rawColor = (style.color || style.getPropertyValue('--color-digit-field')).trim();
    const parsed = parseColor(rawColor);
    // Theme text color is opaque; strength is controlled by shader falloff and canvas opacity token
    return [parsed[0], parsed[1], parsed[2], 1.0];
  };

  const geometry = new Triangle(gl);
  const program = new Program(gl, {
    vertex: vertexShader,
    fragment: fragmentShader,
    uniforms: {
      uResolution: { value: [canvas.width || 1, canvas.height || 1] },
      uPointer: { value: [-999.0, -999.0] },
      uTime: { value: 0 },
      uCellSize: { value: cellSizeVal * (renderer?.dpr || 1.0) },
      uFlipRadius: { value: DIGIT_FIELD.flipRadius * (renderer?.dpr || 1.0) },
      uFlipInterval: { value: DIGIT_FIELD.flipIntervalSec },
      uFalloffRadius: { value: DIGIT_FIELD.falloffRadius * (renderer?.dpr || 1.0) },
      uMinAlphaRatio: { value: DIGIT_FIELD.minAlphaRatio },
      uColor: { value: getComputedDigitColor() },
      uAtlas: { value: texture },
      uIsCoarse: { value: isFinePointer() ? 0.0 : 1.0 },
      uReducedMotion: { value: isReducedMotion() ? 1.0 : 0.0 },
    },
    transparent: true,
    cullFace: false,
    depthTest: false,
    depthWrite: false,
  });

  program.setBlendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const mesh = new Mesh(gl, { geometry, program });

  const renderSingleFrame = () => {
    if (!renderer) return;
    renderer.render({ scene: mesh });
    canvas.setAttribute('data-webgl-ready', 'true');
  };

  const heroSection = canvas.closest('.hero-section') || canvas.parentElement || canvas;

  // Cache bounding rect and update on resize / scroll to avoid forced layout reflow during pointermove
  let canvasRect = canvas.getBoundingClientRect();
  const updateRect = () => {
    if (canvas) canvasRect = canvas.getBoundingClientRect();
  };
  window.addEventListener('resize', updateRect, { passive: true });
  window.addEventListener('scroll', updateRect, { passive: true });

  // Resize handling
  const updateSize = () => {
    if (!renderer || !canvas) return;
    const width = canvas.parentElement?.clientWidth || window.innerWidth;
    const height = canvas.parentElement?.clientHeight || window.innerHeight;
    renderer.setSize(width, height);
    program.uniforms.uResolution.value[0] = canvas.width;
    program.uniforms.uResolution.value[1] = canvas.height;
    program.uniforms.uCellSize.value = cellSizeVal * renderer.dpr;
    program.uniforms.uFlipRadius.value = DIGIT_FIELD.flipRadius * renderer.dpr;
    program.uniforms.uFalloffRadius.value = DIGIT_FIELD.falloffRadius * renderer.dpr;
    updateRect();

    if (isReducedMotion()) {
      renderSingleFrame();
    }
  };

  const resizeObserver = new ResizeObserver(updateSize);
  resizeObserver.observe(heroSection);
  updateSize();

  // Pointer tracking attached to window using cached rect (no forced synchronous layout)
  const onPointerMove = (e: PointerEvent) => {
    if (!isFinePointer() || isReducedMotion()) return;
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;
    if (x >= 0 && x <= canvasRect.width && y >= 0 && y <= canvasRect.height) {
      const dpr = renderer?.dpr || 1.0;
      program.uniforms.uPointer.value[0] = x * dpr;
      program.uniforms.uPointer.value[1] = y * dpr;
    } else {
      program.uniforms.uPointer.value[0] = -999.0;
      program.uniforms.uPointer.value[1] = -999.0;
    }
  };

  const onPointerLeave = () => {
    program.uniforms.uPointer.value[0] = -999.0;
    program.uniforms.uPointer.value[1] = -999.0;
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerleave', onPointerLeave, { passive: true });

  // Theme change observation
  const updateThemeColor = () => {
    program.uniforms.uColor.value = getComputedDigitColor();
    if (isReducedMotion()) {
      renderSingleFrame();
    }
  };

  const themeObserver = new MutationObserver(updateThemeColor);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  colorSchemeQuery.addEventListener('change', updateThemeColor);

  let isTickerRunning = false;
  let isHeroIntersecting = true;

  const onTick = (time: number) => {
    if (!renderer || !isHeroIntersecting || document.hidden) return;
    program.uniforms.uTime.value = time;
    renderer.render({ scene: mesh });

    if (isReducedMotion()) {
      stopTicker();
    }
  };

  const startTicker = () => {
    if (isTickerRunning) return;
    if (isReducedMotion()) {
      renderSingleFrame();
      return;
    }
    gsap.ticker.add(onTick);
    isTickerRunning = true;
  };

  const stopTicker = () => {
    if (!isTickerRunning) return;
    gsap.ticker.remove(onTick);
    isTickerRunning = false;
  };

  // Visibility and intersection observation
  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isHeroIntersecting = entry.isIntersecting;
        if (isHeroIntersecting && !document.hidden) {
          startTicker();
        } else {
          stopTicker();
        }
      });
    },
    { threshold: 0.05 },
  );
  intersectionObserver.observe(heroSection);

  const onVisibilityChange = () => {
    if (document.hidden) {
      stopTicker();
    } else if (isHeroIntersecting) {
      startTicker();
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  // Motion preference changes
  const onMotionChange = () => {
    const reduced = isReducedMotion();
    program.uniforms.uReducedMotion.value = reduced ? 1.0 : 0.0;
    if (reduced) {
      renderSingleFrame();
      stopTicker();
    } else if (isHeroIntersecting && !document.hidden) {
      startTicker();
    }
  };
  window.addEventListener(MOTION_CHANGE_EVENT, onMotionChange);

  // Initial draw
  renderSingleFrame();
  if (!isReducedMotion()) {
    startTicker();
  }

  // Sampling API exposed ONLY in builds with PUBLIC_E2E=true
  if (import.meta.env.PUBLIC_E2E === 'true') {
    window.__sampleDigitCanvas = (cssX: number, cssY: number): DigitSampleResult | null => {
      if (!renderer || !gl || !canvas) return null;

      // Ensure frame buffer is freshly rendered
      renderer.render({ scene: mesh });
      gl.finish();

      const dpr = renderer.dpr || 1.0;
      const cellSizePx = cellSizeVal * dpr;

      const px = cssX * dpr;
      const py = cssY * dpr;
      const cellX = Math.floor(px / cellSizePx);
      const cellY = Math.floor(py / cellSizePx);

      // WebGL pixel coordinates: Y=0 is bottom
      const cellLeft = Math.floor(cellX * cellSizePx);
      const cellTop = Math.floor(cellY * cellSizePx);
      const boxW = Math.max(1, Math.min(Math.floor(cellSizePx), canvas.width - cellLeft));
      const boxH = Math.max(1, Math.min(Math.floor(cellSizePx), canvas.height - cellTop));
      const glBottom = Math.max(0, Math.floor(canvas.height - (cellTop + boxH)));

      const pixelBuffer = new Uint8Array(boxW * boxH * 4);
      gl.readPixels(cellLeft, glBottom, boxW, boxH, gl.RGBA, gl.UNSIGNED_BYTE, pixelBuffer);

      let maxAlphaByte = 0;
      let strokeR = 0;
      let strokeG = 0;
      let strokeB = 0;

      for (let i = 0; i < pixelBuffer.length; i += 4) {
        const a = pixelBuffer[i + 3] ?? 0;
        if (a > maxAlphaByte) {
          maxAlphaByte = a;
          strokeR = pixelBuffer[i] ?? 0;
          strokeG = pixelBuffer[i + 1] ?? 0;
          strokeB = pixelBuffer[i + 2] ?? 0;
        }
      }

      const shaderAlpha = maxAlphaByte / 255;
      const canvasOpacity = parseFloat(getComputedStyle(canvas).opacity) || 1.0;
      const effectiveAlpha = shaderAlpha * canvasOpacity;

      // Un-premultiply RGB for luminance calculation
      let normR = 0;
      let normG = 0;
      let normB = 0;
      if (maxAlphaByte > 0) {
        const normA = maxAlphaByte / 255;
        normR = Math.min(1.0, strokeR / 255 / normA);
        normG = Math.min(1.0, strokeG / 255 / normA);
        normB = Math.min(1.0, strokeB / 255 / normA);
      }
      const luminance = 0.2126 * normR + 0.7152 * normG + 0.0722 * normB;

      // Compute active digit mathematically matching the shader
      const sinVal = Math.sin(cellX * 12.9898 + cellY * 78.233) * 43758.5453;
      const h = sinVal - Math.floor(sinVal);
      let flip = 0.0;
      const uPointer = program.uniforms.uPointer.value;
      const cellCenterX = (cellX + 0.5) * cellSizePx;
      const cellCenterY = (cellY + 0.5) * cellSizePx;
      const uPtrX = uPointer[0] ?? -999.0;
      const uPtrY = uPointer[1] ?? -999.0;
      if (
        program.uniforms.uReducedMotion.value < 0.5 &&
        program.uniforms.uIsCoarse.value < 0.5 &&
        uPtrX > -500.0
      ) {
        const d = Math.hypot(cellCenterX - uPtrX, cellCenterY - uPtrY);
        if (d < program.uniforms.uFlipRadius.value) {
          flip =
            (Math.floor(program.uniforms.uTime.value / program.uniforms.uFlipInterval.value) % 2) *
            0.5;
        }
      }
      const fracVal = h + flip - Math.floor(h + flip);
      const digit: '0' | '1' = fracVal >= 0.5 ? '1' : '0';

      return {
        alpha: shaderAlpha,
        effectiveAlpha,
        luminance,
        digit,
        cell: [cellX, cellY],
      };
    };
  }

  function cleanup() {
    stopTicker();
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    themeObserver.disconnect();
    window.removeEventListener('resize', updateRect);
    window.removeEventListener('scroll', updateRect);
    colorSchemeQuery.removeEventListener('change', updateThemeColor);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener(MOTION_CHANGE_EVENT, onMotionChange);
    window.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerleave', onPointerLeave);
    canvas.removeEventListener('webglcontextlost', handleContextLost);

    if (import.meta.env.PUBLIC_E2E === 'true') {
      delete window.__sampleDigitCanvas;
    }

    try {
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      // Ignore if lose_context fails
    }
    renderer = null;
  }

  activeCleanup = cleanup;
  return cleanup;
}

export function cleanupDigitField(): void {
  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }
}
