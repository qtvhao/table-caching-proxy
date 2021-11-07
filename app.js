const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const proxyTable = {
    'http://localhost:3000/': 'https://www.example.org/',
}
const myProxy = createProxyMiddleware({
    target: 'http://localhost:8000',
    router: function (req) {
        const requestFullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        let origin = proxyTable[requestFullUrl];
        console.log(origin)
        return origin; // protocol + host
    },
    changeOrigin: true
});

const app = express();
app.use(myProxy); // add the proxy to express

app.listen(3000);
