import { readFileSync } from 'fs'
import { join } from 'path'

describe('Dockerfile configuration', () => {
  let dockerfileContent: string

  beforeAll(() => {
    // Read the Dockerfile content
    const dockerfilePath = join(process.cwd(), 'Dockerfile')
    dockerfileContent = readFileSync(dockerfilePath, 'utf-8')
  })

  describe('npm ci command configuration', () => {
    it('should use npm ci with legacy-peer-deps flag', () => {
      // Test that the npm ci command is present with legacy-peer-deps
      expect(dockerfileContent).toMatch(/RUN npm ci --legacy-peer-deps/)
    })

    it('should not include --only=production flag', () => {
      // Test that the --only=production flag has been removed
      expect(dockerfileContent).not.toMatch(/RUN npm ci.*--only=production/)
    })

    it('should have the correct npm ci command format', () => {
      // Test the exact command format to ensure it matches the expected change
      const lines = dockerfileContent.split('\n')
      const npmCiLine = lines.find(line => line.includes('npm ci'))
      
      expect(npmCiLine).toBeDefined()
      expect(npmCiLine?.trim()).toBe('RUN npm ci --legacy-peer-deps')
    })

    it('should maintain the legacy-peer-deps flag for compatibility', () => {
      // Ensure legacy-peer-deps is still present for npm compatibility
      expect(dockerfileContent).toMatch(/--legacy-peer-deps/)
    })
  })

  describe('Docker stage configuration', () => {
    it('should have the deps stage properly configured', () => {
      // Verify the deps stage is correctly set up
      expect(dockerfileContent).toMatch(/FROM base AS deps/)
    })

    it('should copy package files before npm ci', () => {
      // Ensure package.json and package-lock.json are copied before npm ci
      const lines = dockerfileContent.split('\n')
      const copyIndex = lines.findIndex(line => line.includes('COPY package.json package-lock.json'))
      const npmCiIndex = lines.findIndex(line => line.includes('npm ci'))
      
      expect(copyIndex).toBeGreaterThan(-1)
      expect(npmCiIndex).toBeGreaterThan(-1)
      expect(copyIndex).toBeLessThan(npmCiIndex)
    })
  })

  describe('Multi-stage build structure', () => {
    it('should have the correct build stages', () => {
      // Verify all required stages are present
      expect(dockerfileContent).toMatch(/FROM node:20-alpine AS base/)
      expect(dockerfileContent).toMatch(/FROM base AS deps/)
      expect(dockerfileContent).toMatch(/FROM deps AS builder/)
      expect(dockerfileContent).toMatch(/FROM base AS runner/)
    })

    it('should maintain the correct working directory', () => {
      // Ensure WORKDIR is set correctly
      expect(dockerfileContent).toMatch(/WORKDIR \/app/)
    })
  })

  describe('Dependency installation impact', () => {
    it('should allow both production and dev dependencies to be installed', () => {
      // With --only=production removed, both prod and dev deps should be available
      // This is an indirect test - we verify the flag is not present
      const npmCiCommand = dockerfileContent.match(/RUN npm ci[^\n]*/)?.[0]
      expect(npmCiCommand).toBeDefined()
      expect(npmCiCommand).not.toContain('--only=production')
      expect(npmCiCommand).not.toContain('--production')
    })
  })
})

export {}