import { execFileSync, execSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)))

const git = (args, cwd) => execFileSync('git', args, { cwd, stdio: 'inherit' })
const gitOutput = (args, cwd) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim()

const remote = gitOutput(['remote', 'get-url', 'origin'], root)

console.log('› Building BÉT!…')
execSync('npm run build', { cwd: root, stdio: 'inherit' })

const dist = path.join(root, 'dist')
if (!fs.existsSync(path.join(dist, '.nojekyll'))) {
  fs.writeFileSync(path.join(dist, '.nojekyll'), '')
}

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'bet-pages-'))
try {
  fs.cpSync(dist, temp, { recursive: true })
  fs.writeFileSync(path.join(temp, '.nojekyll'), '')

  console.log('› Publishing dist/ to gh-pages…')
  git(['init', '-b', 'gh-pages'], temp)
  git(['add', '-A'], temp)
  git(
    [
      '-c',
      `user.name=${gitOutput(['config', 'user.name'], root) || 'BÉT! deploy'}`,
      '-c',
      `user.email=${gitOutput(['config', 'user.email'], root) || 'noreply@github.com'}`,
      'commit',
      '-m',
      `Deploy BÉT! — ${new Date().toISOString()}`,
    ],
    temp,
  )
  git(['remote', 'add', 'origin', remote], temp)
  git(['push', '--force', 'origin', 'gh-pages'], temp)

  const match = remote.match(/github\.com[/:]([^/]+)\/(.+?)(?:\.git)?$/i)
  if (match) {
    console.log(`✓ Live at https://${match[1]}.github.io/${match[2]}/`)
  }
  console.log('✓ gh-pages updated. GitHub Pages will rebuild in a few seconds.')
} finally {
  fs.rmSync(temp, { recursive: true, force: true })
}
