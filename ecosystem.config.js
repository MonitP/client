module.exports = {
  apps: [
    {
      name: 'monitor-client',
      script: 'npm',
      args: 'run start',
      instances: 1,
      autorestart: true,
      watch: true,
      ignore_watch: ['node_modules'],
      env: {
        NODE_ENV: 'production',
        PORT: 14002,
        HOST: '0.0.0.0',
        REACT_APP_SERVER_URL: 'http://gsrnd.m3sen.com:14200',
      },
    },
  ],
}; 