module.exports = {
  apps: [
    {
      name: "historian-backend",
      script: "bun",
      args: "start",
      cwd: "/opt/software/historian",
      env: {
        NODE_ENV: "production",
        PORT: 3333,
      },
      log_file: "/home/arkits/.pm2/logs/historian-backend-out.log",
      err_file: "/home/arkits/.pm2/logs/historian-backend-error.log",
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
};
