module.exports = {
  apps: [{
    name: 'historian-backend',
    script: 'npm',
    args: 'run backend:run:prod',
    cwd: '/opt/software/historian',
    env: {
      NODE_ENV: 'production',
      BETTER_AUTH_URL: 'https://historian-api.archit.xyz'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
