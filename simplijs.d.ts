declare module 'simplijs' {
  // Utility Types
  export type EffectFunction = () => void;

  // Reactivity
  export function effect(fn: EffectFunction): void;
  export function reactive<T extends object>(obj: T): T;

  export namespace reactive {
    export interface AsyncState<T> {
      loading: boolean;
      error: Error | null;
      value: T | null;
    }
    // Async State Management (Feature 5)
    export function async<T>(fn: () => Promise<T>): AsyncState<T>;
  }

  // Components
  export interface ComponentLifecycle {
    onMount?: () => void;
    onUpdate?: () => void;
    onDestroy?: () => void;
  }
  
  export type SetupFunction = (element: HTMLElement) => (() => string) | string | (ComponentLifecycle & { render?: () => string });
  export function component(name: string, setup: SetupFunction): void;

  // Core App & Forms
  export interface FormOptions<TData = Record<string, any>> {
    fields: string[];
    validate?: Partial<Record<keyof TData, (value: any, data: TData) => string | null>>;
    submit: (data: TData) => Promise<void> | void;
  }

  export interface App {
    view(fn: () => string): this;
    mount(): void;
    form<TData = Record<string, any>>(options: FormOptions<TData>): (e: Event) => void;
  }

  export function createApp(rootSelector: string): App;
  
  // Hydration & Islands (Feature 6 & 7)
  export function hydrate(element?: HTMLElement): void;

  // Router
  export type RouteHandler = string | (() => string | void);
  export interface Routes {
    [path: string]: RouteHandler;
  }
  
  export interface Router {
    navigate(hash: string): void;
    transition(type: 'slide' | 'fade' | string): void;
  }
  export function createRouter(routes: Routes, rootElement?: string): Router;

  // Renderer
  export function render(container: string | HTMLElement, html: string): void;

  // Utils
  export function warn(msg: string): void;
  export function error(msg: string): void;

  export const VERSION: string;
}
