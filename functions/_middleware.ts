// HTTP Basic Auth — attivo solo quando ENVIRONMENT=staging
// In produzione (ENVIRONMENT assente o diverso) la richiesta passa senza controllo.

interface Env {
  ENVIRONMENT?: string
  BASIC_AUTH_USER?: string
  BASIC_AUTH_PASS?: string
}

interface PagesContext {
  request: Request
  env: Env
  next: () => Promise<Response>
}

export const onRequest = async ({ request, env, next }: PagesContext): Promise<Response> => {
  if (env.ENVIRONMENT !== 'staging') return next()

  const user = env.BASIC_AUTH_USER
  const pass = env.BASIC_AUTH_PASS
  if (!user || !pass) {
    console.error('[middleware] BASIC_AUTH_USER o BASIC_AUTH_PASS non configurati')
    return next()
  }

  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Basic ')) {
    const decoded = atob(authHeader.slice(6))
    const colonIdx = decoded.indexOf(':')
    if (colonIdx !== -1) {
      const reqUser = decoded.slice(0, colonIdx)
      const reqPass = decoded.slice(colonIdx + 1)
      if (reqUser === user && reqPass === pass) return next()
    }
  }

  return new Response('Accesso riservato all\'ambiente di test.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Viaggiatore nel Tempo — Test"' },
  })
}
