require("dotenv").config()
const path = require("path")
const { Client, Message } = require("discord.js")
const discordClient = new Client()
const net = require("net")
const { connect } = require("http2")
const mudClient = new net.Socket()
const discordToken = process.env.DISCORD_TOKEN
const config = require(path.join(__dirname, "config"))

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
            discordChannel.send(`${messageData.name}: ${messageData.message}`)
        }
    }     
}) 

connectToMud() ;

discordClient.login(discordToken)
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

discordClient.on("message", message => {
    // Do not accept zero-length content.
    if(message.content.length < 1) return ;
    if(message.member.user.bot === true) return ;

    //Find the right channel to have listened on, discard any other channels
    for(channel of config.channels) {
        if(message.channel.id === channel.discord) {
            const authorName = message.member.nickname || message.member.user.username
            const mudMessage = {
                name: authorName,
                channel: channel.mud,
                message: message.content
            }

            mudClient.write(JSON.stringify(mudMessage))
        }
    }    
})
