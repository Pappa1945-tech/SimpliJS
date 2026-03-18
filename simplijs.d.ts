declare module 'simplijs' {
  // Utility Types
  export type EffectFunction = () => void;

  // Reactivity
  export function effect(fn: EffectFunction): void;
  export function reactive<T extends object>(obj: T): T;
  export function ref<T>(value?: T): { value: T };
  export function computed<T>(getter: () => T): { readonly value: T };
  export function watch<T>(source: T | (() => T), callback: (newValue: T, oldValue: T) => void): void;

  export namespace reactive {
    export interface AsyncState<T> {
      loading: boolean;
      error: Error | null;
      value: T | null;
    }
    // Async State Management (Feature 5)
    export function async<T>(fn: () => Promise<T>): AsyncState<T>;

    export interface Vault<T> {
      back(): void;
      forward(): void;
      share(): string;
    }
    // Time Vault (Feature 13)
    export function vault<T extends object>(obj: T, limit?: number): T & { vault: Vault<T> };
  }

  // Components
  export interface ComponentLifecycle {
    onMount?: () => void;
    onUpdate?: () => void;
    onDestroy?: () => void;
    onError?: (err: Error) => void;
    render?: () => string;
  }
  
  export type SetupFunction = (element: HTMLElement, props: any) => (() => string) | string | (ComponentLifecycle & { [key: string]: any });
  export function component(name: string, setup: SetupFunction): void;

  // Core App & Forms
  export interface FormOptions<TData = Record<string, any>> {
    fields: string[];
    validate?: Partial<Record<keyof TData, (value: any, data: TData) => string | null>>;
    onError?: (errors: Record<string, string>) => void;
    submit: (data: TData) => Promise<void> | void;
  }

    export interface App {
    view(fn: () => string): this;
    mount(): this;
    form<TData = Record<string, any>>(options: FormOptions<TData>): (e: Event) => void;
  }

  export function createApp(rootSelector: string): App;
  export function emit(event: string, data?: any): void;
  export function on(event: string, callback: (data: any) => void): void;
  
  // Hydration & Islands (Feature 6 & 7)
  export function hydrate(element?: HTMLElement): void;

  // Router
  export type RouteHandler = string | (() => string | Promise<string> | void);
  export interface Routes {
    [path: string]: RouteHandler;
  }
  
  export interface RouterOptions {
    root?: string | HTMLElement;
    mode?: 'hash' | 'history';
  }

  export interface Router {
    navigate(path: string): void;
    transition(type: 'slide' | 'fade' | string): void;
  }
  export function createRouter(routes: Routes, options?: RouterOptions): Router;

  // SEO
  export interface MetaTag {
    name?: string;
    property?: string;
    content: string;
  }
  export interface HeadConfig {
    title?: string;
    meta?: MetaTag[];
    links?: Record<string, string>[];
  }
  export function useHead(config: HeadConfig | (() => HeadConfig)): void;

  // SSR / SSG
  export interface SSRRenderOptions {
    data?: Record<string, any>;
  }
  export function renderToString(template: string | (() => string), options?: SSRRenderOptions): string;
  export function renderToStaticMarkup(content: string, headHtml?: string, template?: string): string;

  // Bridge (Feature 12)
  export interface Bridge {
    react(url: string, name?: string): string;
    vue(url: string, name?: string): string;
    svelte(url: string, name?: string): string;
  }
  export const use: Bridge;

  // Renderer
  export function render(container: string | HTMLElement, html: string): void;
  export function domPatch(container: string | HTMLElement, html: string, host?: any): void;

  // Utils
  export function warn(msg: string, tip?: string): void;
  export function error(msg: string, tip?: string): void;
  export function fadeIn(el: string | HTMLElement, duration?: number): void;
  export function fadeOut(el: string | HTMLElement, duration?: number): void;

  export const VERSION: string;
}
