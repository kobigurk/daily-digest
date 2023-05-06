-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "newsForText" TEXT NOT NULL,
    "newsForAudio" TEXT NOT NULL,
    "audio" BYTEA NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);
