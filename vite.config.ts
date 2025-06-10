import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    assetsInlineLimit: 0, // 禁用资源内联，确保SVG文件作为独立文件
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // 保持SVG文件的原始路径结构
          if (assetInfo.name && assetInfo.name.endsWith('.svg')) {
            return 'images/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  assetsInclude: ['**/*.svg']
});
