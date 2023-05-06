import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { Client, auth } from "twitter-api-sdk";

import { authOptions } from "@/pages/api/auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions)
    const account = await prisma.account.findFirst({
        where: {
            userId: session?.user?.id,
        },
    });

    const client = new Client(account?.access_token as string);
    const followers = await client.users.usersIdFollowers(account?.providerAccountId as string);
    
    res.status(200).json({ followers })
}