// PM2 process config for AWS EC2
// Usage:
//   pm2 start ecosystem.config.js
//   pm2 restart pern-api
//   pm2 logs pern-api

module.exports = {
  apps: [
    {
      name:         "pern-api",
      script:       "src/index.js",
      cwd:          "/home/ubuntu/pern-todo/server",
      instances:    1,              // scale to "max" for multi-core
      autorestart:  true,
      watch:        false,          // never watch in production
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "production",
        PORT:     4000,
      },
      // Logs go to CloudWatch via the agent, but also keep local copies
      error_file:  "/home/ubuntu/logs/pern-api-error.log",
      out_file:    "/home/ubuntu/logs/pern-api-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
