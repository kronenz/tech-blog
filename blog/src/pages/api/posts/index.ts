/**
 * Posts API - List & Create
 * GET /api/posts - 발행된 포스트 목록 조회
 * POST /api/posts - 새 포스트 생성
 */
import type { APIRoute } from 'astro';
import {
  getPublishedPosts,
  createPost,
  isSlugAvailable,
} from '../../../lib/posts-repository';

// GET /api/posts
export const GET: APIRoute = async ({ url }) => {
  try {
    const tag = url.searchParams.get('tag') || undefined;
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const posts = await getPublishedPosts({ tag, limit });

    return new Response(JSON.stringify({ posts }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch posts' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// POST /api/posts
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // 필수 필드 검증
    const { title, slug, content, description, tags } = body;

    if (!title || !slug || !content) {
      return new Response(
        JSON.stringify({ error: 'title, slug, content are required' }),
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
          error: 'slug must contain only lowercase letters, numbers, and hyphens',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Slug 중복 검사
    const slugAvailable = await isSlugAvailable(slug);
    if (!slugAvailable) {
      return new Response(
        JSON.stringify({ error: 'slug already exists' }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 포스트 생성
    const post = await createPost({
      title,
      slug,
      content,
      description: description || '',
      tags: tags || [],
      published: body.published ?? true,
    });

    return new Response(JSON.stringify({ post }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to create post:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create post' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
