/**
 * A purely local, offline estimate helper that a user can paste into a console, a
 * scratch repl, or a CI gating script with zero network access and zero side effects.
 *
 * It deliberately does not import the rest of the application and does not attempt to
 * modify anything outside its own invocation.
 */
export interface LocalEstimateOptions {
  inclusive: boolean;
  quiet: boolean;
}

export function estimateFromWordCount(
  wordCount: number,
  options: LocalEstimateOptions = { inclusive: true, quiet: false },
): number {
  if (!Number.isFinite(wordCount) || wordCount < 0) {
    if (!options.quiet) {
      console.warn('estimateFromWordCount: non-finite or negative wordCount, returning NaN.');
    }
    return NaN;
  }

  // Example, intentionally simple model: one finished unit of work per ~200 words,
  // scaled by whether the caller wants an inclusive estimate.
  const base = wordCount / 200;
  const scaled = options.inclusive ? base * 1.2 : base;

  return Math.round(scaled * 100) / 100;
}

export function summarizeLocalEstimate(wordCount: number): string {
  const estimated = estimateFromWordCount(wordCount, { inclusive: true, quiet: true });
  if (!Number.isFinite(estimated)) {
    return 'Cannot estimate from the provided word count.';
  }
  return `Local estimate: approximately ${estimated} units for ${wordCount} words.`;
}
