const { resolve } = require('path')

const namespace = 'Websocket Relay'.replaceAll(' ', '_')
const name = 'iot-datalogger.craigvantonder.com'

module.exports = {
  apps : [{
    namespace,
    name,
    out_file: resolve(__dirname, '..', '..', 'logs', `${namespace}_${name}.log`),
    error_file: resolve(__dirname, '..', '..', 'logs', `${namespace}_${name}.error.log`),
    script : './dist/index.js',
    // https://pm2.keymetrics.io/docs/usage/docker-pm2-nodejs/#using-exec_mode-cluster-together-with-nuxtjs
    exec_mode: 'fork',
    // https://pm2.keymetrics.io/docs/usage/docker-pm2-nodejs/#enabling-graceful-shutdown
    // time in milliseconds before sending a final SIGKILL
    kill_timeout: 6000,
    // https://pm2.keymetrics.io/docs/usage/application-declaration/#control-flow
    // time in ms before forcing a reload if app not listening
    listen_timeout: 445000,
    // https://pm2.keymetrics.io/docs/usage/restart-strategies/#skip-auto-restart-for-specific-exit-codes
    stop_exit_codes: [0], // when the quit function is triggered during runtime
    // https://pm2.keymetrics.io/docs/usage/restart-strategies/#restart-delay
    // time to wait before restarting a crashed app (in milliseconds). defaults to 0
    restart_delay: 2000,
    // https://pm2.keymetrics.io/docs/usage/application-declaration/#control-flow
    // number of consecutive unstable restarts
    // (less than 1sec interval or custom time via min_uptime)
    // before your app is considered errored and stop being restarted
    max_restarts: 2,
    env: {
      NODE_ENV: 'production',
      PORT: 9080,
      HOST: '127.0.0.1'
    }
  }]
}
