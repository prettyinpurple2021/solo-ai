// Minimal server-side polyfills for Web APIs that may be missing in older Node runtimes

// Local minimal types to avoid depending on DOM lib typings
type PolyfillBlobPart = string | ArrayBuffer | Uint8Array | any
interface PolyfillFileOptions { type?: string; lastModified?: number }
type PolyfillFormDataEntryValue = string | any

// Only define polyfills if we're in a Node.js environment (not browser)
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  // Polyfill global File if not present (Node < 20)
  if (typeof (globalThis as any).File === "undefined") {
    // Simple File-like class for server-side use
    class PolyfillFile {
      public readonly name: string
      public readonly lastModified: number
      public readonly size: number
      public readonly type: string
      private _buffer: any

      constructor(fileBits: PolyfillBlobPart[] = [], fileName: string = "unknown", options: PolyfillFileOptions = {}) {
        this.name = String(fileName)
        this.lastModified = typeof options.lastModified === "number" ? options.lastModified : Date.now()
        this.type = options.type || ''

        // Convert file bits to buffer
        const buffers: any[] = []
        for (const bit of fileBits) {
          if (typeof bit === 'string') {
            buffers.push(Buffer.from(bit, 'utf-8'))
          } else if (bit instanceof ArrayBuffer) {
            buffers.push(Buffer.from(bit))
          } else if (bit instanceof Uint8Array) {
            buffers.push(Buffer.from(bit))
          } else if (Buffer.isBuffer(bit)) {
            buffers.push(bit)
          }
        }
        this._buffer = Buffer.concat(buffers)
        this.size = this._buffer.length
      }

      arrayBuffer(): Promise<ArrayBuffer> {
        return Promise.resolve(this._buffer.buffer.slice(this._buffer.byteOffset, this._buffer.byteOffset + this._buffer.byteLength))
      }

      text(): Promise<string> {
        return Promise.resolve(this._buffer.toString('utf-8'))
      }

      stream(): any {
        // Simple implementation for compatibility
        throw new Error('stream() not implemented in polyfill')
      }
    }
    ; (globalThis as any).File = PolyfillFile
  }

  // Polyfill global FormData if not present
  if (typeof (globalThis as any).FormData === "undefined") {
    class PolyfillFormData {
      private _data: Map<string, string | any> = new Map()

      append(name: string, value: any, fileName?: string): void {
        this._data.set(name, value as string | any)
      }

      get(name: string): PolyfillFormDataEntryValue | null {
        return this._data.get(name) || null
      }

      has(name: string): boolean {
        return this._data.has(name)
      }

      set(name: string, value: any, fileName?: string): void {
        this._data.set(name, value as string | any)
      }

      delete(name: string): void {
        this._data.delete(name)
      }

      *entries(): IterableIterator<[string, PolyfillFormDataEntryValue]> {
        for (const [key, value] of Array.from(this._data)) {
          yield [key, value]
        }
      }

      *keys(): IterableIterator<string> {
        for (const key of this._data.keys()) {
          yield key
        }
      }

      *values(): IterableIterator<PolyfillFormDataEntryValue> {
        for (const value of this._data.values()) {
          yield value
        }
      }

      [Symbol.iterator](): IterableIterator<[string, PolyfillFormDataEntryValue]> {
        return this.entries()
      }
    }
    ; (globalThis as any).FormData = PolyfillFormData
  }
}


export { }
