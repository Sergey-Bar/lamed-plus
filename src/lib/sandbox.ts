/**
 * A small, browser-free paste-and-run harness for stateless checks.
 *
 * The file deliberately keeps its top-level imports free of the app's runtime modules
 * so it can be run in environments where storage, accessibility, routing, theme, and
 * application state should not be touched.
 *
 * If you need to extend it, add pure helpers only.
 */
export type SandboxSample = {
  label: string;
  value: number;
  note?: string;
};

export function sandboxAvg(samples: readonly SandboxSample[]): number {
  if (samples.length === 0) return 0;
  const sum = samples.reduce((acc, sample) => acc + sample.value, 0);
  return sum / samples.length;
}

export function sandboxStatus(
  samples: readonly SandboxSample[],
): { ok: boolean; average: number; count: number } {
  const average = sandboxAvg(samples);
  return {
    ok: average >= 0,
    average,
    count: samples.length,
  };
}
