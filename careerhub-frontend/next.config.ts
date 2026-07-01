// import type { NextConfig } from "next";
// import withBundleAnalyzer from "@next/bundle-analyzer";

// const nextConfig: NextConfig = {
//   images: {
//     dangerouslyAllowSVG: true,
//     contentDispositionType: "attachment",
//     contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "api.dicebear.com",
//         pathname: "/7.x/initials/svg/**",
//       },
//     ],
//   },
// };

// export default withBundleAnalyzer({
//   enabled: process.env.ANALYZE === "true",
// })(nextConfig);

import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/7.x/initials/png/**",
      },
    ],
  },
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(nextConfig);