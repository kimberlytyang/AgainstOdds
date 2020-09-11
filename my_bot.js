const fs = require('fs')
const Discord = require('discord.js')
const { parse } = require('path')
const attachment = new Discord.MessageAttachment('cbcfilter.png')
const client = new Discord.Client()

const prefix = "!"

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

    //const localFileAttachment = new Discord.MessageAttachment('./res/dice.png')
    const welcomeEmbed = new Discord.MessageEmbed()
        .setColor("#ce2228")
        .setTitle("---------  Welcome to AgainstOdds!  ---------")
        .attachFiles(['./res/dice.png'])
        .setImage('attachment://dice.png')
        .setDescription("This is where you can risk every dollar you save <:money_with_wings:753429317903712288>")
        .setFooter("!help for how to play")

    generalChannel.send(welcomeEmbed)
})

client.on('message', (receivedMessage) => {
    // console.log(receivedMessage.author)
    if (!receivedMessage.content.startsWith(prefix) || receivedMessage.author == client.user) {
        return
    }

    const withoutPrefix = receivedMessage.content.slice(prefix.length)
	const split = withoutPrefix.split(" ")
	const command = split[0]
    const args = split.slice(1)

    var retrieved = fs.readFileSync("./data.json", "utf8")
    var obj = null // array of all users
    var userIndex = null // reference to current user data
    if (retrieved === "") { // no users exist yet
        var person = {
            id:receivedMessage.author.id,
            money:1000,
            toiletpaper:0,
            poop:0,
        }
        var arr = [{...person}]
        fs.writeFileSync("./data.json", JSON.stringify(arr))

        retrieved = fs.readFileSync("./data.json", "utf8")
        obj = JSON.parse(retrieved)
        userIndex = 0
    } else { // check each existing user to find if current user exists
        obj = JSON.parse(retrieved)
        var found = false
        for (let i = 0; i < obj.length; i++) {
            if (obj[i].id === receivedMessage.author.id) { // if found
                userIndex = i // set `userIndex` to current location
                found = true
                break
            }
        }
        if (!found) { // searched and still not found
            var person = {
                id:receivedMessage.author.id,
                money:1000,
                toiletpaper:0,
                poop:0,
            }
            obj.push({...person})
            fs.writeFileSync("./data.json", JSON.stringify(obj))

            retrieved = fs.readFileSync("./data.json", "utf8")
            obj = JSON.parse(retrieved)
            userIndex = obj.length - 1
        }
    }    

    if (command === "help") {
        const helpEmbed = new Discord.MessageEmbed()
            .setColor("#ce2228")
            .setTitle("Help Menu")
            .addFields(
                { name: "<:game_die:753436658556338206> Game Options", value: "`!cointoss`", },
                { name: "<:moneybag:753439669471150140> Player Options", value: "`!bank`, `!shop`", },
            )
        receivedMessage.channel.send(helpEmbed);
    } else if (command === "bank") {
        // if money above certain amount, react with "rich" or "poor"
        // receivedMessage.react("\:smile:")
        var wealth = null
        if (obj[userIndex].money <= 0) {
            wealth = "*maybe you should try working for once...*"
        } else if (obj[userIndex].money < 100) {
            wealth = "*dirt. poor.*"
        } else if (obj[userIndex].money < 5000) {
            wealth = "*not doing great...*"
        } else if (obj[userIndex].money < 25000) {
            wealth = "*kinda average...*"
        } else if (obj[userIndex].money < 60000) {
            wealth = "*still not as rich as me...*"
        } else if (obj[userIndex].money < 100000) {
            wealth = "*why do you have so much?*"
        } else if (obj[userIndex].money < 500000) {
            wealth = "*go spend all this money...*"
        } else {
            wealth = "*stop trying so hard!*"
        }

        const helpEmbed = new Discord.MessageEmbed()
            .setColor("#ce2228")
            .setTitle("<:bank:753916288744554526>   " + receivedMessage.author.username + "\'s Bank   <:bank:753916288744554526>")
            .setDescription("**Money:** $" + obj[userIndex].money + "\n**Toilet Paper:** " + obj[userIndex].toiletpaper + "\n**Poop:** " + obj[userIndex].poop)
        
        receivedMessage.channel.send(helpEmbed);
        receivedMessage.channel.send(wealth);
    } else if (command === "cointoss") {
        if (args.length != 2 || !parseInt(args[0]) || (args[1] != "heads" && args[1] != "tails")) {
            const cointossEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("Coin Toss")
                .setDescription("**Command:** " + "!cointoss <betamount> <heads/tails>")
            receivedMessage.channel.send(cointossEmbed);
        } else if (args[0] > obj[userIndex].money) {
            const poorEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("Too Poor")
            receivedMessage.channel.send(poorEmbed);
        } else if (args[0] < 0) {
            const invalidEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("Invalid Bet")
            receivedMessage.channel.send(invalidEmbed);
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
                obj[userIndex].money = parseInt(args[0]) + parseInt(obj[userIndex].money)
                fs.writeFileSync("./data.json", JSON.stringify(obj)) // update balance
            } else {
                won = "You Lost a "
                obj[userIndex].money = parseInt(obj[userIndex].money) - parseInt(args[0])
                fs.writeFileSync("./data.json", JSON.stringify(obj)) // update balance
            }

            const results = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("<:moneybag:753937876399685653>   Results   <:moneybag:753937876399685653>")
                .addFields(
                    { name: "Landed on: `" + side + "`\n" + won + "$" + args[0] + " Bet!", value: "New Balance: $" + obj[userIndex].money, },
                )
            receivedMessage.channel.send(results);
        }
        
        // is there a way to wait for response and take it in
    } else if (command === "shop") {
        if (args.length != 2 || !parseInt(args[0]) || !parseInt(args[1])) {
            const shopEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("<:shopping_cart:753943631764783215>   Items for Sale   <:shopping_cart:753943631764783215>")
                .setDescription("**Command:** \n" + "!shop <itemnumber> <quantity>" + "\n**1) <:roll_of_paper:753943988754710608>   Toilet Paper   $50**\n**2) <:poop:753944822233956389>   Poop   $25**\n**Special Bundle**\n**3) <:roll_of_paper:753943988754710608>  +  <:poop:753944822233956389> for $60**")
            receivedMessage.channel.send(shopEmbed);
            return
        } else if (args[0] < 1 || args[0] > 3) {
            const boundsEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("Invalid Bet")
            receivedMessage.channel.send(boundsEmbed);
            return
        }

        var price = 0
        var item = null
        if (parseInt(args[0]) === 1) {
            price = 50
            item = "Toilet Paper"
        } else if (parseInt(args[0]) === 2) {
            price = 25
            item = "Poop"
        } else {
            price = 60
            item = "Special Bundle"
        }
        
        var total = price * args[1]
        if (total > obj[userIndex].money) {
            const poorEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("Too Poor")
            receivedMessage.channel.send(poorEmbed);
        } else {
            if (parseInt(args[0]) === 1) {
                obj[userIndex].toiletpaper = parseInt(obj[userIndex].toiletpaper) + parseInt(args[1])
                obj[userIndex].money = parseInt(obj[userIndex].money) - parseInt(total)
                fs.writeFileSync("./data.json", JSON.stringify(obj)) // update balance
            } else if (parseInt(args[0]) === 2) {
                obj[userIndex].poop = parseInt(obj[userIndex].poop) + parseInt(args[1])
                obj[userIndex].money = parseInt(obj[userIndex].money) - parseInt(total)
                fs.writeFileSync("./data.json", JSON.stringify(obj)) // update balance
            } else {
                obj[userIndex].toiletpaper = parseInt(obj[userIndex].toiletpaper) + parseInt(args[1])
                obj[userIndex].poop = parseInt(obj[userIndex].poop) + parseInt(args[1])
                obj[userIndex].money = parseInt(obj[userIndex].money) - parseInt(total)
                fs.writeFileSync("./data.json", JSON.stringify(obj)) // update balance
            }

            const purchases = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("<:moneybag:753937876399685653>   Purchase   <:moneybag:753937876399685653>")
                .addFields(
                    { name: "You bought `" + item + "` x" + args[1], value: "New Balance: $" + obj[userIndex].money + "\nThank you for coming <:woman_bowing:753954248764686379>", },
                )
            receivedMessage.channel.send(purchases);
        }
    } else {
        console.log("Message received: " + receivedMessage.content)
    }
})

client.login("") // replace with token

// IDEAS

// !beg <user>
// !buy <item>
// !shop for items to buy
// !work to do simple math problems
// !leaderboard for top <something>

// difference between file parsing with node vs just json parsing