/**
 * Posts API Client
 * 에디터에서 포스트를 발행하기 위한 API 클라이언트
 */

export interface CreatePostData {
  title: string;
  slug: string;
  content: string;
  description: string;
  tags: string[];
  published?: boolean;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  description: string;
  tags: string[];
  published: boolean;
  pub_date: string;
  updated_at: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 포스트 발행
 */
export async function publishPost(data: CreatePostData): Promise<ApiResponse<Post>> {
  try {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        published: true,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to publish post',
      };
    }

    return {
      success: true,
      data: result.post,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * 포스트 수정
 */
export async function updatePost(
  slug: string,
  data: Partial<CreatePostData>
): Promise<ApiResponse<Post>> {
  try {
    const response = await fetch(`/api/posts/${slug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to update post',
      };
    }

    return {
      success: true,
      data: result.post,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Slug 사용 가능 여부 확인
 */
export async function checkSlugAvailability(
  slug: string
): Promise<ApiResponse<{ available: boolean }>> {
  try {
    const response = await fetch(`/api/posts/check-slug?slug=${encodeURIComponent(slug)}`);
    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to check slug',
      };
    }

    return {
      success: true,
      data: { available: result.available },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * 포스트 조회
 */
export async function getPost(slug: string): Promise<ApiResponse<Post>> {
  try {
    const response = await fetch(`/api/posts/${slug}`);
    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Post not found',
      };
    }

    return {
      success: true,
      data: result.post,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * 제목에서 slug 생성
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[가-힣]/g, '') // 한글 제거
    .replace(/[^a-z0-9\s-]/g, '') // 특수문자 제거
    .replace(/\s+/g, '-') // 공백을 하이픈으로
    .replace(/-+/g, '-') // 중복 하이픈 제거
    .replace(/^-|-$/g, ''); // 앞뒤 하이픈 제거
}
