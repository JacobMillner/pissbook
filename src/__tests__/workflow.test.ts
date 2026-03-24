import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { parse as parseYaml } from 'yaml'

describe('GitHub Actions workflow', () => {
  const workflowPath = resolve(__dirname, '../../.github/workflows/deploy.yml')

  it('deploy.yml exists', () => {
    expect(existsSync(workflowPath)).toBe(true)
  })

  it('workflow triggers on push to trunk', () => {
    const content = readFileSync(workflowPath, 'utf-8')
    const doc = parseYaml(content)
    expect(doc.on?.push?.branches).toContain('trunk')
  })

  it('workflow has a test job', () => {
    const content = readFileSync(workflowPath, 'utf-8')
    expect(content).toContain('npm test')
  })

  it('workflow has a build step', () => {
    const content = readFileSync(workflowPath, 'utf-8')
    expect(content).toContain('npm run build')
  })

  it('workflow deploys to github-pages', () => {
    const content = readFileSync(workflowPath, 'utf-8')
    expect(content).toContain('github-pages')
  })
})
