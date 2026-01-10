import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['you/**/*.js'],
      exclude: [
        'you/**/*.test.js',
        // 통합 테스트가 필요한 파일들 (브라우저 API 의존)
        'you/engine.js',
        'you/scene.js',
        'you/you.js',
        'you/resource.js',
        'you/graphics/**',
        'you/ui/**',
        'you/utilities/resource.js',
        'you/utilities/progress.js',
        'you/framework/input.js',
        'you/framework/loop.js',
        'you/framework/event.js',
      ],
      thresholds: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80
        }
      }
    }
  }
})
