const fs = require("fs")
const path = require("path")

const configObj = JSON.parse( fs.readFileSync(path.join(__dirname, "config.json") ) )

module.exports = configObj
