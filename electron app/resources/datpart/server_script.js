"use strict";

	//const {shell} = require('electron');
	const http = require('http');
	const url = require("url");
	const dat = require('dat-node');
	const fs = require('fs');
	const path = require("path");
	
	//    "chrome-native-messaging": "^0.2.0",
    //    "node-dat-archive": "^1.5.0",
    //    "pauls-dat-api": "^8.0.1"

	var host = "127.0.0.1";
	var port = "9989";
	
	var versionNumber = require('electron').remote.getGlobal('sharedObject').appVersionNumber;
	
	console.log("DatPart Server Version "+versionNumber);
	
	var datMap = {};

	var mimeTypes = {
	//text formats
      "html": "text/html",
      "xhtml": "application/xhtml+xml",
	  "js": "text/javascript",
      "css": "text/css",
      "txt": "text/plain",
      "appcache": "text/cache-manifest",
      "htc": "text/x-component",
	//image formats
	  "svg": "image/svg+xml",
	  "svgz": "image/svg+xml",
      "jpeg": "image/jpeg",
      "jpg": "image/jpeg",
      "png": "image/png",
      "apng": "image/png",
      "webp": "image/webp",
      "jxr": "image/vnd.ms-photo",
      "hdp": "image/vnd.ms-photo",
      "wdp": "image/vnd.ms-photo",
      "flif": "image/flif",
      "heif": "image/heif",
      "heic": "image/heic",
      "tiff": "image/tiff",
      "tif": "image/tiff",
      "mpo": "image/mpo",
      "gif": "image/gif",
      "ico": "image/x-icon",
	//font formats
      "woff": "application/font-woff",
      "woff2": "font/woff2",
      "ttf": "application/x-font-ttf",
      "ttc": "application/x-font-ttf",
      "otf": "font/opentype",
      "eot": "application/vnd.ms-fontobject",
	//video formats
      "webm": "video/webm",
      "mp4": "video/mp4",
      "m4v": "video/m4v",
      "ogv": "video/ogg",
	//audio formats
      "ogg": "audio/ogg",
      "oga": "audio/ogg",
      "aac": "audio/x-aac",
      "mp3": "audio/mpeg",
      "weba": "audio/webm",
	//application file formats
      "wasm": "application/wasm",
      "nexe": "application/x-nacl",
      "xml": "application/xml",
      "json": "application/json",
      "map": "application/json",
      "rss": "application/rss+xml",
      "atom": "application/atom+xml",
      "opensearchxml": "application/opensearchdescription+xml",
      "torrent": "application/x-bittorrent",
      "webmanifest": "application/manifest+json",
	//browser extension file formats
      "crx": "application/x-chrome-extension",
      "xpi": "application/x-xpinstall",
      "nex": "application/x-navigator-extension",
	//plugin file formats
      "swf": "application/x-shockwave-flash",
	  "xap": "application/x-silverlight-app",
	  "unity3d": "application/vnd.unity",
	  "jar": "application/java-archive",
	  "class": "application/x-java-applet",
	//random Misc
      "webapp": "application/x-web-app-manifest+json",
      "pdf": "application/pdf",
      "ics": "text/calendar",
      "pkpass": "application/vnd.apple.pkpass",
      "mobileconfig": "application/x-apple-aspen-config",
      "prs": "application/x-psp-radio-skin",
      "p3t": "application/x-ps3-theme",
      "ptf": "application/x-psp-theme",
      "pbp": "application/x-psp-game"
    };
	
	var HTTPheaders = {
	  "Server": "DatPart "+versionNumber,
	  "X-Powered-By": "DatPart "+versionNumber,
	  //"Cache-Control": "no-cache, no-store, must-revalidate, no-transform",
	  //"Pragma": "no-cache",
	  //"Expires": "0",
	  "Cache-Control": "public, max-age: 60, no-transform",
	  "Accept-Charset": "utf-8",
	  "Access-Control-Allow-Origin": "*",
	  "Content-Security-Policy": "frame-ancestors 'self'",
	  "Upgrade-Insecure-Requests": "1"
	};
	
	if (!fs.existsSync(__dirname + '/../../dats/')) {
		fs.mkdirSync(__dirname + '/../../dats/');
	}

const requestHandler = (request, response) => {
  console.log(request.url);
    console.log(request);
  
    var uri = url.parse(request.url).pathname,
      filename = path.join(process.cwd(), uri);
	  
      var mimeType = mimeTypes[filename.split('.').pop()];
      
      if (!mimeType) {
        mimeType = 'text/plain';
      }
	
	var currentTLD = url.parse(request.url).hostname.split(".").pop();
	
	var currentURLhostNoTLD = url.parse(request.url).hostname.split(".")[0];
	
	var datPath = url.parse(request.url).pathname;
	
	console.log(datPath);

if(request.method == 'GET' && currentTLD == 'dat_site') {
	datMap[currentURLhostNoTLD] = {};
dat( __dirname + '/../../dats/'+currentURLhostNoTLD, {
  // 2. Tell Dat what link I want
  key: currentURLhostNoTLD, temp: true, sparse: true // (a 64 character hash from above)
}, function (err, dat) {
  if (err) {throw err;console.log(err);}
  
  var stats = dat.trackStats();
  console.log(dat.stats.get());

  // 3. Join the network & download (files are automatically downloaded)
  dat.joinNetwork(function (err) {
  if (err) { throw err; }

    // After the first round of network checks, the callback is called
    // If no one is online, you can exit and let the user know.
    if (!dat.network.connected || !dat.network.connecting) {
      console.error('No users currently online for dat://'+currentURLhostNoTLD);
      process.exit(1);
    }
  });

  datMap[currentURLhostNoTLD].datJSON = new Promise(function(resolve, reject) {
	  
	  dat.archive.readFile('/dat.json', function (err, content) {
		if (content != null) {
			console.log("Got dat.json for "+ currentURLhostNoTLD);
			console.log(datMap[currentURLhostNoTLD]);
			resolve(JSON.parse(content.toString()));
		} else {
			console.log("dat.json not found for "+ currentURLhostNoTLD);
			reject("dat.json not found for "+ currentURLhostNoTLD);
		}
		if (err) {throw err; console.log(err);}
	  });
	  
  });
  
  var fourOhFourFallback = new Promise(function(resolve, reject) {
	datMap[currentURLhostNoTLD].datJSON.then(function(result) {
		
	  console.log("Grabbing JSON for fallback_page "+JSON.stringify(result));
	  
		dat.archive.readFile(result.fallback_page, function (err, fallbackContent) {
			if (fallbackContent != null) {
				console.log("Got fallback page for dat://"+ currentURLhostNoTLD +" " + result.fallback_page);
				resolve(fallbackContent);
			} else {
				console.log("fallback_page not found for dat://"+ currentURLhostNoTLD);
				reject("fallback_page not found for dat://"+ currentURLhostNoTLD);
			}
		});
		
	}, function(err) {
	  console.log(err);
	});
  });
  
    var datContentSecurityPolicy = new Promise(function(resolve, reject) {
	datMap[currentURLhostNoTLD].datJSON.then(function(result) {
		
	  console.log("Grabbing JSON for content_security_policy "+JSON.stringify(result));
	  
		dat.archive.readFile(result.content_security_policy, function (err, cspContent) {
			if (cspContent != null) {
				console.log("Got fallback page for dat://"+ currentURLhostNoTLD +" " + result.content_security_policy);
				resolve(cspContent);
			} else {
				console.log("content_security_policy not found for dat://"+ currentURLhostNoTLD);
				reject("content_security_policy not found for dat://"+ currentURLhostNoTLD);
			}
		});
		
	}, function(err) {
	  console.log(err);
	});
  });

var lastChar = request.url.substr(-1); // Selects the last character
if (lastChar == '/') {         // If the last character is not a slash
  
  dat.archive.readFile(datPath+'/index.html', function (err, content) {

	if (content != null) {
		console.log(datPath);
		var newHeaders = HTTPheaders;
		delete newHeaders["X-Frame-Options"];
		delete newHeaders["Location"];
		newHeaders["Content-Type"] = "text/html";
		newHeaders["Alt-Svc"] = "dat='dat://"+currentURLhostNoTLD+datPath+"'";
		newHeaders["Dat-Url"] = "dat://"+currentURLhostNoTLD+datPath;
		newHeaders["Content-Security-Policy"] = "frame-ancestors 'self' https://*";
		newHeaders["Hyperdrive-Key"] = currentURLhostNoTLD;
		newHeaders["Hyperdrive-Version"] = ""; //dat.stats.get().version;
		
		datContentSecurityPolicy.then(function(result) {
					console.log(result); // "Stuff worked!"
					newHeaders["Content-Security-Policy"] = result;
					response.writeHead(200, newHeaders);
					response.end(content);
		}, function(err) {
					console.log(err); // Error: "It broke"
					response.writeHead(200, newHeaders);
					response.end(content);
		});
		
		//response.writeHead(200, newHeaders);
		//response.end(content);
	} else {
		console.log("File "+datPath+" not found!");
		
		var newHeaders = HTTPheaders;
		delete newHeaders["X-Frame-Options"];
		delete newHeaders["Location"];
		newHeaders["Content-Security-Policy"] = "frame-ancestors 'none'";
		newHeaders["X-Frame-Options"] = "DENY";
		
		fourOhFourFallback.then(function(result) {
					console.log(result); // "Stuff worked!"
  					response.writeHead(404, newHeaders);
					response.end(result);
		}, function(err) {
					console.log(err); // Error: "It broke"
					response.writeHead(204, newHeaders);
					response.end("Nothing");
		});

	}
	if (err) {throw err; console.log(err);}
  });

} else {

  dat.archive.readFile(datPath, function (err, content) {
	
	if (content != null) {
		console.log(datPath);
		
		var newHeaders = HTTPheaders;
		delete newHeaders["X-Frame-Options"];
		delete newHeaders["Location"];
		newHeaders["Content-Type"] = mimeType;
		newHeaders["Alt-Svc"] = "dat='dat://"+currentURLhostNoTLD+datPath+"'";
		newHeaders["Dat-Url"] = "dat://"+currentURLhostNoTLD+datPath;
		newHeaders["Content-Security-Policy"] = "frame-ancestors 'self' https://*";
		newHeaders["Hyperdrive-Key"] = currentURLhostNoTLD;
		newHeaders["Hyperdrive-Version"] = ""; //dat.stats.get().version;

		delete newHeaders["X-Frame-Options"];
		delete newHeaders["Location"];
		//response.setHeader('Alt-Svc', 'dat="'+currentURLhostNoTLD+datPath+'"');
		
		datContentSecurityPolicy.then(function(result) {
					console.log(result); // "Stuff worked!"
					newHeaders["Content-Security-Policy"] = result;
					response.writeHead(200, newHeaders);
					response.end(content);
		}, function(err) {
					console.log(err); // Error: "It broke"
					response.writeHead(200, newHeaders);
					response.end(content);
		});
		
		//response.writeHead(200, newHeaders);
		//response.end(content); 
	} else {
		console.log("File "+datPath+" not found!");
		
		var newHeaders = HTTPheaders;
		delete newHeaders["X-Frame-Options"];
		delete newHeaders["Location"];
		newHeaders["Content-Security-Policy"] = "frame-ancestors 'none'";
		newHeaders["X-Frame-Options"] = "DENY";
		
		fourOhFourFallback.then(function(result) {
					console.log(result); // "Stuff worked!"
  					response.writeHead(404, newHeaders);
					response.end(result);
		}, function(err) {
					console.log(err); // Error: "It broke"
					response.writeHead(204, newHeaders);
					response.end("Nothing");
		});
		
	}
	if (err) {throw err; console.log(err);}
  });

}
  
  dat.leaveNetwork();
  
});

} else if(fs.existsSync(__dirname + "/../../dats/")) {

console.log(request.url);

	var currentTLD = url.parse(request.url).hostname.split(".").pop();
	
	var currentURLhostNoTLD = url.parse(request.url).hostname.split(".")[0];
	
	var datPath = url.parse(request.url).pathname;
	
	console.log(datPath);
	
	console.log("TLD: " + currentTLD + " Hash: " + currentURLhostNoTLD);

} else {
	
	fs.mkdirSync(appPath + "/dats/");
	console.log(request.url);
	
}

};

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }

  console.log(`server is listening on ${port}`);
});