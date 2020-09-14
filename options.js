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
        } else if (user.money < 3000) {
            wealth = "*not doing great...*"
        } else if (user.money < 10000) {
            wealth = "*looking average...*"
        } else if (user.money < 25000) {
            wealth = "*still not as rich as me...*"
        } else if (user.money < 50000) {
            wealth = "*why do you have so much?*"
        } else if (user.money < 100000) {
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
                .setDescription("**Command: ** " + "!cointoss <bet> <heads/tails>\n**Winnings:** `2x`")
            receivedMessage.channel.send(cointossEmbed)
        } else if (args[0] < 0) {
            const boundsEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("Invalid Bet")
            receivedMessage.channel.send(boundsEmbed)
        } else if (args[0] > user.money) {
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

            var result = null
            if (side === args[1]) {
                result = "You Won a $" + parseInt(args[0]) + " Bet!"
                user.money = parseInt(user.money) + parseInt(args[0])
                fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
            } else {
                result = "You Lost a $" + parseInt(args[0]) + " Bet!"
                user.money = parseInt(user.money) - parseInt(args[0])
                fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
            }

            const results = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("<:moneybag:753937876399685653>   Results   <:moneybag:753937876399685653>")
                .addFields(
                    { name: "Landed on: `" + side + "`\n" + result, value: "New Balance: $" + user.money, },
                )
            receivedMessage.channel.send(results)
        }
    },

    guesscard: function(userBase, user, receivedMessage, args) {
        let deck = JSON.parse(fs.readFileSync("./deck.json", "utf8"))
        let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
        let suits = ["spades", "clubs", "diamonds", "hearts"]
        if (args.length != 3 || !parseInt(args[0]) || !values.includes(args[1]) || !suits.includes(args[2])) {
            const guesscard = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("Guess the Card")
                .setDescription("**Command: ** " + "!guesscard <bet> <value> <suit>\n**Winnings: **`3x` for suit, `10x` for value, `50x` for suit & value\nValues: A, 2 ,3, 4, 5, 6, 7, 8, 9, 10, J, Q, K\nSuits: spades, clubs, diamonds, hearts")
            receivedMessage.channel.send(guesscard)
        } else if (args[0] < 0) {
            const boundsEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("Invalid Bet")
            receivedMessage.channel.send(boundsEmbed)
        } else if (args[0] > user.money) {
            const poorEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("Too Poor")
            receivedMessage.channel.send(poorEmbed)
        } else {
            let randCard = deck[Math.floor(Math.random() * 52)]
            var result = null
            if (randCard.suit === args[2] && randCard.value === args[1]) { // correct suit and value
                result = "You won a `50x` on a $" + parseInt(args[0]) + " Bet!!!"
                user.money = parseInt(user.money) + (parseInt(args[0]) * 49)
                fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
            } else if (randCard.suit === args[2]) { // correct suit
                result = "You won `3x` on a $" + parseInt(args[0]) + " Bet!"
                user.money = parseInt(user.money) + (parseInt(args[0]) * 2)
                fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
            } else if (randCard.value === args[1]) { // correct value
                result = "You won `10x` on a $" + parseInt(args[0]) + " Bet!!"
                user.money = parseInt(user.money) + (parseInt(args[0]) * 9)
                fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
            } else {
                result = "You lost a $" + parseInt(args[0]) + " Bet!"
                user.money = parseInt(user.money) - parseInt(args[0])
                fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
            }

            const results = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("<:moneybag:753937876399685653>   Results   <:moneybag:753937876399685653>")
                .addFields(
                    { name: "Random Card: `" + randCard.value + " of " + randCard.suit + "`\n" + result, value: "New Balance: $" + user.money, },
                )
            receivedMessage.channel.send(results)
        }
    }
}