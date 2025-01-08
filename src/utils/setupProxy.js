import { createProxyMiddleware } from 'http-proxy-middleware';

// Create proxy middleware
export const webhookProxy = createProxyMiddleware({
  target: 'https://webhook.site',
  changeOrigin: true,
  pathRewrite: {
    '^/webhook-proxy': '/token'
  },
  onProxyRes: function (proxyRes, req, res) {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  }
}); 