import { readdir } from 'fs/promises'
import type { FastifyInstance } from 'fastify'

export default async function(fastify: FastifyInstance) {
  const ext = process.env.NODE_ENV === 'development' ? '.ts' : '.js'
  const directoryContents = await readdir(__dirname)
  const folders = directoryContents.filter(ref => !ref.endsWith(ext))
  for (let i = 0, n = folders.length; i < n; i++) {
    const folder = folders[i]
    const folderDirectory = __dirname+'/'+folder
    const files = await readdir(folderDirectory)
    LOOP_FILES:
    for (let j = 0, o = files.length; j < o; j++) {
      const filename = files[j]
      if (!filename.endsWith(ext)) continue LOOP_FILES
      const modulePath = `./${folder}/${filename.replace(ext, '')}`
      const { default: registerRoutes } = await import(modulePath)
      registerRoutes(fastify)
    }
  }
}