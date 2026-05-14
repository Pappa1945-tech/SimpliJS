export default {
    baseUrl: 'https://test-simplijs.com',
    entryFile: 'tests/verification/ssg-template.html',
    outDir: 'tests/verification/ssg-dist',
    minify: true,
    routes: {
        '/': '<h1>Home Page</h1>',
        '/about': '<h1>About Page</h1><a href="/">Back Home</a>'
    }
};
