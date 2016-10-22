var Stack = require('stackjs');
// Initialize WebHooks module. 
var WebHooks = require('node-webhooks');
var loaded = 0;
var key = "https://discordapp.com/api/webhooks/239187782013026305/aTsUQSxyaIlhcYsC0Dc_Noqy6WrS-oaxYA7xK-mN5FfdHf5o3BjYaVK0XwvD2wObycee";
var time = 15;
var lastf = "l";
var plf = "p";
var FeedParser = require('feedparser')
  , request = require('request');
var timeout = time*(60*1000);
var add_hours = 0;
var add_minutes = 0;
var webHooks = null;
var http = require("http");
http.createServer(function (request, response) {
   // Send the HTTP header 
   // HTTP Status: 200 : OK
   // Content Type: text/plain
   response.writeHead(200, {'Content-Type': 'text/plain'});
   
   // Send the response body as "Hello World"
   response.end('Frab!\n');
}).listen(process.env.PORT || 8081);

// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');
	
	// TIME 
if (timeout<60000) {timeout = 60000;}
var add_hours = Math.trunc((timeout/(60*60*1000)));
var add_minutes = ((timeout/(60*1000))-(add_hours*60));
console.log("Timeout set to "+add_hours+" Hours and "+add_minutes+" Minutes.");
	//END OF TIME 
	//WEBHOOK
webHooks = new WebHooks({db: './webHooksDB.json',});
webHooks.remove('discord').catch(function(err){console.error(err);});
webHooks.add('discord', key).then(function(){}).catch(function(err){
console.log(err);
});
	//END OF WEBHOOK
postrss();
setInterval(postrss,timeout);

function postrss(){
var date = new Date();
var current_hour = date.getHours();
var current_min = date.getMinutes();
var current_sec = date.getSeconds();
var hs = "",ms="",ss="";
makeTimeString(current_hour,current_min,current_sec);
console.log("[ "+hs+" : "+ms+" : "+ss+" ] Launching Update Coroutine!");
var nextminutes = current_min + add_minutes;
if (nextminutes>=60) {
	current_hour += 1;
	nextminutes-=60;
}
var nexthours = current_hour + add_hours;
if (nexthours >= 24) {
	nexthours -= 24;
}
var  req = request("http://imgur.com/rss"),
feedparser = new FeedParser();
var count = 0;
var newf = "";
var newpf = "";
var poststack = new Stack();
var end = false;
req.on('error', function (error) {
  // handle any request errors
});
req.on('response', function (res) {
  var stream = this;

  if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
  stream.pipe(feedparser);
});


feedparser.on('error', function(error) {
  // always handle errors
});
feedparser.on('readable', function() {
  // This is where the action is!
  var stream = this
    , meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
    , item;
  while (item = stream.read()) {
	  var title = item.title;
	  var url = (""+item.enclosures[0].url).replace("gif","gifv").replace("mp4","gifv");
	  if (count==0) {newf = ""+item.guid;}
	  if (count==1) {newpf = ""+item.guid;}
	  if (lastf == ""+item.guid) {end = true; lastf=newf; plf=newpf; console.log("Reached End of Last Update!");}
	  if ((plf == ""+item.guid)&&(end == false)) {end = true; newf=lastf; newpf = plf; console.log("Reached End of Last Update!");}
	  console.log((count+1)+". "+title);
	  if (end == false) {
	  poststack.push({pn: title,ps: url});
	  }
	  if (count==19) {
		  lastf = newf;
		  plf = newpf;
		  console.log(poststack.size()+" Items in Poststack!");
		  emptystack();
		  }
 }
 count+=1;
});	
function makeTimeString(hours,minutes,seconds){
	if (hours <10) {
		hs = "0"+hours;
	}
	else {
		hs = hours;
	}
	if (minutes <10) {
		ms = "0"+minutes;
	}
	else {
		ms = minutes;
	}
	if (seconds <10) {
		ss = "0"+seconds;
	}
	else {
		ss = seconds;
	}
}
function emptystack() {
	if (poststack.size()!=0) {
				var post = poststack.pop();
			console.log("Posting: "+post.pn+" - "+post.ps);	
			webHooks.trigger('discord', {content: post.pn+"\n"+post.ps});
	}
	if (poststack.size()!=0) {
	setTimeout(emptystack, 500);
	}
	else {
	makeTimeString(nexthours,nextminutes,current_sec);
	console.log("Next one will be at: "+hs+":"+ms+":"+ss);
	}
}
}