import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { autolinkConfig } from "./plugins/rehype-autolink-config";
import rehypeSlug from "rehype-slug";
import astroI18next from "astro-i18next";
import alpinejs from "@astrojs/alpinejs";
import AstroPWA from "@vite-pwa/astro";
import icon from "astro-icon";
import solidJs from "@astrojs/solid-js";

import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'server',
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
});




// https://astro.build/config
export default defineConfig({
  site: "https://tiktokio.cam",
  vite: {
    define: {
      __DATE__: `'${new Date().toISOString()}'`
    }
  },
  output: "hybrid",
  integrations: [
    tailwind(), 
    sitemap(), 
    astroI18next(), 
    alpinejs(),                  
    AstroPWA({
    mode: "production",
    base: "/",
    scope: "/",
    includeAssets: ["favicon.ico"],
    registerType: "autoUpdate",
    manifest: {
      name: "Tiktokio - TikTok Downloader - Download TikTok Videos Without Watermark",
      short_name: "Tikokio",
      theme_color: "#ffffff",
      icons: [{
        src: "pwa-192x192.webp",
        sizes: "192x192",
        type: "image/webp"
      }, {
        src: "pwa-512x512.webp",
        sizes: "512x512",
        type: "image/webp"
      }, {
        src: "pwa-512x512.webp",
        sizes: "512x512",
        type: "image/webp",
        purpose: "any maskable"
      }]
    },
    workbox: {
      navigateFallback: "/404",
      globPatterns: ["*.js"]
    },

    

    devOptions: {
      enabled: false,
      navigateFallbackAllowlist: [/^\/404$/],
      suppressWarnings: true
    }
  }), icon(), solidJs()],
  markdown: {
    rehypePlugins: [rehypeSlug,
    // This adds links to headings
    [rehypeAutolinkHeadings, autolinkConfig]]
  },
  experimental: {
    contentCollectionCache: true
  },
  
  adapter: vercel()
});
