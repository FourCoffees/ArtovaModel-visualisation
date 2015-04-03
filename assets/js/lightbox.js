/****************************************
	Barebones Lightbox Template
	by Kyle Schaeffer
	http://www.kyleschaeffer.com
	* requires jQuery
****************************************/

// display the lightbox
function lightbox(insertContent, ajaxContentUrl){

	// jQuery wrapper (optional, for compatibility only)
	(function($) {
	
		// add lightbox/shadow <div/>'s if not previously added
		if($('#lightboxVIS').size() == 0){
			var theLightbox = $('<div id="lightboxVIS" class="vis"/>');
			var theShadow = $('<div id="lightbox-shadow"/>');
			$(theShadow).click(function(e){
				closeLightbox();
			});
			$('body').append('<a href="#" onclick="closeLightbox();"><img id="close" src="assets/img/close.png"/></a>');
			$('body').append(theShadow);
			$('body').append(theLightbox);

		}
		
		// remove any previously added content
		$('#lightboxVIS').empty();
		
		// insert HTML content
		if(insertContent != null){
			$('#lightboxVIS').append(insertContent);
		}
		
		// insert AJAX content
		if(ajaxContentUrl != null){
			// temporarily add a "Loading..." message in the lightbox
			$('#lightboxVIS').append('<p class="loading">Loading...</p>');
			
			// request AJAX content
			$.ajax({
				type: 'GET',
				url: ajaxContentUrl,
				success:function(data){
					// remove "Loading..." message and append AJAX content
					$('#lightboxVIS').empty();
					$('#lightboxVIS').append(data);
				},
				error:function(){
					alert('AJAX Failure!');
				}
			});
		}
		
		// move the lightbox to the current window top + 100px
		$('#lightboxVIS').css('top', $(window).scrollTop() + 100 + 'px');
		$('#close').css('top', $(window).scrollTop() + 110 + 'px');

		
		
		// display the lightbox
		$('#lightboxVIS').show();
		$('#lightbox-shadow').show();
		$('#close').show();

	
	})(jQuery); // end jQuery wrapper
	
}

// close the lightbox
function closeLightbox(){
	
	// jQuery wrapper (optional, for compatibility only)
	(function($) {
		$("#makeVizBefore").append($("#makeViz"));

		// hide lightbox/shadow <div/>'s
		$('#lightboxVIS').hide();
		$('#lightbox-shadow').hide();
	 	$('#close').hide();

		// remove contents of lightbox in case a video or other content is actively playing
		$('#lightboxVIS').empty();
	
	
	})(jQuery); // end jQuery wrapper
	
}