require("dotenv").config()
const fs = require("fs")
const path = require("path")

const configObj = JSON.parse( fs.readFileSync(path.join(__dirname, "config.json") ) )
configObj.discordToken = process.env.DISCORD_TOKEN
configObj.bitlyToken = process.env.BITLY_TOKEN

module.exports = configObj
