const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/cvs/ws',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      ws: true,
    })
  );

  app.use(
    '/backend',
    createProxyMiddleware({
      target: 'http://localhost:7000',
      changeOrigin: true,
    })
  );
};
