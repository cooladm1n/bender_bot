const Discord = require('discord.js')
const Client = require('./client.js')
const faker = require('faker');
const {
	prefix,
	token,
	anon_channel_id
} = require('./config.json')

const client = new Client()
client.commands = new Discord.Collection()

client.on('ready', () => {
    // List servers the bot is connected to
    console.log("Servers:")
    client.guilds.forEach((guild) => {
        console.log(" - " + guild.name)

        // List all channels
        guild.channels.forEach((channel) => {
			console.log(` -- ${channel.name} (${channel.type}) - ${channel.id}`)
			if (channel.id == anon_channel_id){
				channel.setRateLimitPerUser(1)
			}
        })
    })
})


client.once('reconnecting', () => {
	console.log('Reconnecting!')
})

client.once('disconnect', () => {
	console.log('Disconnect!')
})

const anon_user = {}
const anon_timer = {}

function get_id(id) {
	const timestamp = Math.floor(Date.now() / 1000)
	for (var k in anon_user) {
		if (id == k) {
			if (timestamp - anon_timer[k] < 60) {
				anon_timer[k] = timestamp
				return anon_user[k]
			}
		}
		
	}
	faker.locale = 'ru'
	faker.fake()
	const new_anon = faker.name.findName();
	anon_user[id] = new_anon
	anon_timer[id] = timestamp
	return new_anon
}

client.on('message', async message => {
	const args = message.content.slice(1).split(/ +/)
	const commandName = args.shift().toLowerCase()
	const command = client.commands.get(commandName)
	
	//loop protection
	if (message.author.bot) return
	
	//anonym channel messaging
	if (message.channel.id == anon_channel_id) {
		message.channel.send(get_id(message.author.id) + ": " + message.content)
		message.delete()
	}
	
	//command execution
	if (!message.content.startsWith(prefix)) return
	try {
		command.execute(message)
	} catch (error) {
		console.error(error)
		message.reply('There was an error trying to execute that command!')
	}
})

client.login(token)