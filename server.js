var express = require('express');
var app = express();
var port = 3700;
var uuid = require('node-uuid');
 
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
  console.log(uuid.v4())
  res.render('index');
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
