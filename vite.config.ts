import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/[\\/]node_modules[\\/](three|@react-three)[\\/]/.test(id)) return 'three';
          if (/[\\/]node_modules[\\/](gsap|@gsap)[\\/]/.test(id)) return 'gsap';
          if (/[\\/]node_modules[\\/]tone[\\/]/.test(id)) return 'tone';
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react-vendor';
          if (/[\\/]node_modules[\\/]@radix-ui[\\/]/.test(id)) return 'radix';
          if (/[\\/]node_modules[\\/](lucide-react|react-icons)[\\/]/.test(id)) return 'icons';
          if (/[\\/]node_modules[\\/]recharts[\\/]/.test(id)) return 'recharts';
          if (/[\\/]node_modules[\\/]lenis[\\/]/.test(id)) return 'lenis';
        },
      },
    },
  },
});

