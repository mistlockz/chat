'use strict';

const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });
var host = [];
var clients = [];


wss.on('connection', (ws) => { 	
 	ws.on('message', (msg)=>{
		var event = JSON.parse(msg);		
		if(event.type == 'connection'){
			console.log(event.name + ' connected');	
			event.socketInfo = ws;
			clients.push(event);
			var pong = {};
			pong.name = event.name;
			pong.type = event.type;
			pong.socketLength = clients.length;		
			clients.forEach((client) => {
				client.socketInfo.send(JSON.stringify(pong));
			});					
		}

		if(event.type == 'message'){
			console.log(event.name + ' says: '+ event.content);
			var pong = {};
			pong.name = event.name;
			pong.type = event.type;
			pong.socketLength = clients.length;
			pong.content= event.content;
			clients.forEach((client) => {
				client.socketInfo.send(JSON.stringify(pong));
			});
		}		
 	});

	ws.on('close', () =>{
		var pos = clients.map(function(e) { return e.socketInfo; }).indexOf(ws);
		var temp = clients[pos];
		clients.splice(pos,1);		
		if(clients.length>0){
			var pong = {};
			pong.name = temp.name;
			pong.type = 'disconnect';
			pong.socketLength = clients.length;
			clients.forEach((client)=>{
				client.socketInfo.send(JSON.stringify(pong));
			})
		}

		console.log(temp.name + ' disconnected');		
	});
});

