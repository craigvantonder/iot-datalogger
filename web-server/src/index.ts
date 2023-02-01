import Fastify from 'fastify'
import cors from '@fastify/cors'
import registerRoutes from './routes'
import fastifyStatic from '@fastify/static'
import { resolve } from 'path'
import { existsSync } from 'fs'
import { log } from './lib/util'
import { connect } from './lib/websocket'
import './lib/env-loader'

(async function () {
  try {
    // Ensure that the database exists
    const dbExists = await existsSync(resolve(__dirname, '..', '..', 'database', 'development.db'))
    if (!dbExists) {
      log('Unable to find the SQLite database, please execute the following command in your terminal:')
      log('npx prisma migrate dev --name "starting_point"')
      process.exit(1)
    }

    // Establish a connection to the websocket server
    connect()

    // Parse the environment configuration
    const { HOST, PORT, CLIENT_ORIGIN } = process.env

    // Initialise the fastify instance
    const fastify = Fastify({
      //logger: true
    })

    // Host files in the static directory (built client application)
    await fastify.register(fastifyStatic, {
      // The absolute path of the directory that contains the files to serve.
      root: resolve(__dirname, '..', 'dist', 'public'),
      // A URL path prefix used to create a virtual mount path for the static directory
      prefix: '/',
    })

    // Initialise cors plugin in development and production
    const { origin } = JSON.parse(CLIENT_ORIGIN as string)
    await fastify.register(cors, {
      origin,
      methods: ['OPTIONS','GET','POST']
    })

    // Handle routing logic
    await registerRoutes(fastify)

    // Start listening for traffic
    const address = await fastify.listen({
      host: HOST,
      port: parseInt(PORT!, 10)
    })
    log(`Web server listening for traffic at ${address}`)
  } catch (err: any) {
    log('Web server encountered an unhandled error: ', err)
    process.exit(1)
  }
})()