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
var unirest = require('unirest');
var Twit = require('twit');
var twitter = new Twit({
    consumer_key: process.env.TwitterConsumerKey,
    consumer_secret: process.env.TwitterConsumerSecret,
    access_token: process.env.TwitterAccessToken,
    access_token_secret: process.env.TwitterAccessTokenSecret
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
    	var goal = data.goal;
	    stream.on('tweet', function (tweet) {
	    	count++;
	        socket.emit('blast', {msg:"<span style=\"color:red !important\">" + tweet.text + "!</span>", count: count});
	        if(count >= goal){
	        	//stop the stream
	        	console.log('GOAL REACHED! TODO - Fire Rocket!');
	        	stream.stop();
	        	fireRocket(function(err){
		    		if(err){
		    			return console.error(err);
		    		}

		    		return console.log('Rocket Fired!!');
	    		});
	        }
	    });

	    //stop tracking tweets after disconnecting
	    socket.on('disconnect', function(socket){
	    	console.log("!!!!CLIENT DISCONNECTED!!!");
	    	stream.stop();

			
		});
    });

    
});

function fireRocket(cb){

	//TODO: NEVER place your actual spark core access_token in your file
  unirest.post('https://api.spark.io/v1/devices/53ff6e066667574833512467/cycleRelay')
  .send('access_token=a60207c84d396e58510aae5b91f5bbfb0dccb9a7')
  .send('params=r1,1500')
  .end(function(response){

    if(response.error){
      //something went wrong!
      console.error(response.error);
      cb(response.error);
    }

    //rocket triggered! (make sure its on and connected)
    cb(null);
  });


}

server.listen(runningPortNumber);

