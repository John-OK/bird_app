import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  return {
    // vite uses this as a prefix for href and src URLs
    test: {
      environment: "jsdom",
      setupFiles: "./src/setupTests.js",
    },
    base: command === "serve" ? "/" : "/static/",
    build: {
      // this is the folder where vite will generate its output. Make sure django can serve files from here!
      outDir: "../backend/static",
      emptyOutDir: true,
      sourcemap: true, // aids in debugging by giving line numbers and readable code
    },
    server: {
      proxy: {
        "/whoami": {
          target: "http://127.0.0.1:8000",
          changeOrigin: false,
        },
        "/signup/": {
          target: "http://127.0.0.1:8000",
          changeOrigin: false,
        },
        "/login/": {
          target: "http://127.0.0.1:8000",
          changeOrigin: false,
        },
        "/logout/": {
          target: "http://127.0.0.1:8000",
          changeOrigin: false,
        },
        "/geolocate/": {
          target: "http://127.0.0.1:8000",
          changeOrigin: false,
        },
        "/update_user_coords/": {
          target: "http://127.0.0.1:8000",
          changeOrigin: false,
        },
        "/find_birds/": {
          target: "http://127.0.0.1:8000",
          changeOrigin: false,
        },
        "/confirm_bird/": {
          target: "http://127.0.0.1:8000",
          changeOrigin: false,
        },
        "/get_users_birds/": {
          target: "http://127.0.0.1:8000",
          changeOrigin: false,
        },
        "/delete_birds/": {
          target: "http://127.0.0.1:8000",
          changeOrigin: false,
        },
      },
    },
    plugins: [react()],
  };
});
