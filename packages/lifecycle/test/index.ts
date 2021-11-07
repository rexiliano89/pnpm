/// <reference path="../../../typings/index.d.ts"/>
import path from 'path'
import runLifecycleHook, { runPostinstallHooks } from '@pnpm/lifecycle'
import loadJsonFile from 'load-json-file'
import rimraf from 'rimraf'

const fixtures = path.join(__dirname, 'fixtures')
const rootModulesDir = path.join(__dirname, '..', 'node_modules')

test('runLifecycleHook()', async () => {
  const pkgRoot = path.join(fixtures, 'simple')
  const pkg = await import(path.join(pkgRoot, 'package.json'))
  await runLifecycleHook('postinstall', pkg, {
    depPath: '/simple/1.0.0',
    optional: false,
    pkgRoot,
    rawConfig: {},
    rootModulesDir,
    unsafePerm: true,
  })

  expect((await import(path.join(pkgRoot, 'output.json'))).default).toStrictEqual(['install'])
})
test('runLifecycleHook()#3907', async () => {
  const pkgRoot = path.join(fixtures, 'issue-3907')
  const pkg = await import(path.join(pkgRoot, 'package.json'))
  await runLifecycleHook('echo', pkg, {
    depPath: '/issue-3907/1.0.0',
    pkgRoot,
    rawConfig: {},
    rootModulesDir,
    unsafePerm: true,
    args: ['Revert "feature (#1)"', '\'', '\\', 'TXT'],
  })

  expect((await import(path.join(pkgRoot, 'output.json'))).default).toStrictEqual([
    'Revert "feature (#1)"',
    "\\'",
    '\\',
    'TXT',
  ])
})

test('runPostinstallHooks()', async () => {
  const pkgRoot = path.join(fixtures, 'with-many-scripts')
  rimraf.sync(path.join(pkgRoot, 'output.json'))
  await runPostinstallHooks({
    depPath: '/with-many-scripts/1.0.0',
    optional: false,
    pkgRoot,
    rawConfig: {},
    rootModulesDir,
    unsafePerm: true,
  })

  expect(loadJsonFile.sync(path.join(pkgRoot, 'output.json'))).toStrictEqual(['preinstall', 'install', 'postinstall'])
})
