"use strict";

  var host = "127.0.0.1";
  var port = "9989";
  
  var serverSocketId = null;
  var filesMap = {};
  
  var rootDir = null;
  var packDir = null;
  
  if (typeof process === 'object') {
	if (typeof process.versions === 'object') {
		if (typeof process.versions['electron'] !== 'undefined') {
		
		// content of index.js
		const {shell} = require('electron');
		const http = require('http');
		var dat = require('dat-node');
		
		//var versionNumber = app.getVersion();
		//var appName = app.getName();
		//var appIcon = __dirname+'/logo_128.png';
		
		document.querySelectorAll("a.external-link").forEach(function (el) {
		  el.onclick = function(){shell.openExternal(el.href);return false;};
		});

const requestHandler = (request, response) => {
  console.log(request.url);
  
	var currentURLRequest = document.createElement('a');
	currentURLRequest.href = request.url;
	
	var currentTLD = currentURLRequest.hostname.split(".").pop();
	var currentURLhostNoTLD = currentURLRequest.hostname.split(".")[0];
	
	var fileSearch = currentURLRequest.pathname;
	
	console.log(fileSearch);
	
	console.log("TLD: " + currentTLD + " Hash: " + currentURLhostNoTLD);
	/*
	if(currentTLD == 'dat_site') {
		fileSearch = "/dat/" + currentURLhostNoTLD + currentURLRequest.pathname;
		console.log(fileSearch);
	}
*/
   
dat( __dirname + '/dats/'+currentURLhostNoTLD, {
  // 2. Tell Dat what link I want
  key: currentURLhostNoTLD, temp: false, sparse: true // (a 64 character hash from above)
}, function (err, dat) {
  if (err) {throw err;console.log(err)}
  
  var stats = dat.trackStats()

  // 3. Join the network & download (files are automatically downloaded)
  dat.joinNetwork();
  /*
  dat.archive.readFile(fileSearch+'/dat.json', function (err, content) {
    console.log(JSON.parse(content));
	if (err) {throw err;console.log(err)}
  });
  */
  var lastChar = request.url.substr(-1); // Selects the last character
if (lastChar == '/') {         // If the last character is not a slash
  
  dat.archive.readFile(fileSearch+'/index.html', function (err, content) {
    console.log(content);
	response.end(content);
	if (err) {throw err;console.log(err)}
  });

} else {
	
  dat.archive.readFile(fileSearch, function (err, content) {
    console.log(content);
	response.end(content);
	if (err) {throw err;console.log(err)}
  });
  
}
  
});

};

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }

  console.log(`server is listening on ${port}`);
});

  }}}