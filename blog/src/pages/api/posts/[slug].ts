/**
 * Single Post API - Read, Update, Delete
 * GET /api/posts/[slug] - 포스트 조회
 * PUT /api/posts/[slug] - 포스트 수정
 * DELETE /api/posts/[slug] - 포스트 삭제 (soft delete)
 */
import type { APIRoute } from 'astro';
import {
  getPostBySlug,
  updatePost,
  deletePost,
  isSlugAvailable,
} from '../../../lib/posts-repository';

// GET /api/posts/[slug]
export const GET: APIRoute = async ({ params }) => {
  try {
    const { slug } = params;

    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'slug is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const post = await getPostBySlug(slug);

    if (!post) {
      return new Response(
        JSON.stringify({ error: 'Post not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ post }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch post' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// PUT /api/posts/[slug]
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { slug } = params;

    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'slug is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 기존 포스트 확인
    const existingPost = await getPostBySlug(slug);
    if (!existingPost) {
      return new Response(
        JSON.stringify({ error: 'Post not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await request.json();
    const { title, content, description, tags, published } = body;

    // 새 slug로 변경하는 경우 중복 검사
    if (body.slug && body.slug !== slug) {
      // Slug 유효성 검사
      if (!/^[a-z0-9-]+$/.test(body.slug)) {
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

      const slugAvailable = await isSlugAvailable(body.slug);
      if (!slugAvailable) {
        return new Response(
          JSON.stringify({ error: 'new slug already exists' }),
          {
            status: 409,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // 포스트 업데이트
    const updatedPost = await updatePost(existingPost.id, {
      title,
      slug: body.slug,
      content,
      description,
      tags,
      published,
    });

    return new Response(JSON.stringify({ post: updatedPost }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to update post:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update post' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// DELETE /api/posts/[slug]
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { slug } = params;

    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'slug is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 기존 포스트 확인
    const existingPost = await getPostBySlug(slug);
    if (!existingPost) {
      return new Response(
        JSON.stringify({ error: 'Post not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Soft delete
    await deletePost(existingPost.id);

    return new Response(
      JSON.stringify({ message: 'Post deleted successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Failed to delete post:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete post' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
