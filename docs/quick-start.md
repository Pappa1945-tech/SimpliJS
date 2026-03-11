# Quick Start

Get started with SimpliJS in just one file!

### `index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My SimpliJS App</title>
    <!-- Include SimpliJS -->
    <script src="https://path-to-cdn/simplijs.min.js"></script>
</head>
<body>
    <!-- The Root Element -->
    <div id="app"></div>

    <script>
        // Destructure features from SimpliJS global
        const { reactive, component, createApp } = SimpliJS;

        // 1. Create reactive state
        const state = reactive({ message: 'Hello, World!' });

        window.updateMessage = () => state.message = 'Hello, SimpliJS!';

        // 2. Define a component
        component('hello-world', () => {
            return () => `
                <div>
                    <h1>${state.message}</h1>
                    <button onclick="updateMessage()">Change Message</button>
                </div>
            `;
        });

        // 3. Mount the app
        createApp('#app').mount('<hello-world></hello-world>');
    </script>
</body>
</html>
```

Open this file in your browser, and you're done. No build step required!
