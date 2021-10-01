var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http, {
	allowEIO3: true,
	/*allowRequest: (req, callback) => {
		
		callback(req, true);
	}*/
  });


var usernames = {};

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/www/index.html');
});


io.sockets.on('connection', function (socket) {

	console.log("@connection")
	socket.on('sendchat', function (data) {
		console.log("@sendchat")
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.emit('updatechat', socket.username, data);
	});

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username){
		console.log("@adduser")
		// guardar o nome de usuario dentro da variavel de socket
		socket.username = username;

		var usuario = { nome : username, id : socket.id };

		// adicionar um usuario ao array global
		usernames[socket.id] = usuario;

		// Avisar ao proprio cliente que ele se conectou
		socket.emit('updatechat', 'SERVER', 'você está conectado ao chat');

		// Avisar a todos usuarios que um novo usuario foi conectado ao chat
		socket.broadcast.emit('updatechat', 'SERVER', username + ' se conectou');

		// Atualizar a lista de usuarios de todo mundo
		io.sockets.emit('updateusers', usernames);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		console.log("@disconnect")
		// remove the username from global usernames list
		delete usernames[socket.id];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});


});

http.listen(8888, function() {
	console.log('Server running on ' + 8888 + ' port');
});
