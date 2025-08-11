// Minimal server-side polyfills for Web APIs that may be missing in older Node runtimes

// Polyfill global File if not present (Node < 20)
if (typeof (globalThis as any).File === "undefined") {
  class PolyfillFile extends Blob {
    public readonly name: string
    public readonly lastModified: number

    constructor(fileBits: BlobPart[] = [], fileName: string = "unknown", options: FilePropertyBag = {}) {
      super(fileBits, options)
      this.name = String(fileName)
      this.lastModified = typeof options.lastModified === "number" ? options.lastModified : Date.now()
    }
  }
  ;(globalThis as any).File = PolyfillFile
}


