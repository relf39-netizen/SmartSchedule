const { defineConfig, loadEnv } = require('vite');
const react = require('@vitejs/plugin-react');
const tailwindcss = require('@tailwindcss/vite').default || require('@tailwindcss/vite');
const path = require('path');

module.exports = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    root: process.cwd(),
    base: './',
    plugins: [
      react(),
      tailwindcss()
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: false,
      minify: 'esbuild',
      // ป้องกัน esbuild จากการสแกนหาโฟลเดอร์ข้างนอก
      commonjsOptions: {
        include: [/node_modules/],
      }
    },
    esbuild: {
      // บังคับให้ไม่ใช้ฟีเจอร์ที่ต้องอาศัยการสแกน filesystem ลึกเกินไป
      legalComments: 'none'
    }
  };
});
