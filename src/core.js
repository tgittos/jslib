var jslib = function(){
	if (String.prototype.trim == 'undefined')
	{
	    String.prototype.trim = function() { return str.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); };
	}
	return {
		onload: function(callback){
			if (window.onload) {
		        var func = window.onload;
		        window.onload = function(){
		            callback();
		            func();
		        }
		    } else {
		        window.onload = callback;
		    }
		},
		debug: {
			assert: function(statement, expected){
			    if (statement == expected) {
			        document.writeln("<span style=\"display:block;background:#00cc33;color:#fff;padding:0.2em;margin:0.2em;border:#000 solid 1px;\"><strong>Assert:</strong> Passed (" + statement + ")</span>");
			    }
			    else {
			        document.writeln("<span style=\"display:block;background:#ff0033;color:#fff;padding:0.2em;margin:0.2em;border:#000 solid 1px;\"><strong>Assert:</strong> Failed, expected " + expected + ", got " + eval(statement) + " (" + statement + ")</span>");
			    }
			},
			trace: function(message){
			    document.writeln("<span style=\"display:block;padding:0.2em;margin:0.2em;border:#000 solid 1px;\"><strong>Trace:</strong> " + message + "</span>");
			},
			print_r: function(obj){
    			var indent = "&nbsp;&nbsp;&nbsp;&nbsp;";  
    			document.writeln("<p style=\"padding:0.2em;margin:0.2em;\">" + obj + "<br />");
			    var recursive = function(obj, depth){
			        if (depth == 5)
			            return;
			        var currentIndent = "";
			        for (var i = 0; i < depth; i++){
			            currentIndent += indent;
			        }
			        for (p in obj){
			            if (typeof(p) == 'object')
			                recursive(p, depth + 1);
			            document.writeln(currentIndent + "<strong>" + p + "</strong>" + ": " + obj[p] + "<br />");
			        }
			    }
			    recursive(obj, 1);
			}
		}
	}
}();