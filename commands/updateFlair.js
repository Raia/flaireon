const snoowrap = require('snoowrap');
const { roleMapping, redditClientId, redditClientSecret, redditRefreshToken } = require('../config.json');

const r = new snoowrap({
	userAgent: 'pokemontrades Discord test by /u/crownofnails v0.5',
	clientId: redditClientId,
	clientSecret: redditClientSecret,
	refreshToken: redditRefreshToken
});

module.exports = {
	name: 'updateflair',
	description: 'Updates user flair based on their subreddit flair',
	cooldown: 5,
	execute(message, args) {
		let username = message.member.displayName;
		console.log(username.split(''));

		if (username.includes('(')) {
			const regExp = /\(([^)]+)\)/;
			username = username.match(regExp)[1];
		}
		// TODO: strip sparkles from username too

		// testing w/o subreddit stuff
		// message.guild.roles.fetch(roleMapping['premierball'])
		// 	.then(role => message.member.roles.add(role))
		// 	.catch(console.error);

		r.getSubreddit('notpokemontrades').getUserFlair(username)
			.then(result => {
				let flairLevel = result.flair_css_class;
				console.log(typeof flairLevel);
				console.log(flairLevel);
				// get main flair class
				const hasInvolvement = flairLevel.includes('1');
				flairLevel = flairLevel.split(' ')[0].replace(/\d+$/, '');
				console.log(flairLevel);

				// todo: consolidate all messages into one
				message.guild.roles.fetch(roleMapping[flairLevel])
					.then(newFlairRole => {
						// console.log(role);
						const currentFlairRole = message.member.roles.highest;
						if (currentFlairRole !== newFlairRole) {
							message.member.roles.remove(currentFlairRole);
							message.member.roles.add(newFlairRole);

							message.reply(`your role has been updated to **${newFlairRole.name}**!`);
						} else {
							message.reply('your ball flair level is already up-to-date.');
						}
					}).catch(console.error);
				// handle involvement flair: add sparkles to nick
				if (hasInvolvement && !username.includes('✨')) {
					message.guild.roles.fetch(roleMapping.involvement)
						.then(involvementRole => {
							message.member.roles.add(involvementRole);
							message.reply('you got the **Involvement** role!');
							message.member.setNickname(username + ' ✨', 'Setting Involvement Flair')
								.then(res => {
									console.log(res);
									message.reply('you got Involvement Flair sparkles for your name! ✨');
								})
								.catch(err => {
									console.error(err);
									message.reply('There was a problem setting involvement flair sparkles. Your name may be too long.');
								});
						}).catch(console.error);
				}
				// TODO: rewrite with async try/catch
			},
			).catch(console.error);
	},
};