// Performance HUD overlay (?perf=1) per docs/02-engineering/dev-environment.md.
// Active in preview, development, and test builds; stripped in production.

interface LongTaskRecord {
  duration: number;
  time: number;
}

export function initPerfOverlay(): void {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  if (params.get('perf') !== '1') return;

  // Create HUD element
  const overlay = document.createElement('div');
  overlay.id = 'perf-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  Object.assign(overlay.style, {
    position: 'fixed',
    bottom: '12px',
    right: '12px',
    zIndex: '99999',
    background: 'rgba(0, 0, 0, 0.85)',
    color: '#00ff88',
    fontFamily: 'monospace',
    fontSize: '11px',
    lineHeight: '1.4',
    padding: '8px 12px',
    borderRadius: '4px',
    pointerEvents: 'none',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
    maxWidth: '320px',
  });
  document.body.appendChild(overlay);

  // Track long tasks with 5s sliding window
  const recentTasks: LongTaskRecord[] = [];
  try {
    const observer = new PerformanceObserver((list) => {
      const now = performance.now();
      for (const entry of list.getEntries()) {
        recentTasks.push({ duration: entry.duration, time: now });
      }
    });
    observer.observe({ type: 'longtask', buffered: false });
  } catch {
    // Longtask observer not supported
  }

  // Frame timing & FPS calculation
  let frameCount = 0;
  let lastFpsTime = performance.now();
  let currentFps = 60;
  let lastFrameTime = 0;
  let prevFrameTimestamp = performance.now();

  function updateHUD() {
    const now = performance.now();
    frameCount++;
    lastFrameTime = now - prevFrameTimestamp;
    prevFrameTimestamp = now;

    if (now - lastFpsTime >= 500) {
      currentFps = Math.round((frameCount * 1000) / (now - lastFpsTime));
      frameCount = 0;
      lastFpsTime = now;
    }

    // Prune tasks older than 5 seconds
    while (recentTasks.length > 0 && now - (recentTasks[0]?.time ?? 0) > 5000) {
      recentTasks.shift();
    }
    const maxLongTask5s = recentTasks.reduce((max, t) => Math.max(max, t.duration), 0);

    const currentMotion = document.documentElement.getAttribute('data-motion') || 'normal';
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const envInfo = `Mode: motion=${currentMotion}, theme=${currentTheme}`;

    overlay.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 4px; color: #fff;">MansurVerse Perf HUD (?perf=1)</div>
      <div>FPS: ${currentFps} (${lastFrameTime.toFixed(1)}ms)</div>
      <div>Max Long Task (5s): ${maxLongTask5s.toFixed(1)}ms</div>
      <div style="color: #aaa;">${envInfo}</div>
    `;

    requestAnimationFrame(updateHUD);
  }

  requestAnimationFrame(updateHUD);
}
