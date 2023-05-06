import { Configuration, OpenAIApi } from 'openai';
import { config } from '@/config';
import { Role } from '@/constants/openai';
import { logger } from '@/logger';

const configuration = new Configuration({
    apiKey: config.openai_api_key,
});
const openai = new OpenAIApi(configuration);

function constructNewsAnchorSystemMessage() {
    const message = `Re-write the following text that sounds like a short new piece. There should be a title, then a new line, then a summarized news piece. Don't read out hashtags or links.`;
    return { role: Role.System, content: message };
}

function constuctNewsPieceMessage(author: string, text: string) {
    const message = `Author: ${author}\nText: ${text}\nShort Title and Summarized News Piece:`;
    return { role: Role.User, content: message };
}

export async function createNewsPiece(author: string, bookmark: string) {
    const puppetCompletion = await openai.createChatCompletion({
        model: 'gpt-4',
        messages: [constructNewsAnchorSystemMessage(), constuctNewsPieceMessage(author, bookmark)],
    });
    const answer = puppetCompletion.data.choices[0].message?.content as string;
    logger.debug(`News piece for (${author}) ${bookmark}: ${answer}`);
    return answer;
}

