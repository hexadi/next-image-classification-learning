import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { MongoClient } from "mongodb";
import { Adapter } from "next-auth/adapters";

import { compare } from 'bcryptjs';



export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            httpOptions: {
                timeout: 10000,
            },
            profile(profile) {
                return {
                    id: profile.sub,
                    role: profile.role ?? ["Student"],
                    email: profile.email,
                    name: profile.name,
                    image: profile.picture,
                };
            },
        }),
        CredentialsProvider({
            async authorize(credentials: { email: any; password: any; }) {
                const client = await clientPromise;
                const usersCollection = client.db('data').collection('users');
        
                const user = await usersCollection.findOne({
                    email: credentials.email,
                  });
          
                  if (!user) {
                    throw new Error('No user found');
                  }
          
                  const isValidPassword = await compare(
                    credentials.password,
                    user.password
                  );
          
                  if (!isValidPassword) {
                    throw new Error('Invalid password');
                  }
          
                  return {
                    id: user._id,
                    role: user.role,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                  };
                },
            } as any),
    ],
    adapter: MongoDBAdapter(clientPromise, { databaseName: "data" }) as Adapter,
    callbacks: {
        jwt({ token, user }) {
            if (user) token.role = (user as any).role
            return token
        },
        session({ session, token, user }) {
            (session as any).user.role = token.role
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
    },
    pages: {
        signIn: '/login'
    }
};