Web Client
==========

This application displays the hardware telemetry and provides an interface for modification of the hardware settings.

It exposes a web-based client interface using the [vue](https://github.com/vuejs/) library.

Using the default configuration in a local development environment the software is exposed at http://localhost:8082/ and this can be configured at in the [vite.config.ts file](https://github.com/craigvantonder/iot-datalogger/blob/main/web-client/vite.config.ts).

The application consists of various features:

- Displays the hardware telemetry in "realtime"
- Filter telemetry data by start and / or end date selection
- Set the hardware wakeup period / logging interval
- Enable or disable the active state of the blue LED

Operating Instructions
----------------------

Initially **you must** rename [.env.template](https://github.com/craigvantonder/iot-datalogger/blob/main/web-client/.env.template) to `.env`.

Initially **you must** install the required dependencies

    npm install

To start the development server (**Linux or Windows**)

    npm run dev

To compile the source code for production

    npm run build

View the `scripts` section of [package.json](https://github.com/craigvantonder/iot-datalogger/blob/main/web-client/package.json) for more information.

Example Terminal Output
-----------------------

    $ npm run dev

    VITE v4.0.4  ready in 430 ms

    ➜  Local:   http://localhost:8082/
    ➜  press h to show help

Software Dependencies
---------------------

- [node](https://github.com/nodejs/node)
- [typescript](https://github.com/microsoft/TypeScript)
- [@types/bootstrap](https://www.npmjs.com/package/@types/bootstrap)
- [@types/lodash.debounce](https://www.npmjs.com/package/@types/lodash.debounce)
- [@types/vue-select](https://www.npmjs.com/package/@types/vue-select)
- [vite](https://github.com/vitejs/vite)
- [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue)
- [vue](https://github.com/vuejs/)
- [vue-router](https://github.com/vuejs/router)
- [vue-tsc](https://github.com/johnsoncodehk/volar)
- [bootstrap](https://github.com/twbs/bootstrap)
- [@popperjs/core](https://github.com/floating-ui/floating-ui/tree/v2.x)
- [saas](https://github.com/sass)
- [eslint](https://github.com/eslint/eslint)
- [eslint-plugin-vue](https://github.com/vuejs/eslint-plugin-vue)
- [vue-select](https://github.com/sagalbot/vue-select)
- [vue-datepicker](https://github.com/Vuepic/vue-datepicker)
- [lodash.debounce](https://github.com/lodash/lodash/blob/master/debounce.js)