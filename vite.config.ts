import * as path from "node:path";
import { defineConfig } from "vite";

export default () => {
  return defineConfig({
    plugins: [],

    server: {
      port: 5766,
      host: true,
    },
    build: {
      target: "esnext",
      copyPublicDir: false,
      emptyOutDir: true,
      lib: {
        entry: path.resolve(__dirname, "index.js"),
        name: "sheep",
        formats: ["es"],
        fileName: (format) => `sheep.js`,
      },
    },
  });
};
