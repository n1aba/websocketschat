var express = require('express');
var bodyParser = require('body-parser');
var socketio = require('socket.io');

var app = express();
var server = app.listen(6969);
var io = socketio.listen(server);

var staticDir = __dirname + '/public/';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
	res.sendFile(staticDir + 'index.html');
});

io.sockets.on('connection', function(socket) {
	console.log('Client connected');
	socket.on('disconnected', function() {
		console.log('Client disconnected');
	});

	socket.on('chat message', function(msg) {
    saveMsg(msg, function(err){if(err) throw err;});
		io.emit('chat message', msg);
	});
  showOldMsgs(socket);
});

function showOldMsgs(socket){
  getOldMsgs(69, function(err, docs){
    socket.emit('chat history', docs);
  });
}

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/chatappsockets', function(err){
	if(err) {
		console.log(err);
	} else {
		console.log('Connected to mongodb!');
	}
});

var chatSchema = mongoose.Schema({
	name: String,
	text: String,
	created: {type: Date, default: Date.now}
});

var Chat = mongoose.model('message', chatSchema);

var getOldMsgs = function(limit, cb){
	var query = Chat.find({});
	query.sort('created').limit(limit).exec(function(err, docs){
		cb(err, docs);
	});
}

var saveMsg = function(data, cb){
	var newMsg = new Chat({name: data.name, text: data.text});
	newMsg.save(function(err){
		cb(err);
	});
};
