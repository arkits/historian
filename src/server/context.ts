export interface Context {
  headers: Headers;
}

export async function createContext(headers: Headers): Promise<Context> {
  return { headers };
}
