// Global object
GLOBAL.App = {};

var Client = require('./Client.js');
var CommandManager = require('./CommandManager.js');
var sq = require('./songrequests/SongQueue.js');

require('fs').readFile('creds', 'utf8', function (err, data) {
  App.botClient = new Client({
      autorun: true,
      email: data.split('/')[0],
      password: data.split('/')[1],
  });
  App.commandManager = new CommandManager();
  App.songQue = new sq();
  registerCommands();
});

// I'm lazy
process.on('uncaughtException', function(err) {
    console.error('\033[31m Caught exception: ' + err + '\033[91m');
});

//--------------------------------------

function registerCommands() {
  var cm = App.commandManager;
  
  cm.registerCommand('!kappa', function(payload) {
    return "Kappa "+payload.nick;
  });

  cm.registerCommand('!serverlist', function(payload) {
    var l = App.botClient.getDiscordClient().servers;
    var res = '';
    for(var i in l)
      res += i + ' ';
    return res;
  });

  cm.registerCommand('!randomnum', function(payload) {
    try {
      var obj = JSON.parse(payload.mess.split(' ')[1]);
      return Math.floor(obj.begin + (Math.random() * (obj.end-obj.begin)));
    } catch(e) {
      return e;
    }
  });

  cm.registerCommand('!summon', function(payload) {
    var vChannelID = App.botClient.getDiscordClient().servers['172356325689262080'].members[payload.uID].voice_channel_id;
      App.botClient.getDiscordClient().joinVoiceChannel(vChannelID, function(err) {
        return err;
      });

      return "Joined "+vChannelID;
  });

  cm.registerCommand('!skip', function(payload) {
    App.songQue.skip();
  });

  cm.registerCommand('!reqlist', function(payload) {
    if(songQue !== null) {
      var q = App.songQue.getQueue();
      var resStr = '';
      for(var i = 0; i < q.length; i++) {
        resStr += ' ' + q[i].title; 
      }
      return resStr;
    }
  });

  cm.registerCommand('!play', function(payload) {
    var vChannelID = App.botClient.getDiscordClient().servers['172356325689262080'].members[payload.uID].voice_channel_id;
    try {
      App.songQue.addToQueue(vChannelID, payload.mess.split(' ')[1]);
      return 'youre song has been add xDDD';
    } catch(e) {
      console.log(e);
    }
  });
}
