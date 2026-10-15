module.exports = {
  apps: [
    {
      name: "parkbot-app",
      script: "./node_modules/@react-router/serve/bin.cjs",
      cwd: __dirname,
      interpreter: "/home/parkbot/.nvm/versions/node/v24.18.0/bin/node",
      node_args: ["--env-file=.env"],
      args: ["./build/server/index.js"],
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      max_memory_restart: "768M",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      out_file: "/dev/null",
      watch: false
    }
  ]
}
