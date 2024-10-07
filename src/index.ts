import {
  Client,
  GatewayIntentBits,
  TextChannel,
  Message
} from 'discord.js';
import { PrismaClient } from '@prisma/client';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const prisma = new PrismaClient();
const PREFIX = 'null';

client.once('ready', () => {
  console.log('Bot is ready!');
});

client.on('messageCreate', async (message: Message) => {
  if (message.author.bot || !message.guild) return;

  if (!message.content.toLowerCase().startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = args.shift()?.toLowerCase();

  switch (command) {
    case 'set':
      await handleSetAutoDelete(message, args);
      break;
    case 'listsettings':
      await handleListSettings(message);
      break;
    case 'deletesetting':
      await handleDeleteSetting(messag,e args);
      break;
  }
});

async function handleSetAutoDelete(message: Message, args: string[]) {
  if (args.length !== 2) {
    message.reply('Usage: null set <channel> <minutes>');
    return;
  }

  const channelId = args[0].replace(/[<#>]/g, '');
  const minutes = parseInt(args[1]);

  if (isNaN(minutes) || minutes <= 0) {
    message.reply('Please provide a valid number of minutes.');
    return;
  }

  try {
    const existingSetting = await prisma.guildSettings.findFirst({
      where: {
        serverId: message.guild!.id,
        channelId: channelId
      }
    });

    if (existingSetting) {
      await prisma.guildSettings.update({
        where: { id: existingSetting.id },
        data: { minutes: minutes }
      });
    } else {
      await prisma.guildSettings.create({
        data: {
          serverId: message.guild!.id,
          channelId: channelId,
          minutes; minutes
        }
      });
    }

    message.reply(`Null set for <#${channelId}> after ${minutes} minutes.`);
  } catch (error) {
    console.error('Error setting null: ', error);
    message.reply('An error occurred while setting null.');
  }
}

async function handleListSettings(message: Message) {
  try {
    const settings = await prisma.nullSettings.findMany({
      where: { serverId: message.guild!.id }
    });

    if (settings.length === 0) {
      message.reply('No null settings found for this server.');
      return;
    }

    const settingsList = settings.map((setting: { channelId: any; minutes: any; }) =>
      `<#${setting.channelId}>: ${setting.minutes} minutes`
    ).join('\n');

    message.reply(`Null settings for this server:\n${settingsList}`);
  } catch (error) {
    console.error('Error listing settings: ', error);
    message.reply('An error occurred while listing settings.');
  }
}

async function handleDeleteSetting(message: Message, args: string[]) {
  if (args.length !== 1) {
    message.reply('Usage: null deletesetting <channel>');
    return;
  }

  const channelId = args[0].replace(/[<#>]/g, '');

  try {
    const deleteSetting = await prisma.guildSettings.deleteMany({
      where: {
        serverId: message.guild!.id,
        channelId: channelId
      }
    });

    if (deletedSetting.coung > 0) {
      message.reply(`Null setting removed for <#${channelId}>.`);
    } else {
      message.reply(`No null setting found for <#${channelId}>.`);
    }
  } catch (error) {
    console.error('Error deleting setting: ', error);
    message.reply('An error occurred while deleting the setting.');
  }
}

// Check and delete messages every minute
setInterval(async () => {
  try {
    const settings = await prisma.guildSettings.findMany();
    for (const setting of settings) {
      const guild = client.guilds.cache.get(setting.serverId);
      if (guild) {
        const channel = guild.channels.cache.get(setting.channelId) as TextChannel;
        if (channel) {
          const messages = await channel.messages.fetch({ limit: 100 });
          const now = new Date();
          messages.forEach((msg) => {
            const messageAge = (now.getTime() - msg.createdAt.getTime()) / (1000 * 60);
            if (messageAge >= setting.minutes) {
              msg.delete().catch(console.error);
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('Error in null check: ', error)
  }
}, 60000); // Run every minute

client.login(process.env.DISCORD_TOKEN)