-- CreateTable
CREATE TABLE "guildSettings" (
    "id" SERIAL NOT NULL,
    "channelId" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guildSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guildSettings_channelId_key" ON "guildSettings"("channelId");
