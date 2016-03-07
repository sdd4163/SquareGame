var http = require('http');
var fs = require('fs');
var socketio = require('socket.io');

var port = process.env.PORT || process.env.NODE_PORT || 3000;
var index = fs.readFileSync(__dirname + '/../client/client.html');

var connectionCount = 0;

function onRequest(request, response) {

 response.writeHead(200, {"Content-Type": "text/html"});
 response.write(index);
 response.end();
}

var app = http.createServer(onRequest).listen(port);
console.log("Listening on 127.0.0.1:" + port);

//pass in the http server into socketio and grab the websocket server as io
var io = socketio(app);

var onMsg = function(socket) {
	socket.on('msgToServer', function(data) {
		//Send score changes to both clients
		if (data.color == "red") {
			socket.emit('changeScores', {myChange: -1, theirChange: 0, key: data.key});
			socket.broadcast.emit('changeScores', {myChange: 0, theirChange: -1, key: data.key});
		}
		else {
			socket.emit('changeScores', {myChange: 1, theirChange: 0, key: data.key});
			socket.broadcast.emit('changeScores', {myChange: 0, theirChange: 1, key: data.key});
		}
	});
};

setInterval(function() {
			if (connectionCount == 2) {
				//Create a green and a red square, randomly on the clients' canvases
				var key = 'square' + (Math.floor((Math.random() * 1000)) + 1);
				var x = Math.floor(Math.random() * (780 - 20) + 20);
				var y = Math.floor(Math.random() * (580 - 20) + 20);
				var color = "red";
				io.sockets.emit('update', {key: key, x: x, y: y, color: color});
				
				var key2 = 'square' + (Math.floor((Math.random() * 1000)) + 1);
				var x2 = Math.floor(Math.random() * (780 - 10) + 10);
				var y2 = Math.floor(Math.random() * (580 - 10) + 10);
				var color2 = "green";
				io.sockets.emit('update', {key: key2, x: x2, y: y2, color: color2});
			}
			else if (connectionCount > 2) {
				io.sockets.emit('tooMany');
			}
			else {
				io.sockets.emit('notEnough');
			}
		}, 2000);

io.sockets.on('connection', function(socket) {
	connectionCount++;
	onMsg(socket);
	socket.on('disconnect', function() {
		connectionCount--;
	});
});