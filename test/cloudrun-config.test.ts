import { readFileSync } from 'fs'
import { join } from 'path'
import * as yaml from 'js-yaml'

describe('Cloud Run deployment configuration', () => {
  let cloudbuildContent: string
  let cloudrunContent: string

  beforeAll(() => {
    const cloudbuildPath = join(process.cwd(), 'cloudbuild.yaml')
    const cloudrunPath = join(process.cwd(), 'cloudrun.yaml')
    
    cloudbuildContent = readFileSync(cloudbuildPath, 'utf-8')
    cloudrunContent = readFileSync(cloudrunPath, 'utf-8')
  })

  describe('Image configuration consistency', () => {
    it('should use consistent image repository in cloudbuild.yaml and cloudrun.yaml', () => {
      const imagePath = 'us-central1-docker.pkg.dev/soloboss-ai-v3/soloboss-ai-platform/soloboss-ai-platform'
      
      // Check cloudbuild.yaml references the correct image
      expect(cloudbuildContent).toMatch(new RegExp(imagePath))
      
      // Check cloudrun.yaml references the same image (without tag)
      expect(cloudrunContent).toMatch(new RegExp(imagePath))
    })

    it('should use correct service name in cloudbuild.yaml', () => {
      // Ensure the service name matches the expected production service
      expect(cloudbuildContent).toMatch(/soloboss-ai-platform/)
    })
  })

  describe('Port configuration', () => {
    it('should configure port 3000 in cloudbuild.yaml', () => {
      // Verify the port is explicitly set to 3000
      expect(cloudbuildContent).toMatch(/- '--port'\s*\n\s*- '3000'/)
    })

    it('should use port 3000 in health checks in cloudrun.yaml', () => {
      const cloudrunData = yaml.load(cloudrunContent) as any
      const container = cloudrunData.spec.template.spec.containers[0]
      
      expect(container.startupProbe.httpGet.port).toBe(3000)
      expect(container.livenessProbe.httpGet.port).toBe(3000)
    })
  })

  describe('Resource configuration', () => {
    it('should have proper resource limits in cloudbuild.yaml', () => {
      expect(cloudbuildContent).toMatch(/- '--cpu'\s*\n\s*- '2'/)
      expect(cloudbuildContent).toMatch(/- '--memory'\s*\n\s*- '2Gi'/)
    })
  })
})

export {}