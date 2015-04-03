var wid = 1100,
	heig = 150,
	centerWid;

var factor = 40;
var visTimeline, eventsEnter;

function startTimeline(highlightedId) {
  	
	var tmp;
	
	$.each(code, function(i, v) {
    if (v.Abrev == projectName) {
        tmp=v.Name;
        return false;
    }
	});  	

  	$("#TimelineTitle").text((tmp+" Timeline").toUpperCase());
  	
  	if(rootTimeline.length > 15 && rootTimeline.length <= 22) { factor = 28;}
  	if(rootTimeline.length > 22) { factor = 22;}
  	
  	wid = factor*(rootTimeline.length-1);
	
 	if($("#timeline").width()>10 && $("#timeline").width()<wid){ wid = $("#timeline").width(); }
	
	if($("#timeline").height()>10){ heig = $("#timeline").height(); }
	
		
	//Reserve the space for the visualization	
	visTimeline = d3.select("#timeline").append("svg:svg")
			.attr("class", "alignCenter")
			.attr("width", wid)
			.attr("height", heig);

	var xstart = ($("#timeline").width() - wid)/2 + 30;
	var ystart = heig/2 +2;

	//Draw a line big enough.
	var timeline = visTimeline.append("svg:rect")
			  .attr("y", ystart )
			  .attr("x", xstart)
			  .attr("width", wid)
			  .attr("height", 2)
			  .attr("fill", "#3f3f3f")
			  .attr("rx", 2)
			  .attr("ry", 2);

	drawLegend(xstart, ystart);	  
			  
	updateTime(highlightedId);

	function updateTime(highlighted) {
	
		var event = visTimeline.selectAll("g.event")
							.data(rootTimeline);
							
		eventsEnter = event.enter().append("svg:g")
  	  		.attr("class", "event");

		var motivationEnter  = eventsEnter.append("svg:line")
							.attr("class", 'motivation')
							.attr("stroke","#f0f0e0");

		//Make the main circle for each of the events
		eventsEnter.append("svg:circle") 	
  		 		  .attr("class", 'eventStyle')
    			  .attr("r", "8px")
    			  .attr("cx", function(d,i) {
    			  			return  xstart+(factor*i);})
    			  .attr("cy", ystart);
    			  
    	    			  
    	 eventsEnter.attr("fill", "#fff")
    	 			.attr("stroke-weight", "0.8px")
    	 			.attr("stroke", "#3f3f3f");
    	
    	var prevFill, prevD;
		  
    	eventsEnter.on("mouseover", function(d){
    					eventsEnter.select('.eventStyle').filter(function(data){ return (data.id ==d.id);})
    								.attr("r","9px");
    								
    					motivationEnter.filter(function(data){ return (data.id ==d.id);})
    								.attr("stroke-width","2.3px");
    								
    					var forTooltip = motivationEnd.filter(function(data){ return (data.id ==d.id);})
    								.attr("fill","#3f3f3f");
    								
    					//Add tooltip HERE
 						var sign = d.Motivation?d.Motivation<0?-1:1:0;
						var tooltipX = parseInt(forTooltip.attr("cx"));
 						var tooltipY = parseInt(forTooltip.attr("cy"))-8*sign ;
    					   			    				
   	     			    	

						var tmpToolTip = eventsEnter.append('g') 
 		    			 	  .attr("class","tooltipMot")  
 		    			 	  .attr("x", tooltipX ) 
							  .attr("y", tooltipY) 
							  .style("width", '100%');

 		    			tmpToolTip.append('svg:rect')
 		    				   	.style("fill", '#fff')
 		    					.attr("width", 20)
 		    					.attr("height", 14)
 		    					.attr("x", tooltipX - 10) 
							 	.attr("y", tooltipY - sign*10 - 10)
							 	.attr("stroke","none");
 		    			
 		    			tmpToolTip.append('svg:text')
 		    					  .attr("text-anchor", 'middle')  
								  .text(d.Motivation)
								  .attr("opacity", 1)
								  .attr("x", tooltipX) 
								  .attr("y", tooltipY - sign*10)
								  .style("font-size","8pt")
								  .style("font-weight","lighter")
								  .style("stroke","none")
								  .style("fill", "#3f3f3f");				
    				})
    				.on("mouseout", function(d){
    					eventsEnter.select('.eventStyle:not(.active)').filter(function(data){ return (data.id ==d.id);})
    								.attr("r","8px");
    					eventsEnter.select('.motivation').filter(function(data){ return (data.id ==d.id);})
    								.attr("stroke-width","1.5px");
    				    eventsEnter.select('.motivationEnding:not(.active)').filter(function(data){ return (data.id ==d.id);})
    								.attr("fill","#ffffff");	
    								
    				 	$(".tooltipMot").remove();										

    				})
    			    .on("click",function(d) {
   	     			    	
  			    	  		 d3.selectAll(".highlightedFactor").attr("r","8px")
  			    	  		 				.filter(function(data){ return (data ==prevD);})
   	     			    	  				.attr("fill", prevFill);
   	     			    		
   	     			    	
   	     			    	  d3.selectAll('.eventStyle:not(.highlightedFactor)').attr("r","8px")
   	     			    	  				.classed("active", false)
   	     			    	  				.attr("fill", "#fff");

   	     			    	
    			  			  eventsEnter.select('.eventStyle').filter(function(data){ return (data.id ==d.id);})
    								.classed("active", true)
    								.attr("r","10px")
    								.attr("fill", function(d) { 
    										prevFill = $(this).attr("fill");
    										prevD = d;
    										return  "#3f3f3f";});	
   								
    						  d3.selectAll('.motivation').attr("stroke-width","1.5px").classed("active", false);	
    			  				  motivationEnter.filter(function(data){ return (data.id ==d.id);})
    								.classed("active", true)
    								.attr("stroke-width","2px");	
    			    		 	 showEventDescription(d);
    			    		 
    			    		  d3.selectAll('.motivationEnding').attr("fill","#ffffff").classed("active", false);	
    			  				  motivationEnd.filter(function(data){ return (data.id ==d.id);})
    								.classed("active", true)
    								.attr("fill","#3f3f3f")	;
    			    		 	 showEventDescription(d);
    			    		 	 
    			    		/*  $('html, body').stop().animate({
         						   'scrollTop': $("#timelineLink").offset().top
     						   }, 900, 'swing', function () {
									return false;     
							   });*/	 
    			    		 			    	
    			      });
    		
    	//Make the motivation lines and their circle endings..
    	motivationEnter.attr("x1",function(d,i){
    						return xstart+(factor*i);
    						})
    					.attr("y1", function(d) { 
    							var sign = d.Motivation?d.Motivation<0?-1:1:0;
    							return ystart;})
    					.attr("x2",function(d,i) {
    							return (xstart+(factor*i));
    							})
    					.attr("y2",function(d) { 
    							var sign = d.Motivation?d.Motivation<0?-1:1:0;
    							return (ystart - d.Motivation*10 );
    							})			
    	var motivationEnd = eventsEnter.append("svg:circle")
    					.attr("class", "motivationEnding")
    					.attr("r","1px")
    					.attr("cx",function(d,i){
    						return xstart+(factor*i);
    					})
    					.attr("cy", function(d) { 
    							var sign = d.Motivation?d.Motivation<0?-1:1:0;
    							return (ystart - d.Motivation*10 );
    							});
    		
    	
    	console.log("ID: "+highlighted); 
    			  		
    	 var highlightedEvents = eventsEnter.select('.eventStyle')
    	 							.filter(function(data){ return (data.id == highlighted);})
    	 							.each(showEventDescription)
    								.attr("r","10px")
    								.classed("active", true)
    								.attr("fill","#3f3f3f")	;	    				    			  		
    	
	 	 event.exit().remove();
	 	 
	 	 event = visTimeline.selectAll("g.event");

	}
	
}

function showEventDescription (d) {

		
		var factorsHtml = "";
		$("#eventFactors").html(factorsHtml);

		
		
		$("#eventDesc").html('<a id="eventLink"></a><div class="row"><div class="span2"> '+d.Time+'</div><div class="span2 alignCenter"><p style="margin-bottom:0px"> Motivation self-rating: '+d.Motivation+'</p></div></div><h3 style="text-align:left">'+d.Title+"</h3>"+
									'<p id="descr" style="text-align:left">' +d.Description+'</p>')
						.attr("class", "addBorder span4");
		
		if(d.GeneralLink) { $("#descr").append('<br><a href="'+d.GeneralLink+'" target="_blank"> Link </a>');}


		var quotesHtml= "";
		for(var k=1;k<=d.QuoteNo;k++){
		
			quotesHtml +='<p style="text-align:left"  class="greyish">"'+eval("d.QuoteText"+k.toString())+'"</p><p  style="line-height:130%;font-size:80%;text-align:left">'+eval("d.Who"+k.toString())+". "+eval("d.Translation"+k);
			
			if(eval("d.Link"+k.toString())) { quotesHtml+='<a href="'+eval("d.Link"+k.toString())+'" target="_blank" > Link</a>';}
			quotesHtml +="</p><br>";

		}
						$("#eventQuotes").html(quotesHtml);

		var factorsHtml = "";								

		for( var k in colorCode){
			if(eval("d."+k)==1) {
					factorsHtml +='<div class="rounded alignCenter" width="50%" style="margin-bottom:8px;color:white;font-size:12px;font-weight:light;opacity:0.8;background-color:'+colorCode[k]+'">'+k+'</div>';
			}				
		}
		
		$("#eventDesc").append(factorsHtml);
}

function showAllEventsByFactor (Factor) {


	eventsEnter.selectAll('.eventStyle')
		    	.classed("highlightedFactor", false)
				.attr("fill", "#fff")
				.style("stroke", "#3f3f3f")
    	 	 	.style("stroke-width", "0.5px");

	eventsEnter.selectAll('.eventStyle')
			   .filter( function(d) {
						return (eval("d."+getCleanString(Factor))==1); })
			   .classed("highlightedFactor",true)
			   .attr("fill", colorCode[getCleanString(Factor)])
			   .style("stroke", "#fff")
			   .style("stroke-width",3);			   
	
	 $('html, body').stop().animate({
            'scrollTop': $("#vizLink").offset().top
        }, 900, 'swing', function () {
		return false;     
	   });
}

function drawLegend(xstart, ystart){

	var legend = visTimeline.append("svg:g")
						.attr("class", "legend");
	

	var legendLine = legend.append("svg:line")
			  .attr("y1", ystart )
			  .attr("x1",xstart - 100 )
			  .attr("x2", xstart - 10)
			  .attr("y2", ystart)
			  .attr("stroke", "#3f3f3f")
			  .attr("stroke-width","0.2")
			  .attr("stroke-dasharray", "5,5");
	
	var lengendMot = legend.append("svg:line")
			  .attr("y1", ystart -40 )
			  .attr("x1",xstart - 100 )
			  .attr("x2", xstart - 100 )
			  .attr("y2", ystart + 40)
			  .attr("stroke", "#3f3f3f")
    	 	  .attr("stroke-width", "0.2px")
    	 	  
	legend.append("svg:circle")
    			.attr("r","1px")
    			.attr("cx", xstart - 100)
    			.attr("cy",ystart-40);
  	legend.append("svg:circle")
    			.attr("r","1px")
    			.attr("cx", xstart - 100)
    			.attr("cy",ystart+40);
    			
	legend.append("svg:text")
			.attr("class", "legendText")
			.attr("text-anchor", "middle")
			  .attr("x", xstart -100 )
			  .attr("y", ystart - 66)
			  .append("svg:tspan")
			  .text("Increase in")
			  .append("svg:tspan")
			  .attr("dy", "1em")
			  .attr("dx", "-4.6em")
			  .text("motivation");

	legend.append("svg:text")
			.attr("class", "legendText")
			.attr("text-anchor", "middle")
			  .attr("x", xstart -100 )
			  .attr("y", ystart + 56)
			  .append("svg:tspan")
			  .text("Decrease in")
			  .append("svg:tspan")
			  .attr("dy", "1em")
			  .attr("dx", "-5em")
			  .text("motivation");
	
	legend.append("svg:text")
			.attr("class", "legendText")
			.attr("x", xstart -80 )
			.attr("y", ystart - 8)
			.text("Time");
	
	
/*	legend.append("svg:line")
			  .attr("y1", ystart )
			  .attr("x1",xstart - 100 )
			  .attr("x2", xstart - 60 )
			  .attr("y2", ystart)
			  .attr("stroke", "#000")
    	 	  .attr("stroke-width", "1px")	  */
    				  
}