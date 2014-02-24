var Cookie = {
  get: function(key) {
    var cookiePairs = document.cookie.split(';');
    var cookies = {};
    var cookie;
    for(var i = 0;i < cookiePairs.length; i++) {
      cookie = cookiePairs[i].split('=');
      cookies[cookie[0].trim()] = cookie[1];
    }
    return cookies[key];
  },
};
window.onload = function() {
  var socket = io.connect('http://localhost:3700');
  var bodyData = document.querySelector('body').dataset;
  var playerList = document.querySelector('ul');
  var gameId = bodyData.gameId;
  var pid = Cookie.get('pid');
  socket.emit('player:connect', {
    gameId: gameId,
    pid: pid
  });
  socket.on('player:connect', function(data) {
    console.debug('Player ' + data.pid + ' has connected');
  });
  socket.on('player:join', function(data) {
    console.debug('Player ' + data.pid + ' has joined', data);
    var li = document.createElement('li');
    li.innerHTML = data.pid;
    console.log(li);
    playerList.appendChild(li);
  });
}
