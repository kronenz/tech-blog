export const siteConfig = {
  title: 'Tech Blog',
  description: 'Interactive technical blog with AnimFlow diagrams',
  author: {
    name: 'Author',
    avatar: '/avatar.png',
    bio: 'Software Engineer',
    social: {
      github: 'https://github.com/username',
      twitter: 'https://twitter.com/username',
    },
  },
  postsPerPage: 10,
  defaultTheme: 'system' as ThemeMode,
};

// Theme System Types
export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemePreset = 'default' | 'sepia' | 'nord' | 'dracula' | 'solarized' | 'high-contrast' | 'neon' | 'minimal' | 'forest' | 'ocean';

// Layout System Types
export type LayoutPreset = 'default' | 'focus-reader' | 'classic-blog' | 'magazine' | 'code-wide' | 'minimal-zen' | 'card-gallery';

export interface LayoutConfig {
  id: LayoutPreset;
  name: string;
  description: string;
  features: string[];
}

// Layout Presets Configuration
export const layoutPresets: LayoutConfig[] = [
  {
    id: 'default',
    name: 'Standard',
    description: '균형잡힌 기본 레이아웃',
    features: ['800px 콘텐츠', '반응형 그리드', '표준 카드'],
  },
  {
    id: 'focus-reader',
    name: 'Focus Reader',
    description: '집중 읽기를 위한 좁은 레이아웃',
    features: ['650px 콘텐츠', '세리프 폰트', '넓은 간격'],
  },
  {
    id: 'classic-blog',
    name: 'Classic Blog',
    description: '사이드바가 있는 전통적인 블로그',
    features: ['사이드바', '리스트 스타일', '1100px 너비'],
  },
  {
    id: 'magazine',
    name: 'Magazine',
    description: '비주얼 중심의 매거진 스타일',
    features: ['3열 그리드', '이미지 강조', '콤팩트'],
  },
  {
    id: 'code-wide',
    name: 'Code Wide',
    description: '코드 블록에 최적화된 넓은 레이아웃',
    features: ['1000px 콘텐츠', '넓은 카드', '코드 친화적'],
  },
  {
    id: 'minimal-zen',
    name: 'Minimal Zen',
    description: '여백이 넉넉한 미니멀 디자인',
    features: ['1열 레이아웃', '넓은 여백', '테두리 없음'],
  },
  {
    id: 'card-gallery',
    name: 'Card Gallery',
    description: '갤러리 스타일의 정사각 카드',
    features: ['1:1 비율', '이미지 중심', '반응형 그리드'],
  },
];

export interface ThemeConfig {
  id: ThemePreset;
  name: string;
  description: string;
  preview: {
    bg: string;
    text: string;
    primary: string;
    accent: string;
  };
}

// Theme Presets Configuration
export const themePresets: ThemeConfig[] = [
  {
    id: 'default',
    name: 'Default',
    description: '깔끔한 기본 테마',
    preview: {
      bg: '#ffffff',
      text: '#1a1a2e',
      primary: '#0066cc',
      accent: '#ff6b6b',
    },
  },
  {
    id: 'sepia',
    name: 'Sepia',
    description: '따뜻하고 편안한 세피아 톤',
    preview: {
      bg: '#f4ecd8',
      text: '#5c4b37',
      primary: '#8b4513',
      accent: '#cd853f',
    },
  },
  {
    id: 'nord',
    name: 'Nord',
    description: '차분한 북유럽 스타일',
    preview: {
      bg: '#eceff4',
      text: '#2e3440',
      primary: '#5e81ac',
      accent: '#88c0d0',
    },
  },
  {
    id: 'dracula',
    name: 'Dracula',
    description: '개발자를 위한 다크 테마',
    preview: {
      bg: '#282a36',
      text: '#f8f8f2',
      primary: '#bd93f9',
      accent: '#ff79c6',
    },
  },
  {
    id: 'solarized',
    name: 'Solarized',
    description: '눈의 피로를 줄이는 테마',
    preview: {
      bg: '#fdf6e3',
      text: '#657b83',
      primary: '#268bd2',
      accent: '#cb4b16',
    },
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    description: '높은 대비의 접근성 테마',
    preview: {
      bg: '#000000',
      text: '#ffffff',
      primary: '#00ff00',
      accent: '#ffff00',
    },
  },
  {
    id: 'neon',
    name: 'Neon',
    description: '사이버펑크 네온 스타일',
    preview: {
      bg: '#0a0a0f',
      text: '#e0e0ff',
      primary: '#00ffff',
      accent: '#ff00ff',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: '심플하고 집중하기 좋은 미니멀',
    preview: {
      bg: '#fafafa',
      text: '#333333',
      primary: '#555555',
      accent: '#888888',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    description: '자연에서 영감받은 그린 톤',
    preview: {
      bg: '#f5f9f5',
      text: '#2d3b2d',
      primary: '#2e7d32',
      accent: '#8bc34a',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: '평화로운 바다 블루 테마',
    preview: {
      bg: '#f0f8ff',
      text: '#1a3a5c',
      primary: '#0288d1',
      accent: '#4fc3f7',
    },
  },
];
