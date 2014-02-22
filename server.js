var express = require('express');
var app = express();
var port = 3700;
var uuid = require('node-uuid');
var databaseUrl = 'rps';
var collections = ['games'];
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rps');

var Game = mongoose.model('Game', { id: String });
 
app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.use(express.static(__dirname + '/public'));
app.use(express.cookieParser());

// Routes
app.get("/", function(req, res){
  if (!req.cookies.pid) {
    res.cookie('pid', uuid.v4());
  }
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
    res.render('game', {
      game: games[0]
    });
  });
});


// app.listen(port);
var io = require('socket.io').listen(app.listen(port));
console.log("Listening on port " + port);

io.sockets.on('connection', function (socket) {
    socket.emit('message', { message: 'welcome to the chat' });
    socket.on('send', function (data) {
        io.sockets.emit('message', data);
    });
});
