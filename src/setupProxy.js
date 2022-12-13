const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    // app.use(
    //     createProxyMiddleware('/gameWs', {
            
    //         target: "wss://fartian.app:444/",
    //         target: 'wss://127.0.0.1:444',
    //         ws: true,
    //         changeOrigin: true,
    //         secure: true
    //     })
    // );

    app.use(
        createProxyMiddleware('/gameWs',{
            target: 'https://127.0.0.1:444',
			ws: true,
			secure: false,
            changeOrigin: true,
        })
    );

    app.use(
        createProxyMiddleware('/api',{
            target: 'https://127.0.0.1:444',
            changeOrigin: true,
            secure: false
        })
    );
};