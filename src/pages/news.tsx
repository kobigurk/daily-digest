import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getServerSideProps() {
    const news = await prisma.news.findMany();
    return {
        props: {
            news:
                news.map((news) => {
                    return {
                        key: news.createdAt.getTime(),
                        link: news.createdAt.toLocaleString(),
                    };
                }),
        },
    };
}

export default function News({ news }: {
    news: {
        key: number;
        link: string;
    }[]
}) {
    return (
        <main
            className={`flex min-h-screen flex-col items-center p-24`}>
            {news.map((news) => (
                <div className="underline" key={news.key}>
                    <a href={`/newsItem/${news.key}`}>{news.link}</a>
                </div>
            ))}
        </main>
    )
}