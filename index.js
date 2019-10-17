const fs = require('fs')
const Discord = require('discord.js')
const Client = require('./client/Client')
const {
	prefix,
	token,
	anon_channel_id
} = require('./config.json')

const client = new Client()
client.commands = new Discord.Collection()

//const queue = new Map()

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	client.commands.set(command.name, command)
}

console.log(client.commands)

client.once('ready', () => {
	console.log('Ready!')
	console.log(client.guilds)
})

client.once('reconnecting', () => {
	console.log('Reconnecting!')
})

client.once('disconnect', () => {
	console.log('Disconnect!')
})

client.on('message', async message => {
	const args = message.content.slice(1).split(/ +/)
	const commandName = args.shift().toLowerCase()
	const command = client.commands.get(commandName)

	//loop protection
	if (message.author.bot) return
	
	//anonym channel messaging
	if (message.channel.id == anon_channel_id) {
		message.channel.send('1:' + message.content)
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