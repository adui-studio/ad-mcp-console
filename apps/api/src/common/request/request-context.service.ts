import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContextStore {
  requestId: string;
  method?: string;
  path?: string;
}

@Injectable()
export class RequestContextService {
  private readonly als = new AsyncLocalStorage<RequestContextStore>();

  run<T>(store: RequestContextStore, callback: () => T): T {
    return this.als.run(store, callback);
  }

  getStore(): RequestContextStore | undefined {
    return this.als.getStore();
  }

  getRequestId(): string | null {
    return this.als.getStore()?.requestId ?? null;
  }
}
