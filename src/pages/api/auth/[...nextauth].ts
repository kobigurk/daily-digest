import NextAuth, { Account } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { performRefresh } from "@/auth/refresh";

import { config, TWITTER_SCOPES } from "@/config";
import { logger } from "@/logger";

const prisma = new PrismaClient();

export const authOptions = {
    debug: true,
    adapter: PrismaAdapter(prisma),
    providers: [
        TwitterProvider({
            clientId: config.twitter_client_id,
            clientSecret: config.twitter_client_secret,
            version: "2.0",
            authorization: {
                url: "https://twitter.com/i/oauth2/authorize",
                params: {
                    scope: TWITTER_SCOPES.join(" "),
                },
            },
        })
    ],
    callbacks: {
        async session({ session, user }: {
            session: any,
            token: any,
            user: any
        }) {
            if (session?.user) {
                session.user.id = user.id;
            }

            try {
                await performRefresh(session.user.id);
            } catch (error) {
                session.error = "RefreshAccessTokenError"
            }
            return session;
        },
        async signIn({ user, account, profile, email, credentials }: { user: any, account: any, profile: any, email: any, credentials: any }) {
            await prisma.account.update({
                data: {
                    access_token: account.access_token,
                    refresh_token: account.refresh_token,
                    expires_at: account.expires_at,
                    scope: account.scope,
                    token_type: account.token_type,
                },
                where: {
                    provider_providerAccountId: {
                        provider: account?.provider as string,
                        providerAccountId: account?.providerAccountId as string,
                    }
                }

            }).catch((e) => { logger.error(e); });
            return true;
        },
        secret: config.nextauth_secret,
    }
};

export default NextAuth(authOptions as any);

