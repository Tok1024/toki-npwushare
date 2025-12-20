const path = require('path')

module.exports = {
  apps: [
    {
      name: 'nwpushare',
      port: 3000,
      cwd: path.join(__dirname),
      instances: 2,  // 改为 2 个实例（适合 2核4G 服务器）
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',  // 降低内存限制
      script: './.next/standalone/server.js',
      // https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
      env: {
        NODE_ENV: 'production',
        HOSTNAME: '127.0.0.1',
        PORT: 3000
      }
    }
  ]
}
