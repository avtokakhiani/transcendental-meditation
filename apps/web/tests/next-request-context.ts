// Test-only adapter: capture the installed Next after() scheduling boundary.
// Production uses Next's actual request lifecycle, never this adapter.
import { AsyncLocalStorage } from 'node:async_hooks';

export async function nextRequestContext() {
  Object.assign(globalThis, { AsyncLocalStorage });
  const { workAsyncStorage } = await import('next/dist/server/app-render/work-async-storage.external');
  const { workUnitAsyncStorage } = await import('next/dist/server/app-render/work-unit-async-storage.external');
  const pending: (() => unknown)[] = [];
  return {
    pending,
    run<T>(callback: () => T): T {
      const work = { afterContext: { after(task: () => unknown) { pending.push(task); } } };
      return workAsyncStorage.run(work as unknown as Parameters<typeof workAsyncStorage.run>[0], () =>
        workUnitAsyncStorage.run({ type: 'request', phase: 'action' } as Parameters<typeof workUnitAsyncStorage.run>[0], callback));
    },
    async drain() { while (pending.length) await pending.shift()!(); },
  };
}
