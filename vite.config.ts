import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages/core/src/**/*.ts'],
      exclude: ['**/*.d.ts', '**/index.ts'],
    },
  },
  resolve: {
    alias: {
      '@animflow/core': resolve(__dirname, 'packages/core/src'),
    },
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: ['52a57cc4511e.ngrok-free.app'] // allow this host for Vite dev server
  },
});

/*
왜 뜨는걸까?
- Vite의 보안 정책 중 하나로, 외부에서 ngrok 등으로 터널링하여 접속 시 허용되지 않은 호스트라면 "Blocked request. This host (...) is not allowed." 에러가 발생합니다.
- 이를 해결하려면 `server.allowedHosts` 설정에 접속하려는 호스트(`52a57cc4511e.ngrok-free.app`)를 추가해야 합니다.

실행 옵션:
- 위 설정 이후에는 평소처럼 `vite` 또는 `npm run dev`로 실행하면 됩니다.
- 만약 cli에서 임시로 허용하고 싶다면, 환경변수 VITE_HOST=0.0.0.0 등으로 실행해도 되지만, 근본적으로는 위 설정 추가가 필요합니다.
*/
