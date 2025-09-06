const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const cron = require('node-cron');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

let targetRoleId = null;
let everydayRandomKickEnabled = false;

// コマンド定義
const commands = [
  new SlashCommandBuilder().setName('hi').setDescription('Say hi!'),
  new SlashCommandBuilder().setName('randomkick').setDescription('Kick a random user in the set role'),
  new SlashCommandBuilder().setName('rollset')
    .setDescription('Set target role for random kick')
    .addRoleOption(option =>
      option.setName('role').setDescription('Target role to random kick').setRequired(true)),
  new SlashCommandBuilder().setName('everydayrandomkickon').setDescription('Enable everyday random kick at 6pm'),
  new SlashCommandBuilder().setName('everydayrandomkickoff').setDescription('Disable everyday random kick at 6pm'),
];

// コマンド登録
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(client.application?.id || process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands.map(cmd => cmd.toJSON()) },
    );
    console.log('Slash commands registered');
  } catch (error) {
    console.error(error);
  }
})();

// コマンド応答
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  switch (interaction.commandName) {
    case 'hi':
      await interaction.reply('hi');
      break;
    case 'rollset':
      targetRoleId = interaction.options.getRole('role').id;
      await interaction.reply(`Target role set: <@&${targetRoleId}>`);
      break;
    case 'randomkick':
      if (!targetRoleId) {
        await interaction.reply('Please set a role first with /rollset');
        return;
      }
      await handleRandomKick(interaction);
      break;
    case 'everydayrandomkickon':
      everydayRandomKickEnabled = true;
      await interaction.reply('Everyday random kick enabled.');
      break;
    case 'everydayrandomkickoff':
      everydayRandomKickEnabled = false;
      await interaction.reply('Everyday random kick disabled.');
      break;
  }
});

// ランダムキック処理
async function handleRandomKick(interaction) {
  try {
    const guild = interaction.guild;
    const role = guild.roles.cache.get(targetRoleId);
    if (!role) {
      await interaction.reply('Role not found.');
      return;
    }
    await role.guild.members.fetch();
    const membersWithRole = role.members.filter(m => !m.user.bot && m.kickable);
    if (membersWithRole.size === 0) {
      await interaction.reply('No kickable members found in this role.');
      return;
    }
    const randomMember = membersWithRole.random();
    await randomMember.kick('Random kick by bot');
    await interaction.reply(`Kicked: ${randomMember.user.tag}`);
  } catch (err) {
    console.error(err);
    await interaction.reply('Failed to kick member.');
  }
}

// 毎日18時にランダムキック
cron.schedule('0 18 * * *', async () => {
  if (!everydayRandomKickEnabled || !targetRoleId) return;
  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  if (!guild) return;
  const role = guild.roles.cache.get(targetRoleId);
  if (!role) return;
  await role.guild.members.fetch();
  const membersWithRole = role.members.filter(m => !m.user.bot && m.kickable);
  if (membersWithRole.size === 0) return;
  const randomMember = membersWithRole.random();
  await randomMember.kick('Everyday random kick by bot');
  const channel = guild.systemChannel || guild.channels.cache.find(ch => ch.isTextBased() && ch.permissionsFor(guild.members.me).has('SendMessages'));
  if (channel) channel.send(`Everyday random kick: Kicked ${randomMember.user.tag} from <@&${targetRoleId}>`);
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);