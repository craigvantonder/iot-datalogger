const { resolve } = require('path')

const namespace = 'Web Server'.replaceAll(' ', '_')
const name = 'iot-datalogger.craigvantonder.com'

module.exports = {
  apps : [{
    namespace,
    name,
    out_file: resolve(__dirname, '..', 'logs', `${namespace}_${name}.log`),
    error_file: resolve(__dirname, '..', 'logs', `${namespace}_${name}.error.log`),
    script : './dist/index.js',
    // https://pm2.keymetrics.io/docs/usage/docker-pm2-nodejs/#using-exec_mode-cluster-together-with-nuxtjs
    exec_mode: 'fork',
    // https://pm2.keymetrics.io/docs/usage/docker-pm2-nodejs/#enabling-graceful-shutdown
    // time in milliseconds before sending a final SIGKILL
    kill_timeout: 6000,
    // https://pm2.keymetrics.io/docs/usage/application-declaration/#control-flow
    // time in ms before forcing a reload if app not listening
    listen_timeout: 440000,
    // https://pm2.keymetrics.io/docs/usage/restart-strategies/#restart-delay
    // time to wait before restarting a crashed app (in milliseconds). defaults to 0
    restart_delay: 2000,
    // https://pm2.keymetrics.io/docs/usage/application-declaration/#control-flow
    // number of consecutive unstable restarts
    // (less than 1sec interval or custom time via min_uptime)
    // before your app is considered errored and stop being restarted
    max_restarts: 2,
    // https://pm2.keymetrics.io/docs/usage/watch-and-restart/#auto-restart-apps-on-file-change
    // ignore_watch : ['./','./**/**'], // ignore all files
    // watch: ['./server_entry_point.js'/*,'./api','./config','./views'*/], // except this file
    // watch_delay: 1000, // delay between change registration,
    env: {
      NODE_ENV: 'development',
      PORT: 8080,
      HOST: '127.0.0.1'

    }
  }]
}

