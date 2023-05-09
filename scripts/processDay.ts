import { createNewsPiece } from "@/processing/bookmark";
import { PrismaClient } from "@prisma/client";
import { logger } from "@/logger";
import { delay } from "@/utils";
import { textToSpeech } from "@/voice";
import { notifyNews } from "@/notify";
import { TodoistApi } from '@doist/todoist-api-typescript'
import { config } from "@/config";


const DAY_IN_MS = 1000 * 60 * 60 * 24;
const TEN_MINUTES_IN_MS = 1000 * 60 * 10;

const prisma = new PrismaClient();

async function main() {
    while (true) {
        const currentDayNews = await prisma.news.findFirst({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - DAY_IN_MS),
                },
            },
        });
        if (currentDayNews != null) {
            await delay(TEN_MINUTES_IN_MS);
            continue;
        }
        const currentDate = new Date();
        const currentHour = currentDate.getHours();
        if (currentHour < 2) {
            console.log(`Too early, waiting for 2:00: ${currentHour}`);
            await delay(TEN_MINUTES_IN_MS);
            continue;
        }
        const api = new TodoistApi(config.todoist_token);
        const tasks = await api.getTasks({
            filter: 'today',
            projectId: config.todoist_project_id,
        });
        const tasksText = tasks.length > 0 ? tasks.map((task) => task.content).join('.\n') : 'No tasks for today';
        const medicineForToday = `Medicine Summary:\n${tasksText}\n`;
        logger.info(`Medicine for today: ${medicineForToday}`);
        const startOfDay = new Date(Date.now() - DAY_IN_MS);
        startOfDay.setHours(0, 0, 0, 0);

        // const bookmarks = await prisma.bookmark.findMany({
        //     where: {
        //         addedAt: {
        //             gte: startOfDay,
        //         },
        //     },
        // });
        const bookmarks = [] as any[];
        const openingMessage = `---\nNews for ${new Date().toLocaleDateString()}\n`;
        const newsForVoice = [medicineForToday, openingMessage];
        const newsForText = [medicineForToday, openingMessage];
        for (const bookmark of bookmarks) {
            try {
                const newsPiece = await createNewsPiece(bookmark.author, bookmark.text);
                logger.info(`Produced news piece for bookmark ${bookmark.tweetId}: (${newsPiece}`);
                newsForVoice.push(newsPiece);
                newsForText.push(`${newsPiece}\nhttps://twitter.com/${bookmark.author}/status/${bookmark.tweetId}\n`);
            } catch (error) {
                logger.error(`Error processing bookmark ${bookmark.tweetId}, error: ${error}`);
            }
        }
        if (bookmarks.length == 0) {
            const noNews = 'No news for today';
            newsForVoice.push(noNews);
            newsForText.push(noNews);
        }
        const newsItemDate = new Date();
        logger.info(`News: ${newsForText.join('\n')}`);
        const audio = await textToSpeech(newsForVoice.join('\n'), 'Rachel');
        notifyNews([...newsForText, `---\n${config.nextauth_url}/newsItem/${newsItemDate.getTime()}`].join('\n'), audio);

        await prisma.news.create({
            data: {
                createdAt: newsItemDate,
                audio,
                newsForAudio: newsForVoice.join('\n'),
                newsForText: newsForText.join('\n'),
            },
        });

        await delay(TEN_MINUTES_IN_MS);
    }

}

main()
    .then(() => {
        console.log('done');
    })
    .catch((err) => {
        console.error(err);
    });