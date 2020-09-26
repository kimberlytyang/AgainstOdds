const fs = require('fs')
const Discord = require('discord.js')
const options = require('./options.js')
require('dotenv').config()
const client = new Discord.Client()

const prefix = "!"
let userBase = {}

client.on("ready", () => {
    initUserBase()
    initDeck()
})

client.on("guildCreate", (guild) => {
    sendWelcome(guild)
})

function sendWelcome(guild) {
    const welcomeEmbed = new Discord.MessageEmbed()
        .setColor("#ce2228")
        .setTitle("---------  Welcome to AgainstOdds!  ---------")
        .attachFiles(["./res/dice.png"])
        .setImage("attachment://dice.png")
        .setDescription("This is where you can risk every dollar you save <:money_with_wings:753429317903712288>")
        .setFooter("!help for how to play")

    let channelExists = false
    guild.channels.cache.some((channel) => {
        if (channel.name == "againstodds" && channel.type == "text") {
            channelExists = true
            let textChannel = client.channels.cache.get(channel.id)
            textChannel.send(welcomeEmbed)
            return true
        }
    })
        
    if (!channelExists) {
        guild.channels.create("againstodds", { type: "text" }).then((result) => {
            let textChannel = client.channels.cache.get(result.id)
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

function initDeck() {
    let deck = []
    let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
    let suits = ["spades", "clubs", "diamonds", "hearts"]
    let countVal = 1

    for (let i = 0; i < values.length; i++) {
        for (let k = 0; k < suits.length; k++) {
            let bjVal = 0
            if (values[i] === "A") {
                bjVal = 11
            } else if (values[i] === "J" || values[i] === "Q" || values[i] === "K") {
                bjVal = 10
            } else {
                bjVal = parseInt(values[i])
            }
            let card = {
                numeric:countVal,
                numericBJ:bjVal,
                value:values[i],
                suit:suits[k],
            }
            deck.push(card)
        }
        countVal++
    }

    fs.writeFileSync("./deck.json", JSON.stringify(deck, null, 4))
}

function getUser(authorID) {
    if (!userBase[authorID]) {
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

client.on("message", (receivedMessage) => {
    if (!receivedMessage.content.startsWith(prefix) || receivedMessage.author == client.user) {
        return
    }
    
    const withoutPrefix = receivedMessage.content.slice(prefix.length)
	const split = withoutPrefix.split(" ")
	const command = split[0]
    const args = split.slice(1)

    let user = getUser(receivedMessage.author.id)
    
    switch (command) {
        case "help":
            const helpEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("Help Menu")
                .addFields(
                    { name: "<:game_die:753436658556338206> Game Options", value: "`!cointoss` `!guesscard`\n`!slot` `!blackjack`", },
                    { name: "<:moneybag:753439669471150140> Player Options", value: "`!bank` `!shop` `!beg`", },
                )
            receivedMessage.channel.send(helpEmbed)
            break
        case "bank":
            options.bank(userBase, user, receivedMessage)
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
        case "guesscard":
            options.guesscard(userBase, user, receivedMessage, args)
            break
        case "slot":
            options.slot(userBase, user, receivedMessage, args)
            break
        case "blackjack":
            options.blackjack(userBase, user, receivedMessage, args)
            break
    }
})

client.login(process.env.CLIENT_TOKEN) // replace with token