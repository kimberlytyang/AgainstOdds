const Discord = require('discord.js')
const attachment = new Discord.MessageAttachment('cbcfilter.png');
const client = new Discord.Client()

client.on('ready', async() => { // async function allows the use of `await` to complete action before continuing
    // List servers the bot is connected to
    console.log("Servers:")
    client.guilds.cache.forEach((guild) => {
        console.log(" - " + guild.name)
        // List all channels
        guild.channels.cache.forEach((channel) => {
            console.log("    - " + channel.name + " (" + channel.type + ") - " + channel.id)
        })
    })

    var generalChannel = client.channels.cache.get("753105145209815131") // Known channel ID

    await generalChannel.send("---------------------------------------------------")
    const localFileAttachment = new Discord.MessageAttachment('./res/dice.png')
    await generalChannel.send(localFileAttachment)
    await generalChannel.send("---------  Welcome to AgainstOdds!  ---------")
})

client.login("NzUzMTAxMDAyMzQwNTY1MTEz.X1hR9g.VqT5IUjiD9x_9hq8GWUrdc1sGug")