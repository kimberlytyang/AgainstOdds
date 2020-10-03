const fs = require('fs')
const Discord = require('discord.js')
const options = require('./options.js')
require('dotenv').config()
const client = new Discord.Client()

const prefix = "!"
let userBase = {}
let userArray = []

client.on("ready", () => {
    initUserBase()
    initDeck()
})

client.on("guildCreate", (guild) => {
    try {
        sendWelcome(guild)
    } catch (error) {
        console.log("ERROR: server welcome")
        console.log(error)
    }
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
    for (var user in userBase) {
        if (userBase.hasOwnProperty(user)) {
            userArray.push(userBase[user])
        }
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

function getUser(author) {
    if (!userBase[author.id]) {
        let person = {
            name:author.username,
            money:1000,
            present:0,
            scissors:0,
            teddybear:0,
            diamond:0,
        }
        userBase[author.id] = {...person}
        userArray.push(person)
        fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4))
    }

    return userBase[author.id]
}

client.on("message", (receivedMessage) => {
    try {
        if (!receivedMessage.content.startsWith(prefix) || receivedMessage.author == client.user) {
            return
        }
        
        const withoutPrefix = receivedMessage.content.slice(prefix.length)
        const split = withoutPrefix.split(" ")
        const command = split[0].toLowerCase()
        const args = split.slice(1)
    
        let user = getUser(receivedMessage.author)
    } catch (error) {
        receivedMessage.channel.send("Error! Something went wrong :(")
        console.log("ERROR: message event")
        console.log(error)
    }
    
    switch (command) {
        case "help":
            try {
                options.help(receivedMessage)
            } catch (error) {
                receivedMessage.channel.send("Error! Something went wrong :(")
                console.log("ERROR: help option (general)")
                console.log(error)
            }
            break
        case "bank":
            try {
                options.bank(userBase, user, receivedMessage)
            } catch (error) {
                receivedMessage.channel.send("Error! Something went wrong :(")
                console.log("ERROR: bank option (general)")
                console.log(error)
            }
            break
        case "beg":
            try {
                options.beg(userBase, user, receivedMessage)
            } catch (error) {
                receivedMessage.channel.send("Error! Something went wrong :(")
                console.log("ERROR: beg option (general)")
                console.log(error)
            }
            break
        case "leader":
            try {
                options.leaderboard(userArray, receivedMessage)
            } catch (error) {
                receivedMessage.channel.send("Error! Something went wrong :(")
                console.log("ERROR: leaderboard option (general)")
                console.log(error)
            }
            break
        case "buy":
            try {
                options.buy(userBase, user, receivedMessage, args)
            } catch (error) {
                receivedMessage.channel.send("Error! Something went wrong :(")
                console.log("ERROR: buy option (general)")
                console.log(error)
            }
            break
        case "open":
            try {
                options.open(userBase, user, receivedMessage, args)
            } catch (error) {
                receivedMessage.channel.send("Error! Something went wrong :(")
                console.log("ERROR: open option (general)")
                console.log(error)
            }
            break
        case "sell":
            try {
                options.sell(userBase, user, receivedMessage, args)
            } catch (error) {
                receivedMessage.channel.send("Error! Something went wrong :(")
                console.log("ERROR: sell option (general)")
                console.log(error)
            }
            break
        case "cointoss":
            try {
                options.cointoss(userBase, user, receivedMessage, args)
            } catch (error) {
                receivedMessage.channel.send("Error! Something went wrong :(")
                console.log("ERROR: cointoss option (general)")
                console.log(error)
            }
            break
        case "guesscard":
            try {
                options.guesscard(userBase, user, receivedMessage, args)
            } catch (error) {
                receivedMessage.channel.send("Error! Something went wrong :(")
                console.log("ERROR: guesscard option (general)")
                console.log(error)
            }
            break
        case "slot":
            try {
                options.slot(userBase, user, receivedMessage, args)
            } catch (error) {
                receivedMessage.channel.send("Error! Something went wrong :(")
                console.log("ERROR: slot option (general)")
                console.log(error)
            }
            break
        case "blackjack":
            try {
                options.blackjack(userBase, user, receivedMessage, args)
            } catch (error) {
                receivedMessage.channel.send("Error! Something went wrong :(")
                console.log("ERROR: blackjack option (general)")
                console.log(error)
            }
            break
    }
})

client.login(process.env.CLIENT_TOKEN)