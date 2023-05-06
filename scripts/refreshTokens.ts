import { PrismaClient } from "@prisma/client";
import { delay } from "@/utils";
import { performRefresh } from "@/auth/refresh";
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
                await performRefresh(account.userId);
                logger.info(`Refreshed access token for user ${account.userId}`);
            } catch (error) {
                logger.error(`Error refreshing access token for user ${account.userId}, error: ${error}`);
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