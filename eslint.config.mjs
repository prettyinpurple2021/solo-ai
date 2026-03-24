import nextConfig from "eslint-config-next";

export default [
  // ...nextConfig, // This might not work if it's not an array
  {
      ignores: [".next/", "node_modules/", "out/", "build/", "server/dist/"]
  }
];
