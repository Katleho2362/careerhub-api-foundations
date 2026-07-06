// import NextAuth from "next-auth";
// import Credentials from "next-auth/providers/credentials";
// import type { NextAuthConfig } from "next-auth";
// import { decodeJwtPayload } from "@/lib/jwt";

// const MOCK_USERS = [
//   {
//     id: "1",
//     name: "employer1",
//     role: "employer" as const,
//     password: "password123",
//     backendUsername: "employer",
//     backendPassword: "password123",
//     backendLoginPath: "/api/auth/login",
//   },
//   {
//     id: "2",
//     name: "employer2",
//     role: "employer" as const,
//     password: "password123",
//     backendUsername: null,
//     backendPassword: null,
//     backendLoginPath: null,
//   },
//   {
//     id: "3",
//     name: "alice",
//     role: "candidate" as const,
//     password: "password123",
//     backendUsername: "applicant",
//     backendPassword: "password123",
//     backendLoginPath: "/api/auth/login/applicant",
//   },
//   {
//     id: "4",
//     name: "bob",
//     role: "candidate" as const,
//     password: "password123",
//     backendUsername: "applicant",
//     backendPassword: "password123",
//     backendLoginPath: "/api/auth/login/applicant",
//   },
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

//         // Only attempt backend login if this mock user has a mapped
//         // backend account — employer2 does not, so they get no backendToken.
//         let backendToken: string | null = null;

//         if (user.backendUsername && user.backendPassword && user.backendLoginPath) {
//           try {
//             const baseUrl = process.env.NEXT_PUBLIC_API_URL;
//             const res = await fetch(`${baseUrl}${user.backendLoginPath}`, {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({
//                 username: user.backendUsername,
//                 password: user.backendPassword,
//               }),
//               cache: "no-store",
//             });

//             if (res.ok) {
//               const body = await res.json();
//               backendToken = body.token ?? null;
//             } else {
//               console.error("Backend login failed:", res.status, await res.text());
//             }
//           } catch (err) {
//             console.error("Backend login error:", err);
//           }
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
//         const u = user as {
//           id: string;
//           name: string;
//           role: string;
//           backendToken?: string | null;
//         };
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
//       // Relay the backend token onto the session so server actions can read it
//       (session as unknown as { backendToken?: string | null }).backendToken =
//         token.backendToken as string | null;
//       return session;
//     },
//   },
// };

// export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { decodeJwtPayload } from "@/lib/jwt";

const MOCK_USERS = [
  {
    id: "1",
    name: "employer1",
    role: "employer" as const,
    password: "password123",
    backendUsername: "employer",
    backendPassword: "password123",
    backendLoginPath: "/api/auth/login",
  },
  {
    id: "2",
    name: "employer2",
    role: "employer" as const,
    password: "password123",
    backendUsername: null,
    backendPassword: null,
    backendLoginPath: null,
  },
  {
    id: "3",
    name: "alice",
    role: "candidate" as const,
    password: "password123",
    backendUsername: "applicant",
    backendPassword: "password123",
    backendLoginPath: "/api/auth/login/applicant",
  },
  {
    id: "4",
    name: "bob",
    role: "candidate" as const,
    password: "password123",
    backendUsername: "applicant",
    backendPassword: "password123",
    backendLoginPath: "/api/auth/login/applicant",
  },
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

        // Only attempt backend login if this mock user has a mapped
        // backend account — employer2 does not, so they get no backendToken.
        let backendToken: string | null = null;

        if (user.backendUsername && user.backendPassword && user.backendLoginPath) {
          try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL;
            const res = await fetch(`${baseUrl}${user.backendLoginPath}`, {
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
        const u = user as {
          id: string;
          name: string;
          role: string;
          backendToken?: string | null;
        };
        token.role = u.role;
        token.name = u.name;
        token.backendToken = u.backendToken ?? null;

        // The .NET API reads the applicant's identity from a JWT claim
        // (Controllers/ApplicationsController.cs:
        // User.FindFirst("applicantId")), not from any request body
        // field. We decode that same claim here — once, at login time —
        // so the rest of the frontend can build URLs like
        // /api/v1/applicants/{applicantId}/applications without asking
        // the user to supply their own ID, and without decoding the
        // token again on every request.
        //
        // NOTE: the claim name "applicantId" was inferred from the
        // controller source, not independently confirmed against a real
        // decoded token. Verify at https://jwt.io (or via a debugger
        // breakpoint on `body.token` above) before relying on this in
        // the Part 4 end-to-end demo. If the real claim name differs,
        // update the string below to match.
        if (u.backendToken) {
          const claims = decodeJwtPayload(u.backendToken);
          token.applicantId = (claims?.applicantId as string) ?? null;
        } else {
          token.applicantId = null;
        }
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
      // Relay the decoded applicantId claim so client code can build
      // applicant-scoped URLs (e.g. GET /applicants/{applicantId}/applications)
      // without re-decoding the JWT on every call.
      (session as unknown as { applicantId?: string | null }).applicantId =
        token.applicantId as string | null;
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);