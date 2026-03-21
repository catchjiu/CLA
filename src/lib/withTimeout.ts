/** Default cap for Supabase browser fetches that might hang (sleep, network stalls). */
export const SUPABASE_REQUEST_TIMEOUT_MS = 40_000;

export function withTimeout<T>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const tid = window.setTimeout(() => {
      reject(
        new Error(
          `${label} timed out after ${Math.round(ms / 1000)}s. Check your connection and try again.`
        )
      );
    }, ms);
    Promise.resolve(promise).then(
      (value) => {
        window.clearTimeout(tid);
        resolve(value);
      },
      (err) => {
        window.clearTimeout(tid);
        reject(err);
      }
    );
  });
}
