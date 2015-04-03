/* ===================================================
 * artovamodel-vis overview.js
 * artovamodel.fi/visual-eng
 * ===================================================
 * FourCoffees 2013
 *
 * Licensed under the MIT License
 * ========================================================== */
var force, link, vis, nodes, navSvg;

//What is called by the other file..
function overviewViz(elementIdToAppend) {

 $('#part1').height($(document).height() - parseInt($("#part1").position().bottom  ));

 force = d3.layout.force()
    .linkDistance(function(d) { 
    	if(d.target.children || d.target._children) { return 100;} 
    	else { return 25; }})
    .charge(-320)
    .gravity(0)
    .linkStrength(0.8)
    .friction(0.7)
    .size([w, h]);

//Main Visualization
 vis = d3.select("#"+elementIdToAppend).append("svg:svg")
    .attr("width", w)
    .attr("height", h);
 
 //Align the visualization to the twitter bootstap div containing it
 if($("#"+elementIdToAppend).width()){ centerW = $("#"+elementIdToAppend).width()/2; }
 
 // Navigation circles   
 navSvg = d3.select("#textNavigation").append("svg")
    				   .attr("width", 250)
  					   .attr("height", 20);		   
    
//Extra circle to show the selected nodes..
var nodeSelected;

	if(typeof root != 'undefined') {
		showInfo(root,0);	
	}else{
	console.log("HETESDGSRHSRGHS");
	Tabletop({
      	       key: "XXXXX", //Add Google spreadsheet url key here for factors & descriptions.
     	       callback: showInfo,
      	       simpleSheet: true,
      	       debug : true
      });

    }
    function showInfo (data, tablet) {     
    	  root = makeToJson(data);
      	  update();
    } 	   
}


 //Find the Initial Positions of the Nodes:      
  function initialize() {
	  root.x = centerW;
	  root.y = h / 2; 
	  root.fixed=true;

	  nodes.filter(function(d) { return (d.level==1);})
	  		.forEach( function(d) { 
	  			radius = getRadius(d);
    			theta = 72*d.position; 	
	 			d.x = root.x - radius*Math.cos(theta);
				d.y = root.y - radius*Math.sin(theta);
	  });
 }

//EVERYTHING IS IN HERE :)
function update() {

   nodes = flatten(root);
   links = d3.layout.tree().links(nodes);
         
 
  initialize();
  
  // Restart the force layout.
  force.nodes(nodes)
       .links(links)
       .start();
	
  // Update the links…
  var link = vis.selectAll("line.link")
      .data(links, function(d) { return d.target.id; });

	var theta;
	var radius;
	
   /* Enter any new links.
    * Give some offset between the Nodes and the Links..
    * offset is the radius --> the link goes to the side no the center of node
    * ( original + r*sin(theta) ) 
   */  
  link.enter().insert("svg:line", ".node")
      .attr("class", function(d) { return ((d.source.level>0) ? "subfactor ": "")+"link";})
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) {              
                radius = getRadius(nodes[d.source.index]); 
    			theta = getangle(d.source.x, d.source.y, d.target.x, d.target.y); 
        		return (d.target.x - radius*Math.cos(theta)); })
      .attr("y2", function(d) { 
                radius = getRadius(nodes[d.source.index]); 
    			theta = getangle(d.source.x, d.source.y, d.target.x, d.target.y); 
        		return (d.target.y - radius*Math.sin(theta)); });
  	
  // Exit any old links.
  link.exit().remove();

  // Update the nodes…
  var node = vis.selectAll("g.node")
      .data(nodes, function(d) { return d.id; });


//  node.select("circle");

  // Enter any new nodes.
  var nodeEnter = node.enter().append("svg:g")
  	  .attr("class","node");

  var node_drag = d3.behavior.drag()
        .on("dragstart", dragstart)
        .on("drag", dragmove)
        .on("dragend", dragend);
 
// Define Node reactions: 		
 nodeEnter.filter( function(d) { return (d.level != 0); })
      .on("click", click)
      .call(node_drag)
      .each(function(d,i) { return toggleChildren(d); });
      
  nodeEnter.append("svg:circle") 	
  	  .attr("class", findClass)
      .attr("r", getRadius)
	  .on("mouseover", function(d) { $(this).css("stroke-width","6px");})
      .on("mouseout", function(d) { $(this).css("stroke-width","8px")})
	  .forEach( function(d) { 
	  			if(d.level>0){
	  			radius = getRadius(d);
    			theta = 72*d.position; 	 
	 			d.x = root.x - radius*Math.cos(theta);
				d.y = root.y - radius*Math.sin(theta);}
	  });
  	  
 
 // Put the names of the nodes on the visualization, differently depending on level. 
 var textFactor = nodeEnter.append("svg:text")
     .attr("text-anchor", function(d) { 
      			if(d.x == root.x || d.Name=="External Communications") { return "middle";}
      			if(d.x < root.x ) { return "end";}
      			if(d.x > root.x) {return "start";}})
     .attr("dx", function(d) { if(d.level>0){  return "0.35em"; } })
     .attr("dy", function(d) {	if(d.level>0){ return "2.55em"; } else { return "0em";} })
     .attr("class", function(d) {  
     		var cla = ((d==root) ? "root" : "factor"); 
     		if(d.level==2) { 
     			cla="subText"; //addBox(d);
     		} 
     		return cla; 
     		})
     .text(function(d) { if(d.level < 2 && (d.Name).length < 15 && d.level!=0) { return (d.Name).toUpperCase();}
     					 if(d.level==2 && ((d.Name).split(" ")).length <2) { return (d.Name).toUpperCase();}
     					 });
           
     // Making custom text-wrap since it doesnt happen automaticaly.. 
     textFactor.each( function(d) { if( ((typeof d.Name !='undefined') && (d.Name).length >= 15) && d.level<2 || (d.level==0))
     			{ addTspanLevel1(d);}});    
   
     textFactor.each( function(d) { if( ((typeof d.Name !='undefined') && ((d.Name).split(" ")).length >= 2) && d.level==2 )
     			{ addTspanLevel2(d);}});    
							 				
     function addTspanLevel2(d) {
        
		 var addBr2 = (d.Name).split(" "); console.log(addBr2);
     	 if( addBr2.length == 2) {
	      				return addTspanLevel1(d);
	     }
	     else {
  	
     		for(var j=0; j<2; j++) {
	  
	   			  textFactor.filter(function(node) { return (d == node);})
	   			  		.append("tspan")
	     			   	.attr("y", function(dat){ return (3.8*j+"em");})
 	  					.attr("x", function(dat){ return (1+"em");})
	     			    .text(function(dat) { 
	     			    		var ret="";
	     			    		if(addBr2.length%2==1) {
	     			    			for(var k=(Math.floor(addBr2.length/2))*j; k<(Math.floor(addBr2.length/2)+j*3); k++) {			    
		     			    			if(addBr2[k]!=undefined){    	
	 			    					ret+= addBr2[k].toUpperCase()+" "; }
	     			    			}
	     			    		}
	     			    		else{
	     			     			for(var k=j*2; k<(Math.ceil(addBr2.length/2)+j*2); k++) {			    
		     			    			if(addBr2[k]!=undefined){    	
	 			    					ret+= addBr2[k].toUpperCase()+" "; }
	     			    			}
	     			    		}
		   			    		console.log(ret);
	    	 		    		return ret;
	 			    			
	     			    	});
	     	}
	     	addBr = "";
 	 }   
	}

	function addTspanLevel1(d) {
        
			var  addBr = (d.Name).split(" ");
     		for(var j=0; j<addBr.length; j++) {
		  
	   			  textFactor.filter(function(node) { return (d == node);})
	   			  		.append("tspan")
	     			   	.attr("y", function(d){ if(d.level==0){ return 1.2*j+"em";} else { return (3.8*j+"em");}})
 	  					.attr("x", function(d){ if(d.level==0){ return 0;} else { return (1);}})
	     			    .text(addBr[j].toUpperCase());
	     	}
	     	addBr = "";
 	 }   
       

  // Exit any old nodes.
  node.exit().remove();

  // Re-select for update.
  link = vis.selectAll("line.link");
  node = vis.selectAll("g.node");


   force.on("tick", tick);

  
  /* This function updates the node and link positions
  * In this case the updates are similar to the initializations.
  */
   function tick() {  	
  	
  	var theta;
  	var radius; 

  	  	   	  	  	
    link.attr("x1", function(d) { 
    		return (d.source.x); })
        .attr("y1", function(d) { return (d.source.y); })
        .attr("x2", function(d) {
                radius = getRadius(nodes[d.target.index]); 
    			theta = getangle(d.source.x, d.source.y, d.target.x, d.target.y); 
        		return (d.target.x - radius*Math.cos(theta)); })
        .attr("y2", function(d) { 
                radius = getRadius(nodes[d.target.index]); 
    			theta = getangle(d.source.x, d.source.y, d.target.x, d.target.y); 
        		return (d.target.y - radius*Math.sin(theta)); });
     
   	node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
   
  }
         
	/* The following 3 functions define the dragging behavior of the 
    *  nodes. When start, while it is being dragged and when it
    *  finishes.
    */   
   function dragstart(d, i) {
       // force.stop() // stops the force auto positioning before you start dragging
    }

   function dragmove(d, i) {
		//wiggle when trying to drag..
	}
	 
   function dragend(d, i) {
    //    d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
        tick();
        force.resume();
    }	
}



// Does what the name suggests
function toggleChildren(d) {
 
  if (d.children) {
   			 d._children = d.children;
  			 d.children = null;
 	 } else {
 			 d.children = d._children;
  			 d._children = null;
  }
  update();
}


//Defines on click events 
function click(d) {
  
   /* Show which node is selected. 
   *   IF LEVEL 1: Add a circle that show which on is selected.. 
   *   IF LEVEL 2: toggle opacity...
   *  And Toggle children on click.
   */ 	
   freezeNodesExcept(d, nodes); 
   d3.selectAll("circle.subfactor")
	 .classed("active",false);
  
   d3.selectAll(".factor")
	 .style("opacity","1");
   
   d3.selectAll("line.link")
   		.style("stroke-width", "1px")   	
   		.filter(function(dat) { 
   				return (dat.target==d);})
   		.style("stroke-width", "1.5px");   	
   			
   	for(var j=1;j<4;j++){		
	  	$("#overlay_"+j).width("0");
	}
	
	d3.selectAll(".imgThmb").classed("sel",false);
    		   
   if(d.level<2) {

    var select = document.getElementById(d.Name); 
		
	//Check if already selected, then only toggle the child nodes
    if((typeof nodeSelected !='undefined') && select) {      	
 		toggleChildren(d);
    }
    else {
      	 if( typeof nodeSelected !='undefined') { nodeSelected.remove(); }  
      	 	 nodeSelected = vis
   				  .append("svg:circle")
  				  .attr("class", "selected")
  				  .attr("id", d.Name)
  				  .attr("r", function() { return maxDiameter/(2*scaleParameter[1])+3;})
  	   			  .attr("transform","translate(" + d.x + "," + d.y + ")");      
	      	if( d.children ) {}
	     else { toggleChildren(d); }
	    }
	
	}
	else {
					
			var dataClass = getCleanString(d.Parent);
		
			var tmpParent = d3.selectAll("g circle."+dataClass);
						
			tmp = tmpParent.filter(function (dat) {
						return (dat.Name == d.Name);});
		
		 	var tmpClass = tmp.attr("class");		
		 	tmp.attr("class", tmpClass+" active");	
		 	
		 	//Toggle the Parent text opacity if it's child is active
			if(d._children==null) {
				var tmpOrig = $('circle[class^="'+dataClass+'"]:not(.subfactor)').next().css("opacity","0.1");			
 			}	
 			
 			//Show selected Parent
 			if( typeof nodeSelected !='undefined') { nodeSelected.remove(); }   			
 			nodeSelected = vis
   				  .append("svg:circle")
  				  .attr("class", "selected")
  				  .attr("id", d.Parent)
  				  .attr("r", function() { return maxDiameter/(2*scaleParameter[1])+3;})
  	   			  .attr("transform","translate(" + tmpParent.property("__data__").x + "," + tmpParent.property("__data__").y + ")");      		 	    				
			
	}
	
		
	showDescritpion(d,"#description");
	if(d.level==2) { 
		$("#more").css(  { "border-radius": 25,"border": function() { return "1px solid"+colorCode[getCleanString(d.Parent)];}, "margin-left":60});
		highlightExamples(d); }	
	else {		
		$("#more").css(  { "border-radius": 25,"border": function() { return "1px solid"+colorCode[getCleanString(d.Name)];},"margin-left":60});
	}
	update();
}

//Opens the Description on the Left of the visualization.
function showDescritpion(dataOrig,where) {
  		
  	// Show main text body and title	
  	function showDescritpionText(dataOrig,where) {
  		var i=1;
	    $("#titleDesc").html(dataOrig.Name);
	  	var textString='<div style="width:100%;" ><p>';
		var textStringMore="";
		
	   	$(where).hide("slide",200, function() {
	    		$(this).html(textString).show(60);
	    });
	    
      	while(eval("dataOrig.DescriptionP"+i) !="null" && i<6) {
	      	textString += eval("dataOrig.DescriptionP"+i)+"</p>";
	      	i++;
	    }
	    
	    if(dataOrig.questions == "yes") {
		    textStringMore += '<div class="span5"><p class="span1 alignCenter"> <a href="#makeYourOwn" onclick="clicked=1;hideParts();showPart(2,&quot#li2&quot);showQuestion(checkFactor(&quot '+dataOrig.Name+'&quot));"><img src="assets/img/questions.png"></a></p><div class="span2" style="margin:0"><p class="subtext2" style="font-size:9pt;padding-top:5px;margin-bottom:5px;width:100%;margin:0 auto;">Self-reflective questions about '+dataOrig.Name+'</p></div></div>'
		}
		    
	    textString +="</div>";	      
	      
	    $("#more").empty();
		$("#more").hide("slide",200, function() {
	    		$(this).prepend('<h2 style="font-size:120%;padding-bottom:10px"class="alignCenter"> Explore further through:</h2>');
	    		$(this).append(textStringMore).show(60);
	    });
	    
	    
	    //Update selection
	    navSvg.selectAll("circle").each( function(d){return d;})
			  			.attr("class", function(d,i) { 
			  				if( (dataOrig.level == 2 && (dataOrig.position+1) == (i)) || (dataOrig.level==1 && i==0) ) {  isSelected = "isSelected";}
			  				else {  isSelected = "";}
			  				return "navCircles "+ navDataClass+" "+isSelected;});
	
	}
		
	// Show navigation	
	var navDataClass = (dataOrig.level == 2) ?  dataOrig.Parent : dataOrig.Name;
	
	navDataClass = getCleanString(navDataClass);	
		
	var branch = vis.selectAll(("."+navDataClass));		
	navData = branch[0];
					
	var navCircles = navSvg.selectAll("circle")
							.data(navData);		
		
	navCircles.enter()
			  .append("circle")
			  .attr("r", function(d, i){ 
			  		if(i==0){ return 6;} else{ return 4;}} )
			  .attr("cx",function(d,i) { return 16*i+8;})
			  .attr("cy", 10)
			  .on("mouseover", function(d) { $(this).attr("r",parseInt($(this).attr("r"))+1)})
			  .on("mouseout",function(d) {
			  	 $(this).attr("r",parseInt($(this).attr("r"))-1)});
			  
		
	navCircles.exit().remove();
    	
	navCircles.on("click", function(dataNull,i) { 
				d3.selectAll("circle.subfactor")
	 				.classed("active",false);
				
				if(i==0) { var dat = navData[i]['__data__'].index;
					 		showDescritpionText(nodes[dat],where);}
				else { var dat = navData[i]['__data__'].index;
		
						 	var tmp = navData[i].getAttribute("class");		
						 	navData[i].setAttribute("class", tmp+" active")				 	
							console.log(navData[i].getAttribute("class"));
							
					 		showDescritpionText(nodes[dat],where);
					 		
					 	    //Toggle the Parent text opacity if it's child is active
							if(nodes[dat]._children==null) {
							    var dataClass = getCleanString(nodes[dat].Parent);
								var tmpOrig = $('circle[class^="'+dataClass+'"]:not(.subfactor)').next().css("opacity","0.1");			
 							}
				 		}
			 
			  });
	
	
	
	showDescritpionText(dataOrig,where);	  
			 			  
}

//Show on overview example icons that there are examples for this region
function highlightExamples (d) {
	
	
	$("#more").append('<div class="span6 subtext2" style="width:100%"><div class="span6" id="imgs" style="margin-left:0px"> </div></div>');
		
	//Find the 3 examples from the projects
	for(var j=1; j<4; j++) {
			
		var proj = eval("d.ExampleProject"+j);
		proj = proj.split("_");
		
		if(proj=="") { return;}
		
		//project name
		var projName = proj[0];
		var highlight = new Array(proj[1]);
		
		console.log("Name: "+projName+" Higl: "+highlight);
		
		var name;
		$.each( code, function(j, item) { 
	 	if( code[j].Abrev == projName ) { 
	 		name = code[j].Name; 
	 		}  
		 });
		
	
		 $("#imgs").append('<div class="span1"><a onclick="clicked=1;hideParts();showPart(3);change(&quot '+projName+'&quot,&quot '+highlight+'&quot)" class="projectLink"  id="'+projName+'Link">'
		 				+'<img style="padding:0;" src="assets/img/project_icons/'+projName+'.png"></a><p style="font-size:8pt;padding-top:4px;margin-left:-26px;text-align:center">'+name+'</p></div>');
		

	}
		
}

function gotoArtovaModel(str) {

 $('html, body').stop().animate({
            'scrollTop': $("#"+str).offset().top - 50
        }, 900, 'swing', function () {
		return false;     
	   });
	

}


