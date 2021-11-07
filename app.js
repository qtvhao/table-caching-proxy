const express = require('express');
const {createProxyMiddleware} = require('http-proxy-middleware');
const axios = require('axios')

global.proxyTable = {
    'http://localhost/': 'https://www.example.org/',
    'http://localhost': 'https://www.example.org/',
}

function refreshProxyTable() {
    axios(process.env.PROXY_TABLE_REGISTRY)
        .then(function (resp) {
            if (typeof resp.data === "string") {
                global.proxyTable = JSON.parse(resp.data)
            }
            if (typeof resp.data === "object") {
                global.proxyTable = resp.data
            }
            console.log(global.proxyTable)
        })
}

refreshProxyTable()
setInterval(refreshProxyTable, 60e3 * 30)
const myProxy = createProxyMiddleware({
    target: 'http://localhost:8000',
    router: function (req) {
        const requestFullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        let origin = global.proxyTable[requestFullUrl];
        console.log(origin)
        return origin; // protocol + host
    },
    changeOrigin: true
});

const app = express();
app.use(myProxy); // add the proxy to express

app.listen(80);
