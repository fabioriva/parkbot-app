module.exports = {
  apps: [
    {
      name: "parkbot-app",
      script: "pm2",
      interpreter: "npm",
      interpreter_args: "run",
      max_memory_restart: '128M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      out_file: '/dev/null'
    }
  ]
}