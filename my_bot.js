const fs = require('fs')
const Discord = require('discord.js')
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
                { name: "<:game_die:753436658556338206> Game Options", value: "`!cointoss`, `!highlow`", },
                { name: "<:moneybag:753439669471150140> Player Options", value: "`!bank`", },
            )
        
        receivedMessage.channel.send(helpEmbed);
    } else if (command === "bank") {
        // if money above certain amount, react with "rich" or "poor"
        // receivedMessage.react("\:smile:")
        var wealth = null
        if (obj[userIndex].money <= 0) {
            wealth = "maybe you should try working for once"
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
            .setDescription("Money: $" + obj[userIndex].money)
        
        receivedMessage.channel.send(helpEmbed);
        receivedMessage.channel.send(wealth);
    } else if (command === "cointoss") {
        const cointossEmbed = new Discord.MessageEmbed()
            .setColor("#ce2228")
            .setTitle("Coin Toss")
            .addFields(
                { name: "Command", value: "`!cointoss <betamount> <heads/tails>", },
            )
        // is there a way to wait for response and take it in
        
        receivedMessage.channel.send(helpEmbed);
    } else {
        console.log("Message received: " + receivedMessage.content)
    }
})

client.login("")

// IDEAS

// !beg <user>
// !buy <item>
// !shop for items to buy
// !work to do simple math problems
// !leaderboard for top <something>

// difference between file parsing with node vs just json parsing