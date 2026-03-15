# Getting Started with HTML-First 🏁

Building your first reactive app with SimpliJS takes less than a minute. Follow these steps:

## Step 1: Include the Script
Add the SimpliJS bundle to your HTML file. You can use a CDN or local file.

```html
<script src="dist/simplijs.js"></script>
```

## Step 2: Define your Application Root
Use the `s-app` attribute to tell SimpliJS where to start scanning. Usually, this is a wrapper `div`.

```html
<div s-app>
   <!-- Your reactive app goes here -->
</div>
```

## Step 3: Initialize State
Use `s-state` to define your reactive variables. This uses JSON-like syntax.

```html
<div s-app s-state="{ name: 'SimpliJS' }">
    ...
</div>
```

## Step 4: Add Interactivity
Use directives like `s-bind` and `s-click` to make it alive.

```html
<div s-app s-state="{ name: 'SimpliJS', count: 0 }">
    <h1>Hello, {name}!</h1>
    
    <input s-bind="name" placeholder="Type your name...">
    
    <button s-click="count++">
        Clicked {count} times
    </button>
</div>
```

## Step 5: Master the Directives
Now that you have the basics, dive into the [Directives Reference](./reference/state.md) to learn about loops, conditionals, fetching data, and more!
