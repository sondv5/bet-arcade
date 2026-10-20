import { execFileSync, execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const remote = execFileSync('git', ['remote', 'get-url', 'origin'], { cwd: root, encoding: 'utf8' }).trim()
// Supports https://github.com/owner/repo(.git), git@github.com:owner/repo(.git)
// and SSH aliases such as git@github-personal:owner/repo(.git)
const match = remote.match(/(?:github\.com[:/]|github-[^:/]+[:/])([^/]+)\/(.+?)(?:\.git)?$/i)

if (!match) {
  console.error('✗ Could not parse the GitHub owner/repo from the "origin" remote.')
  process.exit(1)
}

const [owner, repo] = match.slice(1)
const repoSlug = `${owner}/${repo}`

const run = (cmd, args) => execFileSync(cmd, args, { cwd: root, encoding: 'utf8' }).trim()

console.log('› Building BÉT!…')
execSync('npm run build', { cwd: root, stdio: 'inherit' })

const dist = path.join(root, 'dist')
if (!fs.existsSync(path.join(dist, '.nojekyll'))) {
  fs.writeFileSync(path.join(dist, '.nojekyll'), '')
}

console.log('› Triggering the "Deploy to GitHub Pages" workflow…')
run('gh', ['workflow', 'run', 'deploy.yml', '--repo', repoSlug, '--ref', 'main'])

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

console.log('› Waiting for the deployment to finish…')
let conclusion = null
let runUrl = ''
for (let i = 0; i < 60; i += 1) {
  await sleep(5000)
  const json = run('gh', ['run', 'list', '--repo', repoSlug, '--workflow', 'deploy.yml', '--limit', '1', '--json', 'status,conclusion,url'])
  const [runInfo] = JSON.parse(json)
  conclusion = runInfo?.conclusion
  runUrl = runInfo?.url ?? ''
  if (runInfo?.status === 'completed') break
}

if (conclusion === 'success') {
  console.log(`✓ Live at https://${owner}.github.io/${repo}/`)
  if (runUrl) console.log(`✓ ${runUrl}`)
} else {
  console.error(`✗ Deployment did not succeed (conclusion: ${conclusion ?? 'timeout'}).`)
  process.exit(1)
}
