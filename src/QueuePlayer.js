'use strict';
const ytdl = require('ytdl-core');
module.exports = function () {
  this.queue = [];
  var self = this;
  this.voiceConnection = null;
  this.isPlaying = false;

  this.addSong = (obj) => {
    if (obj.data instanceof Array) {
      for (let item of obj.data) 
        self.queue.push({data: item, voiceChannelId: obj.voiceChannelId});
    } else self.queue.push(obj);
    if (self.queue.length >= 1 && !self.isPlaying)
        play();
  };

  this.skip = () => {
    if (this.voiceConnection)
      this.voiceConnection.stopPlaying();
  };

  function play() {
    if (self.isPlaying) return;
    var current = self.queue.shift();
    self.isPlaying = true;
    if (self.voiceConnection) {
      self.voiceConnection.play(ytdl(current.data.url, {audioonly: true}));
      return;
    }
    App.Client.joinVoiceChannel(current.voiceChannelId).then(con => {
      self.voiceConnection = con;
      let stream = ytdl(current.data.url, {audioonly: true});
      stream.on('error', e => {
        self.isPlaying = false;
        if (!self.isPlaying && self.queue.length !== 0)
          play(); 
      });
      con.play(stream);
      con.on('end', () => {
        self.isPlaying = false;
        if (!self.isPlaying && self.queue.length !== 0)
          play();
      });
      con.on('error', () => {
        self.isPlaying = false;
        if (self.queue.length !== 0)
          play();       
      });
    });
  }
};