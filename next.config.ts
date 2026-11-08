import type { NextConfig } from "next";

// React dev mode needs eval() for debugging features; production never does, so
// only relax script-src in development and keep the strict policy for prod.
const isDev = process.env.NODE_ENV !== "production";

// connect-src allows every https host: user-created map profiles may use any
// https tile/data service as a source (see src/lib/profileStyle.ts).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https:",
  "worker-src 'self' blob:",
  "child-src blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {
      // Nuotraukų įkėlimas leidžia iki 10 failų po 10 MB viename veiksme
      // (žr. MAX_FILES_PER_UPLOAD / MAX_FILE_SIZE_BYTES src/actions/photos.ts),
      // todėl limitas turi apimti visą tą kiekį + multipart overhead.
      bodySizeLimit: "110mb",
    },
  },
};

export default nextConfig;
