const fs = require('fs')
const Discord = require('discord.js')
require('dotenv').config()
const attachment = new Discord.MessageAttachment('cbcfilter.png')
const client = new Discord.Client()

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
        .setImage('attachment://dice.png')
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

client.on('message', (receivedMessage) => {
    // console.log(receivedMessage.author)
    if (!receivedMessage.content.startsWith(prefix) || receivedMessage.author == client.user) {
        return
    }

    const withoutPrefix = receivedMessage.content.slice(prefix.length)
	const split = withoutPrefix.split(" ")
	const command = split[0]
    const args = split.slice(1)

    var authorID = receivedMessage.author.id
    
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
            // if money above certain amount, react with "rich" or "poor"
            // receivedMessage.react("\:smile:")
            user = getUser(authorID)

            var wealth = null
            if (user.money <= 0) {
                wealth = "*maybe you should try working for once...*"
            } else if (user.money < 500) {
                wealth = "*dirt. poor.*"
            } else if (user.money < 5000) {
                wealth = "*not doing great...*"
            } else if (user.money < 25000) {
                wealth = "*looking average...*"
            } else if (user.money < 60000) {
                wealth = "*still not as rich as me...*"
            } else if (user.money < 100000) {
                wealth = "*why do you have so much?*"
            } else if (user.money < 500000) {
                wealth = "*go spend some money...*"
            } else {
                wealth = "*stop trying so hard!*"
            }

            const bankEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("<:bank:753916288744554526>   " + receivedMessage.author.username + "\'s Bank   <:bank:753916288744554526>")
                .setDescription("**Money:** $" + user.money + "\n<:soap:754085455791915108>: " + user.soap + "\n<:roll_of_paper:753943988754710608>: " + user.toiletpaper)
            
            receivedMessage.channel.send(bankEmbed)
            receivedMessage.channel.send(wealth)
            break
        case "shop":
            if (args.length != 2 || !parseInt(args[0]) || !parseInt(args[1])) {
                const shopEmbed = new Discord.MessageEmbed()
                    .setColor("#ce2228")
                    .setTitle("<:shopping_cart:753943631764783215>   Items for Sale   <:shopping_cart:753943631764783215>")
                    .setDescription("**Command:** !shop <item#> <quantity>" + "\n**1) $35 `Soap` <:soap:754085455791915108>**\n**2) $50 `Toilet Paper` <:roll_of_paper:753943988754710608>**\n**3) $75 `Special Bundle` <:roll_of_paper:753943988754710608> + <:soap:754085455791915108>**")
                    .setFooter("Stock up on items for quarantine!")
                receivedMessage.channel.send(shopEmbed)
                return
            } else if (args[0] < 1 || args[0] > 3) {
                const boundsEmbed = new Discord.MessageEmbed()
                    .setColor("#ce2228")
                    .setTitle("Invalid Item")
                receivedMessage.channel.send(boundsEmbed)
                return
            }

            var price = 0
            var item = null
            if (args[0] == 1) { // already made sure value is an int, so dont need ===
                price = 35
                item = "Soap"
            } else if (args[0] == 2) {
                price = 50
                item = "Toilet Paper"
            } else {
                price = 75
                item = "Special Bundle"
            }
            
            var total = price * args[1]
            user = getUser(authorID)

            if (total > user.money) {
                const poorEmbed = new Discord.MessageEmbed()
                    .setColor("#ce2228")
                    .setTitle("Too Poor")
                receivedMessage.channel.send(poorEmbed)
            } else {
                if (args[0] == 1) {
                    user.soap = parseInt(user.soap) + parseInt(args[1])
                    user.money = parseInt(user.money) - parseInt(total)
                    fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
                } else if (args[0] == 2) {
                    user.toiletpaper = parseInt(user.toiletpaper) + parseInt(args[1])
                    user.money = parseInt(user.money) - parseInt(total)
                    fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
                } else {
                    user.soap = parseInt(user.soap) + parseInt(args[1])
                    user.toiletpaper = parseInt(user.toiletpaper) + parseInt(args[1])
                    user.money = parseInt(user.money) - parseInt(total)
                    fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
                }

                const purchases = new Discord.MessageEmbed()
                    .setColor("#ce2228")
                    .setTitle("<:moneybag:753937876399685653>   " + receivedMessage.author.username + "\'s Purchase   <:moneybag:753937876399685653>")
                    .addFields(
                        { name: "You bought `" + item + "` x" + args[1], value: "New Balance: $" + user.money + "\nThank you for coming <:woman_bowing:753954248764686379>", },
                    )
                receivedMessage.channel.send(purchases)
            }
            break
        case "beg":
            user = getUser(authorID)
            if (user.money > 300) { // if bank is > $300, deny from begging
                const begEmbed = new Discord.MessageEmbed()
                    .setColor("#ce2228")
                    .setTitle("<:dollar:754245592661884949>   Federal Reserve   <:dollar:754245592661884949>")
                    .setDescription("There is enough money in your bank.\nYou have been denied by the Fed.")
                receivedMessage.channel.send(begEmbed)
            } else {
                var randMoney = Math.floor(Math.random() * 21) * 10 + 300
                user.money = parseInt(user.money) + parseInt(randMoney)
                fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance

                const begEmbed = new Discord.MessageEmbed()
                    .setColor("#ce2228")
                    .setTitle("<:dollar:754245592661884949>   Federal Reserve   <:dollar:754245592661884949>")
                    .setDescription("You begged the Federal Reserve and got $" + randMoney + ".")
                receivedMessage.channel.send(begEmbed)
            }
            break
        case "cointoss":
            if (args.length != 2 || !parseInt(args[0]) || (args[1] != "heads" && args[1] != "tails")) {
                const cointossEmbed = new Discord.MessageEmbed()
                    .setColor("#ce2228")
                    .setTitle("Coin Toss")
                    .setDescription("**Command:** " + "!cointoss <bet> <heads/tails>")
                receivedMessage.channel.send(cointossEmbed)
                return
            } else if (args[0] < 0) {
                const boundsEmbed = new Discord.MessageEmbed()
                    .setColor("#ce2228")
                    .setTitle("Invalid Bet")
                receivedMessage.channel.send(boundsEmbed)
                return
            }

            user = getUser(authorID)

            if (args[0] > user.money) {
                const poorEmbed = new Discord.MessageEmbed()
                    .setColor("#ce2228")
                    .setTitle("Too Poor")
                receivedMessage.channel.send(poorEmbed)
            } else {
                var flip = Math.floor(Math.random() * 2)
                var side = null
                if (flip === 0) {
                    side = "heads"
                } else if (flip === 1) {
                    side = "tails"
                } else {
                    side = "error"
                }

                var won = null
                if (side === args[1]) {
                    won = "You Won a "
                    user.money = parseInt(args[0]) + parseInt(user.money)
                    fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
                } else {
                    won = "You Lost a "
                    user.money = parseInt(user.money) - parseInt(args[0])
                    fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
                }

                const results = new Discord.MessageEmbed()
                    .setColor("#ce2228")
                    .setTitle("<:moneybag:753937876399685653>   Results   <:moneybag:753937876399685653>")
                    .addFields(
                        { name: "Landed on: `" + side + "`\n" + won + "$" + parseInt(args[0]) + " Bet!", value: "New Balance: $" + user.money, },
                    )
                receivedMessage.channel.send(results)
            }
            break
        default:
            console.log("Message received: " + receivedMessage.content)
    }
})

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