// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import rehypeExternalLinks from 'rehype-external-links';

import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: '_blank',
          rel: ['noopener', 'noreferrer'],
          content: {
            type: 'element',
            tagName: 'svg',
            properties: {
              className: ['external-link-icon'],
              xmlns: 'http://www.w3.org/2000/svg',
              width: '16',
              height: '16',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              strokeWidth: '2',
              strokeLinecap: 'round',
              strokeLinejoin: 'round'
            },
            children: [
              {
                type: 'element',
                tagName: 'path',
                properties: {
                  d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'
                },
                children: []
              },
              {
                type: 'element',
                tagName: 'polyline',
                properties: {
                  points: '15 3 21 3 21 9'
                },
                children: []
              },
              {
                type: 'element',
                tagName: 'line',
                properties: {
                  x1: '10',
                  y1: '14',
                  x2: '21',
                  y2: '3'
                },
                children: []
              }
            ]
          }
        }
      ]
    ]
  },

  integrations: [svelte()]
});