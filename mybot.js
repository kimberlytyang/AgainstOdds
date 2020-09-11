const fs = require('fs')
const Discord = require('discord.js')
const { parse } = require('path')
const attachment = new Discord.MessageAttachment('cbcfilter.png')
const client = new Discord.Client()

const prefix = "!"

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

    var curr = {
        authorID:receivedMessage.author.id,
        retrieved:fs.readFileSync("./data.json", "utf8"), // data file
        obj:null, // array of all users from parsing file
        userIndex:null, // index in `obj` array of current user
        user:null, // reference to current user data
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
        user = getUser(curr) // getUser

        var wealth = null
        if (user.money <= 0) {
            wealth = "*maybe you should try working for once...*"
        } else if (user.money < 100) {
            wealth = "*dirt. poor.*"
        } else if (user.money < 5000) {
            wealth = "*not doing great...*"
        } else if (user.money < 25000) {
            wealth = "*kinda average...*"
        } else if (user.money < 60000) {
            wealth = "*still not as rich as me...*"
        } else if (user.money < 100000) {
            wealth = "*why do you have so much?*"
        } else if (user.money < 500000) {
            wealth = "*go spend all this money...*"
        } else {
            wealth = "*stop trying so hard!*"
        }

        const helpEmbed = new Discord.MessageEmbed()
            .setColor("#ce2228")
            .setTitle("<:bank:753916288744554526>   " + receivedMessage.author.username + "\'s Bank   <:bank:753916288744554526>")
            .setDescription("**Money:** $" + user.money + "\n<:soap:754085455791915108>: " + user.soap + "\n<:roll_of_paper:753943988754710608>: " + user.toiletpaper)
        
        receivedMessage.channel.send(helpEmbed);
        receivedMessage.channel.send(wealth);
    } else if (command === "cointoss") {
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

        user = getUser(curr) // getUser

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
                fs.writeFileSync("./data.json", JSON.stringify(curr.obj)) // update balance
            } else {
                won = "You Lost a "
                user.money = parseInt(user.money) - parseInt(args[0])
                fs.writeFileSync("./data.json", JSON.stringify(curr.obj)) // update balance
            }

            const results = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("<:moneybag:753937876399685653>   Results   <:moneybag:753937876399685653>")
                .addFields(
                    { name: "Landed on: `" + side + "`\n" + won + "$" + args[0] + " Bet!", value: "New Balance: $" + user.money, },
                )
            receivedMessage.channel.send(results)
        }
        
        // is there a way to wait for response and take it in
    } else if (command === "shop") {
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
        user = getUser(curr) // getUser

        if (total > user.money) {
            const poorEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("Too Poor")
            receivedMessage.channel.send(poorEmbed);
        } else {
            if (args[0] == 1) {
                user.soap = parseInt(user.soap) + parseInt(args[1])
                user.money = parseInt(user.money) - parseInt(total)
                fs.writeFileSync("./data.json", JSON.stringify(curr.obj)) // update balance
            } else if (args[0] == 2) {
                user.toiletpaper = parseInt(user.toiletpaper) + parseInt(args[1])
                user.money = parseInt(user.money) - parseInt(total)
                fs.writeFileSync("./data.json", JSON.stringify(curr.obj)) // update balance
            } else {
                user.soap = parseInt(user.soap) + parseInt(args[1])
                user.toiletpaper = parseInt(user.toiletpaper) + parseInt(args[1])
                user.money = parseInt(user.money) - parseInt(total)
                fs.writeFileSync("./data.json", JSON.stringify(curr.obj)) // update balance
            }

            const purchases = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("<:moneybag:753937876399685653>   " + receivedMessage.author.username + "\'s Purchase   <:moneybag:753937876399685653>")
                .addFields(
                    { name: "You bought `" + item + "` x" + args[1], value: "New Balance: $" + user.money + "\nThank you for coming <:woman_bowing:753954248764686379>", },
                )
            receivedMessage.channel.send(purchases);
        }
    } else {
        console.log("Message received: " + receivedMessage.content)
    }
})

function getUser(curr) {
    if (curr.retrieved === "") { // no users exist yet
        var person = {
            id:curr.authorID,
            money:1000,
            soap:0,
            toiletpaper:0,
        }
        var arr = [{...person}]
        fs.writeFileSync("./data.json", JSON.stringify(arr))

        curr.retrieved = fs.readFileSync("./data.json", "utf8")
        curr.obj = JSON.parse(curr.retrieved)
        curr.userIndex = 0
    } else { // check each existing user to find if current user exists
        curr.obj = JSON.parse(curr.retrieved)
        var found = false
        for (let i = 0; i < curr.obj.length; i++) {
            if (curr.obj[i].id === curr.authorID) { // if found
                curr.userIndex = i // set `userIndex` to current location
                found = true
                break
            }
        }
        if (!found) { // searched and still not found
            var person = {
                id:curr.authorID,
                money:1000,
                soap:0,
                toiletpaper:0,
            }
            curr.obj.push({...person})
            fs.writeFileSync("./data.json", JSON.stringify(curr.obj))

            curr.retrieved = fs.readFileSync("./data.json", "utf8")
            curr.obj = JSON.parse(curr.retrieved)
            curr.userIndex = curr.obj.length - 1
        }
    }
    return curr.obj[curr.userIndex]
}

client.login("NzUzMTAxMDAyMzQwNTY1MTEz.X1hR9g.xDqCq6JsT-OyNG0A3ZQvy_VRbgk") // replace with token

// IDEAS

// !beg <user>
// !work to do simple math problems
// !leaderboard for top <something>

// difference between file parsing with node vs just json parsing