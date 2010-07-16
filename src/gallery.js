jslib.gallery = function(){
	function init(){
		var thumbs = document.getElementsByTagName("a");
        for (var i = 0; i < thumbs.length; i++) {
            thumb = thumbs[i];
            if (thumb.getAttribute("rel") == "jslib-gallery")
            {
                thumb.onclick = clicked;
            }
        }
	};
	function clicked(){
		var fullPic = this.href
        var title = this.getAttribute("title");
        
        var image = document.createElement("img");
        image.setAttribute("src", fullPic);
        var mainImage = document.getElementById("jslib-gallery");
        mainImage.innerHTML = "";
        mainImage.appendChild(image);
        
        var caption = document.getElementById("title");
        caption.innerHTML = title;
        
        return false;
	};
	jslib.onload(function(){
		init();	
	});
}();
