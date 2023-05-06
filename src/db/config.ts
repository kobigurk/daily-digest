import { Client } from 'ts-postgres';

import { config } from '../config';

export async function getClient() {
    return new Client({
        host: config.postgres_host,
        port: config.postgres_port,
        user: config.postgres_user,
        password: config.postgres_password,
        database: config.postgres_db,
    })
}