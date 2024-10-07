import {
  Client,
  GatewayIntentBits,
  TextChannel,
  Message,
  REST,
  Routes,
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  PermissionFlagsBits
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

// Slash command setup
const commands = [
  {
    name: "setautonull",
    description: 'Set auto-null for a channel',
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    options: [
      {
        name: 'channel',
        type: ApplicationCommandOptionType.Channel,
        description: 'The channel to set auto-null for',
        required: true,
      },
      {
        name: 'minutes',
        type: ApplicationCommandOptionType.Integer,
        description: 'Number of minutes before messages are deleted',
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN || '');

client.once('ready', async () => {
  console.log('Bot is ready!');

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(client.user!.id),
      { body: commands },
    );

    console.log('Successful reloading application (/) commands.');
  } catch (error) {
    console.error(error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'setautonull') {
    await handleSlashSetAutoNull(interaction);
  }
});

client.on('messageCreate', async (message: Message) => {
  if (message.author.bot || !message.guild) return;

  if (!message.content.toLowerCase().startsWith(PREFIX)) return;

  // Check for administrator privileges
  if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
    message.reply('You need to have administrator privileges to use this command.');
    return;
  }

  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = args.shift()?.toLowerCase();

  switch (command) {
    case 'set':
      await handleSetAutoNull(message, args);
      break;
    case 'listsettings':
      await handleListSettings(message);
      break;
    case 'deletesetting':
      await handleDeleteSetting(messag,e args);
      break;
  }
});

async function handleSetAutoNull(message: Message, args: string[]) {
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

async function handleSlashSetAutoNull(interaction: ChatInputCommandInteraction) {
  const channel = interaction.options.getChannel('channel');
  const minutes = interaction.options.getInteger('minutes');

  if (!channel || !minutes || channel.type !== 0) { // 0 is the type for text channels
    await interaction.reply({ content: 'Please provide a valid text channel and number of minutes.', ephemeral: true });
    return;
  }

  try {
    const existingSetting = await prisma.guildSettings.findFirst({
      where: {
        serverId: interaction.guildId!,
        channelId: channel.id
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
          serverId: interaction.guildId!,
          channelId: channel.id,
          minutes; minutes
        }
      });
    }

    await interaction.reply(`Null set for <#${channel.id}> after ${minutes} minutes.`);
  } catch (error) {
    console.error('Error setting null: ', error);
    await interaction.reply({ content: 'An error occurred while setting null.', ephemeral: true });
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