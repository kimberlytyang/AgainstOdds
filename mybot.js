const fs = require('fs')
const Discord = require('discord.js')
require('dotenv').config()
const client = new Discord.Client()
const options = require('./options.js')
// const attachment = new Discord.MessageAttachment('cbcfilter.png')

const prefix = "!"
var userBase = {} // holds all user data from file

client.on('ready', () => { // async function allows the use of `await` to complete action before continuing
    // List servers the bot is connected to
    console.log("Servers:")
    client.guilds.cache.forEach((guild) => {
        console.log(" - " + guild.name)
        // List all channels
        guild.channels.cache.forEach((channel) => {
            console.log("    - " + channel.name + " (" + channel.type + ") - " + channel.id)
        })
    })

    // var generalChannel = client.channels.cache.get("753105145209815131") // Known channel ID
        
    client.guilds.cache.forEach((guild) => {
        sendWelcome(guild)
    })
    
    initUserBase()

    // const localFileAttachment = new Discord.MessageAttachment('./res/dice.png')
})

client.on("guildCreate", (guild) => {
    sendWelcome(guild)
})

function sendWelcome(guild) { // send on restart or add to new server
    const welcomeEmbed = new Discord.MessageEmbed()
        .setColor("#ce2228")
        .setTitle("---------  Welcome to AgainstOdds!  ---------")
        .attachFiles(['./res/dice.png'])
        .setImage("attachment://dice.png")
        .setDescription("This is where you can risk every dollar you save <:money_with_wings:753429317903712288>")
        .setFooter("!help for how to play")

    var channelExists = false
    guild.channels.cache.some((channel) => {
        // console.log(channel.id)
        if (channel.name == "againstodds" && channel.type == "text") { // if againstodds channel exists, send here
            channelExists = true
            var textChannel = client.channels.cache.get(channel.id)
            textChannel.send(welcomeEmbed)
            return true
        }
    })
        
    if (!channelExists) { // create againstodds channel, then send here
        guild.channels.create("againstodds", { type: "text" }).then((result) => {
            var textChannel = client.channels.cache.get(result.id)
            textChannel.send(welcomeEmbed)
        })
    }
}

function initUserBase() {
    let dataFile = fs.readFileSync("./data.json", "utf8")
    if (dataFile !== "") {
        userBase = JSON.parse(dataFile)
    }
}

function getUser(authorID) {
    if (userBase[authorID] === undefined) { // create new user if necessary
        let person = {
            money:1000,
            soap:0,
            toiletpaper:0,
        }
        userBase[authorID] = {...person}
        fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4))
    }

    return userBase[authorID]
}

client.on('message', (receivedMessage) => {
    // console.log(receivedMessage.author)
    if (!receivedMessage.content.startsWith(prefix) || receivedMessage.author == client.user) {
        return
    }

    const withoutPrefix = receivedMessage.content.slice(prefix.length)
	const split = withoutPrefix.split(" ")
	const command = split[0]
    const args = split.slice(1)

    var user = getUser(receivedMessage.author.id)
    
    switch (command) {
        case "help":
            const helpEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("Help Menu")
                .addFields(
                    { name: "<:game_die:753436658556338206> Game Options", value: "`!cointoss`", },
                    { name: "<:moneybag:753439669471150140> Player Options", value: "`!bank`, `!shop`, `!beg`", },
                )
            receivedMessage.channel.send(helpEmbed)
            break
        case "bank":
            options.bank(user, receivedMessage)
            break
        case "shop":
            options.shop(userBase, user, receivedMessage, args)
            break
        case "beg":
            options.beg(userBase, user, receivedMessage)
            break
        case "cointoss":
            options.cointoss(userBase, user, receivedMessage, args)
            break
        default:
            console.log("Message received: " + receivedMessage.content)
    }
})

client.login(process.env.CLIENT_TOKEN) // replace with token

// IDEAS

// !beg <user>
// !work to do simple math problems
// !leaderboard for top <something>
// implement easier way to see if you won visually with check or X emojis
// how to separate into different functions/files
// implement deck of cards

// is there a way to wait for response and take it in
// difference between file parsing with node vs just json parsing