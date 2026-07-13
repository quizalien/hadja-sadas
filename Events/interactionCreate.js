// Core Authorized Server Joining Users
let progressCancelled = false;

if (rowyId == "writeJoinAmount") {
    const message = await interaction.message;
    let checkData = await userSchema.find({});

    let json = checkData;

    let amount = interaction.fields.getTextInputValue("writeJoinAmountText");
    if (!amount || isNaN(amount) || amount <= 0)
        return interaction
            .update({
                content: `${interaction.locale == "tr" ? "❌ Lütfen bir sayı girin." : interaction.locale == "fr" ? "❌ Veuillez entrer un nombre." : "❌ Please enter a number."}`,
                ephemeral: true,
            })
            .then((x) => setTimeout(() => x.delete(), 5000));
    if (checkData?.length < amount)
        return interaction
            .update({
                content: `${interaction.locale == "tr" ? `❌ Yeterli kullanıcı yok! En fazla ${checkData?.length} (max) kullanıcı ekliyebilirsiniz.` : interaction.locale == "fr" ? `❌ Il n'y a pas assez d'utilisateurs! Au plus ${checkdata?.length} (max) vous pouvez ajouter des utilisateurs.` : `❌ Not enough users! Attempting to add ${checkData.length} (max) users.`}`,
                ephemeral: true,
            })
            .then((x) => setTimeout(() => x.delete(), 5000));

    let scd = amount * 0.08;
    scd = scd * 7500;
    let guild = client.guilds.cache.get(newCollection.get(client.user.id).id);

    if (!guild) return;

    // ✅ CANCEL BUTONU - progressCancelled DEĞİŞKENİNİ TRUE YAPAR
    const cancelButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("cancelProgress")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Danger)
    );

    let embed_ = new EmbedBuilder()
        .setFooter({
            text: `${config.client.footer} ・ ${config.client.serverLink}`,
        })
        .setColor("Random");

    let time = msToTime(scd);
    await interaction.update({
        components: [cancelButton],
        embeds: [
            embed_.setTitle(
                `${interaction.locale == "tr" ? "Giriş İşlemi" : interaction.locale == "fr" ? "Session Commune" : "Join Session"}`
            ).setDescription(`${interaction.locale == "tr" ? `\`🆔\` Sunucu ID: \`${guild.id}\`
\`🏠\` Sunucu Adı: \`${guild.name}\`

\`🎀\` Sunucu Üyesi: \`${guild.memberCount}\`
\`✨\` Davetiye: \` 0 / ${amount} \`

\`🟢\` Başarılı: \`0\`
\`🔴\` Başarısız: \`0\`
\`🔵\` Sunucuda Mevcut: \`0\`

\`🔱\` Durum: \`Başlatılıyor...\`
\`⏱\` Tahmini Süre: \`${time}\`` : interaction.locale == "fr" ? `\`🆔\` ID Serveur: \`${guild.id}\`
\`🏠\` Nom Serveur: \`${guild.name}\`

\`🎀\` Membres Serveur: \`${guild.memberCount}\`
\`✨\` Invites: \`0 / ${amount}\`

\`🟢\` Succès: \`0\`
\`🔴\` Erreur: \`0\`
\`🔵\` Disponible sur le Serveur: \`0\`

\`🔱\` Situation: \`Initialiser...\`
\`⏱\` Temps Estimé: \`${time.replace(/hours/g, "heure").replace(/seconds/g, "deuxième")}\`` :
`\`🆔\` Server ID: \`${guild.id}\`
\`🏠\` Server Name: \`${guild.name}\`

\`🎀\` Server Member Count: \`${guild.memberCount}\`
\`✨\` Invites: \`0 / ${amount}\`

\`🟢\` Success: \`0\`
\`🔴\` Error: \`0\`
\`🔵\` Already in Server: \`0\`

\`🔱\` Status: \`Starting...\`
\`⏱\` Estimated Time: \`${time}\``}`),
        ],
    });

    let error = 0;
    let success = 0;
    let already_joined = 0;

    // ✅ DÖNGÜ BAŞLANGICI
    for (let i = 0; i < amount; i++) {
        // ✅ CANCEL KONTROLÜ - progressCancelled TRUE İSE DÖNGÜYÜ KIR
        if (progressCancelled) {
            progressCancelled = false;
            await message.edit({
                components: [],
                embeds: [
                    embed_
                        .setTitle(`${interaction.locale == "tr" ? "Giriş İşlemi İptali" : interaction.locale == "fr" ? "Session Commune Annulation" : "Join Session Cancellation"}`)
                        .setDescription(`${interaction.locale == "tr" ? `\`🆔\` Sunucu ID: \`${guild.id}\`
\`🏠\` Sunucu Adı: \`${guild.name}\`

\`🎀\` Sunucu Üyesi: \`${guild.memberCount}\`
\`✨\` Davetiye: \`${amount} / ${amount}\`

\`🟢\` Başarılı: \`${success}\`
\`🔴\` Başarısız: \`${error}\`
\`🔵\` Sunucuda Mevcut: \`${already_joined}\`

\`🔱\` Durum: \`İşlem iptal edildi!\`
\`⏱\` Tahmini Süre: \`Kısmi tamamlandı!\`` : interaction.locale == "fr" ? `\`🆔\` ID Serveur: \`${guild.id}\`
\`🏠\` Nom Serveur: \`${guild.name}\`

\`🎀\` Membres Serveur: \`${guild.memberCount}\`
\`✨\` Invites: \`${amount} / ${amount}\`

\`🟢\` Succès: \`${success}\`
\`🔴\` Erreur: \`${error}\`
\`🔵\` Disponible sur le Serveur: \`${already_joined}\`

\`🔱\` Situation: \`L'opération a été annulée!\`
\`⏱\` Temps Estimé: \`Achèvement partiel!\`
` :
`\`🆔\` Server ID: \`${guild.id}\`
\`🏠\` Server Name: \`${guild.name}\`

\`🎀\` Server Member Count: \`${guild.memberCount}\`
\`✨\` Invites: \`${amount} / ${amount}\`

\`🟢\` Success: \`${success}\`
\`🔴\` Error: \`${error}\`
\`🔵\` Already in Server: \`${already_joined}\`

\`🔱\` Status: \`The session is canceled!\`
\`⏱\` Estimated Time: \`Partial completion!\``}`),
                ],
            });
            break;
        }

        try {
            let user = await client.users.fetch(json[i].id);

            if (guild.members.cache.get(json[i].id)) {
                already_joined++;
            } else {
                await guild.members.add(user, { accessToken: json[i].accessToken });
                success++;
            }
        } catch {
            error++;
        }

        // ✅ HER EKLEMEDE MESAJI GÜNCELLE (ANLIK SAYI)
        const scd2 = ((already_joined + success + error) * 100) / amount;
        await message.edit({
            components: [cancelButton],
            embeds: [
                embed_
                    .setTitle(`${interaction.locale == "tr" ? "Giriş İşlemi" : interaction.locale == "fr" ? "Session Commune" : "Join Session"}`)
                    .setDescription(`${interaction.locale == "tr" ? `\`🆔\` Sunucu ID: \`${guild.id}\`
\`🏠\` Sunucu Adı: \`${guild.name}\`

\`🎀\` Sunucu Üyesi: \`${guild.memberCount}\`
\`✨\` Davetiye: \`${already_joined + success + error} / ${amount}\`

\`🟢\` Başarılı: \`${success}\`
\`🔴\` Başarısız: \`${error}\`
\`🔵\` Sunucuda Mevcut: \`${already_joined}\`

\`🔱\` Durum: \`%${scd2.toFixed()} tamamlandı!\`
\`⏱\` Tahmini Süre: \`${time.replace(/hours/g, "saat").replace(/minutes/g, "dakika").replace(/seconds/g, "saniye")}\`` : interaction.locale == "fr" ? `\`🆔\` ID Serveur: \`${guild.id}\`
\`🏠\` Nom Serveur: \`${guild.name}\`

\`🎀\` Membres Serveur: \`${guild.memberCount}\`
\`✨\` Invites: \`${already_joined + success + error} / ${amount}\`

\`🟢\` Succès: \`${success}\`
\`🔴\` Erreur: \`${error}\`
\`🔵\` Disponible sur le Serveur: \`${already_joined}\`

\`🔱\` Situation: \`%${scd2.toFixed()} compléter!\`
\`⏱\` Temps Estimé: \`${time.replace(/hours/g, "heure").replace(/seconds/g, "deuxième")}\`
` :
`\`🆔\` Server ID: \`${newCollection.get(client.user.id).id}\`
\`🏠\` Server Name: \`${guild.name}\`

\`🎀\` Server Member Count: \`${guild.memberCount}\`
\`✨\` Invites: \`${already_joined + success + error} / ${amount}\`

\`🟢\` Success: \`${success}\`
\`🔴\` Error: \`${error}\`
\`🔵\` Already in Server: \`${already_joined}\`

\`🔱\` Status: \`%${scd2.toFixed()} completed!\`
\`⏱\` Estimated Time: \`${time}\``}`),
            ],
        });

        // KÜÇÜK BEKLEME (RATE-LİMİT KORUMASI)
        await new Promise(r => setTimeout(r, 1000));
    }

    // ✅ İŞLEM BİTİNCE
    if (!progressCancelled) {
        await message.edit({
            components: [],
            embeds: [
                embed_
                    .setTitle(`${interaction.locale == "tr" ? "Giriş İşlemi" : interaction.locale == "fr" ? "Session Commune" : "Join Session"}`)
                    .setDescription(`${interaction.locale == "tr" ? `\`🆔\` Sunucu ID: \`${guild.id}\`
\`🏠\` Sunucu Adı: \`${guild.name}\`

\`🎀\` Sunucu Üyesi: \`${guild.memberCount}\`
\`✨\` Davetiye: \`${amount} / ${amount}\`

\`🟢\` Başarılı: \`${success}\`
\`🔴\` Başarısız: \`${error}\`
\`🔵\` Sunucuda Mevcut: \`${already_joined}\`

\`🔱\` Durum: \`%100 tamamlandı!\`
\`⏱\` Tahmini Süre: \`%100 tamamlandı!\`` : interaction.locale == "fr" ? `\`🆔\` ID Serveur: \`${guild.id}\`
\`🏠\` Nom Serveur: \`${guild.name}\`

\`🎀\` Membres Serveur: \`${guild.memberCount}\`
\`✨\` Invites: \`${amount} / ${amount}\`

\`🟢\` Succès: \`${success}\`
\`🔴\` Erreur: \`${error}\`
\`🔵\` Disponible sur le Serveur: \`${already_joined}\`

\`🔱\` Situation: \`%100 compléter!\`
\`⏱\` Temps Estimé: \`%100 compléter!\`
` :
`\`🆔\` Server ID: \`${newCollection.get(client.user.id).id}\`
\`🏠\` Server Name: \`${guild.name}\`

\`🎀\` Server Member Count: \`${guild.memberCount}\`
\`✨\` Invites: \`${amount} / ${amount}\`

\`🟢\` Success: \`${success}\`
\`🔴\` Error: \`${error}\`
\`🔵\` Already in Server: \`${already_joined}\`

\`🔱\` Status: \`%100 completed!\`
\`⏱\` Estimated Time: \`%100 completed!\``}`),
            ],
        });
    }
}
