// connect to our socket server
var socket = io.connect();

var app = app || {};


// shortcut for document.ready
$(function(){
	//setup some common vars
	var $blastField = $('#blast'),
		$allPostsTextArea = $('#allPosts'),
		$clearAllPosts = $('#clearAllPosts'),
		$sendBlastButton = $('#send');


	//SOCKET STUFF
	socket.on("blast", function(data){
		var copy = $allPostsTextArea.html();
		$allPostsTextArea.html('<p>' + copy + data.msg + "</p>");
		$allPostsTextArea.scrollTop($allPostsTextArea[0].scrollHeight - $allPostsTextArea.height());
		//.css('scrollTop', $allPostsTextArea.css('scrollHeight'));
		//update gauge with latest count data
		g.refresh(data.count);
	});

	socket.emit("register", {track: getParameterByName('track'), goal: getParameterByName('goal')});

	function getParameterByName(name)
	{
		name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		var regexString = "[\\?&]" + name + "=([^&#]*)";
		var regex = new RegExp(regexString);
		var found = regex.exec(window.location.search);
		if(found == null)
		  return "";
		else
		  return decodeURIComponent(found[1].replace(/\+/g, " "));
	}
	
	$clearAllPosts.click(function(e){
		$allPostsTextArea.text('');
	});

	$sendBlastButton.click(function(e){

		var blast = $blastField.val();
		if(blast.length){
			socket.emit("blast", {msg:blast}, 
				function(data){
					$blastField.val('');
				});
		}


	});

	$blastField.keydown(function (e){
	    if(e.keyCode == 13){
	        $sendBlastButton.trigger('click');//lazy, but works
	    }
	})
	
});
