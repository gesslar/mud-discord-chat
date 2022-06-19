const path = require("path")

// Config
const config = require(path.join(__dirname, "config"))

// Discord stuff
const { Client, Message } = require("discord.js")
const discordClient = new Client()

// Mudclient stuff
const net = require("net")
const mudClient = new net.Socket()

// Miscellaneous stuff
const urlRegexSafe = require("url-regex-safe");
// const emojiRegexText = require("emoji-regex/text.js")
const emojiRegexText = require("emoji-regex/RGI_Emoji.js")
const { write } = require("fs")
const BitlyClient = require('bitly').BitlyClient;
const { S_IFBLK } = require("constants")
const bitly = new BitlyClient(config.bitlyToken);

async function shortenUrls(message) {
    let result
    let newMessage = "" 

    while( (result = urlRegexSafe().exec(message)) !== null ) {
        const match = result[0] 
        const index = result.index
        let response
        let shortenedUrl = null

        newMessage += message.slice(0, index)
        message = message.slice( (index + 1) + match.length -1 )

        try {
            response = await bitly.shorten(match) 
            shortenedUrl = response.link
        } catch (e) {
            // Don't actually need to do anything, just silently ignore
        } finally {
            newMessage += shortenedUrl !== null ? shortenedUrl : match
        }
    }

    newMessage += message 

    return newMessage.toString()
}

function connectToMud() {
    mudClient.connect( config.mud_port, config.mud_ip, () => {
        console.log(`Connected to ${config.mud_name} ${config.mud_ip}:${config.mud_port}`)
    })
}

mudClient.on("close", (hadError) => {
    console.log(`Disconnected from ${config.mud_name} ${config.mud_ip}:${config.mud_port}`)
    console.log("Reconnecting...")
    connectToMud()
})

mudClient.on("data", data => {
    const messageData = JSON.parse(data.toString()) ;
    for(channel of config.channels) {
        if(messageData.channel === channel.mud) {
            const discordChannel = discordClient.channels.cache.get(channel.discord)
            if( messageData.emoted === 1 ) discordChannel.send(`${messageData.message}`)
            else discordChannel.send(`${messageData.name}: ${messageData.message}`)
        }
    }     
}) 

discordClient.login(config.discordToken)
.then( () => {
    console.log(`Logged into Discord`)
    //TODO: create a global array that handles what channels we found so we will only
    //TODO: listen on those channels.
    for(discordChannel of config.channels) {
        discordClient.channels.fetch(discordChannel.discord)
        .then(results => {
            const { guild } = results
            console.log(`Found channel #${results.name} (${results.id}) on server ${guild.name} (${guild.id})`)
            // channel = results
        })    
    }
})

discordClient.on("message", async message => {
    // Do not accept zero-length content.
    if(message.content.length < 1) return ;
    if(message.member.user.bot === true) return ;

    let messageText = message.content.replace(/<@!*\d*>/g, mention => {
        if (mention.startsWith('<@') && mention.endsWith('>')) {
            mention = mention.slice(2, -1)
    
            if (mention.startsWith('!')) {
                mention = mention.slice(1)
            }

            const result = message.guild.member(mention)
            mention = result.displayName || result.username
        }

        return mention 
    }) 

    if(message.content.length > config.largest_printable_string) return ;

    //Find the right channel to have listened on, discard any other channels
    for(channel of config.channels) {
        if(message.channel.id === channel.discord) {
            const mudChannel = channel.mud
            let authorName = message.member.nickname || message.member.user.username

            // If option to strip emoji is on, which is probably a good idea
            // and is why it is the default
            if( config.strip_emoji === true ) {
                authorName = stripEmoji(authorName)
                messageText = stripEmoji(messageText)
            }

            // After emoji stripping, need to now exit if our
            // author or text is empty. 
            if( authorName.length < 1 ) return ;
            if( messageText.length < 1 ) return ;

            // Now we need to parse urls if bitly is enabled
            if(config.enable_bitly) messageText = await shortenUrls(messageText)

            const mudMessage = {
                name: authorName,
                channel: mudChannel,
                message: messageText
            }

            mudClient.write(JSON.stringify(mudMessage))
        }
    }    
})

function parseMentions(message) {
    console.log(message.content) 
    // const args = message.content.slice(prefix.length).trim().split(/ +/) 
    // const command = args.shift().toLowerCase()

    return message
}

function getUserFromMention(mention) {
	if (!mention) return 

	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1) 

		if (mention.startsWith('!')) {
			mention = mention.slice(1) 
		}

		return client.users.cache.get(mention) 
	}
}

function stripEmoji(str) {
    
    const reg = /<?:\w+:\d{18}>?/g
    str = str.replace(reg, "")

    const regex = emojiRegexText()
    str = str.replace(regex, "")

    return str
}

connectToMud() ;
