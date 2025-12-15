import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { env } from '@/env.mjs';
import { pagesOptions } from './pages-options';
import { LOGIN_MUTATION, type LoginResponse, type LoginVariables } from '@/graphql/auth.graphql';

export const authOptions: NextAuthOptions = {
  // debug: true,
  pages: {
    ...pagesOptions,
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
        },
      };
    },
    async jwt({ token, user }) {
      if (user) {
        // Store user data and token from GraphQL response
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // const parsedUrl = new URL(url, baseUrl);
      // if (parsedUrl.searchParams.has('callbackUrl')) {
      //   return `${baseUrl}${parsedUrl.searchParams.get('callbackUrl')}`;
      // }
      // if (parsedUrl.origin === baseUrl) {
      //   return url;
      // }
      return baseUrl;
    },
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {},
      async authorize(credentials: any) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || 'https://127.0.0.1:8000/api/graphql';

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: LOGIN_MUTATION,
              variables: {
                input: {
                  username: credentials?.email,
                  password: credentials?.password,
                },
              } as LoginVariables,
            }),
          });

          const data = await response.json();

          if (data.errors) {
            console.error('GraphQL errors:', data.errors);
            // Extract error message from GraphQL errors
            const errorMessage = data.errors[0]?.message || 'Erreur de connexion';
            throw new Error(errorMessage);
          }

          const loginData = data.data as LoginResponse;

          if (loginData?.loginAuthToken?.authToken?.token) {
            const token = loginData.loginAuthToken.authToken.token;

            // Store token in localStorage for GraphQL client
            if (typeof window !== 'undefined') {
              localStorage.setItem('authToken', token);
            }

            return {
              id: credentials?.email, // Using email as ID temporarily
              email: credentials?.email,
              name: credentials?.email,
              accessToken: token,
            };
          }

          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          // Re-throw to be caught by NextAuth
          throw error;
        }
      },
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID || '',
      clientSecret: env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
};
