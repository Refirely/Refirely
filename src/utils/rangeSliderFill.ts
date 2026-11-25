// Global synchronizer that keeps --range-progress on every <input type="range">
// updated in real time so CSS track gradients fill from the left up to the selected thumb position.

let isInitialized = false;

export function syncRangeInputProgress(el: HTMLInputElement) {
  if (!el || el.type !== 'range') return;
  const min = el.min !== '' ? Number(el.min) : 0;
  const max = el.max !== '' ? Number(el.max) : 100;
  const val = el.value !== '' ? Number(el.value) : min;
  const span = max - min;
  const pct =
    span > 0 && Number.isFinite(val)
      ? Math.min(100, Math.max(0, ((val - min) / span) * 100))
      : 0;
  el.style.setProperty('--range-progress', `${pct.toFixed(2)}%`);
}

export function syncAllRangeInputs(root: ParentNode = document) {
  const inputs = root.querySelectorAll<HTMLInputElement>('input[type="range"]');
  inputs.forEach(syncRangeInputProgress);
}

export function initGlobalRangeSliderFill() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (isInitialized) {
    syncAllRangeInputs();
    return;
  }
  isInitialized = true;

  // 1. Intercept HTMLInputElement.prototype.value setter so React state updates
  //    immediately update --range-progress on range sliders.
  const proto = HTMLInputElement.prototype;
  const valueDesc = Object.getOwnPropertyDescriptor(proto, 'value');
  if (valueDesc && valueDesc.set && valueDesc.get) {
    const originalSet = valueDesc.set;
    const originalGet = valueDesc.get;
    Object.defineProperty(proto, 'value', {
      configurable: true,
      enumerable: valueDesc.enumerable,
      get() {
        return originalGet.call(this);
      },
      set(v: any) {
        originalSet.call(this, v);
        if (this.type === 'range') {
          syncRangeInputProgress(this);
        }
      },
    });
  }

  // 2. Listen to user drag/input events in the capture phase
  const handleEvent = (e: Event) => {
    const target = e.target as HTMLInputElement | null;
    if (target && target.tagName === 'INPUT' && target.type === 'range') {
      syncRangeInputProgress(target);
    }
  };

  document.addEventListener('input', handleEvent, true);
  document.addEventListener('change', handleEvent, true);

  // 3. Observe newly mounted range sliders or attribute changes (min/max/value)
  const observer = new MutationObserver(mutations => {
    let shouldSyncAll = false;
    for (const m of mutations) {
      if (m.type === 'attributes' && m.target instanceof HTMLInputElement) {
        if (m.target.type === 'range') {
          syncRangeInputProgress(m.target);
        }
      } else if (m.type === 'childList' && m.addedNodes.length > 0) {
        shouldSyncAll = true;
      }
    }
    if (shouldSyncAll) {
      syncAllRangeInputs();
    }
  });

  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['value', 'min', 'max'],
    });
  }

  // Initial pass
  syncAllRangeInputs();
  requestAnimationFrame(() => syncAllRangeInputs());
}
