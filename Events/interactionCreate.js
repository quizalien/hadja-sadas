// ============================================================
// Core Authorized Server Joining Users (DÜZELTİLMİŞ)
// ============================================================
if (rowyId == "writeJoinAmount") {
    // interaction zaten async fonksiyon içinde olduğu için await kullanabiliriz
    const message = await interaction.message;
    let checkData = await userSchema.find({});

    let json = checkData;
    let amount = interaction.fields.getTextInputValue("writeJoinAmountText");

    if (!amount || isNaN(amount) || amount <= 0) {
        return interaction.update({
            content: `${interaction.locale == "tr" ? "❌ Lütfen bir sayı girin." : "❌ Please enter a number."}`,
            ephemeral: true,
        }).then(x => setTimeout(() => x.delete(), 5000));
    }

    if (checkData?.length < amount) {
        return interaction.update({
            content: `${interaction.locale == "tr" ? `❌ Yeterli kullanıcı yok! En fazla ${checkData?.length} (max) kullanıcı ekliyebilirsiniz.` : `❌ Not enough users! Max ${checkData?.length} users.`}`,
            ephemeral: true,
        }).then(x => setTimeout(() => x.delete(), 5000));
    }

    let guild = client.guilds.cache.get(newCollection.get(client.user.id)?.id);
    if (!guild) {
        return interaction.update({
            content: "❌ Sunucu bulunamadı!",
            ephemeral: true,
        });
    }

    // Cancel butonu
    const cancelButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("cancelProgress")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Danger)
    );

    let embed_ = new EmbedBuilder()
        .setFooter({ text: `${config.client.footer} ・ ${config.client.serverLink}` })
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

    // Collector ile cancel butonunu dinle
    const collector = message.createMessageComponentCollector({
        filter: (i) => i.customId === "cancelProgress" && i.user.id === interaction.user.id,
        time: 600000, // 10 dakika
    });

    collector.on("collect", async (i) => {
        progressCancelled = true;
        await i.update({
            content: "❌ İşlem iptal edildi!",
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

    // İşlem bitti veya iptal
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

// ============================================================
// msToTime FONKSİYONU
// ============================================================
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
