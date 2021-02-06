const { Client, MessageEmbed } = require('discord.js');
const client = new Client();
const prefix = ";"

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`)
})

client.on("message", async message => {
    if (!message.content.toLowerCase().startsWith(prefix)) return
    const args = message.content.slice(prefix.length).split(/ +/g)
    const command = args.shift().toLowerCase()
    if (command == "checkinvs") {
        const guild = message.guild
        const validcatergories = new MessageEmbed()
            .setDescription('what are the ids of the valid categories?');
        message.channel.send(validcatergories);
        const categories = (await message.channel.awaitMessages(m => m.author.id == message.author.id, { max: 1 })).first().content.split(/ +/g)
        const successmsg = new MessageEmbed()
          .setDescription('searching for invalid invite links...');
        const wipmsg = await message.channel.send(successmsg);
        const channels = guild.channels.cache.filter(c => categories.includes(c.parentID) && c.viewable && c.type == "text").array().sort((a, b) => categories.indexOf(a.parentID) - categories.indexOf(b.parentID))
        const codeblocks = []
        for (const channel of channels) {
            const messages = await channel.messages.fetch()
            const push = messages.find(msg => msg.content.startsWith("```"))
            if (push) {
                const invites = push.content.match(/discord(?:(?:app)?\.com\/invite|\.gg(?:\/invite)?)\/([\w-]{2,255})/g)
                if (!invites) {
                  message.channel.send('<#' + channel.id + '>')
                } else {
                    for (const invite of invites) {
                        try {
                            await client.fetchInvite(invite)
                            codeblocks.push(push.content)
                            break
                        } catch (error) {
                            if (invites.indexOf(invite) === invites.length - 1) message.channel.send('<#' + channel.id + '>')
                        }
                    try {
                      const finishmsg = new MessageEmbed()
                        .setDescription('finished listing invalids below');
                      await wipmsg.edit(finishmsg)
                    } catch (error) {
                        const failed = new MessageEmbed()
                          .setDescription('there were no invalid invite links in the selected catergories');
                        message.channel.send(failed)
                    }
                  }
                }
            }
        }
    }
});

client.login(token);
