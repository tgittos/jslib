jslib.dragdrop = function(){
    //Drag and Drop "plugin" - framework agnostic
    //Public vars
    //These vars can be set using the init function
    this.targets = { target: function(){  //Target object, target names as properties, target functions as values of properties
        alert('Declare "targets" property in "dragAndDrop.init" call param, format of "rel attribute name: function"');
    }};
    this.dragRel = "draggable"; //Rel attribute of objects to drag - comma separated list
    this.onTargetDrop = function(e){}; //Event that gets called when an object is dropped on a target
    this.onDraggableDrop = function(e){}; //Event that gets called when an object is dropped on a dragable
    this.onBoundaryHit = function(e){}; //Event that gets called when an object hits a boundary

    //Private vars
    var dragObj = null; //Object we're dragging
    var dragClone = null; //Clone of object we're dragging (for removeOnDrag = false)
    var mouseOffset = null; //Offset of mouse from objects position
    var draggables = []; //Draggables
    var boundaries = []; //Boundary
    var targets = []; //Targets
    var styleBuffer = null; //Style buffer
    var that = this;
    
    //Priveliged init
    this.init = function(obj)
    {
        for(var key in obj)
        {
            if (that.hasOwnProperty(key))
            {
                that[key] = obj[key];
            }
        }
    };
    
    //Priveliged Constructor
    this.construct = function() //Goes through DOM and creates draggables, targets and boundaries
    {
        var relArray = [];
        if (that.dragRel.indexOf(',') > 0)
        {
            relArray = that.dragRel.split(',');
        }
        else
        {
            relArray.push(that.dragRel);
        }
        for each(rel in relArray)
        {
            var drops = getElementsByRel(rel.trim());
            if (drops) {
                var c = drops.length;
                for (var i = 0; i < c; i++) {
                    makeDraggable(drops[i]);
                }
            }
        }

        var bounds = getElementsByRel('boundary');
        if (bounds) {
            var c = bounds.length;
            for (var i = 0; i < c; i++) {
                addBoundary(bounds[i]);
            }
        }

        document.onmousemove = onMouseMove;
        document.onmouseup = onMouseUp;
        
        //Register custom events
        eventDispatcher.subscribe("targetDrop", that.onTargetDrop);
        eventDispatcher.subscribe("draggableDrop", that.onDraggableDrop);
        eventDispatcher.subscribe("boundaryHit", that.onBoundaryHit);
    }
    
    //Public functions
    this.Reload = function()
    {
        this.construct();
    }

    //Core Logic (Private)
    function checkBoundary(obj) //Ensures object can't leave a boundary object it's in
    {
        if (!obj)
            return;

        var x = obj.style.top.substr(0, obj.style.top.length - 2);
        var y = obj.style.left.substr(0, obj.style.left.length - 2);
        var c = boundaries.length;

        for (var i = 0; i < c; i++) {
            boundary = boundaries[i];

            var bWidth = boundary.y + parseInt(boundary.width.substr(0, boundary.width.length - 2));
            var bHeight = boundary.x + parseInt(boundary.height.substr(0, boundary.height.length - 2));

            if (x <= boundary.x)
            {
                obj.style.top = boundary.x + 'px';
                eventDispatcher.notify("boundaryHit", {dragged: obj, boundary: boundary});
            }
            else if (x >= bHeight - obj.height)
            {
                obj.style.top = bHeight - obj.height + 'px';
                eventDispatcher.notify("boundaryHit", {dragged: obj, boundary: boundary});
            }

            if (y <= boundary.y)
            {
                obj.style.left = boundary.y + 'px';
                eventDispatcher.notify("boundaryHit", {dragged: obj, boundary: boundary});
            }
            else if (y >= bWidth - obj.width)
            {
                obj.style.left = bWidth - obj.width + 'px';
                eventDispatcher.notify("boundaryHit", {dragged: obj, boundary: boundary});
            }
        }
    }
    function checkTarget(obj) //Checks if an object has been dropped on a target
    {
        if (!obj)
            return;
            
        var y = obj.style.top.substr(0, obj.style.top.length - 2);
        var x = obj.style.left.substr(0, obj.style.left.length - 2);
        
        for (var name in that.targets)
        {
            var targs = getElementsByRel(name);
            if (targs) 
            {
                var c = targs.length;
                for (var i = 0; i < c; i++) {
                    target = targs[i];
                    
                    var tPos = getPosition(target);
                    var tWidth = tPos.x + (target.width || target.offsetWidth);
                    var tHeight = tPos.y + (target.height || target.offsetHeight);
                    
                    if ((x > tPos.x && x < tWidth - obj.offsetWidth) &&
                        (y > tPos.y && y < tHeight - obj.offsetHeight)) {  
                        eventDispatcher.notify("targetDrop", {dropped: obj, target: target});
                        return that.targets[name](target, obj);
                    }
                }
            }
        }

        return false;
    }
    function makeDraggable(obj) //Enables an object to be draggable
    {
        //Null object check
        if (!obj)
            return;

        draggables.push(obj);

        obj.onmouseover = function(e) {
            obj.style.cursor = "move";
        }

        obj.onmousedown = function(e) {
            dragObj = this;
            styleBuffer = dragObj.getAttribute("style");
            dragObj.style.zIndex = 1000;
            mouseOffset = getMouseOffset(this, e);
            return false;
        }
    }
    function addBoundary(obj) //Registers a boundary object
    {
        if (!obj)
            return;

        var oPos = getPosition(obj);
        var oWidth = obj.width || obj.offsetWidth;
        var oHeight = obj.height || obj.offsetHeight;

        boundaries.push({ x: oPos.y, y: oPos.x, width: oWidth, height: oHeight });
    }
    /*function addTarget(obj, func) //Registers a target object
    {
        if (!obj)
            return;

        var oPos = getPosition(obj);
        //The following depends on the target being an img
        
        var oWidth = obj.width  || obj.offsetWidth;
        var oHeight = obj.height || obj.offsetHeight;

        targets.push({ x: oPos.y, y: oPos.x, width: oWidth, height: oHeight, f: func, id: obj.getAttribute("id") });
    }*/
    function checkDraggable(obj) {
        if (!obj)
            return;

        var x = obj.style.top.substr(0, obj.style.top.length - 2);
        var y = obj.style.left.substr(0, obj.style.left.length - 2);
        var c = draggables.length;

        for (var i = 0; i < c; i++) {
            var draggable = draggables[i];
            if (draggable == obj) {
                continue;
            }
            var dPos = getPosition(draggable);
            var droppedRightEdge = parseInt(y) + obj.width - mouseOffset.x;
            var droppedLeftEdge = parseInt(y) - mouseOffset.x;
            //var halfWidth = dPos.x + (draggable.width / 2);

            if (droppedRightEdge > dPos.x && droppedRightEdge < dPos.x + draggable.width) {
                alert("before");
                //Insert before drop target
                draggable.parentNode.insertBefore(obj, draggable);
                obj.setAttribute("style", styleBuffer);
                eventDispatcher.notify("draggableDrop", {dropped: obj, target: draggable});
                return true;
            }
            else if (droppedLeftEdge > dPos.x && droppedLeftEdge < dPos.x + draggable.width) {
                alert("after");
                //Insert after drop target
                draggable.parentNode.insertBefore(obj, draggable.nextSibling);
                obj.setAttribute("style", styleBuffer);
                eventDispatcher.notify("draggableDrop", {dropped: obj, target: draggable});
                return true;
            }
        }
        return false;
    }

    //Events (Private)
    function onMouseMove(e) //Fires when mouse moved
    {
        e = e || window.event;
        var coords = getMouseCoords(e);

        var myDragObj = null;
        if (dragClone) {
            myDragObj = dragClone;
        }
        else {
            myDragObj = dragObj;
        }

        if (myDragObj) {
            myDragObj.style.position = 'absolute';
            myDragObj.style.top = coords.y - mouseOffset.y + 'px';
            myDragObj.style.left = coords.x - mouseOffset.x + 'px';

            checkBoundary(myDragObj);

            //DEBUG
            //document.getElementById('txtDebugX').value = coords.y - mouseOffset.y;//dragObj.style.top;
            //document.getElementById('txtDebugY').value = coords.x - mouseOffset.x;//dragObj.style.left;
            //document.getElementById('spanDebugObj').innerHTML = dragObj.style.top;
            //END DEBUG

            return false;
        }
    }
    function onMouseUp(e) //Fires when mouse is released
    {
        if (dragObj == null)
            return;
            
        //Check draggable first
        if (!checkDraggable(dragObj) &&
            !checkTarget(dragObj)) {
            if (typeof(styleBuffer) == 'object')
            {
                //Naughty IE - set to blank to reset
                dragObj.style.position = "";
                dragObj.style.top = "";
                dragObj.style.left = "";
            }
            else
            {
                //Well behaved browsers
                dragObj.setAttribute("style", styleBuffer);
            }
        }
        dragObj = null;
    }

    //Helper functions (Private)
    function getElementsByRel(str) //Returns array of DOM objects with given rel
    {
        var ret = new Array();
        var tags = document.getElementsByTagName('*');
        if (tags) {
            var c = tags.length;
            for (var i = 0; i < c; i++) {
                var tag = tags[i];
                if (!tag)
                    continue;
                if (tag.getAttribute('rel') == str)
                    ret.push(tag);
            }
            return ret;
        }
    }
    function getMouseCoords(e) //Returns object with mouse coords
    {
        if (e.pageX || e.pageY) {
            return { x: e.pageX, y: e.pageY };
        }
        return {
            x: e.clientX + document.body.scrollLeft - document.body.clientLeft,
            y: e.clientY + document.body.scrollTop - document.body.clientTop
        };
    }
    function getMouseOffset(obj, e) //Returns mouse offset
    {
        e = e || window.event;

        var oPos = getPosition(obj);
        var mPos = getMouseCoords(e);
        return { x: mPos.x - oPos.x, y: mPos.y - oPos.y };
    }
    function getPosition(e) //Gets the x,y location of a supplied object
    {
        var left = 0;
        var top = 0;

        //Recurse through DOM adding offsets
        while (e.offsetParent) {
            left += e.offsetLeft;
            top += e.offsetTop;
            e = e.offsetParent;
        }

        left += e.offsetLeft;
        top += e.offsetTop;

        return { x: left, y: top };
    }
}
}();