import { defineConfig } from '@rsbuild/core';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  output: {
    assetPrefix: '/tools_endfield-factory-planner/',
  },
html: {
    title: 'Endfield Factory Planner'
  },
});
