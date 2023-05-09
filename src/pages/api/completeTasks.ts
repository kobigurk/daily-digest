import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { Client } from "twitter-api-sdk";
import { TodoistApi } from '@doist/todoist-api-typescript'
import { config } from "@/config";

import { authOptions } from "@/pages/api/auth/[...nextauth]";

const prisma = new PrismaClient();

interface CompleteTasksApiRequest extends NextApiRequest {
    body: {
        date: string,
    }
}

export default async function handler(req: CompleteTasksApiRequest, res: NextApiResponse) {
    if (req.method != 'POST') {
        throw new Error('Method not allowed');
    }

    const requestDate = new Date(req.body.date);
    const currentDate = new Date();

    if (requestDate.getFullYear() != currentDate.getFullYear() ||
        requestDate.getMonth() != currentDate.getMonth() ||
        requestDate.getDate() != currentDate.getDate()) {
        throw new Error('Invalid date');
    }

    const api = new TodoistApi(config.todoist_token);
    const tasks = await api.getTasks({
        filter: 'today',
        projectId: config.todoist_project_id,
    });

    for (const task of tasks) {
        await api.closeTask(task.id);
    }

    res.status(200)
}