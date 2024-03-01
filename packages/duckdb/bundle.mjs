import esbuild from 'esbuild'
import mkdir from 'make-dir'
import path from 'path'
import { rimraf } from 'rimraf'
import { fileURLToPath } from 'url'

const TARGET_BROWSER = ['chrome64', 'edge79', 'firefox62', 'safari11.1']
const EXTERNALS_WEBWORKER = []

// Read CLI flags
let is_debug = false
let args = process.argv.slice(2)
if (args.length == 0) {
  console.warn('Usage: node bundle.mjs {debug/release}')
} else {
  if (args[0] == 'debug') is_debug = true
}
console.log(`DEBUG=${is_debug}`)
function printErr(err) {
  if (err) return console.log(err)
}

// -------------------------------
// Cleanup output directory

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dist = path.resolve(__dirname, 'dist')
mkdir.sync(dist)
rimraf.sync(`${dist}/*.wasm`)
rimraf.sync(`${dist}/*.d.ts`)
rimraf.sync(`${dist}/*.js`)
rimraf.sync(`${dist}/*.js.map`)
rimraf.sync(`${dist}/*.mjs`)
rimraf.sync(`${dist}/*.mjs.map`)
rimraf.sync(`${dist}/*.cjs`)
rimraf.sync(`${dist}/*.cjs.map`)

// -------------------------------
// Browser bundles

console.log('[ ESBUILD ] ocap-agent-data-init.worker.js')
esbuild.build({
  entryPoints: ['./src/worker/excel.worker.ts'],
  outfile: 'dist/ocap-agent-data-init.worker.js',
  platform: 'browser',
  format: 'iife',
  globalName: 'ocapagent',
  target: TARGET_BROWSER,
  bundle: true,
  minify: true,
  sourcemap: is_debug ? 'inline' : true,
  external: EXTERNALS_WEBWORKER,
  define: { 'process.release.name': '"browser"' }
})

// console.log('[ ESBUILD ] duckdb-browser.cjs');
// esbuild.build({
//     entryPoints: ['./src/targets/duckdb.ts'],
//     outfile: 'dist/duckdb-browser.cjs',
//     platform: 'browser',
//     format: 'cjs',
//     target: TARGET_BROWSER,
//     bundle: true,
//     minify: true,
//     sourcemap: is_debug ? 'inline' : true,
//     external: EXTERNALS_BROWSER,
//     define: { 'process.release.name': '"browser"' },
// });

// console.log('[ ESBUILD ] duckdb-browser.mjs');
// esbuild.build({
//     entryPoints: ['./src/targets/duckdb.ts'],
//     outfile: 'dist/duckdb-browser.mjs',
//     platform: 'browser',
//     format: 'esm',
//     globalName: 'duckdb',
//     target: TARGET_BROWSER,
//     bundle: true,
//     minify: true,
//     sourcemap: is_debug ? 'inline' : true,
//     external: EXTERNALS_BROWSER,
//     define: { 'process.release.name': '"browser"' },
// });
