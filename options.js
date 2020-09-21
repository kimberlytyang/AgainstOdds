const fs = require('fs')
const Discord = require('discord.js')
const MAX_MONEY = 1000000000000

module.exports = {
    bank: function(user, receivedMessage) {
        // if money above certain amount, react with "rich" or "poor"
        // receivedMessage.react("\:smile:")
        let wealth = null
        if (parseInt(user.money) <= 0) {
            wealth = "*maybe you should try working for once...*"
        } else if (parseInt(user.money) < 500) {
            wealth = "*dirt. poor.*"
            receivedMessage.channel.send(parseInt(user.money))
        } else if (parseInt(user.money) < 3000) {
            wealth = "*not doing great...*"
        } else if (parseInt(user.money) < 10000) {
            wealth = "*looking average...*"
        } else if (parseInt(user.money) < 25000) {
            wealth = "*still not as rich as me...*"
        } else if (parseInt(user.money) < 50000) {
            wealth = "*why do you have so much?*"
        } else if (parseInt(user.money) < 100000) {
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
        let num = parseInt(args[0])
        let quantity = parseInt(args[1])
        if (args.length != 2 || !num || !quantity) { // invalid usage
            const shopEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("<:shopping_cart:753943631764783215>   Items for Sale   <:shopping_cart:753943631764783215>")
                .setDescription("**Command:** !shop <item#> <quantity>" + "\n**1) $35 `Soap` <:soap:754085455791915108>**\n**2) $50 `Toilet Paper` <:roll_of_paper:753943988754710608>**\n**3) $75 `Special Bundle` <:roll_of_paper:753943988754710608> + <:soap:754085455791915108>**")
                .setFooter("Stock up on items for quarantine!")
            receivedMessage.channel.send(shopEmbed)
            return
        } else if (num < 1 || num > 3) { // invalid usage
            const boundsEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("Invalid Item")
            receivedMessage.channel.send(boundsEmbed)
            return
        }

        let price = 0
        let item = null
        if (num === 1) {
            price = 35
            item = "Soap"
        } else if (num == 2) {
            price = 50
            item = "Toilet Paper"
        } else {
            price = 75
            item = "Special Bundle"
        }
        
        let total = price * quantity

        if (total > parseInt(user.money)) {
            const poorEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("Too Poor")
            receivedMessage.channel.send(poorEmbed)
        } else {
            if (num == 1) {
                user.soap = parseInt(user.soap) + quantity
                user.money = parseInt(user.money) - parseInt(total)
                fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
            } else if (num == 2) {
                user.toiletpaper = parseInt(user.toiletpaper) + quantity
                user.money = parseInt(user.money) - parseInt(total)
                fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
            } else {
                user.soap = parseInt(user.soap) + quantity
                user.toiletpaper = parseInt(user.toiletpaper) + quantity
                user.money = parseInt(user.money) - parseInt(total)
                fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
            }

            const purchases = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("<:moneybag:753937876399685653>   " + receivedMessage.author.username + "\'s Purchase   <:moneybag:753937876399685653>")
                .addFields(
                    { name: "You bought `" + item + "` x" + quantity, value: "New Balance: $" + user.money + "\nThank you for coming <:woman_bowing:753954248764686379>", },
                )
            receivedMessage.channel.send(purchases)
        }
    },

    beg: function(userBase, user, receivedMessage) {
        if (parseInt(user.money) > 300) { // if bank is > $300, deny from begging
            const begEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("<:dollar:754245592661884949>   Federal Reserve   <:dollar:754245592661884949>")
                .setDescription("There is enough money in your bank.\nYou have been denied by the Fed.")
            receivedMessage.channel.send(begEmbed)
        } else {
            let randMoney = Math.floor(Math.random() * 21) * 10 + 300
            user.money = parseInt(user.money) + randMoney
            fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance

            const begEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("<:dollar:754245592661884949>   Federal Reserve   <:dollar:754245592661884949>")
                .setDescription("You begged the Federal Reserve and got $" + randMoney + ".")
            receivedMessage.channel.send(begEmbed)
        }
    },

    cointoss: function(userBase, user, receivedMessage, args) {
        let bet = parseInt(args[0])
        if (args.length != 2) {
            const cointossEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("Coin Toss")
                .setDescription("**Command: ** " + "!cointoss <bet> <heads/tails>\n**Winnings:** `2x`")
            receivedMessage.channel.send(cointossEmbed)
            return
        } else if (bet <= 0 || !bet || (args[1] != "heads" && args[1] != "tails")) {
            const boundsEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("Invalid Bet")
            receivedMessage.channel.send(boundsEmbed)
            return
        } else if (bet > parseInt(user.money)) {
            const poorEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("Too Poor")
            receivedMessage.channel.send(poorEmbed)
            return
        }

        user.money = parseInt(user.money) - bet // take money when bet is placed
        fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
        let flip = Math.floor(Math.random() * 2)
        let side = null
        if (flip === 0) {
            side = "heads"
        } else if (flip === 1) {
            side = "tails"
        } else {
            side = "error"
        }

        let result = null
        if (side === args[1]) {
            result = "You Won `2x` on a $" + bet + " Bet!"
            user.money = parseInt(user.money) + (bet * 2)
            fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
        } else {
            result = "You Lost a $" + bet + " Bet!"
        }

        const results = new Discord.MessageEmbed()
            .setColor("#ce2228")
            .setTitle("<:moneybag:753937876399685653>   Results   <:moneybag:753937876399685653>")
            .addFields(
                { name: "Landed on: `" + side + "`\n" + result, value: "New Balance: $" + user.money, },
            )
        receivedMessage.channel.send(results)
    },

    guesscard: function(userBase, user, receivedMessage, args) {
        let bet = parseInt(args[0])
        let deck = JSON.parse(fs.readFileSync("./deck.json", "utf8"))
        let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
        let suits = ["spades", "clubs", "diamonds", "hearts"]
        if (args.length != 3) {
            const guesscard = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("Guess the Card")
                .setDescription("**Command: ** " + "!guesscard <bet> <value> <suit>\n**Winnings: **`2x` for suit, `5x` for value, `20x` for suit & value\nValues: A, 2 ,3, 4, 5, 6, 7, 8, 9, 10, J, Q, K\nSuits: spades, clubs, diamonds, hearts")
            receivedMessage.channel.send(guesscard)
            return
        } else if (bet <= 0 || !bet || !values.includes(args[1]) || !suits.includes(args[2])) {
            const boundsEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("Invalid Bet")
            receivedMessage.channel.send(boundsEmbed)
            return
        } else if (bet > parseInt(user.money)) {
            const poorEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("Too Poor")
            receivedMessage.channel.send(poorEmbed)
            return
        }

        user.money = parseInt(user.money) - bet // take money when bet is placed
        fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
        let randCard = deck[Math.floor(Math.random() * 52)]
        let result = null
        if (randCard.suit === args[2] && randCard.value === args[1]) {
            result = "You Won a `20x` on a $" + bet + " Bet!!!"
            user.money = parseInt(user.money) + (bet * 20)
            fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
        } else if (randCard.suit === args[2]) { // correct suit
            result = "You Won `2x` on a $" + bet + " Bet!"
            user.money = parseInt(user.money) + (bet * 2)
            fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
        } else if (randCard.value === args[1]) { // correct value
            result = "You Won `5x` on a $" + bet + " Bet!!"
            user.money = parseInt(user.money) + (bet * 5)
            fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
        } else {
            result = "You Lost a $" + bet + " Bet!"
        }

        const results = new Discord.MessageEmbed()
            .setColor("#ce2228")
            .setTitle("<:moneybag:753937876399685653>   Results   <:moneybag:753937876399685653>")
            .addFields(
                { name: "Random Card:  " + getTopCardEmoji(randCard) + "\n<:clear:756342610213470299><:clear:756342610213470299><:clear:756342610213470299><:clear:756342610213470299><:clear:756342610213470299>" + getBottomCardEmoji(randCard) + "\n" + result, value: "New Balance: $" + user.money, },
            )
        receivedMessage.channel.send(results)
    },

    slot: function(userBase, user, receivedMessage, args) {
        let bet = parseInt(args[0])
        let slot1 = "<:slot1:756340365157466183>"
        let slot2 = "<:slot2:756340415132598392>"
        let slot3 = "<:slot3:756340439501504523>"
        let slot4 = "<:slot4:756340456853340242>"
        let slot5 = "<:slot5:756340468786266184>"
        let any = "<:yellowquestion:756374980064968714>"
        let clear = "<:clear:756342610213470299>"

        let wins = [[slot1, slot1, slot1], [slot2, slot2, slot2], [slot3, slot3, slot3], [slot4, slot4, slot4], [slot5, slot5, slot5], [slot1, slot1, any], [slot2, slot2, any], [slot3, slot3, any], [slot4, slot4, any], [slot5, slot5, any]]

        if (args.length != 1) {
            const slot = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("Slot Machine")
                .setDescription("**Command: ** " + "!slot <bet>\n**Winnings:**\n" + wins[0].join(" ") + clear + "`100x`\n" + wins[1].join(" ") + clear + "`15x`\n" + wins[2].join(" ") + clear + "`10x`\n" + wins[3].join(" ") + clear + "`7x`\n" + wins[4].join(" ") + clear + "`5x`\n" + wins[5].join(" ") + clear + "`3x`\n" + wins[6].join(" ") + clear + "`2x`\n" + wins[7].join(" ") + clear + "`1x`\n" + wins[8].join(" ") + clear + "`1x`\n" + wins[9].join(" ") + clear + "`0.5x`\n") // format winnings
            receivedMessage.channel.send(slot)
            return
        } else if (bet <= 0 || !bet) {
            const boundsEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("Invalid Bet")
            receivedMessage.channel.send(boundsEmbed)
            return
        } else if (bet > parseInt(user.money)) {
            const poorEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("Too Poor")
            receivedMessage.channel.send(poorEmbed)
            return
        }

        user.money = parseInt(user.money) - bet // take money when bet is placed
        fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance

        let roll1 = getRoll()
        let roll2 = getRoll()
        let roll3 = getRoll()
        let rollResults = [roll1, roll2, roll3]

        const results = new Discord.MessageEmbed()
            .setColor("#ce2228")
            .setTitle("<:moneybag:753937876399685653>   Results   <:moneybag:753937876399685653>")

        receivedMessage.channel.send(slotTopBar() + "\n<:left:756372063983501423><a:slot:756046766545305701><a:slot:756046766545305701><a:slot:756046766545305701><:right:756372063954141304>\n" + slotBottomBar()).then((message) => {
            setTimeout(() => {
                message.edit(slotTopBar() + "\n<:left:756372063983501423>" + roll1 + "<a:slot:756046766545305701><a:slot:756046766545305701><:right:756372063954141304>\n" + slotBottomBar())
                setTimeout(() => {
                    message.edit(slotTopBar() + "\n<:left:756372063983501423>" + roll1 + roll2 + "<a:slot:756046766545305701><:right:756372063954141304>\n" + slotBottomBar())
                    setTimeout(() => {
                        message.edit(slotTopBar() + "\n<:left:756372063983501423>" + roll1 + roll2 + roll3 + "<:right:756372063954141304>\n" + slotBottomBar())

                        let winType = getSlotWinnings(rollResults)
                        let multiplier = winType[0]
                        let numMatches = winType[1]
                        if (numMatches === 3) {
                            user.money = parseInt(user.money) + (bet * multiplier)
                            fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
                            results.setDescription("**You Matched 3!**")
                            results.addFields(
                                { name: "You Won `" + multiplier + "x` a $" + bet + " Bet!", value: "New Balance: $" + user.money, },
                            )
                            receivedMessage.channel.send(results)
                        } else if (numMatches === 2) {
                            user.money = parseInt(user.money) + Math.ceil(bet * multiplier)
                            fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
                            results.setDescription("**You Matched 2!**")
                            results.addFields(
                                { name: "You Won `" + multiplier + "x` a $" + bet + " Bet!", value: "New Balance: $" + user.money, },
                            )
                            receivedMessage.channel.send(results)
                        } else {
                            results.setDescription("**No Matches!**")
                            results.addFields(
                                { name: "You Lost a $" + bet + " Bet!", value: "New Balance: $" + user.money, },
                            )
                            receivedMessage.channel.send(results)
                        }
                    }, 1000)
                }, 1000)
            }, 1000)
        })
    },

    blackjack: function(userBase, user, receivedMessage, args) {
        let bet = parseInt(args[0])
        if (args.length != 1) {
            const blackjack = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("Blackjack")
                .setDescription("**Command: ** " + "!blackjack <bet>\n**Winnings: **`2x` normal, `3x` blackjack\n<:greencheck:755603324400828467> Hit, <:x:755295994760921128> Stand, <:two:755609764305698817> Double Down")
                .setFooter("Hit to draw one card, Stand to end your turn,\nDouble Down to double your bet, hit, and stand")
            receivedMessage.channel.send(blackjack)
            return
        } else if (bet <= 0 || !bet) {
            const boundsEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("Invalid Bet")
            receivedMessage.channel.send(boundsEmbed)
            return
        } else if (bet > parseInt(user.money)) {
            const poorEmbed = new Discord.MessageEmbed()
                .setColor("#ce2228")
                .setTitle("Too Poor")
            receivedMessage.channel.send(poorEmbed)
            return
        }

        user.money = parseInt(user.money) - bet // take money when bet is placed
        fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
        
        let deck = JSON.parse(fs.readFileSync("./deck.json", "utf8")) // change to 8 decks?
        let player1 = deck[Math.floor(Math.random() * 52)]
        let player2 = deck[Math.floor(Math.random() * 52)]
        let dealer1 = deck[Math.floor(Math.random() * 52)]
        let dealer2 = deck[Math.floor(Math.random() * 52)]

        let playerCards = [{...player1}, {...player2}]
        let dealerCards = [{...dealer1}, {...dealer2}]

        const results = new Discord.MessageEmbed()
            .setColor("#ce2228")
            .setTitle("<:moneybag:753937876399685653>   Results   <:moneybag:753937876399685653>")

        const game = new Discord.MessageEmbed()
            .setColor("#ce2228")
            .setTitle("Blackjack")
            .setDescription("Player Cards:\n" + formatCards(playerCards) + "\nDealer Cards:\n" + getDealerHidden(dealer1))
            .setFooter("Player Total: " + cardsTotal(playerCards))
        receivedMessage.channel.send(game).then((message) => {
            let pTotal = cardsTotal(playerCards)
            let dTotal = cardsTotal(dealerCards)
            if (dTotal === 21 && pTotal === 21) {
                game.setDescription("Player Cards:\n" + formatCards(playerCards) + "\nDealer Cards:\n" + formatCards(dealerCards)) // reveal dealer card
                game.setFooter("Player Total: " + pTotal + "\nDealer Total: " + dTotal)
                message.edit(game)
                user.money = parseInt(user.money) + bet
                fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
                results.setDescription("**Both got Blackjack!**")
                results.addFields(
                    { name: "You Tied a $" + bet + " Bet!", value: "Balance: $" + user.money, },
                )
                receivedMessage.channel.send(results)
                return
            } else if (dTotal === 21 && pTotal < 21) {
                game.setDescription("Player Cards:\n" + formatCards(playerCards) + "\nDealer Cards:\n" + formatCards(dealerCards)) // reveal dealer card
                game.setFooter("Player Total: " + pTotal + "\nDealer Total: " + dTotal)
                message.edit(game)                
                results.setDescription("**Dealer got Blackjack!**")
                results.addFields(
                    { name: "You Lost a $" + bet + " Bet!", value: "New Balance: $" + user.money, },
                )
                receivedMessage.channel.send(results)
                return
            } else if (dTotal < 21 && pTotal === 21) {
                game.setDescription("Player Cards:\n" + formatCards(playerCards) + "\nDealer Cards:\n" + formatCards(dealerCards)) // reveal dealer card
                game.setFooter("Player Total: " + pTotal + "\nDealer Total: " + dTotal)
                message.edit(game)
                user.money = parseInt(user.money) + (bet * 3)
                fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
                results.setDescription("**You got Blackjack!**")
                results.addFields(
                    { name: "You Won `3x` on a $" + bet + " Bet!", value: "New Balance: $" + user.money, },
                )
                receivedMessage.channel.send(results)
                return
            }

            message.react("755603324400828467").then(() => message.react("❌")).then(() => message.react("2️⃣"))
            const hitFilter = (reaction, person) =>
                (reaction.emoji.name === "greencheck" && person.id === receivedMessage.author.id) || (reaction.emoji.name === "⏩" && person.id === message.author.id)
            const standFilter = (reaction, person) =>
                (reaction.emoji.name === "❌" && person.id === receivedMessage.author.id) || (reaction.emoji.name === "⏭" && person.id === message.author.id)
            const doubleFilter = (reaction, person) =>
                reaction.emoji.name === "2️⃣" && person.id === receivedMessage.author.id
            const hit = message.createReactionCollector(hitFilter, {
                time:60000,
            })
            const stand = message.createReactionCollector(standFilter, {
                time:60000,
                max:1,
            })
            const double = message.createReactionCollector(doubleFilter, {
                time:60000,
                max:1,
            })

            hit.on("collect", () => {
                if (message.reactions.cache.get("2️⃣")) {
                    double.stop()
                    message.reactions.cache.get("2️⃣").remove().catch(error => console.error('Failed to remove reactions: ', error))
                }
                
                let newCard = deck[Math.floor(Math.random() * 52)]
                playerCards.push({...newCard})
                pTotal = cardsTotal(playerCards)
                if (pTotal > 21) { // BUST
                    game.setDescription("Player Cards:\n" + formatCards(playerCards) + "\nDealer Cards:\n" + formatCards(dealerCards)) // reveal all cards
                    game.setFooter("Player Total: " + pTotal + "\nDealer Total: " + dTotal)
                    message.edit(game)
                    results.setDescription("**You BUST!**")
                    results.addFields(
                        { name: "You Lost a $" + bet + " Bet!", value: "New Balance: $" + user.money, },
                    )
                    receivedMessage.channel.send(results)
                    removeReactions(receivedMessage, message)
                    hit.stop()
                    stand.stop()
                    double.stop()
                    return
                } else if (pTotal === 21) {
                    message.react("⏭").then(() => message.reactions.cache.get("⏭").remove().catch(error => console.error('Failed to remove reactions: ', error))) // force stand
                } else {
                    game.setDescription("Player Cards:\n" + formatCards(playerCards) + "\nDealer Cards:\n" + getDealerHidden(dealer1))
                    game.setFooter("Player Total: " + pTotal)
                    message.edit(game)
                    removeReactions(receivedMessage, message)
                }
            })

            stand.on("collect", () => {
                if (message.reactions.cache.get("2️⃣")) {
                    double.stop()
                    message.reactions.cache.get("2️⃣").remove().catch(error => console.error('Failed to remove reactions: ', error))
                }

                while (cardsTotal(dealerCards) < 17) {
                    newCard = deck[Math.floor(Math.random() * 52)]
                    dealerCards.push({...newCard})
                }
                dTotal = cardsTotal(dealerCards)
                game.setDescription("Player Cards:\n" + formatCards(playerCards) + "\nDealer Cards:\n" + formatCards(dealerCards)) // reveal all cards
                game.setFooter("Player Total: " + pTotal + "\nDealer Total: " + dTotal)
                message.edit(game)

                if (dTotal > 21) {
                    user.money = parseInt(user.money) + (bet * 2)
                    fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
                    results.setDescription("**Dealer BUST!**")
                    results.addFields(
                        { name: "You Won `2x` on a $" + bet + " Bet!", value: "New Balance: $" + user.money, },
                    )
                    receivedMessage.channel.send(results)
                } else if (pTotal > dTotal) {
                    user.money = parseInt(user.money) + (bet * 2)
                    fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
                    results.setDescription("**You beat the dealer!**")
                    results.addFields(
                        { name: "You Won `2x` on a $" + bet + " Bet!", value: "New Balance: $" + user.money, },
                    )
                    receivedMessage.channel.send(results)
                } else if (pTotal < dTotal) {
                    results.setDescription("**The dealer beat you!**")
                    results.addFields(
                        { name: "You Lost a $" + bet + " Bet!", value: "New Balance: $" + user.money, },
                    )
                    receivedMessage.channel.send(results)
                } else {
                    user.money = parseInt(user.money) + bet
                    fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
                    results.addFields(
                        { name: "You Tied a $" + bet + " Bet!", value: "Balance: $" + user.money, },
                    )
                    receivedMessage.channel.send(results)
                }

                removeReactions(receivedMessage, message)
                hit.stop()
                stand.stop()
                double.stop()
                return
            })

            double.on("collect", () => {
                if (parseInt(user.money) < bet) { // too poor to double
                    message.reactions.cache.get("2️⃣").remove().catch(error => console.error('Failed to remove reactions: ', error))
                    const poorEmbed = new Discord.MessageEmbed()
                        .setColor("#ce2228")
                        .setTitle("Too Poor")
                    receivedMessage.channel.send(poorEmbed)
                } else {
                    user.money = parseInt(user.money) - bet // take money when bet is placed
                    fs.writeFileSync("./data.json", JSON.stringify(userBase, null, 4)) // update balance
                    bet = bet * 2
                    message.reactions.cache.get("2️⃣").remove().catch(error => console.error('Failed to remove reactions: ', error))
                    message.react("⏩").then(() => message.reactions.cache.get("⏩").remove().catch(error => console.error('Failed to remove reactions: ', error))).then(() => { // force hit collector
                        if (cardsTotal(playerCards) < 21) {
                            message.react("⏭").then(() => message.reactions.cache.get("⏭").remove().catch(error => console.error('Failed to remove reactions: ', error))) // force stand collector if game not over
                        }
                    })
                }
            })
        })
    },
}

function slotTopBar() {
    return "<:topleft:756372117800353844><:top_:756372063857672269><:top_:756372063857672269><:top_:756372063857672269><:topright:756372132463771690>"
}

function slotBottomBar() {
    return "<:bottomleft:756372146434998292><:bottom:756372063786369025><:bottom:756372063786369025><:bottom:756372063786369025><:bottomright:756372160443842621>"
}

function getRoll() {
    let rolls = ["<:slot1:756340365157466183>", "<:slot2:756340415132598392>", "<:slot3:756340439501504523>", "<:slot4:756340456853340242>", "<:slot5:756340468786266184>"]
    let randRoll = Math.floor(Math.random() * 100)
    if (randRoll < 30) { // 3/10 chance (30%)
        return rolls[4]
    } else if (randRoll < 55) { // 2.5/10 chance (25%)
        return rolls[3]
    } else if (randRoll < 75) { // 2/10 chance (20%)
        return rolls[2]
    } else if (randRoll < 90) { // 1.5/10 chance (15%)
        return rolls[1]
    } else { // 1/10 chance (10%)
        return rolls[0]
    }
}

function getSlotWinnings(rollResults) {
    let slot1 = "<:slot1:756340365157466183>"
    let slot2 = "<:slot2:756340415132598392>"
    let slot3 = "<:slot3:756340439501504523>"
    let slot4 = "<:slot4:756340456853340242>"
    let slot5 = "<:slot5:756340468786266184>"
    let any = "<:yellowquestion:756374980064968714>"

    if (rollResults[0] === rollResults[1] && rollResults[1] === rollResults[2]) {
        switch (rollResults[0]) {
            case slot1:
                return [100, 3]
            case slot2:
                return [15, 3]
            case slot3:
                return [10, 3]
            case slot4:
                return [7, 3]
            case slot5:
                return [5, 3]
        }
    } else if (rollResults[0] === rollResults[1] || rollResults[0] === rollResults[2] || rollResults[1] === rollResults[2]) {
        let match = null
        if (rollResults[0] === rollResults[1] || rollResults[0] === rollResults[2]) {
            match = rollResults[0]
        } else {
            match = rollResults[1]
        }
        switch (match) {
            case slot1:
                return [3, 2]
            case slot2:
                return [2, 2]
            case slot3:
                return [1, 2]
            case slot4:
                return [1, 2]
            case slot5:
                return [0.5, 2]
        }
    } else {
        return [0, 0]
    }
}

function formatCards(cards) {
    let formatTop = getTopCardEmoji(cards[0])
    let formatBottom = getBottomCardEmoji(cards[0])
    for (let i = 1; i < cards.length; i++) {
        formatTop += " " + getTopCardEmoji(cards[i])
        formatBottom += " " + getBottomCardEmoji(cards[i])
    }
    return formatTop + "\n" + formatBottom
}

function getDealerHidden(card) {
    let formatTop = getTopCardEmoji(card) + " <:back1:755968281697058906>"
    let formatBottom = getBottomCardEmoji(card) + " <:back2:755968281453527154>"
    return formatTop + "\n" + formatBottom
}

function getTopCardEmoji(card) {
    let blackCards = ["<:bA:755968281524961280>", "<:b2:755968281227165696>", "<:b3:755968281189548193>", "<:b4:755968281269239828>", "<:b5:755968281269239908>", "<:b6:755968280837226567>", "<:b7:755968280933433525>", "<:b8:755968281243943024>", "<:b9:755968281248137333>", "<:b10:755968281210519662>", "<:bJ:755968281197674598>", "<:bQ:755968281025839215>", "<:bK:755968281516703795>"]
    let redCards = ["<:rA:755968281520766986>", "<:r2:755968281503989902>", "<:r3:755968281189548185>", "<:r4:755968281583681607>", "<:r5:755968281512378468>", "<:r6:755968281311182848>", "<:r7:755968281353126009>", "<:r8:755968281252462593>", "<:r9:755968281390874654>", "<:r10:755968281332023316>", "<:rJ:755968280883363843>", "<:rQ:755968281449463968>", "<:rK:755968281512247297>"]
    if (card.suit === "spades" || card.suit === "clubs") {
        return blackCards[card.numeric - 1]
    } else {
        return redCards[card.numeric - 1]
    }
}

function getBottomCardEmoji(card) {
    let suits = ["<:spades_:755968281130565673>", "<:clubs_:755968281495732385>", "<:diamonds_:755968281499795507>", "<:hearts_:755968281537544222>"]
    switch (card.suit) {
        case "spades":
            return suits[0]
        case "clubs":
            return suits[1]
        case "diamonds":
            return suits[2]
        case "hearts":
            return suits[3]
    }
}

function cardsTotal(cards) { // total up all cards in array
    let sum = 0
    let aces = 0
    for (let i = 0; i < cards.length; i++) {
        sum += parseInt(cards[i].numericBJ)
        if (cards[i].value === "A") {
            aces++
        }
    }
    while (sum > 21 && aces > 0) {
        sum -= 10
        aces--
    }
    return sum
}

function removeReactions(receivedMessage, message) {
    const userReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(receivedMessage.author.id))
    try {
        for (const reaction of userReactions.values()) {
            reaction.users.remove(receivedMessage.author.id)
        }
    } catch (error) {
        console.error('Failed to remove reactions.')
    }
}