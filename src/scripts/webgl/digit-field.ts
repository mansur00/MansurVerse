// Digit Field (I-05) WebGL implementation using OGL per docs/01-design/interaction-motion.md.
// Renders an interactive quiet grid of "0" and "1" glyphs behind the hero section.
// Optimized: CSS pixel coordinate system, coarse pointer static draw, scroll pause, and live state updates.
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';
import { gsap } from 'gsap';
import { isLowPower, isReducedMotion, isFinePointer, MOTION_CHANGE_EVENT } from '../motion/context';
import { DIGIT_FIELD } from './constants';
import { isFeatureDisabled } from '../debug/features';

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
    // All coordinates and radii are strictly in CSS pixels
    vec2 pixelCoord = vec2(vUv.x * uResolution.x, (1.0 - vUv.y) * uResolution.y);
    vec2 cell = floor(pixelCoord / uCellSize);
    vec2 cellCenter = (cell + 0.5) * uCellSize;
    vec2 cellOffset = fract(pixelCoord / uCellSize);

    // Hash per cell
    float h = fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);

    float falloff = uMinAlphaRatio;
    float flip = 0.0;

    if (uReducedMotion < 0.5 && uIsCoarse < 0.5 && uPointer.x > -500.0) {
      float d = length(cellCenter - uPointer);
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
  color: [number, number, number, number];
}

declare global {
  interface Window {
    __sampleDigitCanvas?: (cssX: number, cssY: number) => DigitSampleResult | null;
    __digitFieldPerf?: {
      renderTimes: number[];
      maxRenderTime: number;
    };
    __digitFieldDebug?: {
      gpu?: string;
      quality?: string;
      steppedDown?: boolean;
      dpr?: number;
    };
  }
}

let activeCleanup: (() => void) | null = null;

function checkSoftwareRenderer(gl: WebGLRenderingContext): boolean {
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  if (!ext) return false;
  const renderer = (gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '').toLowerCase();
  const vendor = (gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) || '').toLowerCase();
  return (
    renderer.includes('swiftshader') ||
    renderer.includes('llvmpipe') ||
    renderer.includes('software') ||
    renderer.includes('softpipe') ||
    (renderer.includes('mesa') && renderer.includes('basic')) ||
    (vendor.includes('mesa') && renderer.includes('llvmpipe'))
  );
}

export async function initDigitField(canvas: HTMLCanvasElement): Promise<(() => void) | null> {
  if (!canvas) return null;

  if (isFeatureDisabled('digitfield')) {
    canvas.classList.add('no-webgl');
    return null;
  }

  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }

  // Detect low power / coarse pointer capabilities
  const lowPower = isLowPower();
  let dprCap = lowPower ? 1.0 : 1.5;
  let cellSizeVal = lowPower ? DIGIT_FIELD.cellSizeLowPower : DIGIT_FIELD.cellSize;

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

  const isSoftware = checkSoftwareRenderer(gl);
  if (isSoftware) {
    dprCap = 0.5;
    cellSizeVal = DIGIT_FIELD.cellSizeLowPower;
    renderer.dpr = Math.min(window.devicePixelRatio || 1, dprCap);
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
  if (import.meta.env.PUBLIC_E2E === 'true') {
    window.__digitFieldPerf = {
      renderTimes: [],
      maxRenderTime: 0,
    };
  }

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
    return [parsed[0], parsed[1], parsed[2], 1.0];
  };

  const geometry = new Triangle(gl);
  const program = new Program(gl, {
    vertex: vertexShader,
    fragment: fragmentShader,
    uniforms: {
      uResolution: {
        value: [canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight],
      },
      uPointer: { value: [-999.0, -999.0] },
      uTime: { value: 0 },
      uCellSize: { value: cellSizeVal },
      uFlipRadius: { value: DIGIT_FIELD.flipRadius },
      uFlipInterval: { value: DIGIT_FIELD.flipIntervalSec },
      uFalloffRadius: { value: DIGIT_FIELD.falloffRadius },
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

  // Resize handling (all uniforms in CSS pixels)
  const updateSize = () => {
    if (!renderer || !canvas) return;
    const width = canvas.parentElement?.clientWidth || window.innerWidth;
    const height = canvas.parentElement?.clientHeight || window.innerHeight;
    renderer.dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    renderer.setSize(width, height);
    // Pass CSS pixel dimensions to uniforms
    program.uniforms.uResolution.value[0] = width;
    program.uniforms.uResolution.value[1] = height;
    program.uniforms.uCellSize.value = cellSizeVal;
    program.uniforms.uFlipRadius.value = DIGIT_FIELD.flipRadius;
    program.uniforms.uFalloffRadius.value = DIGIT_FIELD.falloffRadius;
    updateRect();

    renderSingleFrame();
  };

  const resizeObserver = new ResizeObserver(updateSize);
  resizeObserver.observe(heroSection);
  updateSize();

  // Pointer tracking: only store latest position, let single ticker read it per frame
  let latestClientX = -999.0;
  let latestClientY = -999.0;
  let isPointerInside = false;

  const onPointerMove = (e: PointerEvent) => {
    if (!isFinePointer() || isReducedMotion()) return;
    latestClientX = e.clientX;
    latestClientY = e.clientY;
    isPointerInside = true;
  };

  const onPointerLeave = () => {
    isPointerInside = false;
    latestClientX = -999.0;
    latestClientY = -999.0;
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerleave', onPointerLeave, { passive: true });

  // Theme change observation
  const updateThemeColor = () => {
    program.uniforms.uColor.value = getComputedDigitColor();
    renderSingleFrame();
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
  let isScrolling = false;
  let isThrottled30fps = isSoftware;
  let isQualitySteppedDown = isSoftware;
  let tickCount = 0;
  let probeFrames = 0;
  let totalProbeDuration = 0;

  const onTick = (time: number) => {
    if (!renderer || !isHeroIntersecting || isScrolling || document.hidden) return;

    tickCount++;
    // Adaptive rate: cap at 30fps under software rendering or if frame took >12ms
    if (isThrottled30fps && tickCount % 2 !== 0) {
      return;
    }

    // Read stored pointer position in CSS pixels
    if (isPointerInside) {
      const x = latestClientX - canvasRect.left;
      const y = latestClientY - canvasRect.top;
      if (x >= 0 && x <= canvasRect.width && y >= 0 && y <= canvasRect.height) {
        program.uniforms.uPointer.value[0] = x;
        program.uniforms.uPointer.value[1] = y;
      } else {
        program.uniforms.uPointer.value[0] = -999.0;
        program.uniforms.uPointer.value[1] = -999.0;
      }
    } else {
      program.uniforms.uPointer.value[0] = -999.0;
      program.uniforms.uPointer.value[1] = -999.0;
    }

    program.uniforms.uTime.value = time;

    const tStart = performance.now();
    renderer.render({ scene: mesh });
    const frameDur = performance.now() - tStart;

    if (import.meta.env.PUBLIC_E2E === 'true') {
      const perf = window.__digitFieldPerf;
      if (perf) {
        perf.renderTimes.push(frameDur);
        if (frameDur > perf.maxRenderTime) {
          perf.maxRenderTime = frameDur;
        }
      }
    }

    // Cap at 30fps if any single frame takes > 12ms
    if (frameDur > 12) {
      isThrottled30fps = true;
    }

    // Runtime guard: measure average frame time during first 45 frames
    if (probeFrames < 45) {
      probeFrames++;
      totalProbeDuration += frameDur;
      const avgFrameTime = totalProbeDuration / probeFrames;

      // If average frame time exceeds 16ms, step down quality
      if (probeFrames >= 15 && avgFrameTime > 16 && !isQualitySteppedDown) {
        isQualitySteppedDown = true;
        isThrottled30fps = true;
        dprCap = 0.5;
        cellSizeVal = DIGIT_FIELD.cellSizeLowPower;
        updateSize();
      } else if (probeFrames >= 30 && avgFrameTime > 24) {
        // If still exceeds budget (>24ms avg), halt field and show static poster
        canvas.classList.add('no-webgl');
        stopTicker();
        return;
      }
    }

    if (isReducedMotion()) {
      stopTicker();
    }
  };

  const startTicker = () => {
    if (isTickerRunning) return;
    if (isReducedMotion() || !isFinePointer() || isScrolling) {
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

  // Pause render loop during scrolling on all devices
  let scrollEndTimeout: ReturnType<typeof setTimeout> | null = null;
  const onScroll = () => {
    if (!isScrolling) {
      isScrolling = true;
      stopTicker();
    }
    if (scrollEndTimeout !== null) {
      clearTimeout(scrollEndTimeout);
    }
    scrollEndTimeout = setTimeout(() => {
      isScrolling = false;
      scrollEndTimeout = null;
      updateRect();
      if (isHeroIntersecting && isFinePointer() && !isReducedMotion() && !document.hidden) {
        startTicker();
      }
    }, 150);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateRect, { passive: true });

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

  // Motion preference changes live
  const onMotionChange = () => {
    const reduced = isReducedMotion();
    program.uniforms.uReducedMotion.value = reduced ? 1.0 : 0.0;
    if (reduced) {
      program.uniforms.uPointer.value[0] = -999.0;
      program.uniforms.uPointer.value[1] = -999.0;
      stopTicker();
      renderSingleFrame();
    } else if (isHeroIntersecting && isFinePointer() && !isScrolling && !document.hidden) {
      startTicker();
    }
  };
  window.addEventListener(MOTION_CHANGE_EVENT, onMotionChange);

  const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
  motionMedia.addEventListener('change', onMotionChange);

  // Initial draw: coarse pointers only draw once; fine pointers run ticker
  renderSingleFrame();
  if (isFinePointer() && !isReducedMotion()) {
    startTicker();
  }

  // Debug info for HUD
  window.__digitFieldDebug = {
    gpu: gl ? gl.getParameter(gl.RENDERER) || 'OGL WebGL' : 'None',
    quality: `${(renderer?.dpr || 1).toFixed(1)}x DPR, ${cellSizeVal}px cell`,
    steppedDown: isQualitySteppedDown,
    dpr: renderer?.dpr || 1,
  };

  // Sampling API exposed ONLY in builds with PUBLIC_E2E=true
  if (import.meta.env.PUBLIC_E2E === 'true') {
    window.__sampleDigitCanvas = (cssX: number, cssY: number): DigitSampleResult | null => {
      if (!renderer || !gl || !canvas) return null;

      // Sync latest pointer position to uniform in CSS pixels
      if (isPointerInside) {
        const x = latestClientX - canvasRect.left;
        const y = latestClientY - canvasRect.top;
        if (x >= 0 && x <= canvasRect.width && y >= 0 && y <= canvasRect.height) {
          program.uniforms.uPointer.value[0] = x;
          program.uniforms.uPointer.value[1] = y;
        } else {
          program.uniforms.uPointer.value[0] = -999.0;
          program.uniforms.uPointer.value[1] = -999.0;
        }
      } else {
        program.uniforms.uPointer.value[0] = -999.0;
        program.uniforms.uPointer.value[1] = -999.0;
      }

      // Ensure frame buffer is freshly rendered
      renderer.render({ scene: mesh });
      gl.finish();

      const dpr = renderer.dpr || 1.0;
      const cellX = Math.floor(cssX / cellSizeVal);
      const cellY = Math.floor(cssY / cellSizeVal);
      const cellSizePx = cellSizeVal * dpr;

      // WebGL pixel coordinates: Y=0 is bottom
      const cellLeft = Math.floor(cellX * cellSizePx);
      const cellTop = Math.floor(cellY * cellSizePx);
      const boxW = Math.max(1, Math.min(Math.floor(cellSizePx), canvas.width - cellLeft));
      const boxH = Math.max(1, Math.min(Math.floor(cellSizePx), canvas.height - cellTop));
      const glBottom = Math.max(0, Math.floor(canvas.height - (cellTop + boxH)));

      const pixelBuffer = new Uint8Array(boxW * boxH * 4);
      gl.readPixels(cellLeft, glBottom, boxW, boxH, gl.RGBA, gl.UNSIGNED_BYTE, pixelBuffer);

      let maxAlphaByte = 0;

      for (let i = 0; i < pixelBuffer.length; i += 4) {
        const a = pixelBuffer[i + 3] ?? 0;
        if (a > maxAlphaByte) {
          maxAlphaByte = a;
        }
      }

      const shaderAlpha = maxAlphaByte / 255;
      const canvasOpacity = parseFloat(getComputedStyle(canvas).opacity) || 1.0;
      const effectiveAlpha = shaderAlpha * canvasOpacity;

      // Luminance from active theme digit color uniform
      const uColor = program.uniforms.uColor.value as [number, number, number, number];
      const luminance = 0.2126 * uColor[0] + 0.7152 * uColor[1] + 0.0722 * uColor[2];

      // Compute active digit mathematically matching the shader in CSS pixels
      const sinVal = Math.sin(cellX * 12.9898 + cellY * 78.233) * 43758.5453;
      const h = sinVal - Math.floor(sinVal);
      let flip = 0.0;
      const uPointer = program.uniforms.uPointer.value;
      const cellCenterX = (cellX + 0.5) * cellSizeVal;
      const cellCenterY = (cellY + 0.5) * cellSizeVal;
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
        color: uColor,
      };
    };
  }

  function cleanup() {
    stopTicker();
    if (scrollEndTimeout !== null) {
      clearTimeout(scrollEndTimeout);
      scrollEndTimeout = null;
    }
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    themeObserver.disconnect();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', updateRect);
    colorSchemeQuery.removeEventListener('change', updateThemeColor);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener(MOTION_CHANGE_EVENT, onMotionChange);
    motionMedia.removeEventListener('change', onMotionChange);
    window.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerleave', onPointerLeave);
    canvas.removeEventListener('webglcontextlost', handleContextLost);

    if (import.meta.env.PUBLIC_E2E === 'true') {
      delete window.__sampleDigitCanvas;
    }
    delete window.__digitFieldDebug;

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
