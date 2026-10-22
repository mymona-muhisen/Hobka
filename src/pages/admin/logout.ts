import type { APIRoute } from 'astro';
import { logoutCookie } from '../../lib/auth';
export const prerender = false;
export const POST: APIRoute = () => new Response(null, { status: 303, headers: { Location: '/admin/login', 'Set-Cookie': logoutCookie } });
