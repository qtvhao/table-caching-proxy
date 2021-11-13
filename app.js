const express = require('express');
const {createProxyMiddleware} = require('http-proxy-middleware');
const axios = require('axios')
const path = require("path");

global.proxyTable = {
    'http://localhost/': 'https://www.example.org/',
    'http://localhost': 'https://www.example.org/',
}

function refreshProxyTable() {
    if (typeof process.env.PROXY_TABLE_REGISTRY === "undefined") {
        return
    }
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

function getFullUrl(req) {
    return req.protocol + '://' + req.get('host') + req.originalUrl;
}

function getOriginUrl(req) {
    const requestFullUrl = getFullUrl(req);
    let origin = global.proxyTable[requestFullUrl];
    return {requestFullUrl, origin};
}

function getOrigin(host, url) {
    // noinspection HttpUrlsUsage
    let originUrl = global.proxyTable['https://' + host + url] || global.proxyTable['http://' + host + url];
    if (typeof originUrl === "undefined") {
        return undefined
    }
    return new URL(originUrl);
}

const myProxy = createProxyMiddleware({
    target: 'http://localhost:8000',
    router: function (req) {
        let {requestFullUrl, origin} = getOriginUrl(req);
        console.log(origin, '->', requestFullUrl)
        return origin; // protocol + host
    },
    onProxyRes(proxyRes, res, req) {
        const newHeaders = {}
        for (const proxyResHeaderKey in proxyRes.headers) {
            if (['content-type', 'content-length', 'connection', 'accept-ranges', 'vary'].includes(proxyResHeaderKey)) {
                newHeaders[proxyResHeaderKey] = proxyRes.headers[proxyResHeaderKey]
            }
        }
        newHeaders['cache-control'] = 'public, max-age=15552000'
        if (!newHeaders['content-type'].startsWith('image') || proxyRes.statusCode !== 200) {
            newHeaders['content-type'] = 'image/png'
            proxyRes.statusCode = 301
            newHeaders['location'] = '/monterey.jpeg'
        }
        proxyRes.headers = newHeaders
    },
    onProxyReq(proxyReq, req) {
        let hostname = proxyReq.host;
        let host = req.headers.host;
        let url = req.url;
        let origin = getOrigin(host, url);
        proxyReq.path = origin.pathname
        let outgoingHeaders = {
            host: hostname,
            accept: 'image/webp,image/png,image/svg+xml,image/*;q=0.8,video/*;q=0.8,*/*;q=0.5',
            pragma: 'no-cache',
            referer: 'https://www.google.com/',
            'cache-control': 'no-cache',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15',
            'accept-language': 'en-CA,en-US;q=0.9,en;q=0.8',
            'accept-encoding': 'gzip, deflate, br',
            connection: 'close'
        };
        let headerNames = proxyReq.getHeaderNames();
        for (let i = 0; i < headerNames.length; i++) {
            proxyReq.removeHeader(headerNames[i])
        }
        for (const outgoingHeadersKey in outgoingHeaders) {
            proxyReq.setHeader(outgoingHeadersKey, outgoingHeaders[outgoingHeadersKey])
        }
    },
    changeOrigin: true,
});

const app = express();
app.get('/monterey.jpeg', function (req, res) {
    return res.sendFile(path.resolve(__dirname, './monterey.jpeg'))
})
app.use(myProxy); // add the proxy to express
app.listen(80);
