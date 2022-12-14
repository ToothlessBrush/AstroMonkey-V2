const { SlashCommandBuilder, ActionRowBuilder } = require("@discordjs/builders")
const { EmbedBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("display the current songs in queue")
        .addNumberOption((option) => 
            option
                .setName("page")
                .setDescription("page number")
                .setMinValue(1)
                ),

    run: async ({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId)
        if (!queue || !queue.playing){
            return await interaction.editReply({embeds: [new EmbedBuilder().setColor(0xA020F0).setDescription(`**No Music in Queue!**`)]})
        }

        //console.log(queue.tracks.length)
        //console.log(queue.getPlayerTimestamp().current)
        let totalPages = Math.ceil(queue.tracks.length / 10)
        if (totalPages == 0) { //set pages to 1 when song playing but no queue
            totalPages = 1
        }
        
        const page = (interaction.options.getNumber("page") || 1) - 1

        if (page >= totalPages) {
            return await interaction.editReply({embeds: [new EmbedBuilder().setColor(0xA020F0).setTitle(`Invalid Page!`).setDescription(`there are only ${totalPages} pages`)]})
        }

        const queueString = queue.tracks.slice(page * 10, page * 10 + 10).map((song, i) => {
            return `**${page * 10 + i + 1}.** \`[${song.duration}]\` [${song.title}](${song.url})\n**Requested By: <@${song.requestedBy.id}>**`
        }).join("\n")

        const currentSong = queue.current

        let bar = queue.createProgressBar({
            queue: false,
            length: 19,
        })

        let progressBar = `${queue.getPlayerTimestamp().current} **|**${bar}**|** ${queue.getPlayerTimestamp().end}`

        //let nextButton
        let prevPage
        if (page == 0) {
            prevPage = 0
        } else {
            prevPage = page - 1
        }

        let nextPage
        if ((page + 1) == totalPages) {
            nextPage = page
        } else {
            nextPage = page + 1 
        }
        
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setColor(0xA020F0)
                .setDescription(`**Currently Playing**\n` + 
                (currentSong ? `[${currentSong.title}](${currentSong.url})\n${progressBar}\n**Requested by: <@${currentSong.requestedBy.id}>**` : "None") +
                `\n\n**Queue**\n${queueString}`
                )
                .setFooter({
                    text: `Page ${page + 1} of ${totalPages}`
                })
                .setThumbnail(currentSong.thumbnail)
            ],
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`prevPageButton_${prevPage}`)
                            .setLabel(`<`)
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId(`refreshQueue`)
                            .setLabel("???")
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId(`nextPageButton_${nextPage}`)
                            .setLabel(`>`)
                            .setStyle(ButtonStyle.Secondary)                             
                    )
                    
            ]
        })
    }
}