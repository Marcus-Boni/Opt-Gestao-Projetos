import { db } from '@optsolv/db';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../config/env';

const microsoftProvider =
  env.MICROSOFT_CLIENT_ID && env.MICROSOFT_CLIENT_SECRET
    ? {
        microsoft: {
          clientId: env.MICROSOFT_CLIENT_ID,
          clientSecret: env.MICROSOFT_CLIENT_SECRET,
          tenantId: env.MICROSOFT_TENANT_ID ?? 'common',
        },
      }
    : undefined;

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL ?? env.API_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: microsoftProvider,
  trustedOrigins: [env.WEB_URL],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});

async function toWebRequest(request: FastifyRequest) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) headers.set(key, value.join(','));
    else if (value !== undefined) headers.set(key, String(value));
  }

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const body = hasBody && request.body !== undefined ? JSON.stringify(request.body) : undefined;
  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (body !== undefined) init.body = body;

  return new Request(`${env.API_URL}${request.url}`, init);
}

async function sendWebResponse(response: Response, reply: FastifyReply) {
  response.headers.forEach((value, key) => {
    reply.header(key, value);
  });
  const body = await response.text();
  return reply.status(response.status).send(body);
}

export async function registerAuth(app: FastifyInstance) {
  app.all('/api/auth/*', async (request, reply) => {
    const response = await auth.handler(await toWebRequest(request));
    return sendWebResponse(response, reply);
  });
}
