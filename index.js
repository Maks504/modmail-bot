require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ]
});

const PREFIX = "!"; // You can change this

client.once('ready', () => {
  console.log(`✅ ModMail Bot is Online → ${client.user.tag}`);
  client.user.setActivity('DM me for support', { type: 3 });
});

// ==================== MODMAIL SYSTEM ====================

// When user DMs the bot
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // DM from user
  if (message.channel.type === 1) { // DM Channel
    const guild = client.guilds.cache.get('YOUR_SERVER_ID_HERE'); // ← Change to your server ID
    if (!guild) return message.reply("❌ Bot is not in the main server.");

    // Find or create ModMail channel
    let modmailChannel = guild.channels.cache.find(c => 
      c.name === `modmail-${message.author.username}` || 
      c.topic?.includes(message.author.id)
    );

    if (!modmailChannel) {
      modmailChannel = await guild.channels.create({
        name: `modmail-${message.author.username}`,
        type: 0,
        topic: `ModMail | User ID: ${message.author.id}`,
        permissionOverwrites: [
          { id: guild.id, deny: ['ViewChannel'] },
          { id: message.author.id, allow: ['ViewChannel', 'SendMessages'] }, // Optional
        ]
      });
    }

    const embed = new EmbedBuilder()
      .setColor('Blue')
      .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
      .setDescription(message.content)
      .setTimestamp();

    await modmailChannel.send({ embeds: [embed] });
    await message.reply("✅ Your message has been sent to the staff team!");
  }

  // Staff replying in modmail channel
  if (message.channel.name.startsWith('modmail-') && !message.author.bot) {
    const userId = message.channel.topic?.split(': ')[1];
    if (!userId) return;

    const user = await client.users.fetch(userId).catch(() => null);
    if (!user) return message.reply("❌ Could not find the user.");

    const replyEmbed = new EmbedBuilder()
      .setColor('Green')
      .setAuthor({ name: `Staff: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setDescription(message.content)
      .setTimestamp();

    await user.send({ embeds: [replyEmbed] }).catch(() => {
      message.reply("❌ Failed to send message to user (They may have closed DMs).");
    });
  }
});

client.login(process.env.TOKEN);
