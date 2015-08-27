var net = require('net');
var async = require('async');

var TrackerSimulator = require('./tracker-simulator');
var MESSAGE_CMD_T = "#861785001515349,CMD-T,V,DATE:120903,TIME:160649,LAT:25.7225198N,LOT:100.3120225W,Speed:005.5,X-X-X-X-49-5,000,24202-0ED9-D93B#";
	MESSAGE_CMD_T = '#861785001515349,CMD-T,V,DATE:120903,TIME:160649,LAT:19.4265944N,LOT:098.8781135W,Speed:005.5,X-X-X-X-49-5,000,24202-0ED9-D93B#';
var MESSAGE_CMD_X = "#861785001515349,CMD-X#";
var MESSAGE_ALM_A = "#861785001515349,ALM-A,V,DATE:120903,TIME:160649,LAT:25.7225198N,LOT:100.3120225W,Speed:005.5,X-X-X-X-82-10,000,24202-0324-0E26#";
	MESSAGE_ALM_A = '#861785001515349,ALM-A,V,DATE:120903,TIME:160649,LAT:19.4265944N,LOT:098.8781135W,Speed:005.5,X-X-X-X-82-10,000,24202-0324-0E26#';

var MESSAGES_TEST_ARRAY = [MESSAGE_CMD_T, MESSAGE_CMD_X, MESSAGE_ALM_A];

var MESSAGE_CMD_T_ARRAY = [
	'#861785001515349,CMD-T,V,DATE:120903,TIME:160649,LAT:19.4265944N,LOT:098.8781135W,Speed:005.5,X-X-X-X-49-5,000,24202-0ED9-D93B#',
	MESSAGE_CMD_X,
	'#861785001515349,CMD-T,V,DATE:120903,TIME:160749,LAT:19.427989N,LOT:098.8780723W,Speed:005.5,X-X-X-X-49-5,000,24202-0ED9-D93B#',
	MESSAGE_CMD_X,
	'#861785001515349,CMD-T,V,DATE:120903,TIME:160849,LAT:19.4281743N,LOT:098.8775744W,Speed:005.5,X-X-X-X-49-5,000,24202-0ED9-D93B#',
	MESSAGE_CMD_X,
	'#861785001515349,CMD-T,V,DATE:120903,TIME:160949,LAT:19.4271991N,LOT:098.8774237W,Speed:005.5,X-X-X-X-49-5,000,24202-0ED9-D93B#',
	MESSAGE_CMD_X,
	'#861785001515349,CMD-T,V,DATE:120903,TIME:161049,LAT:19.426509N,LOT:098.8792383W,Speed:005.5,X-X-X-X-49-5,000,24202-0ED9-D93B#',
	MESSAGE_CMD_X,
	'#861785001515349,CMD-T,V,DATE:120903,TIME:161149,LAT:19.4260479N,LOT:098.8815732W,Speed:005.5,X-X-X-X-49-5,000,24202-0ED9-D93B#',
	MESSAGE_CMD_X,
	'#861785001515349,CMD-T,V,DATE:120903,TIME:161249,LAT:19.4255307N,LOT:098.8848427W,Speed:005.5,X-X-X-X-49-5,000,24202-0ED9-D93B#',
	MESSAGE_CMD_X,
	'#861785001515349,CMD-T,V,DATE:120903,TIME:161349,LAT:19.4248884N,LOT:098.8888212W,Speed:005.5,X-X-X-X-49-5,000,24202-0ED9-D93B#',
	MESSAGE_CMD_X,
	'#861785001515349,CMD-T,V,DATE:120903,TIME:161449,LAT:19.4247754N,LOT:098.8914596W,Speed:005.5,X-X-X-X-49-5,000,24202-0ED9-D93B#',
	MESSAGE_CMD_X,
	'#861785001515349,CMD-T,V,DATE:120903,TIME:161549,LAT:19.4244583N,LOT:098.9001021W,Speed:005.5,X-X-X-X-49-5,000,24202-0ED9-D93B#'
];

function getParameters() {
	
	var args = process.argv.slice(2);
	if (args.length < 2) {
		throw "usage <hostname> <port>";
	}
	
	var params = new Object();
	
	params.hostname = args[0];
	params.port = args[1];
	return params;
}

var parameters = getParameters();

var openConnections = 0;
var totalConnections = 0;
var pendingConnections = 0;
var failedConnections = 0;

var connect = function(localAddress, callback) {
	console.log('connect');
	var connectOptions = new Object();
	connectOptions.port = parameters.port;
	connectOptions.host = parameters.hostname;
	connectOptions.localAddress = localAddress;

    var trackerSimulator = new TrackerSimulator();
    
    trackerSimulator.connect(connectOptions, function(err) {
        callback(err, trackerSimulator);
    });		 
};

var spawnConnections = function(localAddress) {
	var i = 0;
    
	var connectCallback = function(err, trackerSimulator) {
		if (err) {
		    pendingConnections--;
            failedConnections++;
		} else {
			openConnections++;
            pendingConnections--;
            async.forever(function(callback) {
                // trackerSimulator.sendMessage([ MESSAGE_CMD_T, MESSAGE_CMD_X, MESSAGE_ALM_A ], 3000, 100, 100, callback);
                trackerSimulator.sendMessage(MESSAGE_CMD_T_ARRAY, 3000, 100, 100, callback);
            }, function() {
                openConnections--;
            });
		}
	};
	
	var doConnect = function() {
		if (i < 1) {
			connect(localAddress, connectCallback);
			pendingConnections++;
			i++;
		}
	};
	doConnect();
};
var showDebug = function() {
	var closedConnections = totalConnections - openConnections;
	console.log('open conneciton ' + openConnections + ' total connections '
			+ totalConnections + ' pending connections ' + pendingConnections + ' failed connections ' + failedConnections);
};

setInterval(showDebug, 1000);
spawnConnections();

