module.exports = {
  apps: [
    {
      name: "parkbot-app",
      script: "pm2",
      cwd: "/home/parkbot/github/parkbot-app",
      interpreter: "/home/parkbot/.nvm/versions/node/v24.18.0/bin/npm",
      interpreter_args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      max_memory_restart: "128M",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      out_file: "/dev/null",
      watch: false
    }
  ]
}
