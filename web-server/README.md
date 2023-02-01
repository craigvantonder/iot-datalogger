Web Server
==========

This application receives messages from the hardware and assists in the operation of the web-based client software.

It exposes a http server implementation of the [fastify](https://github.com/fastify/fastify) library.

Using the default configuration in a local development environment the software is exposed at `http://localhost:8081/` and this can be configured in the [.env file](https://github.com/craigvantonder/iot-datalogger/blob/main/web-server/.env.template).

The application consists of various features:

- Exposes a HTTP endpoint to receive "live" communications from the hardware
- Reads and writes the hardware telemetry from/to a SQLite database
- Handles websocket channel subscription, view routing and form submission for the web-based client software

Operating Instructions
----------------------

Initially **you must** rename or copy [.env.template](https://github.com/craigvantonder/iot-datalogger/blob/main/web-server/.env.template) to `.env` or `.env.production` and adjust the file contents as required by your own use case.

Initially **you must** install the required dependencies

    npm install

Initially **you must** create the SQLite database that is utilised by the web server. To create the database:

    npx prisma migrate dev --name "starting_point"

To start the development server (**Linux**)

    npm run dev

Alternatively, to start the development server (**Windows**)

    npm run dev-win

To compile the source code for production

    npm run build

To start the production server using PM2 (Tested Linux)

    npm start-production

View the `scripts` section of [package.json](https://github.com/craigvantonder/iot-datalogger/blob/main/web-server/package.json) for more information.

Example Terminal Output
-----------------------

    $ npm run dev

    > web-server@1.0.0 dev
    > NODE_ENV=development ts-node-dev --exit-child --respawn --transpile-only ./src/index.ts

    [INFO] 12:32:28 ts-node-dev ver. 2.0.0 (using ts-node ver. 10.9.1, typescript ver. 4.9.4)
    2023/01/31, 12:32:29 Established connection to websocket relay at ws://localhost:8080
    2023/01/31, 12:32:29 Web server listening for traffic at http://0.0.0.0:8081
    2023/01/31, 12:32:30 New registration request: req-1
    2023/01/31, 12:32:30 Request req-1 headers:  [
      'Host',
      '192.168.8.10:8081',
      'User-Agent',
      'ESP32HTTPClient',
      'Connection',
      'keep-alive',
      'Accept-Encoding',
      'identity;q=1,chunked;q=0.1,*;q=0',
      'Accept',
      'application/json',
      'Content-Type',
      'application/json',
      'Content-Length',
      '109'
    ]
    2023/01/31, 12:32:30 Request req-1 body:  {
      chipId: 6090984,
      chipModel: 'ESP32-D0WDQ5',
      chipRevision: 1,
      chipCores: 2,
      macAddress: '4C:75:25:5C:F0:E8'
    }
    2023/01/31, 12:32:30 Request req-1 response:  {
      id: 1,
      readingInterval: 'sec',
      manualReadingInterval: 30,
      userLed: false,
      deviceId: 1
    }
    2023/01/31, 12:32:31 New telemetry request: req-2
    2023/01/31, 12:32:31 Request req-2 body:  {
      chipId: 6090984,
      timestamp: 1675161151860,
      temperature: 26.10000038,
      humidity: 85,
      heatIndex: 28.074543,
      soilMoisture: 100
    }
    2023/01/31, 12:32:32 Request req-2 response:  { readingInterval: 'sec', manualReadingInterval: 30, userLed: false }

Software Dependencies
---------------------

- [node](https://github.com/nodejs/node)
- [typescript](https://github.com/microsoft/TypeScript)
- [@types/node](https://www.npmjs.com/package/@types/node)
- [@types/ws](https://www.npmjs.com/package/@types/ws)
- [ts-node-dev](https://github.com/wclr/ts-node-dev)
- [fastify](https://github.com/fastify/fastify)
- [@fastify/static](https://github.com/fastify/fastify-static)
- [@fastify/cors](https://github.com/fastify/fastify-cors)
- [prisma](https://github.com/prisma/prisma)
- [@prisma/client](https://www.prisma.io/docs/concepts/components/prisma-client)
- [ws](https://github.com/websockets/ws)
- [pm2](https://github.com/Unitech/pm2)
- [dotenv](https://github.com/motdotla/dotenv)