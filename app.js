const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const customRouter = function (req) {
    return 'http://www.example.org'; // protocol + host
};

const options = {
    target: 'http://localhost:8000',
    router: customRouter,
};

const myProxy = createProxyMiddleware(options);

const app = express();
app.use(myProxy); // add the proxy to express

app.listen(3000);
