


import { analyze } from '../src/lib/compliance-analyzer'


describe('Compliance Scanner - analyze', () => {
  it('should detect a contact form but not a newsletter form', () => {
    const html = `
      <html>
        <body>
          <h2>Contact Us</h2>
          <form>
            <input type="text" name="name" />
            <input type="email" name="email" />
            <textarea name="message"></textarea>
            <button type="submit">Send</button>
          </form>
        </body>
      </html>
    `
    const result = analyze(html)
    expect(result.has_contact_form).toBe(true)
    expect(result.has_newsletter_signup).toBe(false)
    expect(result.data_collection_points).toContain('Contact Form')
    expect(result.data_collection_points).not.toContain('Newsletter Signup')
  })

  it('should detect a newsletter form but not a contact form', () => {
    const html = `
      <html>
        <body>
          <h3>Subscribe to our newsletter</h3>
          <form>
            <input type="email" name="email" />
            <button type="submit">Subscribe</button>
          </form>
        </body>
      </html>
    `
    const result = analyze(html)
    expect(result.has_contact_form).toBe(false)
    expect(result.has_newsletter_signup).toBe(true)
    expect(result.data_collection_points).not.toContain('Contact Form')
    expect(result.data_collection_points).toContain('Newsletter Signup')
  })

  it('should detect both a contact form and a newsletter form', () => {
    const html = `
      <html>
        <body>
          <h2>Contact Us</h2>
          <form id="contact-form">
            <input type="text" name="name" />
            <input type="email" name="email" />
            <textarea name="message"></textarea>
            <button type="submit">Send</button>
          </form>
          <h3>Subscribe to our newsletter</h3>
          <form id="newsletter-form">
            <input type="email" name="email" />
            <button type="submit">Subscribe</button>
          </form>
        </body>
      </html>
    `
    const result = analyze(html)
    expect(result.has_contact_form).toBe(true)
    expect(result.has_newsletter_signup).toBe(true)
    expect(result.data_collection_points).toContain('Contact Form')
    expect(result.data_collection_points).toContain('Newsletter Signup')
  })

  it('should not detect a contact or newsletter form for a generic form', () => {
    const html = `
      <html>
        <body>
          <form>
            <input type="text" name="username" />
            <input type="password" name="password" />
            <button type="submit">Login</button>
          </form>
        </body>
      </html>
    `
    const result = analyze(html)
    expect(result.has_contact_form).toBe(false)
    expect(result.has_newsletter_signup).toBe(false)
    expect(result.data_collection_points).not.toContain('Contact Form')
    expect(result.data_collection_points).not.toContain('Newsletter Signup')
  })
})
