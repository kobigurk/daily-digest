import { useState, useEffect } from "react";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getServerSideProps(context: { params: { item: string; }; }) {
    const newsItem = await prisma.news.findFirstOrThrow({
        where: {
            createdAt: new Date(parseInt(context.params.item)),
        },
    });
    return {
        props: {
            createdAt: newsItem.createdAt.toISOString(),
            text: newsItem.newsForText,
            audio: Array.from(newsItem.audio),
        },
    };
}

export default function News({ text, audio, createdAt }: { text: string, audio: Buffer, createdAt: string }) {
    const [downloadLink, setDownloadLink] = useState({
        downloadLink: '',
    });

    const [audioSource, setAudioSource] = useState<{ audioSource: AudioBufferSourceNode | undefined }>({
        audioSource: undefined,
    });

    const [error, setError] = useState<{ error: string | undefined }>({
        error: undefined,
    });

    const bytes = Uint8Array.from(audio);
    const blob = new Blob([bytes], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    useEffect(() => {
        setDownloadLink({
            downloadLink: url,
        });
    }, []);

    const stop = async () => {
        if (audioSource.audioSource) {
            (audioSource.audioSource as AudioBufferSourceNode).stop(0);
        }
    };

    const complete = async () => {
        const result = await fetch('/api/completeTasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                date: createdAt,
            }),
        });
        if (result.status !== 200) {
            setError({
                error: result.statusText,
            });
        } else {
            setError({
                error: undefined,
            });
        }
    };



    const start = async () => {
        const clonedBytes = Uint8Array.from(audio);
        const context = new AudioContext();
        if (audioSource.audioSource) {
            (audioSource.audioSource as AudioBufferSourceNode).stop(0);
        }

        const source = context.createBufferSource();
        const decoded = await context.decodeAudioData(clonedBytes.buffer);
        source.buffer = decoded;
        source.connect(context.destination);
        source.loop = false;
        source.start(0);
        setAudioSource({
            audioSource: source,
        });
    }


    return (
        <main
            className={`flex min-h-screen flex-col items-center justify-between p-24`}>
            <div>
                <div className="flex items-stretch text-center justify-center">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ms-1" onClick={start}>Play</button>
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ms-1" onClick={stop}>Stop</button>
                    <a href={downloadLink?.downloadLink} download={`${createdAt}.mp3`}><button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ms-1">Download</button></a>
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ms-1" onClick={complete}>Complete</button>
                </div>
                <p className="whitespace-break-spaces mt-5">
                    {text}
                </p>
                {error?.error && <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                    {error?.error}
                </div>}

            </div >
        </main >
    )
}
