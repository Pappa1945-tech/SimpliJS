# Installation

SimpliJS is designed to be used without a build step. You can include it directly in your HTML files.

## CDN (Recommended)

Include the minified version via jsDelivr:

```html
<script src="https://cdn.jsdelivr.net/gh/Pappa1945-tech/simplijs@v3.2.0/dist/simplijs.min.js"></script>
```

> Note: Replace `yourusername` with the actual GitHub repository owner once published.

## Local Installation

You can download `dist/simplijs.min.js` directly from the repository and include it in your project:

```html
<script src="./path/to/simplijs.min.js"></script>
```

## NPM Package (For Bundlers)

If you prefer to use a bundler (Vite, Webpack, etc.), you can install the package once published:

```bash
npm install simplijs
```

And import it in your modules:

```javascript
import { reactive, component, createApp } from 'simplijs';
```
