const fs = require('fs')
const Discord = require('discord.js')

module.exports = {
    bank: function(user, receivedMessage) {
        // if money above certain amount, react with "rich" or "poor"
        // receivedMessage.react("\:smile:")
        let wealth = null
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
    },

    shop: function(userBase, user, receivedMessage, args) {
        if (args.length != 2 || !parseInt(args[0]) || !parseInt(args[1])) { // invalid usage
            const shopEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("<:shopping_cart:753943631764783215>   Items for Sale   <:shopping_cart:753943631764783215>")
                .setDescription("**Command:** !shop <item#> <quantity>" + "\n**1) $35 `Soap` <:soap:754085455791915108>**\n**2) $50 `Toilet Paper` <:roll_of_paper:753943988754710608>**\n**3) $75 `Special Bundle` <:roll_of_paper:753943988754710608> + <:soap:754085455791915108>**")
                .setFooter("Stock up on items for quarantine!")
            receivedMessage.channel.send(shopEmbed)
            return
        } else if (args[0] < 1 || args[0] > 3) { // invalid usage
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
    },

    beg: function(userBase, user, receivedMessage) {
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
    },

    cointoss: function(userBase, user, receivedMessage, args) {
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
    },
}