// import NextAuth, { DefaultSession } from "next-auth";

// declare module "next-auth" {
//   interface Session {
//     user: {
//       role: string;
//     } & DefaultSession["user"];
//   }

//   interface User {
//     role: string;
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     role: string;
//   }
// }

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    backendToken?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    backendToken?: string | null;
  }
}