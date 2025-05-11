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
        PORT: 3000,
      },
    },
  ],
}; 