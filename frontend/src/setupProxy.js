const proxy = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/backend',
    proxy({
      target: 'http://localhost:7000',
      changeOrigin: true,
    })
  );
};
