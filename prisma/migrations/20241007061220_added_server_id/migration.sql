/*
  Warnings:

  - Added the required column `serverId` to the `guildSettings` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "guildSettings_channelId_key";

-- AlterTable
ALTER TABLE "guildSettings" ADD COLUMN     "serverId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "guildSettings_serverId_channelId_idx" ON "guildSettings"("serverId", "channelId");
