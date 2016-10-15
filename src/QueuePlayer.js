'use strict';
const ytdl = require('ytdl-core');
module.exports = function () {
  this.queue = [];
  var self = this;
  this.voiceConnection = null;
  this.isPlaying = false;

  this.addSong = (obj) => {
    this.queue.push(obj);
    if (this.queue.length === 1)
      play();
  };

  this.skip = () => {
    this.voiceConnection.stopPlaying();
  };

  function play() {
    if (self.isPlaying) return;
    var current = self.queue.shift();
    var connection = App.Client.voiceConnections.find(c => c.channelID === current.voiceChannelId);
    if (!connection) {
      App.Client.joinVoiceChannel(current.voiceChannelId).then(con => {
        self.isPlaying = true;
        self.voiceConnection = con;
        con.play(ytdl(current.data.url, { audioonly: true }));
        con.on('end', () => {
          self.isPlaying = false;
          if (self.queue.length !== 0)
            play();
        });
      });
    } else {
      self.isPlaying = true;
      connection.play(ytdl(current.data.url, { audioonly: true }));
      connection.on('end', () => {
        self.isPlaying = false;
        if (self.queue.length !== 0)
          play();
      });
    }
  }
};