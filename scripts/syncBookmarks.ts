import { PrismaClient } from "@prisma/client";
import { delay } from "@/utils";
import { Client } from "twitter-api-sdk";
import { logger } from "@/logger";

const prisma = new PrismaClient();

async function main() {
    while (true) {
        const accounts = await prisma.account.findMany({
            where: {
                provider: 'twitter',
            }
        });
        for (const account of accounts) {
            try {
                const client = new Client(account?.access_token as string);
                const bookmarks = await client.bookmarks.getUsersIdBookmarks(account?.providerAccountId as string, {
                    "tweet.fields": ["created_at", "text", "author_id"],
                    "expansions": ["author_id"],
                });
                const authors: Record<string, any> = {};
                for (const author of bookmarks.includes?.users || []) {
                    authors[author.id] = author;
                }
                for (const bookmark of bookmarks.data!) {
                    await prisma.bookmark.upsert({
                        where: {
                            tweetId: bookmark.id,
                        },
                        create: {
                            tweetId: bookmark.id,
                            author: authors[bookmark.author_id!].username,
                            createdAt: bookmark.created_at!,
                            text: bookmark.text,
                            accountId: account.id,
                        },
                        update:{},
                    });
                }

            } catch (error) {
                logger.error(`Error syncing bookmarks for user ${account.userId}, error: ${error}`);
            }
        }

        // wait for 10 minutes
        await delay(1000 * 60 * 10);
    }

}

main()
    .then(() => {
        console.log('done');
    })
    .catch((err) => {
        console.error(err);
    });