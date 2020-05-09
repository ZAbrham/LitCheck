const Discord = require('discord.js');
const request = require('request');
const axios = require('axios');
const cheerio = require('cheerio');
// Create an instance of a Discord client
const client = new Discord.Client();
/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on('ready', () => {
  console.log('I am ready!');
});

// Create an event listener for messages
client.on('message', message => {
  var args = message.content.split(' ');
  console.log(args);
  if (args[0] === '!user') {
  //  message.channel.send(getInfo('170455'));
    var userName = args[1];
    var website = 'http://leetcode.com/' + userName;
    var str = request(website, function(err, res, body){
      if(!err ){
        var $ = cheerio.load(body);
        var index = body.indexOf('ng-if=\"ac.selectedMiDist');
        var tempStr = body.substring(index, index + 300);
        var justStr = '<span class="badge progress-bar-success\">'
        var indexJustStr = tempStr.indexOf(justStr);

        var str = tempStr.substring(indexJustStr + justStr.length);
        str = str.substring(0, str.indexOf('/'));
        str = str.trim();
       if(str.length === 0 || str.length > 4){
          message.channel.send('incorrect user name?');

        }else {

          message.channel.send( userName + ' has solved '+ str + ' leetcode questions!');
        }

      }else{
        message.channel.send("please enter a valid \'!user\' followed by a valid user name");
      }

    });

  }
});
client.login(process.env.token);
