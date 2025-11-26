/**
 * Value Animation Utility
 * Smooth animation for numerical values
 */

/** Easing functions */
export type EasingFunction = (t: number) => number;

export const easings: Record<string, EasingFunction> = {
  linear: (t) => t,
  easeOut: (t) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  easeOutBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};

/** Animation options */
export interface AnimateValueOptions {
  from: number;
  to: number;
  duration: number;
  easing?: keyof typeof easings | EasingFunction;
  onUpdate: (value: number) => void;
  onComplete?: () => void;
}

/**
 * Animate a value from one number to another
 */
export function animateValue(options: AnimateValueOptions): () => void {
  const { from, to, duration, onUpdate, onComplete } = options;

  // Get easing function
  let easing: EasingFunction;
  if (typeof options.easing === 'function') {
    easing = options.easing;
  } else {
    easing = easings[options.easing || 'easeOut'];
  }

  const startTime = performance.now();
  let animationId: number | null = null;

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easing(progress);

    const currentValue = from + (to - from) * easedProgress;
    onUpdate(currentValue);

    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
    } else {
      onUpdate(to); // Ensure final value is exact
      onComplete?.();
      animationId = null;
    }
  };

  animationId = requestAnimationFrame(animate);

  // Return cancel function
  return () => {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
    }
  };
}

/**
 * Format a number with commas and optional decimals
 */
export function formatAnimatedNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
