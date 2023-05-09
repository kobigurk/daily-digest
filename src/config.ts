import * as dotenv from 'dotenv';
dotenv.config();

export const config: {
    twitter_client_id: string,
    twitter_client_secret: string,
    twitter_callback_url: string,
    postgres_host: string,
    postgres_port: number,
    postgres_user: string,
    postgres_password: string,
    postgres_db: string,
    openai_api_key: string,
    elevenlabs_api_key: string,
    nextauth_url: string,
    nextauth_secret: string,
    logs_dir: string,
    telegram_bot_token: string,
    telegram_chat_id: string,
    todoist_token: string,
    todoist_project_id: string,
} = {
    twitter_client_id: process.env.TWITTER_CLIENT_ID || '',
    twitter_client_secret: process.env.TWITTER_CLIENT_SECRET || '',
    postgres_host: process.env.POSTGRES_HOST || '',
    postgres_port: parseInt(process.env.POSTGRES_PORT || '5432'),
    postgres_user: process.env.POSTGRES_USER || '',
    postgres_password: process.env.POSTGRES_PASSWORD || '',
    postgres_db: process.env.POSTGRES_DATABASE || '',
    openai_api_key: process.env.OPENAI_API_KEY || '',
    elevenlabs_api_key: process.env.ELEVENLABS_API_KEY || '',
    nextauth_url: process.env.NEXTAUTH_URL || '',
    nextauth_secret: process.env.NEXTAUTH_SECRET || '',
    twitter_callback_url: process.env.TWITTER_CALLBACK_URL || '',
    logs_dir: process.env.LOGS_DIR || './logs',
    telegram_bot_token: process.env.TELEGRAM_BOT_TOKEN || '',
    telegram_chat_id: process.env.TELEGRAM_CHAT_ID || '',
    todoist_token: process.env.TODOIST_TOKEN || '',
    todoist_project_id: process.env.TODOIST_PROJECT_ID || '',
};

export const TWITTER_SCOPES = ["bookmark.read", "offline.access", "users.read", "tweet.read", "follows.read"];
