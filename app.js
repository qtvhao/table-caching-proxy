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
    return new URL(originUrl);
}

const myProxy = createProxyMiddleware({
    target: 'http://localhost:8000',
    router: function (req) {
        let {requestFullUrl, origin} = getOriginUrl(req);
        console.log(origin, requestFullUrl)
        return origin; // protocol + host
    },
    onProxyReq(proxyReq, req) {
        let hostname = proxyReq.host;
        let host = req.headers.host;
        let url = req.url;
        let origin = getOrigin(host, url);
        proxyReq.path = origin.pathname
        let outgoingHeaders = {
            host: hostname,
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
app.use(myProxy); // add the proxy to express

app.listen(80);
