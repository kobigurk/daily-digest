import { PrismaClient } from "@prisma/client";
import { auth } from "twitter-api-sdk";

import { config, TWITTER_SCOPES } from "@/config";
import { logger } from "@/logger";

const prisma = new PrismaClient();

export async function performRefresh(userId: string) {
    const account = await prisma.account.findFirst({
        where: {
            userId,
        },
    });
    const currentToken = {
        access_token: account?.access_token as string,
        refresh_token: account?.refresh_token as string,
        expires_at: account?.expires_at as number * 1000,
        scope: account?.scope as string,
        token_type: account?.token_type as string,
    };
    const offlineAuthClient = new auth.OAuth2User({
        client_id: config.twitter_client_id,
        client_secret: config.twitter_client_secret,
        callback: config.twitter_callback_url,
        // @ts-ignore
        scopes: TWITTER_SCOPES,
        token: currentToken,
    });

    if (offlineAuthClient.isAccessTokenExpired()) {
        try {
            const { token } = await offlineAuthClient.refreshAccessToken();
            await prisma.account.update({
                data: {
                    access_token: token.access_token,
                    refresh_token: token.refresh_token,
                    expires_at: Math.floor(token.expires_at as number / 1000),
                    scope: token.scope,
                    token_type: token.token_type,
                },
                where: {
                    provider_providerAccountId: {
                        provider: account?.provider as string,
                        providerAccountId: account?.providerAccountId as string,
                    }
                }

            });
        } catch (error) {
            logger.error(`Error refreshing access token: ${error}`);
            throw error;
        }
    }
}