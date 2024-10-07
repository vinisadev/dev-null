import {
  Client,
  GatewayIntentBits,
  TextChannel
} from 'discord.js'
import { PrismaClient } from '@prisma/client'

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

const prisma = new PrismaClient()

client.once('ready', () => {
  console.log('Bot is ready!')
})

client.on('messageCreate', async (message) => {
  if (message.author.bot) return

  if (message.content.startsWith('null')) {
    const args = message.content.split(' ')
    if (args.length !== 3) {
      message.reply('Usage: null <channel> <minutes>')
      return
    }

    const channelId = args[1].replace(/[<#>]/g, '')
    const minutes = parseInt(args[2])

    if (isNaN(minutes) || minutes <= 0) {
      message.reply('Please provide a valid number of minutes.')
      return
    }

    try {
      await prisma.guildSettings.upsert({
        where: { channelId: channelId },
        update: { minutes: minutes },
        create: { channelId: channelId, minutes: minutes },
      })
      message.reply(`Null set for <#${channelId}> after ${minutes} minutes.`)
    } catch (error) {
      console.error('Error setting null: ', error)
      message.reply('An error occurred while setting null.')
    }
  }
})

// Check and delete messages every minute
setInterval(async () => {
  try {
    const settings = await prisma.guildSettings.findMany()
    for (const setting of settings) {
      const channel = client.channels.cache.get(settings.channelId) as TextChannel
      if (channel) {
        const messages = await channel.messages.fetch({ limit: 100 })
        const now = new Date()
        messages.forEach((msg) => {
          const messageAge = (now.getTime() - msg.createdAt.getTime()) / (1000 * 60)
          if (messageAge >= setting.minutes) {
            msg.delete().catch(console.error)
          }
        })
      }
    }
  } catch (error) {
    console.error('Error in null check: ', error)
  }
}, 60000); // Run every minute

client.login(process.env.DISCORD_TOKEN)