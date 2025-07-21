module.exports = {
  apps: [
    {
      name: 'ai-search-analyzer-dev',
      script: 'npm',
      args: 'run next:dev',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        HOST: '0.0.0.0',
      },
      watch: false,
      autorestart: true,
      restart_delay: 1000,
      max_restarts: 10,
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
    },
  ],
};
