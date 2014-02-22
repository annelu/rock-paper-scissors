var express = require('express');
var app = express();
var port = 3700;
var uuid = require('node-uuid');
var databaseUrl = 'rps';
var collections = ['games'];
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rps');

var Game = mongoose.model('Game', {
  id: String,
  players: [{
    id: String
  }]
});

var pid = function(req, res, next) {
  if (!req.cookies.pid) {
    res.cookie('pid', uuid.v4());
  }
  next();
};

app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.use(express.static(__dirname + '/public'));
app.use(express.cookieParser());
app.use(pid);

// Routes
app.get("/", function(req, res){
  res.render('index');
});


app.get('/games', function(req, res){
  var gameId = uuid.v4().split('-')[0];
  var game = new Game({ id: gameId });
  game.save(function (err) {
    if (err) {
      console.log('nooooo could not create game');
    } else {
      console.log('Create game ' + gameId);
      res.redirect('/games/' + gameId);
    }
  });
});

app.get('/games/:id', function(req, res) {
  Game.find({ id: req.params.id }, function (err, games) {
    var game = games[0];
    var pid = req.cookies.pid;
    res.render('game', {
      game: game
    });
  });
});


var io = require('socket.io').listen(app.listen(port));
console.log("Listening on port " + port);

io.sockets.on('connection', function (socket) {
    socket.emit('message', { message: 'welcome to the game' });
    socket.on('send', function (data) {
      console.log('woohooooo');
        io.sockets.emit('message', data);
    });
    socket.on('player:connect', function(data) {
      var gid = data.gameId;
      socket.join(gid);
      Game.find({ id: data.gameId }, function (err, games) {
        var game = games[0];
        var inGame = false;
        for (var i = 0; i < game.players.length; i++) {
          if (game.players[i].id === data.pid) {
            console.log('found player ' + data.pid + ' in game');
            inGame = true;
            break;
          }
        }
        if (!inGame) {
          console.log('did not find player ' + data.pid + ' in game');
          game.players.push({
            id: data.pid
          });
          game.save();
          socket.emit('player:join', {
            pid: data.pid
          });
          socket.broadcast.to(gid).emit('player:join', {
            pid: data.pid
          });
        }
        socket.broadcast.to(gid).emit('player:connect', {
          pid: data.pid
        });
      });
    });
});
