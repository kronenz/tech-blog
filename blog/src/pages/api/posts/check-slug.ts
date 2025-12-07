/**
 * Slug Availability Check API
 * GET /api/posts/check-slug?slug=xxx - slug 사용 가능 여부 확인
 */
import type { APIRoute } from 'astro';
import { isSlugAvailable } from '../../../lib/posts-repository';

export const GET: APIRoute = async ({ url }) => {
  try {
    const slug = url.searchParams.get('slug');

    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'slug parameter is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Slug 유효성 검사
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return new Response(
        JSON.stringify({
          available: false,
          error: 'slug must contain only lowercase letters, numbers, and hyphens',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const available = await isSlugAvailable(slug);

    return new Response(JSON.stringify({ available, slug }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to check slug:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to check slug availability' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
