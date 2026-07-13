// @ts-check

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputStyle,
  TextInputBuilder,
  StringSelectMenuBuilder,
  Client,
  SelectMenuInteraction,
} = require("discord.js");

const botSchema = require("../Schema/botSchema");
const userSchema = require("../Schema/userSchema");
const config = require("../Settings/config");
const { newCollection } = require("../Utils/client");

/**
 * @param {Client<true>} client
 * @param {SelectMenuInteraction} interaction
 */

module.exports = async (interaction, client) => {
  /* Core Interaction */
  let rowyValues;
  try {
    rowyValues = interaction.values[0];
  } catch (err) {}
  let rowyId = interaction.customId;

  let botDatas = await botSchema.findOne({ clientId: client.user.id });

  /* Core Whitelist */
  if (rowyValues === "manageWhitelist") {
    let data = await botSchema.findOne({ clientId: client.user.id });
    data.whitelist = data.whitelist.reverse();

    let page = 0;
    let maxPage = Math.ceil(data.whitelist?.length / 5);
    let slicedData = data.whitelist.slice(page * 5, (page + 1) * 5);

    let embed = new EmbedBuilder()
      .setTitle(
        interaction.locale == "tr"
          ? "AuthClient - Beyaz Liste"
          : "AuthClient - Whitelist"
      )
      .setDescription(
        data.whitelist?.length > 0
          ? slicedData
              ?.map(
                (value, index) =>
                  `\` ${index + 1} \` \` ${value.name} \` - \` ${value.id} \``
              )
              .join("\n")
          : "`` Beyazliste boş görünüyor. ``"
      )
      .setFooter({
        text: `${config.client.footer} | Page ${page + 1} of ${maxPage}`,
      });

    let menu1 = new StringSelectMenuBuilder()
      .setCustomId("menu1")
      .setPlaceholder("🔨 Select an option")
      .addOptions(
        {
          label: "Advanced Panel",
          description: "Advanced panel for the bot.",
          value: "advancedsettings",
          emoji: "⚒️",
        },
        {
          label: "Join Users",
          description: "Invite users to the server.",
          value: "joinusers",
          emoji: "🧑‍🚀",
        },
        {
          label: "Manage whitelist",
          description: "Displays the list of whitelisted members.",
          value: "manageWhitelist",
          emoji: "🥷",
        },
        {
          label: "Look at users",
          description: "Displays complete list of authenticated users.",
          value: "manageusers",
          emoji: "🍧",
        }
      );

    const row2 = new ActionRowBuilder().addComponents(menu1);

    let row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Success)
        .setLabel("Add")
        .setCustomId("addWhitelist"),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setLabel("Remove")
        .setCustomId("removeWhitelist")
    );

    let row3 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel("◀")
        .setCustomId("previousPage")
        .setDisabled(page === 0),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel("▶")
        .setCustomId("nextPage")
        .setDisabled(page === maxPage - 1),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Success)
        .setLabel("Add")
        .setCustomId("addWhitelist"),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setLabel("Remove")
        .setCustomId("removeWhitelist")
    );

    let whitelist = [];
    if (data.whitelist?.length > 5) whitelist = [row3, row2];
    else whitelist = [row, row2];

    await interaction
      .update({ embeds: [embed], components: whitelist })
      .then(async (msg) => {
        var iFilter = (x) => x.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({
          filter: iFilter,
          componentType: 2,
          time: 60 * 1000,
        });
        collector.on("collect", async (interac) => {
          if (interac.customId == "nextPage") {
            page++;
            slicedData = data.whitelist.slice(page * 5, (page + 1) * 5);
            embed.setDescription(
              slicedData
                ?.map(
                  (value, index) =>
                    `\` ${index + 1 + page * 5} \` \` ${value.name} \` - \` ${
                      value.id
                    } \``
                )
                .join("\n")
            );
            embed.setFooter({
              text: `${config.client.footer} | Page ${page + 1} of ${maxPage}`,
            });
            row3.components[0].setDisabled(page === 0);
            row3.components[1].setDisabled(page === maxPage - 1);
            await interac
              .update({ embeds: [embed], components: whitelist })
              .catch((err) => {});
          } else if (interac.customId == "previousPage") {
            page--;
            slicedData = data.whitelist.slice(page * 5, (page + 1) * 5);
            embed.setDescription(
              slicedData
                ?.map(
                  (value, index) =>
                    `\` ${index + 1 + page * 5} \` \` ${value.name} \` - \` ${
                      value.id
                    } \``
                )
                .join("\n")
            );
            embed.setFooter({
              text: `${config.client.footer} | Page ${page + 1} of ${maxPage}`,
            });
            row3.components[0].setDisabled(page === 0);
            row3.components[1].setDisabled(page === maxPage - 1);
            await interac
              .update({ embeds: [embed], components: whitelist })
              .catch((err) => {});
          }

          collector.on("end", async () => {
            row3.components[0].setDisabled(true);
            row3.components[1].setDisabled(true);
          });
        });
      });
  }

  /* Core Whitelist Add */
  if (rowyId === "addWhitelist") {
    const addModals = new ModalBuilder()
      .setCustomId("addWhitelistModal")
      .setTitle("AuthClient - Add to Whitelist");

    const guildText = new TextInputBuilder()
      .setCustomId("addWhitelistModalText")
      .setLabel("Enter user ID to add")
      .setRequired(true)
      .setMaxLength(25)
      .setStyle(TextInputStyle.Short);

    const textconverter = new ActionRowBuilder().addComponents(guildText);
    addModals.addComponents(textconverter);
    await interaction.showModal(addModals);
  }

  /* Core Whitelist Remove */
  if (rowyId === "removeWhitelist") {
    const removeModals = new ModalBuilder()
      .setCustomId("removeWhitelistModal")
      .setTitle("AuthClient - Remove from Whitelist");

    const guildText = new TextInputBuilder()
      .setCustomId("removeWhitelistModalText")
      .setLabel("Enter user ID to remove")
      .setRequired(true)
      .setMaxLength(25)
      .setStyle(TextInputStyle.Short);

    const textconverter = new ActionRowBuilder().addComponents(guildText);
    removeModals.addComponents(textconverter);
    await interaction.showModal(removeModals);
  }

  if (rowyValues === "manageusers") {
    let data = await userSchema.find({});
    let page = 0;
    let maxPage = Math.ceil(data.length / 10);
    let slicedData = data.slice(page * 10, (page + 1) * 10);

    let embed = new EmbedBuilder()
      .setTitle("AuthClient - Users")
      .setDescription(
        data.length > 0
          ? slicedData
              ?.map(
                (value, index) =>
                  `\` ${index + 1} \` \` ${value.username}#${
                    value.discriminator
                  } \` - \` ${value.id} \` - ${value.locale}`
              )
              .join("\n")
          : "There is no one in this server."
      )
      .setFooter({
        text: `${config.client.footer} | Page ${page + 1} of ${maxPage}`,
      });

    let row3 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel("◀")
        .setCustomId("previousPage")
        .setDisabled(page === 0),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel("▶")
        .setCustomId("nextPage")
        .setDisabled(page === maxPage - 1)
    );

    let menu1 = new StringSelectMenuBuilder()
      .setCustomId("menu1")
      .setPlaceholder("🔨 Select an option")
      .addOptions(
        {
          label: "Advanced Panel",
          description: "Advanced panel for the bot.",
          value: "advancedsettings",
          emoji: "⚒️",
        },
        {
          label: "Join Users",
          description: "Invite users to the server.",
          value: "joinusers",
          emoji: "🧑‍🚀",
        },
        {
          label: "Manage whitelist",
          description: "Displays the list of whitelisted members.",
          value: "manageWhitelist",
          emoji: "🥷",
        },
        {
          label: "Look at users",
          description: "Displays complete list of authenticated users.",
          value: "manageusers",
          emoji: "🍧",
        }
      );

    const row2 = new ActionRowBuilder().addComponents(menu1);

    let whitelist = [];
    if (data.length > 10) whitelist = [row3, row2];
    else whitelist = [row2];

    interaction
      .update({ embeds: [embed], components: whitelist })
      .then(async (msg) => {
        let filter = (i) => i.user.id === interaction.user.id;
        let collector = msg.createMessageComponentCollector({
          filter,
          time: 60000,
        });

        collector.on("collect", async (i) => {
          if (i.customId === "previousPage") {
            page--;
            slicedData = data.slice(page * 10, (page + 1) * 10);
            embed.setDescription(
              slicedData
                ?.map(
                  (value, index) =>
                    `\` ${index + 1 + page * 10} \` \` ${value.name} \` - \` ${
                      value.id
                    } \``
                )
                .join("\n")
            );
            embed.setFooter({
              text: `${config.client.footer} | Page ${page + 1} of ${maxPage}`,
            });
            row3.components[0].setDisabled(page === 0);
            row3.components[1].setDisabled(page === maxPage - 1);
            i.update({ embeds: [embed], components: [row3, row2] });
          } else if (i.customId === "nextPage") {
            page++;
            slicedData = data.slice(page * 10, (page + 1) * 10);
            embed.setDescription(
              slicedData
                ?.map(
                  (value, index) =>
                    `\` ${index + 1 + page * 10} \` \` ${value.name} \` - \` ${
                      value.id
                    } \``
                )
                .join("\n")
            );
            embed.setFooter({
              text: `${config.client.footer} | Page ${page + 1} of ${maxPage}`,
            });
            row3.components[0].setDisabled(page === 0);
            row3.components[1].setDisabled(page === maxPage - 1);
            i.update({ embeds: [embed], components: [row3, row2] });
          }
        });
      });
  }

  let checkData = await userSchema.find({});

  if (rowyValues === "joinusers") {
    let udb = await userSchema.find({});
    let total = udb.length;

    let options = [];
    let botData = await botSchema.findOne({ clientId: client.user.id });
    botData.authorizedServers?.forEach((value, index) => {
      let guild = client.guilds.cache.get(value);
      options.push({
        label: guild ? guild.name : "Unknown Server",
        value: guild ? guild.id + "+2+" : "Unknown ID" + index,
      });
    });
    if (options > 0) {
      options = [...options];
    } else {
      options.push({
        label: "Don't have a server",
        value: "notvalues",
      });
    }

    let row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("selectJoinUsers")
        .setPlaceholder("Select Server")
        .addOptions(options)
    );

    const embed = new EmbedBuilder()
      .setTitle("📣 Join Users")
      .setDescription(
        `Which server do you want to invite members to?\nYou can invite **${total}** members.`
      );

    interaction.update({ embeds: [embed], components: [row] });
  }

  if (botDatas.authorizedServers?.includes(rowyValues?.split("+2")[0])) {
    newCollection.set(client.user.id, {
      id: rowyValues?.split("+2")[0],
    });

    const addModals = new ModalBuilder()
      .setCustomId("writeJoinAmount")
      .setTitle("📣 Join Users");

    const guildText = new TextInputBuilder()
      .setCustomId("writeJoinAmountText")
      .setLabel("📣 Number of members")
      .setPlaceholder(`${checkData?.length}`)
      .setRequired(true)
      .setMaxLength(25)
      .setStyle(TextInputStyle.Short);

    const textconverter = new ActionRowBuilder().addComponents(guildText);
    addModals.addComponents(textconverter);
    await interaction.showModal(addModals);
  }

  // ============================================================
  // ✅ DÜZELTİLMİŞ JOIN USERS (CANCEL + ANLIK SAYI)
  // ============================================================
  if (rowyId == "writeJoinAmount") {
    // ✅ await KALDIRILDI - interaction.message doğrudan kullanıldı
    const message = interaction.message;
    let checkData = await userSchema.find({});
    let json = checkData;
    let amount = interaction.fields.getTextInputValue("writeJoinAmountText");

    if (!amount || isNaN(amount) || amount <= 0) {
      return interaction.update({
        content: "❌ Please enter a number.",
        ephemeral: true,
      }).then(x => setTimeout(() => x.delete(), 5000));
    }

    if (checkData?.length < amount) {
      return interaction.update({
        content: `❌ Not enough users! Max ${checkData?.length} users.`,
        ephemeral: true,
      }).then(x => setTimeout(() => x.delete(), 5000));
    }

    let guild = client.guilds.cache.get(newCollection.get(client.user.id)?.id);
    if (!guild) {
      return interaction.update({
        content: "❌ Server not found!",
        ephemeral: true,
      });
    }

    const cancelButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("cancelProgress")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Danger)
    );

    let embed_ = new EmbedBuilder()
      .setFooter({ text: `${config.client.footer}` })
      .setColor("Random");

    let scd = amount * 0.08 * 7500;
    let time = msToTime(scd);

    await interaction.update({
      components: [cancelButton],
      embeds: [
        embed_.setTitle("📣 Join Session").setDescription(
          `🆔 Server ID: \`${guild.id}\`
  🏠 Server Name: \`${guild.name}\`
  🎀 Members: \`${guild.memberCount}\`
  ✨ Invites: \`0 / ${amount}\`
  🟢 Success: \`0\`
  🔴 Error: \`0\`
  🔵 Already Joined: \`0\`
  🔱 Status: \`Starting...\`
  ⏱ Estimated Time: \`${time}\``
        )
      ]
    });

    let error = 0;
    let success = 0;
    let already_joined = 0;
    let progressCancelled = false;

    const collector = message.createMessageComponentCollector({
      filter: (i) => i.customId === "cancelProgress" && i.user.id === interaction.user.id,
      time: 600000,
    });

    collector.on("collect", async (i) => {
      progressCancelled = true;
      await i.update({
        content: "❌ Session cancelled!",
        components: [],
        embeds: [],
      });
    });

    for (let i = 0; i < amount; i++) {
      if (progressCancelled) break;

      try {
        let user = await client.users.fetch(json[i]?.id);
        if (!user) continue;

        if (guild.members.cache.get(json[i].id)) {
          already_joined++;
        } else {
          await guild.members.add(user, { accessToken: json[i].accessToken });
          success++;
        }
      } catch {
        error++;
      }

      const total = already_joined + success + error;
      const percent = (total * 100) / amount;

      await message.edit({
        components: [cancelButton],
        embeds: [
          embed_.setTitle("📣 Join Session").setDescription(
            `🆔 Server ID: \`${guild.id}\`
  🏠 Server Name: \`${guild.name}\`
  🎀 Members: \`${guild.memberCount}\`
  ✨ Invites: \`${total} / ${amount}\`
  🟢 Success: \`${success}\`
  🔴 Error: \`${error}\`
  🔵 Already Joined: \`${already_joined}\`
  🔱 Status: \`${percent.toFixed(2)}% completed\`
  ⏱ Estimated Time: \`${time}\``
          )
        ]
      });

      await new Promise(r => setTimeout(r, 1000));
    }

    if (!progressCancelled) {
      await message.edit({
        components: [],
        embeds: [
          embed_.setTitle("📣 Join Session Completed").setDescription(
            `🆔 Server ID: \`${guild.id}\`
  🏠 Server Name: \`${guild.name}\`
  🎀 Members: \`${guild.memberCount}\`
  ✨ Invites: \`${amount} / ${amount}\`
  🟢 Success: \`${success}\`
  🔴 Error: \`${error}\`
  🔵 Already Joined: \`${already_joined}\`
  🔱 Status: \`✅ Completed!\``
          )
        ]
      });
    }
  }
};

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  let time = "";
  if (hours) time += `${hours} hours `;
  if (minutes) time += `${minutes} minutes `;
  if (seconds) time += `${seconds} seconds`;
  return time || "0 seconds";
}
