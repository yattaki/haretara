import * as fs from 'fs'
import * as path from 'path'
import typescript from '@rollup/plugin-typescript'
import { minify } from 'uglify-es'

function uglify (userOptions = {}) {
  const options = { sourceMap: { url: 'out.js.map' }, ...userOptions }
  if (options.minify !== true) { return }
  options.minify = null

  return {
    name: 'uglify',
    renderChunk (code) {
      const result = minify(code, options)
      if (result.map) {
        const commentPos = result.code.lastIndexOf('//#')
        result.code = result.code.slice(0, commentPos).trim()
      }

      return result
    }
  }
}

const plugins = [
  typescript(),
  uglify()
]

const result = [
  {
    plugins,
    input: 'src/ts/haretara.ts',
    output: {
      dir: 'dist/public/js',
      format: 'esm'
    }
  },
  {
    plugins,
    input: 'src/server/app.ts',
    output: {
      dir: 'dist',
      format: 'cjs'
    }
  }
]

fs.readdir(path.join('src', 'ts', 'worker'), { withFileTypes: true }, (err, dirents) => {
  if (err && err.code !== 'ENOENT') { throw err }

  for (const dirent of dirents) {
    if (!dirent.isFile()) { continue }
    result.push({
      plugins,
      input: path.join('src', 'ts', 'worker', dirent.name),
      output: {
        dir: 'dist/public/js/worker',
        format: 'esm'
      }
    })
  }
})

export default result
