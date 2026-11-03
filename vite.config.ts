import { defineConfig } from "vite";
import { rivetRouter } from "@rivetjs/router/vite";

// Every page is rendered to an HTML file at build time.
export default defineConfig({
  plugins: [rivetRouter({ mode: "static", styles: ["src/styles.css"] })],
});
