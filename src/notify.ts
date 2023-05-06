import { config } from '@/config';
import { logger } from '@/logger';

import TelegramBot from 'node-telegram-bot-api';
const bot = new TelegramBot(config.telegram_bot_token);
if (config.telegram_bot_token != '') {
    bot.startPolling();
}

export async function notify(message: string) {
    return bot.sendMessage(config.telegram_chat_id, message).catch((e) => { logger.error(e); });
}

export async function notifyNews(news: string, audio: Buffer) {
    await bot.sendMessage(config.telegram_chat_id, news);
    return bot.sendAudio(config.telegram_chat_id, audio, {}, { filename: 'news.mp3', contentType: 'audio/mpeg' });
}