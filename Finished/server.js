/*************************************
//
// socketio-rocket app
//
**************************************/

// express magic
var express = require('express');
var app = express();
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);
var device  = require('express-device');
var Twit = require('twit');
var twitter = new Twit({
    consumer_key: "<Consumer Key>",//process.env.TwitterConsumerKey,
    consumer_secret: "<Consumer Secret>",//process.env.TwitterConsumerSecret,
    access_token: "<Access Token>",//process.env.TwitterAccessToken,
    access_token_secret: "<Access Token Secret>"//process.env.TwitterAccessTokenSecret
});

var runningPortNumber = process.env.PORT;


app.configure(function(){
	// I need to access everything in '/public' directly
	app.use(express.static(__dirname + '/public'));

	//set the view engine
	app.set('view engine', 'ejs');
	app.set('views', __dirname +'/views');

	app.use(device.capture());
});


// logs every request
app.use(function(req, res, next){
	// output every request in the array
	console.log({method:req.method, url: req.url, device: req.device});

	// goes onto the next function in line
	next();
});

app.get("/", function(req, res){
	if(!req.query.track || !req.query.goal){
		return res.send(400);
	}
	
	res.render('index', {track: req.query.track, goal: req.query.goal});
});


io.sockets.on('connection', function (socket) {

	
	//register for track
    socket.on('register', function(data){
    	var stream = twitter.stream('statuses/filter', { track: "#" + data.track });
    	var count = 0;
	    stream.on('tweet', function (tweet) {
	    	count++;
	        socket.emit('blast', {msg:"<span style=\"color:red !important\">" + tweet.text + "!</span>", count: count});
	    });

	    //stop tracking tweets after disconnecting
	    socket.on('disconnect', function(socket){
	    	console.log("!!!!CLIENT DISCONNECTED!!!");
			stream.stop();
		});
    });

    
});


server.listen(runningPortNumber);

