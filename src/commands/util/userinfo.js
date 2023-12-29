const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
const { hxmaincolor } = require("../../themes/main");
const moment = require("moment")

module.exports = {
  name: "userinfo",
  description: "Exibe informações sobre o usuário escolhido.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "user",
      description: "Usuário que você quer inspecionar",
      type: ApplicationCommandOptionType.User,
    },
  ],

  run: async (client, interaction) => {
    const member = interaction.options.getMember("user");
    let userInfoEmbed;
    if (!member) {
      const roles =
        "```" +
        interaction.member.roles.cache.map((role) => role.name).join(`, `) +
        "```";
      const perms =
        "```" + interaction.member.permissions.toArray().join(`\n`) + "```";
      let badges =
        "```" + interaction.member.user.flags.toArray().join(", ") + "```";
      if (badges === "``````") badges = "```None```";
      userInfoEmbed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setTitle("Informações do usuário")
        .addFields(
          { name: "Username:", value: `${interaction.member.user.tag}` },
          { name: "ID:", value: `${interaction.member.user.id}` },
          {
            name: "Conta desde:",
            value: `${moment(interaction.member.user.createdTimestamp).format(
              "LT"
            )} ${moment(interaction.member.user.createdTimestamp).format(
              "LL"
            )} (${moment(interaction.member.user.createdTimestamp).fromNow()})`,
          },
          { name: "Badges:", value: `${badges}` },
          {
            name: "Entrou em:",
            value: `${moment(interaction.member.joinedTimestamp).format(
              "LT"
            )} ${moment(interaction.member.joinedTimestamp).format(
              "LL"
            )} (${moment(interaction.member.joinedTimestamp).fromNow()})`,
          },
          { name: "Cargos", value: `${roles}` },
          { name: "Permissões", value: `${perms}` }
        )
        .setThumbnail(
          interaction.member.user.displayAvatarURL({ dynamic: true })
        )
        .setTimestamp();
    } else {
      const roles =
        "```" + member.roles.cache.map((role) => role.name).join(`, `) + "```";
      const perms = "```" + member.permissions.toArray().join(`\n`) + "```";
      let badges = "```" + member.user.flags.toArray().join(", ") + "```";
      if (badges === "``````") badges = "```None```";
      userInfoEmbed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setTitle(`${member.user.username}'s User Information`)
        .addFields(
          { name: "Username: ", value: `${member.user.tag}` },
          { name: "ID: ", value: `${member.user.id}` },
          {
            name: "Conta desde:",
            value: `${moment(member.user.createdTimestamp).format(
              "LT"
            )} ${moment(member.user.createdTimestamp).format("LL")} (${moment(
              member.user.createdTimestamp
            ).fromNow()})`,
          },
          { name: "Badges", value: `${badges}` },
          {
            name: "Entrou em:",
            value: `${moment(member.joinedTimestamp).format("LT")} ${moment(
              member.joinedTimestamp
            ).format("LL")} (${moment(member.joinedTimestamp).fromNow()})`,
          },
          { name: "Cargos:", value: `${roles}` },
          { name: "Permissões", value: `${perms}` }
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();
    }
    interaction.reply({ embeds: [userInfoEmbed] });
  },
};
