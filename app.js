    var
        gameport        = process.env.PORT || 3000,

        io              = require('socket.io'),
        express         = require('express'),
        UUID            = require('node-uuid'),

        verbose         = false,
        http            = require('http'),
        app             = express(),
        server          = http.createServer(app);

/* Express server set up. */

//The express server handles passing our content to the browser,
//As well as routing users where they need to go. This example is bare bones
//and will serve any file the user requests from the root of your web server (where you launch the script from)
//so keep this in mind - this is not a production script but a development teaching tool.

        //Tell the server to listen for incoming connections
    server.listen(gameport)

        //Log something so we know that it succeeded.
    console.log('\t :: Express :: Listening on port ' + gameport );

        //By default, we forward the / path to index.html automatically.
    app.get( '/', function( req, res ){
        console.log('trying to load %s', __dirname + '/index.html');
        res.sendFile( '/index.html' , { root:__dirname });
    });

        //This handler will listen for requests on /*, any file from the root of our server.
        //See expressjs documentation for more info on routing.

    app.get( '/*' , function( req, res, next ) {

            //This is the current file they have requested
        var file = req.params[0];

            //For debugging, we can track what files are requested.
        if(verbose) console.log('\t :: Express :: file requested : ' + file);

            //Send the requesting client the file.
        res.sendFile( __dirname + '/' + file );

    }); //app.get *

    var sio = io.listen(server);
    
// main application 

var socketLog = 'Socket Note : ';

function logHelper(prePend , logMessage){
    if(logEnable != undefined && logEnable)
        console.log(prePend + ' : '+logMessage);
}

function Player (userid, xpos ,ypos){
  this.userId= userid;
  this.x = xpos;
  this.y = ypos;
}

var logEnable = false;
var offset = 5;
var arenaHeight = 400;
var arenaWidth = 600;
var frame_rate = 1000/30;

var players = { };
var updateRequests = [];
var getUserIdRequests = [];

sio.on('connection', function(socket){
  
  console.log(socketLog + 'a new user connected '+'user : '+ socket.id);

  socket.on('get-user-id',function(){

    var socketHandlerName = 'get-user-id' ;
    console.log('----------------------Socket Event-----------------------------');
    console.log(socketLog + 'user : '+ socket.id + ' socketHandler : '+socketHandlerName);
    getUserIdRequests.push(socket);
  });

  socket.on('update-player-position',function (data){+
    console.log('user : '+ socket.id + ' ,sent some data ');
    console.log('update-player-position' + " : "+"recieved data : "+JSON.stringify(data));

    var playerTemp = JSON.parse(data);
    updateRequests.push(playerTemp);

  });

  socket.on('disconnect' , function(){
    console.log('user : '+ socket.id + ' ,disconnected ');
  });
});


function processGetUserIdRequests(){
    
  for(var i = 0 ; i<getUserIdRequests.length ; i++)
  { 
    var socket = getUserIdRequests[i];
    var tempId = UUID();
    console.log('tempId is '+tempId);
    var player = new Player(tempId , 0 , 0);    
    players[tempId] = player;
    console.log(socketLog + 'userId assigned is '+tempId);
    socket.emit('set-user-id' , JSON.stringify(player));
    console.log('------------------------EOB------------------------------------');
  }
  getUserIdRequests = [];
}

function processUpdateRequests(){
    for(var i = 0 ; i<updateRequests.length ; i++)
    {
        var playerTemp = updateRequests[i];
        var currentPlayer = players[playerTemp.userId];
        currentPlayer.x = playerTemp.x;
        currentPlayer.y = playerTemp.y;
    }
    updateRequests = [];
}

function emitMostRecentState(){
  sio.emit('most-recent-state' , JSON.stringify(players));
}

function gameLoop(){
  processGetUserIdRequests();
  processUpdateRequests();
  emitMostRecentState();
}

setInterval(gameLoop , frame_rate);
