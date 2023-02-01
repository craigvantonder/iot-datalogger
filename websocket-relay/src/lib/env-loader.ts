// https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
// https://github.com/motdotla/dotenv/issues/133#issuecomment-255298822
import { resolve } from 'path'
import * as dotenv from 'dotenv'

// Parse and validate the runtime environment
const NODE_ENV = process.env.NODE_ENV
if (NODE_ENV === undefined) {
  console.error('Cannot proceed, NODE_ENV is not defined.')
  process.exit(1)
}

// Determine which dotenv configuration to apply
let dotenvFileName
if (NODE_ENV === 'development') dotenvFileName = '.env'
if (NODE_ENV === 'production') dotenvFileName = `.env.${NODE_ENV}`
if (dotenvFileName === undefined) {
  console.error('Cannot proceed, NODE_ENV is set but the value is not development or production.')
  process.exit(1)
}

// Validate the applications runtime environment variables
dotenv.config({ path: resolve(__dirname, '..', '..', dotenvFileName) })
const { HOST, PORT } = process.env
if (HOST === undefined || PORT === undefined) {
  console.error('Cannot proceed, unable to parse the environment variables from the .env file.')
  process.exit(1)
}