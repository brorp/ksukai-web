import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async signIn({ account }) {
      if (account?.provider === "google") {
        try {
          return true;
        } catch {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "google") {
        const mutableToken = token as typeof token & {
          googleIdToken?: string;
          googleName?: string;
          googlePicture?: string | null;
        };

        mutableToken.googleIdToken =
          typeof account.id_token === "string" ? account.id_token : undefined;
        mutableToken.googleName =
          typeof profile?.name === "string" ? profile.name : undefined;
        mutableToken.googlePicture =
          typeof profile?.picture === "string" ? profile.picture : null;
      }

      return token;
    },
    async session({ session, token }) {
      const mutableSession = session as typeof session & {
        googleIdToken?: string;
        googleName?: string;
        googlePicture?: string | null;
      };
      const sourceToken = token as typeof token & {
        googleIdToken?: string;
        googleName?: string;
        googlePicture?: string | null;
      };

      mutableSession.googleIdToken = sourceToken.googleIdToken;
      mutableSession.googleName = sourceToken.googleName;
      mutableSession.googlePicture = sourceToken.googlePicture ?? null;

      return session;
    },
  },
});
