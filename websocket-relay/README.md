Websocket Relay
===============

This application routes messages from the HTTP endpoint that receives hardware telemetry and sends it to the web-based client software which displays it.

It exposes a websocket server implementation of the [ws](https://github.com/websockets/ws) library.

Using the default configuration in a local development environment the software is exposed at `ws://localhost:8080`  and this can be configured in the [.env file](https://github.com/craigvantonder/iot-datalogger/blob/main/websocket-relay/.env.template).

Operating Instructions
----------------------

Initially **you must** rename or copy [.env.template](https://github.com/craigvantonder/iot-datalogger/blob/main/websocket-relay/.env.template) to `.env` or `.env.production` and adjust the file contents as required by your own use case.

Initially **you must** install the required dependencies

    npm install

To start the development server (**Linux**)

    npm run dev

Alternatively, to start the development server (**Windows**)

    npm run dev-win

To compile the source code for production

    npm run build

To start the production server using PM2 (Tested Linux)

    npm start-production

View the `scripts` section of [package.json](https://github.com/craigvantonder/iot-datalogger/blob/main/websocket-relay/package.json) for more information.

Example Terminal Output
-----------------------

    $ npm run dev

    > websocket-relay@1.0.0 dev
    > NODE_ENV=development ts-node-dev --exit-child --respawn --transpile-only ./src/index.ts

    [INFO] 16:16:50 ts-node-dev ver. 2.0.0 (using ts-node ver. 10.9.1, typescript ver. 4.9.5)
    2023/02/01, 16:16:51 Websocket server listening for traffic at ws://localhost:8080
    2023/02/01, 16:16:58 Client socket connected with connectionId: f9e770c7-b3f9-47f4-9cfd-4788659ffa65
    2023/02/01, 16:17:11 Client socket connected with connectionId: e82094b6-f418-4700-8747-9484b2f3982e
    2023/02/01, 16:17:11 Received new message from client with connectionId e82094b6-f418-4700-8747-9484b2f3982e:  <Buffer 7b 22 61 63 74 69 6f 6e 22 3a 22 73 75 62 73 63 72 69 62 65 22 2c 22 63 68 61 6e 6e 65 6c 22 3a 22 64 65 76 69 63 65 22 7d>
    2023/02/01, 16:17:11 Parsed the message from client with connectionId e82094b6-f418-4700-8747-9484b2f3982e:  { action: 'subscribe', channel: 'device', message: undefined }
    2023/02/01, 16:17:11 Received new message from client with connectionId e82094b6-f418-4700-8747-9484b2f3982e:  <Buffer 7b 22 61 63 74 69 6f 6e 22 3a 22 73 75 62 73 63 72 69 62 65 22 2c 22 63 68 61 6e 6e 65 6c 22 3a 22 74 65 6c 65 6d 65 74 72 79 22 7d>
    2023/02/01, 16:17:11 Parsed the message from client with connectionId e82094b6-f418-4700-8747-9484b2f3982e:  { action: 'subscribe', channel: 'telemetry', message: undefined }
    2023/02/01, 16:17:19 Received new message from client with connectionId f9e770c7-b3f9-47f4-9cfd-4788659ffa65:  <Buffer 7b 22 61 63 74 69 6f 6e 22 3a 22 6e 6f 74 69 66 79 22 2c 22 63 68 61 6e 6e 65 6c 22 3a 22 74 65 6c 65 6d 65 74 72 79 22 2c 22 6d 65 73 73 61 67 65 22 ... 136 more bytes>
    2023/02/01, 16:17:19 Parsed the message from client with connectionId f9e770c7-b3f9-47f4-9cfd-4788659ffa65:  {
      action: 'notify',
      channel: 'telemetry',
      message: {
        id: 428,
        timestamp: '1675261039695',
        temperature: 27.10000038,
        humidity: 75,
        heatIndex: 29.47896004,
        soilMoisture: 100,
        deviceId: 1
      }
    }

Software Dependencies
---------------------

- [node](https://github.com/nodejs/node)
- [typescript](https://github.com/microsoft/TypeScript)
- [@types/node](https://www.npmjs.com/package/@types/node)
- [@types/ws](https://www.npmjs.com/package/@types/ws)
- [ts-node-dev](https://github.com/wclr/ts-node-dev)
- [ws](https://github.com/websockets/ws)
- [pm2](https://github.com/Unitech/pm2)
- [dotenv](https://github.com/motdotla/dotenv)