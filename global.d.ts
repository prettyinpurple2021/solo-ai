
interface Env {
  GOOGLE_AI_WORKER: {
    fetch: (request: Request) => Promise<Response>;
  };
  [key: string]: any;
}
