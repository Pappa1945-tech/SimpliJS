declare module '@simplijs/simplijs/ssg' {
  export interface RSSOptions {
    title: string;
    description: string;
    items?: Array<{
      title: string;
      url: string;
      description: string;
      date?: string;
    }>;
  }

  export interface SSGOptions {
    /**
     * The input HTML template file.
     * @default 'index.html'
     */
    entryFile?: string;
    /**
     * The output directory for generated files.
     * @default 'dist'
     */
    outDir?: string;
    /**
     * Map of routes to content functions or strings.
     * @default {}
     */
    routes?: Record<string, string | (() => string | Promise<string>)>;
    /**
     * Base URL for canonical links and sitemap.
     */
    baseUrl?: string;
    /**
     * Whether to minify the output HTML.
     * @default true
     */
    minify?: boolean;
    /**
     * List of assets to preload (e.g. ['/src/index.js']).
     * @default []
     */
    preload?: string[];
    /**
     * RSS feed configuration.
     */
    rss?: RSSOptions;
    /**
     * Global state to inject for hydration.
     */
    state?: Record<string, any>;
    /**
     * Directories to copy into the output directory.
     */
    include?: string[];
  }

  /**
   * Generates a static site from a SimpliJS application.
   */
  export function generateSSG(options?: SSGOptions): Promise<void>;
}
