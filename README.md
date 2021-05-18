# mud-discord-chat
This application connects to a socket on a MUD to send/receive data between, allowing for channels to communicate from the MUD to Discord and back.

## Setup

### Step 1

1. Visit the [Developer's portal](https://discordapp.com/developers/applications/) and create a new application. Record the Client ID, you will need it for the next bit
2. Click Bot on the left
3. Click Add Bot and record the Token for later use
4. Visit https://discordapp.com/oauth2/authorize?client_id=XXXXXXXXXXXXXXXXXX&scope=bot where XXXXXXXXXXXXXXXXXX is your Client ID from #1 above
5. Authorize and add your bot to your server

### Step 2

Get the ID for the channel you wish to post to by right-clicking on the channel and clicking Copy ID

![image](https://user-images.githubusercontent.com/1266935/114635703-45329300-9c93-11eb-9da4-f92b05b0fa0e.png)

### Step 3

Create a `.env` file in the root of the Node.js directory to house the following variables
```
DISCORD_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Step 4

Copy `config.json.example` to `config.json` and modify the values to suit your Discord/MUD.

#### Example
```json
{
    "mud_name" : "ThresholdRPG",
    "mud_ip" : "127.0.0.1",
    "mud_port": 8181,
    "channels" : [
        { "discord" : "783942759576371200", "mud" : "trivia" },
        { "discord" : "844254742989373450", "mud" : "heritage" },
        { "discord" : "844254814518247444", "mud" : "question" }
    ]
}
```

`channels` is an array of objects with the Discord channel ID and the mud channel name.

`mud-discord-chat` sends and receives a JSON object in the form of:
```json
{
    "channel" : "String",
    "name" : "String",
    "message" : "String"
}
```
Where `channel` is the mud channel name, `name` is the name of the user/player, and `message` is the chat message.
