/* ===================================================
 * artovamodel-vis projects.js
 * artovamodel.fi/visual-eng
 * ===================================================
 * FourCoffees 2013
 *
 * Licensed under the MIT License
 * using d3.js, tabletop.js, jquery.js
 * ========================================================== */
 
 
/*
* Shows the timeline and visualization of a project
* takes as input an array of events highlighted already 
* (for example when coming from the overview)
*/

var forcePro,linksPro, visPro, nodesPro, rootPro;
var rootTimeline;
var projectName, projectInfo;
var highlighted;
var tooltipsNo = {};

/*
* Called onLoad(). Calls the data from Google Spreadsheets
* if they are not defined already..
*/
function projectViz() {
     
	  var url = window.location.search.substring(1);
	  var tmp = url.search("highlighted");
	  var tmp2 = url.search("name");
	  
	  highlighted = url.substring(tmp+12);	  
	  projectName = url.substring(tmp2+5, tmp2+8);
	
	  console.log("PROJECT: "+projectName+" HIGHLIGHTED: "+highlighted); 
		
	  if( projectName[2] == "&") { projectName = url.substring(tmp2+5, tmp2+7);}
	
  	  //Get data from Google Spreadsheets if its not loaded already.
		if(typeof root != 'undefined') {
		  	rootPro = root; showInfo(rootPro,0);
  	 	}else {
	
  	  a = Tabletop({
      	       key: "XXXX", // Add Google Spreadsheet URL here for projects.
     	       callback: showInfo,
      	       simpleSheet: true,
      	       proxy: 'https://s3.amazonaws.com/flatware-live',
      	       debug : true
      	  });
   	  }
   	
   	//Load second spreadsheet after loaded the first  
   function showInfo(data, tabletop) {
 	
 	 if(tabletop!=0) {rootPro = makeToJson(data);}
	 var keySt = 0; 
	 
	 $.each( code, function(j, item) { 
	 	if( code[j].Abrev == projectName ) { 
	 		keySt = code[j].Link; 	  console.log("projectName "+projectName);
	 		}  
	 });
	 	 
  	 b = Tabletop({
            key: '"'+keySt+'"',
            callback: showInfoTime,
            simpleSheet: true,
            proxy: 'https://s3.amazonaws.com/flatware-live',
            debug : true
        });

 	} 
   
   //Now we have loaded all of them, start visualizing!
	function showInfoTime(data, tabletop) { 	 
 		rootTimeline = makeToJsonTimeline(data); 
 		
 		d3.json("assets/json/"+projectName+"_"+language+".json", function(error, json) {
					  if (error) return console.log(error);
					  projectInfo = json[0]; 
					  showProjectInfo();

		  });
 			 
		startTimeline(highlighted);
		startViz(); 
 		$('#loading').remove();	 
		if(highlighted!="none") { 
			
		 $("#back3").css("display","inline"); 
		
	 	 $('html, body').stop().animate({
            'scrollTop': $("#timelineLink").offset().top + 3000
        }, 900, 'swing', function () {
		return false;     
	   });
	}
	 }
	 	
}

function showProjectInfo(){ 

	//Add image Logo of project:
	d3.selectAll("#first").append("img").attr("src", "assets/img/"+projectName+"_logo.png");	
	
	$("#ProjTitle").text(projectInfo.Name);
	$("#description").text(projectInfo.Description);
		
	if(projectInfo.DosDonts) {
			$("#dosdonts").html('<br><p> You can find the "Dos and Dont\'s" advice from the "'
				+projectInfo.Name+'" team <a href="'+projectInfo.DosDonts+'" target="_blank"> here.</a></p>');
	}

	
	
  d3.select('#team h3').text(projectInfo.TeamNo+" people team");	
  d3.select('#team p').text(projectInfo.Team);

  d3.select('#designers h3').text(projectInfo.DesignersNo+ " Designers");	
  d3.select('#designers p').text(projectInfo.Designers);

  d3.select('#participants h3').text(projectInfo.ParticipantsNo+ " Participants");	
  d3.select('#participants p').text(projectInfo.Participants);

  d3.select('#budget h3').text("Final Budget: "+projectInfo.Budget+" €");	
  d3.select('#budget p').text("Scheduled Budget was: "+projectInfo.ScheduledBudget+"€");
	
  d3.select('#partners h3').text(projectInfo.PartnersNo+" Partners");	
  d3.select('#partners p').text((projectInfo.Partners).substr(0,50)+" and more!");

  d3.select('#also h3').text("Also");	
  d3.select('#also p').text((projectInfo.Also).substr(0,50));
	
								
  d3.selectAll(".Bckgrclr").style("background-color","#ffffff");
								
								
}


/*
* Is called on google spreadsheet callback. 
* Initializes the visualization
*/
function startViz() {
  // Start Visualization  
  forcePro = d3.layout.force()
    .linkDistance( function(d) { 
    			if(d.source.level==0) { return 200*findlength(d.target); } 
    			else { return 10;}
    		}) // Magic with numbers happens here
    .charge(-320)
    .gravity(0)
    .linkStrength(0.8)
    .friction(0.7)
    .size([w, h]);

	//Main Visualization
 	visPro = d3.select("#vizualProj").append("svg:svg")
    		.attr("width", w)
    		.attr("height", h - 20);

	 //Align the visualization to the twitter bootstap div containing it
 	if($("#vizualProj").width()){ centerW = $("#vizualProj").width()/2+20; }
  	if($("#vizualProj").height()) { centerH = $("#vizualProj").height()/2; }

	//Extra circle to show the selected nodes..
   var nodeSelected;
	
   updatePro();

   
	
}
      

 /*
 * Find the occurrence of the factors in the timeline
 * This defines the length of the link. Save it 
 * to show it as a tooltip
 */
 function findlength(d) {
 	
 	var nestedRoot = rootTimeline.filter(function(data) {
 						if( (data[getCleanString(d.Name)])==1) {
 								return true;
 								}});
 
 										
 	tooltipsNo[d.Name] = (nestedRoot.length);
 	if((nestedRoot.length)<5) { 
 		return 	(nestedRoot.length)/(rootTimeline.length)*1.2;
 	}
 	return (nestedRoot.length)/(rootTimeline.length);
	
	
 }  
   
/*
* Find the Initial Positions of the Nodes 
* (also give distance so the links dont touch the nodes..)      
*/ 
  function initializePro() {
	  rootPro.x = centerW;
	  rootPro.y = centerH; 
	  rootPro.fixed=true;

	  nodesPro.filter(function(d) { return (d.level==1);})
	  		.forEach( function(d) {
	  			radius = getRadius(d); 
    			theta = 72*d.position; 	
	 			d.x = rootPro.x - radius*Math.cos(theta);
				d.y = rootPro.y - radius*Math.sin(theta);
	  });
	  
 	}

/*
* Main function that creates the visualization
* Everything happens here :)
*/
function updatePro() {

   		nodesPro = flatten(rootPro);
   	 	linksPro = d3.layout.tree().links(nodesPro);
 		
 		initializePro();
  
 		// Restart the force layout.
  		forcePro.nodes(nodesPro)
       		.links(linksPro)
       		.start();
	
  		// Update the links…
  		var linkPr = visPro.selectAll("line.link")
      				.data(linksPro, function(d) {  return d.target.id; });
		
		var theta;
		var radius;
	
	   /* Enter any new links.
	    * Give some offset between the Nodes and the Links..
	    * offset is the radius --> the link goes to the side no the center of node
	    * ( original + r*sin(theta) ) 
	   */  
	  linkPr.enter().insert("svg:line", ".node")
    	  .attr("class", "link")
    	  .attr("x1", function(d) { return d.source.x; })
    	  .attr("y1", function(d) { return d.source.y; })
    	  .attr("x2", function(d) {  
    	            radius = getRadius(nodesPro[d.source.index]);  
    				theta = getangle(d.source.x, d.source.y, d.target.x, d.target.y); 
    	    		return (d.target.x - radius*Math.cos(theta)); })
    	  .attr("y2", function(d) {   
    	            radius = getRadius(nodesPro[d.source.index]);
    				theta = getangle(d.source.x, d.source.y, d.target.x, d.target.y); 
    	    		return (d.target.y - radius*Math.sin(theta)); });
  	
  		
  		// Exit any old links.
 		linkPr.exit().remove();

  		// Update the nodes…
  		var node = visPro.selectAll("g.node")
			      .data(nodesPro, function(d) { return d.id; });


		// Enter any new nodes.
	    var nodeEnter = node.enter().append("svg:g")
  	  		.attr("class", "node")
  	  		
		// Define Node reactions: 		
 		nodeEnter.filter( function(d) { return (d.level != 0); })
 		    .on("mouseover", function(d) {
  
  		    		var tmpToolTip = visPro.append('g') 
 		    			 	  .attr("id","tooltipPr")  
 		    			 	  .attr("x", d.x + 20) 
							  .attr("y", d.y+ 5) 
							  .style("width", '100%');

 		    			tmpToolTip.append('svg:rect')
 		    				   	.style("fill", '#fff')
 		    					.attr("width", 60)
 		    					.attr("height", 15)
 		    					.attr("x", d.x + 10) 
							 	.attr("y", d.y);
 		    			
 		    			tmpToolTip.append('svg:text')
 		    					  .attr("text-anchor", 'start')  
								  .text(tooltipsNo[d.Name]+ " events")
								  .attr("opacity", 1)
								  .attr("x", d.x + 20) 
								  .attr("y", d.y  + 10);	
								  
 		     })
  			.on("mouseout", function(d) { 
  				$("#tooltipPr").remove();
  			})
    		.on("click", clickPro)
    		.each(function(d,i) { return toggleChildrenPro(d); });
    		
    	nodeEnter.append("svg:circle") 	
  		 		  .attr("class", findClass)
    			  .attr("r", function(d) {
    	  			if( d.level==0) {  
    	  			     var rad=  getRadius(d)*0.8;
    	  			     return rad;
    	  			} else {
	    	  			 var rad = getRadius(d)*0.8;
	    	  			 return rad;}
	    	  	})
	    	  
	   nodeEnter.selectAll("circle").filter(function(d){ return (d.level==1);})
	   		  .on("mouseover", function(d) { $(this).css("stroke-width","6px");})
      		  .on("mouseout", function(d) { $(this).css("stroke-width","8px")});
	    	  	
	  	 nodeEnter.forEach( function(d) {  
	  			if(d.level>0){console.log("RADIUSBEFORE " +d);
	  			radius = getRadius(d); 
    			theta = 72*d.position; 	 
	 			d.x = rootPro.x - radius*Math.cos(theta);
				d.y = rootPro.y - radius*Math.sin(theta);}
	  	  });
	  	  
	  nodeEnter.filter(function(d){ return (d.level==0 );})
					.attr("stroke-width", "0.3px")
    	 			.attr("stroke", "#f0f0f0");
  	  
  	  	
  	  		
 
 		// Put the names of the nodes on the visualization, differently depending on level. 
		 var textFactor = nodeEnter.append("svg:text")
    		 .attr("text-anchor", function(d) { 
      			if(d.x == rootPro.x || d.Name=="External Communications") { return "middle";}
      			if(d.x < rootPro.x ) {return "end"; }
      			if(d.x > rootPro.x) {return "start";}})
     		.attr("dx", function(d) { if(d.level>0){  return "0.35em"; } })
      		.attr("dy", function(d) {	if(d.level>0){ return "2.55em"; } else { return "0em";} })
    		.attr("class", function(d) {  return ((d==rootPro) ? "rootProj" : "factorProj");})
    		.text(function(d) { if( (d.Name).length < 15 && d.level!=0) { return (d.Name).toUpperCase();} 
    							});
            
 	   // Making custom text-wrap since it doesnt happen automaticaly.. 
       textFactor.each( function(d) { if( ((typeof d.Name !='undefined') && (d.Name).length >= 15) && d.level<2 || (d.level==0))
     				{ addTspan(d);}});    
       
       function addTspan(d) {
        	
        	var addBr;
        	
        	// Show project name not 'Artova Model'
			if(d.level == 0) {
    			for(var j=0; j<code.length; j++) {
    					if(code[j].Abrev == projectName) 
    						{ addBr =  (code[j].Name).split(" "); 
    						break;} 
					}
    		}				
    		else {  addBr = (d.Name).split(" "); }
    		
			//console.log(addBr);
     		for(var j=0; j<addBr.length; j++) {
     					  
	   			  textFactor.filter(function(node) { return (d == node);})
	   			  		.append("tspan")
	     			   	.attr("y", function(d){ if(d.level==0){ return ((1*j)-1)+"em";} else { return (3.8*j+"em");}})
 	  					.attr("x", function(d){ if(d.level==0){ return 0;} else { return (1);}})
	     			    .text(addBr[j].toUpperCase());
	     	}
	     	addBr = "";
 	 }   
     
       

 	 // Exit any old nodes.
 	 node.exit().remove();

  	// Re-select for update.
  	linkPr = visPro.selectAll("line.link");
  	node = visPro.selectAll("g.node");


   	forcePro.on("tick", tickPro);

  
	/* This function updates the node and link positions
 	 * In this case the updates are similar to the initializations.
	 */
   	function tickPro() {  	
  	
  		var theta;
  		var radius; 

  	  	   	  	  	
  	  linkPr.attr("x1", function(d) { return (d.source.x); })
    	    .attr("y1", function(d) { return (d.source.y); })
        	.attr("x2", function(d) { //MAGIC HERE AS BEFORE
            	    radius = getRadius(nodesPro[d.target.index]); 
    				theta = getangle(d.source.x, d.source.y, d.target.x, d.target.y); 
        			return (d.target.x - radius*Math.cos(theta)); })
        	.attr("y2", function(d) { 
            	    radius = getRadius(nodesPro[d.target.index]); 
    				theta = getangle(d.source.x, d.source.y, d.target.x, d.target.y); 
        			return (d.target.y - radius*Math.sin(theta)); });

	   	node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
   
  	}

} // End of Update
	
/*
* Defines on click events .
* In the project page by clicking on the project 
* you get the events highlighted that have affected..
*/
function clickPro(d) {
  
     freezeNodesExcept(d,nodesPro); 

	//Check if already selected, then only toggle the child nodes
    var select = document.getElementById(d.Name); 

    if(!select) {
      	 if( typeof nodeSelected !='undefined') { nodeSelected.remove(); }  
      	 	 nodeSelected = visPro
   				  .append("svg:circle")
  				  .attr("class", "selected")
  				  .attr("id", d.Name)
  				  .attr("r", function() { return maxDiameter/(2*scaleParameter[1])*0.8+3;})
  	   			  .attr("transform","translate(" + d.x + "," + d.y + ")");
  	 }
	
	showAllEventsByFactor( d.Name );
	updatePro();
	

}

/*
*  Does what the name suggests
*  Here it is only used when initializing 
*  (so as not to show the level 3)
*/
function toggleChildrenPro(d) {
 
  if (d.children) {
   			 d._children = d.children;
  			 d.children = null;
 	 } else {
 			 d.children = d._children;
  			 d._children = null;
  }
  updatePro();
}


