jslib.events = function(){
	var callbacks = {};
    return {
        subscribe: function(event, callback) {
            if (!callbacks[event]) {
                callbacks[event] = Array();
                callbacks[event].push(callback);
            } else callbacks[event].push(callback);
        },
        unsubscribe: function(event, callback){
	        if (callbacks[event]) {
	            for (var i = 0; i < callbacks[event].length; i++) {
	                rCallback = callbacks[event][i];
	                if (callback == rCallback) {
	                    callbacks[event].splice(i, 1);
	                    break;
	                }
	            }
	        }
        },
        notify: function(event, args) {
            if (callbacks[event]) {
                for (var i = 0; i < callbacks[event].length; i++) {
                    var callback = callbacks[event][i];
                    callback(args);
                }
            }
        }
    };
}();