//import	s
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

//nicknames
var userNumber = 1;
var nicknames = [];
var nicknameColor = 000000;

//list of users
var listOfUsers = [];
//message history
var listOfMessages = [];

io.on('connection', function(socket)
{
	//log messages
	console.log('a user connected');
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
  
  
	//add user
	//first thing done
	socket.on('adduser', function(callback){
		//create store username
		myName = userNumber ++;
		var nickname = "user" + myName;
		socket.nickname = nickname;
		nicknames.push(nickname);
		
		//add to user list and tell clients to update their html
		//io.socket.emit('updateuserlist', nicknames);
		
		//update chat log if any messages
		socket.emit('addchatlog', listOfMessages);
		
		callback(socket.nickname);
		
	});
	
	//broadcast messages
	socket.on('message', function(data)
	{
		console.log('message: ' + data);
		
		var time = getCurrentTime();
		
		//data = time  + " " + socket.nickname + ": " + data;
		
		//add message to log list
		listOfMessages.push(time  + " " + socket.nickname + ": " + data);
		
		//send regular message
		io.emit('message', {type: 'chat', nickname: socket.nickname, message:data, timestamp: time, nickColor: nicknameColor}) ;
		
	});
	
	//check if user entered change nick command, if so change nick, otherwise send message
	socket.on('changenickname',function(data,callback)
	{
		//if nickname already taken, callback false to display error message
		if(nicknames.indexOf(data)!= -1)
		{
			callback(false);
		}
		
		//else change nickname
		else
		{	
			callback(data);
			var oldnickname =socket.nickname;
			nicknames[ nicknames.indexOf(socket.nickname)] = data;//update list with new nickname
			socket.nickname=data;
			
			//notice message
			io.emit('message', {type: 'notice' , message:"Notice: " + oldnickname + " changed nickname to " + socket.nickname}) ;
		}
		
	});
	
	//check if user entered change nick command, if so change nick, otherwise send message
	socket.on('changenicknameColor',function(data)
	{
		//set nickname color
		nicknameColor = data;
		//notice message
		io.emit('message', {type: 'notice' , message:"Notice: " + socket.nickname + " changed nickname color to " + data}) ;
		
		
	});
});

function getCurrentTime(){
	//get timestamp and format it
		var date = new Date();
		var hours = date.getHours()
		var ampm = (hours >= 12) ? "PM" : "AM";
		hours = hours% 12||12;
		var minutes =date.getMinutes();
		minutes = (minutes <10) ? "0" + minutes:minutes;
		return "(" + hours + ":" + minutes + ampm + ")";
}
http.listen(port,function()
{
	console.log('listening on port', port);
});

