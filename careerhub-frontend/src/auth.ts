
// // import NextAuth from "next-auth";
// // import Credentials from "next-auth/providers/credentials";
// // import type { NextAuthConfig } from "next-auth";

// // // ─────────────────────────────────────────────────────────────────────────
// // // Mock user store — lives here and nowhere else (assignment requirement).
// // // In a real app this would be a database query.
// // // Passwords are compared with strict equality (no bcrypt) as per the spec.
// // // ─────────────────────────────────────────────────────────────────────────
// // const MOCK_USERS = [
// //   { id: "1", name: "employer1", role: "employer" as const, password: "password123" },
// //   { id: "2", name: "employer2", role: "employer" as const, password: "password123" },
// //   { id: "3", name: "alice",     role: "candidate" as const, password: "password123" },
// //   { id: "4", name: "bob",       role: "candidate" as const, password: "password123" },
// // ];

// // export const authConfig: NextAuthConfig = {
// //   providers: [
// //     Credentials({
// //       credentials: {
// //         username: { label: "Username", type: "text" },
// //         password: { label: "Password", type: "password" },
// //       },
// //       authorize(credentials) {
// //         const username = credentials?.username;
// //         const password = credentials?.password;

// //         if (typeof username !== "string" || typeof password !== "string") {
// //           return null;
// //         }

// //         const user = MOCK_USERS.find((u) => u.name === username);
// //         if (!user || user.password !== password) return null;

// //         // Return only what the session needs — no password
// //         return { id: user.id, name: user.name, role: user.role };
// //       },
// //     }),
// //   ],

// //   session: { strategy: "jwt" },

// //   pages: { signIn: "/login" },

// //   callbacks: {
// //     // Step 1 of the relay: persist role onto the JWT token.
// //     // `user` is only present on the first sign-in — after that we read
// //     // from `token` which persists across requests.
// //     jwt({ token, user }) {
// //     if (user) {
// //         // Cast to include role — AdapterUser doesn't pick up module augmentation
// //         const u = user as { id: string; name: string; role: string };
// //         token.role = u.role;
// //         token.name = u.name ?? token.name;
// //     }
// //     return token;
// //     },

// //     // Step 2: expose role on the session object that auth() returns.
// //     session({ session, token }) {
// //     if (session.user) {
// //         (session.user as unknown as { role: string; name: string }).role = token.role as string;
// //         (session.user as unknown as { role: string; name: string }).name = token.name as string;
// //     }
// //     return session;
// //     },
// //   },
// // };

// // export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);


// import NextAuth from "next-auth";
// import Credentials from "next-auth/providers/credentials";
// import type { NextAuthConfig } from "next-auth";

// const MOCK_USERS = [
//   {
//     id: "1",
//     name: "employer1",
//     role: "employer" as const,
//     password: "password123",
//     backendUsername: "employer",
//     backendPassword: "password123",
//   },
//   { id: "2", name: "employer2", role: "employer" as const, password: "password123" },
//   { id: "3", name: "alice",     role: "candidate" as const, password: "password123" },
//   { id: "4", name: "bob",       role: "candidate" as const, password: "password123" },
// ];

// export const authConfig: NextAuthConfig = {
//   providers: [
//     Credentials({
//       credentials: {
//         username: { label: "Username", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         const username = credentials?.username;
//         const password = credentials?.password;

//         if (typeof username !== "string" || typeof password !== "string") {
//           return null;
//         }

//         const user = MOCK_USERS.find((u) => u.name === username);
//         if (!user || user.password !== password) return null;

//         // Call the real .NET API to get a backend JWT
//         let backendToken: string | null = null;
//         try {
//           const baseUrl = process.env.NEXT_PUBLIC_API_URL;
//           const res = await fetch(`${baseUrl}/api/auth/login`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ username, password }),
//             cache: "no-store",
//           });
//           if (res.ok) {
//             const body = await res.json();
//             backendToken = body.token ?? null;
//           }
//         } catch {
//           // If .NET API is unreachable, continue without backend token
//         }

//         return { id: user.id, name: user.name, role: user.role, backendToken };
//       },
//     }),
//   ],

//   session: { strategy: "jwt" },
//   pages: { signIn: "/login" },

//   callbacks: {
//     jwt({ token, user }) {
//       if (user) {
//         const u = user as { id: string; name: string; role: string; backendToken?: string };
//         token.role = u.role;
//         token.name = u.name;
//         token.backendToken = u.backendToken ?? null;
//       }
//       return token;
//     },

//     session({ session, token }) {
//       if (session.user) {
//         (session.user as unknown as { role: string }).role = token.role as string;
//         (session.user as unknown as { name: string }).name = token.name as string;
//       }
//       // ADD THIS — relay the backend token onto the session
//       (session as unknown as { backendToken?: string | null }).backendToken =
//         token.backendToken as string | null;
//       return session;
//     },
//   }
// };

// export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

const MOCK_USERS = [
  {
    id: "1",
    name: "employer1",
    role: "employer" as const,
    password: "password123",
    backendUsername: "employer",
    backendPassword: "password123",
  },
  { id: "2", name: "employer2", role: "employer" as const, password: "password123" },
  { id: "3", name: "alice",     role: "candidate" as const, password: "password123" },
  { id: "4", name: "bob",       role: "candidate" as const, password: "password123" },
];

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username;
        const password = credentials?.password;

        if (typeof username !== "string" || typeof password !== "string") {
          return null;
        }

        const user = MOCK_USERS.find((u) => u.name === username);
        if (!user || user.password !== password) return null;

        // Call the real .NET API to get a backend JWT — but only if this
        // mock user has a corresponding real backend account mapped.
        let backendToken: string | null = null;

        if (user.backendUsername && user.backendPassword) {
          try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL;
            const res = await fetch(`${baseUrl}/api/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                username: user.backendUsername,
                password: user.backendPassword,
              }),
              cache: "no-store",
            });
            if (res.ok) {
              const body = await res.json();
              backendToken = body.token ?? null;
            } else {
              console.error("Backend login failed:", res.status, await res.text());
            }
          } catch (err) {
            console.error("Backend login error:", err);
          }
        }

        return { id: user.id, name: user.name, role: user.role, backendToken };
      },
    }),
  ],

  session: { strategy: "jwt" },
  pages: { signIn: "/login" },

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const u = user as { id: string; name: string; role: string; backendToken?: string | null };
        token.role = u.role;
        token.name = u.name;
        token.backendToken = u.backendToken ?? null;
      }
      return token;
    },

    session({ session, token }) {
      if (session.user) {
        (session.user as unknown as { role: string }).role = token.role as string;
        (session.user as unknown as { name: string }).name = token.name as string;
      }
      // Relay the backend token onto the session so server actions can read it
      (session as unknown as { backendToken?: string | null }).backendToken =
        token.backendToken as string | null;
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);