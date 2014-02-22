var Cookie = {
  get: function(key) {
    var cookiePairs = document.cookie.split(';');
    var cookies = {};
    var cookie;
    for(var i = 0;i < cookiePairs.length; i++) {
      cookie = cookiePairs[i].split('=');
      cookies[cookie[0].trim()] = cookie[1];
    }
    console.log(cookies);
    return cookies[key];
  },
};
window.onload = function() {
  var socket = io.connect('http://localhost:3700');
  var bodyData = document.querySelector('body').dataset;
  var gameId = bodyData.gameId;
  var pid = Cookie.get('pid');
  socket.emit('player:join', {
    gameId: gameId,
    pid: pid
  });
  socket.on('player:join', function(data) {
    console.log('Player ' + data.pid + ' has connected', data);
  });
}
