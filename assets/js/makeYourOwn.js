/* ===================================================
 * artovamodel-vis makeYourOwn.js
 * artovamodel.fi/visual-eng --> self-reflection questions
 * ===================================================
 * FourCoffees 2013
 *
 * Licensed under the MIT License
 * using d3.js, tabletop.js, jquery.js
 * ========================================================== */

/*
Reads questions from a google spreadsheet and visualises
the user's repsonses with a point system.
The visualisign happens by changing the area of  the 
correpsonding circle.
*/


var wid = 500,
	heig = 400,
	centerWidM;

var rootQue,forceQue,linksQue,nodesQue;
var factorBoard, visMake, factorCirclesEnter ;
var navSvgQ ;
var maxSize = 7, maxSizeFactor =22;
var  navCirclesQ;	
var checkedArray;
		
  	  				
function makeInit() {

	//Reserve the space for the visualization	
	visMake = d3.select("#makeViz").append("svg:svg")
			.attr("class", "alignCenter questionsViz")
			.attr("width", wid)
			.attr("height", 250);
			
 	//Align the visualization to the twitter bootstap div containing it
 	if($("#makeViz").width()){ centerWM = $("#makeViz").width()/2; }
	
	//Initialize Background Circles of Factors
	factorBoard= [	{ "id":"VisionGoals",
  	  				  "x": 3*centerWM/4,
  	  				  "y": heig/6+ heig/2
  	  				},
  	  				{ "id":"Group",
  	  				  "x": centerWM/2,
  	  				  "y": heig/3 + heig/2

  	  				},
  	  				{ "id":"PersonalResources",
  	  				  "x": 3*centerWM/2,
  	  				  "y": 3*heig/8+ heig/2

  	  				},
  	  				{ "id":"Partnerships",
  	  				  "x": 5*centerWM/4,
   	  				  "y": 5*heig/24+ heig/2

  	  				},
  	  				{ "id":"ExternalCommunications",
  	  				  "x": centerWM,
   	  				  "y": 3*heig/7+ heig/2

  	  				}];	
	
 	var factorCircles = visMake.selectAll("g.node")
  	  		.attr("class", "factorBoard")
  	  		.data(factorBoard);
  	  				   	
  	 navSvgQ = d3.select("#textNavigationQ").append("svg")
    				   .attr("width", $("#textNavigationQ").width())
  					   .attr("height", 20)
  					   .attr("class", "alignCenter");		   

  	  		
  	 factorCirclesEnter = 	factorCircles.enter().append("svg:g")
  	  				.attr("class", "node")
  	  				.append("svg:circle")
  	  				.attr("class", function(d){ return d.id+" circleBoard";})
  	  				.attr("r", 32)
  	  				.attr("cx", function(d,i ) { return  d.x})
  	  				.attr("cy",  function(d,i ) { return d.y})
  	  				.attr("fill", function(d) { return colorCode[d.id];})
  	  				.attr("opacity", "0.3");
  	  		
 		
	//  read the spreadsheet:
	Tabletop({
      	      key: "XXXX", //Add google spreasheet with questions & point system here
     	       callback: showInfo,
      	       simpleSheet: true,
      	       proxy: 'https://s3.amazonaws.com/flatware-live',
      	       debug : true
      });
    
    
      function showInfo (data, tablet) {     
    	  rootQue = makeToJsonQuestions(data);
      	  updateQuestions();
    } 

	
	checkedArray = new Array();
	
}

function updateFunctionality() {

	//Functionality of Circles
	factorCirclesEnter.on("mouseover", function(d) {
			$(this).css("opacity",0.6);
 		 	var tmpToolTip = visMake.append('g') 
 		   			 	  .attr("id","tooltipQ")  
 	    			 	  .attr("x", d.x + 50) 
						  .attr("y", d.y+ 5) 
						  .style("width", '100%');
	
			var tmp = nodesQue.filter(function(dat) { return (dat.level==1 && getCleanString(dat.factor) == d.id); });

 	   		tmpToolTip.append('svg:text')
 	  					  .attr("text-anchor", 'start')  
 	  					  .attr("class","factor")
						  .text(tmp[0].factor.toUpperCase())
						  .attr("opacity", 1)
						  .attr("x", d.x + 20) 
						  .attr("y", d.y  + 10)
						  .style("font-weight", "lighter")
						  .style("font-size","9px");					
    })
  	.on("mouseout", function(d) { 
  			$(this).css("opacity",0.3);
  			$("#tooltipQ").remove();
  			
  	})
    .on("click", clickQ);
	

}

function clickQ(d) { 

		visMake.selectAll(".linkQ").filter(function(dat) { 
						
						if(dat.source.level==1){
							return ( getCleanString(dat.source.factor)==d.id);
						}else { return false; }
						})
						.classed("open", true);

		
		var dataQ = nodesQue.filter(function(dat) { return (dat.level==1 && getCleanString(dat.factor) == d.id); })
		dataQ= dataQ[0];
				
		getTopNavigation(d, 0);
	
		showQuestion(dataQ.children[0]);
		
	    visMake.selectAll(".linkQ.open")
	    		  .data(linksQue, function(d) {  return d.target.id; })
			      .transition()	
			      .attr("stroke",function(dat) { if(dat.source.level==1) { return '#d0d0d0';}})		
				  .duration(1000)
			      .ease("elastic");
	}

function getTopNavigation ( d, whatIsD  ) {
	
	var dataQ, name, selected;
		
	if(whatIsD == 0 ) { //case of clicking immediately the background circles

	    dataQ = nodesQue.filter(function(dat) {  return (dat.level==1 && getCleanString(dat.factor)==d.id); })
		dataQ= dataQ[0];
		name = d.id;
		selected = dataQ.children[0];
	
	}else { //case d is immediately a factor or subfactor
		dataQ = nodesQue.filter(function(dat) { return (dat.level==1 && getCleanString(dat.factor)==getCleanString(d.factor) ); })
		dataQ= dataQ[0];
		name = d.factor;
		selected = d;
	}

	//Make navigation
	navCirclesQ = navSvgQ.selectAll(".circlesQ").data(dataQ.children);

 	navCirclesQ.enter()
			  .append("svg:circle")
			  .attr("class", function(dat) { return "circlesQ "+getCleanString(name)+"Q";});
			
	navCirclesQ.attr("r", 5)
			  .attr("cx",function(dat,i) { return $("#textNavigationQ").width()/2 - (16*dataQ.children.length)/2 + (16*i);})
			  .attr("cy", 10)
			  .classed("selectedQ", false)
			  .style("opacity",function(d) { 
			  		if(d3.select(this).classed("selectedQ")) { return 1; } else { return 0.3; } })
			  .attr("fill", function(dat) {  return colorCode[getCleanString(dat.factor)];});
    	
	navCirclesQ.on("click", function(dat) { 
					navSvgQ.selectAll(".circlesQ").style("opacity","0.3").classed("selectedQ", false); 
					$(this).css("opacity","1");
					d3.select(this).classed("selectedQ",true)	
					showQuestion(dat);
	});		
	 
	navCirclesQ.filter(function(dat) { return (getCleanString(dat.subfactor)==getCleanString(selected.subfactor)); }) 
				.classed("selectedQ", true)
				.style("opacity", function(d) {
						if(d3.select(this).classed("selectedQ")) { return 1; } else { return 0.3; } }) ;
			  	  		
	navCirclesQ.exit().remove();
	
}

function gotoMakeYOurOwn() {
 
  $('html, body').stop().animate({
            'scrollTop': $("#makeYourOwn").offset().top - 70
        }, 900, 'swing', function () {
		return false;     
	   });
		

}

function showQuestion(d) {
		
		var textAppend = "";
		
		if(!d.subfactor) { d=d.children[0];}
		
		getTopNavigation(d,1);
		
		textAppend +='<h2 style="font-size:120%;margin-top:0;margin-bottom:20px;border-bottom:1px solid grey" class=" alignCenter">'+d.subfactor+'</h2>';

			//Each Question 
			for(var y in d.children) {
				
				textAppend +='<p class="" style="margin-left:5;margin-bottom:5;font-size:11pt"> * '+d.children[y].question+'</p><p style="margin-left:0"class="descQ">'+d.children[y].questionDesc+'</p>';
				textAppend += '<div class=""><ul>';
				for(var l=0; l<d.children[y].AnswerNo;l++){
					textAppend += '<li> <input type="radio" name="rr_'+y+'"  onchange="addToArray(id,name);changeResult(id, &quot '+getCleanString(d.factor)+'&quot)" value="checkbox_'+d.subfactor+'_'+y+"_"+l+'"  id="checkbox_'+d.subfactor+'_'+y+"_"+l+'"/><label for="checkbox_'+d.subfactor+'_'+y+"_"+l+'"><span></span>  '+ eval("d.children[y].Answer"+(l+1))+'</label> </li>';		
					
					
					console.log(checkedArray);
					
					//Show previous values
					var result = $.grep(checkedArray, function(e){ return e.id == ('checkbox_'+d.subfactor+'_'+y+"_"+l) });
			// 		
// 					if (result.length == 0) {
// 						  // not found
// 						} else if (result.length == 1) {
// 						 // access the foo property using result[0].foo
// 						
//   							$("#"+result[0].id).prop('checked',true);
// 						}
				}
				textAppend +='</div></ul><hr>';
			}
		
			//showRecomendations(checkFactor( &quot '+d.id2+'&quot));
			
			var dat;
			if(( dat = checkFactor(getNext(d.id2)))) {
				textAppend +=  '<div style="text-align:right"><div onclick="showQuestion(checkFactor(getNext( &quot '+d.id2+'&quot)))" id="nextButton" ><img width="60" src="assets/img/next.png"/></div></div>';
			}else {  textAppend +=  '<div style="text-align:center"><img width="75" src="assets/img/finish.png" onclick="appendLightbox()"></div>';
			}
			textAppend +='</div>';
		
			showRecomendations(d); 
			
			$("#descriptionQ").hide("slide",200, function() {
	    		$(this).html(textAppend).show(60);
	  		});
	
}

function appendLightbox() {
	
	lightbox();

	$("#lightboxVIS").append("<h2> What do you see? </h2>");
	$("#lightboxVIS").append("<p> Is your project balanced through the factors?</p>");
	
	$("#lightboxVIS").append($("#makeViz"));
	
	$("#lightboxVIS").append("<p> The factors that are not filled up might need more attention! (check the recommendations)</p>");
		
}


function addToArray(id2, name2) {

	function Obk(id,name)
	{
		this.id = id;
		this.value = name;
	}
	
	checkedArray.push(new Obk(id2,name2));
	
}



function showRecomendations(d) {

		var textRec = "";
		$("#recommendationsTitle").html("<h2> Recommendations</h2>");
		
		for( var i=1; i< 6; i++) {
			if((eval("d.children[0].RecommendationP"+i))!= 'undefined') {
				textRec += "<p>"+ eval("d.children[0].RecommendationP"+i)+"</p>";
			}
		}

		$("#recommendations").hide("slide",200, function() {
	    		$(this).html(textRec).show(60);
	    });
}



function getNext(id2) {

	var tmp= id2.trim();
	tmp = id2.split("_");
	tmp[1]++;
	var tmp2 = tmp[0]+"_"+tmp[1]+"_"+tmp[2];
	
	tmp2= tmp2.trim();

	console.log("ID@: "+id2);
	return tmp2;
}

function checkFactor(id2) {

	var id3 = id2.trim();

	var dataQ = nodesQue.filter(function(dat) {  
//				console.log("DAT.Facotr:"+dat.factor+" ID2:"+id3+" ANSWER:"+((dat.level==2 && dat.id2 == id3) || (dat.level==1 && dat.factor == id3) || (dat.level==2 && dat.subfactor==id3)));
				return ((dat.level==2 && dat.id2 == id3) || (dat.level==1 && dat.factor==id3) || (dat.level==2 && dat.subfactor==id3)); })

	if(dataQ) {
		return dataQ[0];
	}else {
		return false;}
}

function changeResult(id, daId) {

	daId = daId.split(" ")[1];
	var tmp = id.split("_");
	var res=0;

	//$(input[name="genderS"]:checked
	$("#id").attr("value",1);


	var quest = nodesQue.filter( function(dat) { return ((dat.level==2) && (dat.subfactor == tmp[1]));});
	
	console.log("Q: "+tmp[1]);

	quest = quest[0];
		
	quest  = quest.children[parseInt(tmp[2])];
	
	
	switch(parseInt(tmp[3])) {		
		case 0:  { 
			res = 0;
			break;}
		case 1: {
			if( quest.AnswerNo ==2) { res= 1;}
			else { res = 0.5;}
			break;
		}
		case 2: {
			res = 1;
			break;
		}
	};
	
	quest.result = res;
	visMake.selectAll("g.nodeQ")
			      .data(nodesQue, function(d) { return d.id; })
			      .selectAll(".nodeCircle")
			      .transition()
			      .attr("r",getCirlceSize)
			      .duration(1000)
			      .ease("elastic");

}
 
function updateQuestions(){
	
	
	nodesQue = flatten(rootQue[0]);
	linksQue = d3.layout.tree().links(nodesQue);

	initializeQ();

	forceQue = d3.layout.force()
    	.linkDistance(5) 
    	.charge(-200)
    	.gravity(0)
    	.linkStrength(0.9)
    	.friction(0.7)
    	.size([wid, 400])
    	.on("tick",tickQ);
    	
	forceQue.nodes(nodesQue)
			.links(linksQue)
			.start();
	
	 // Update the links…
  	 var linkQ = visMake.selectAll("line.linkQ")
      				.data(linksQue, function(d) {  return d.target.id; });	
	
     var linkQEnter = linkQ.enter().insert("svg:line", ".nodeQ")
    	  .attr("class", "linkQ")
    	  .attr("stroke",function(d) { if(d.source.level==1) { return "#fff";}})
    	  .attr("stroke-width",function(d) { if(d.source.level==1) { return 1;}})
    	  .attr("x1", function(d) {	return d.source.x; })
    	  .attr("y1", function(d) { return d.source.y; })
    	  .attr("x2", function(d) { return	d.target.x; })
    	  .attr("y2", function(d) {   return d.target.y; });

     	// Exit any old links.
 		linkQ.exit().remove();

   	// Update the nodes…
  	var nodeQ = visMake.selectAll("g.nodeQ")
			      .data(nodesQue, function(d) { return d.id; });

		
	// Enter any new nodes.
	var nodeQEnter = nodeQ.enter().append("svg:g")
  	  			.attr("class", "nodeQ")
  	  			.attr("fill", function(d) { if(d.level>0) {return colorCode[ getCleanString(d.factor)];}});

	nodeQEnter.append("svg:circle") 
	    		  .attr("r", function(d) { if(d.level==0 || d.level==3){ return 0; }else{ return 2}})
				  .attr("class", function(d) { return (d.level!=0) ? "nodeCircle "+ getCleanString(d.factor)+"Q": "root";})
				  .on("click",clickQQ)
				  .style("cursor",function(d) { return d.level==1 ? "pointer":""});

	 // Exit any old nodes.
 	 nodeQ.exit().remove();

  	// Re-select for update.
  	linkQ = visMake.selectAll("line.linkQ");
  	nodeQ = visMake.selectAll("g.nodeQ");


	function clickQQ(d) {
		if(d.level == 1) { 
			var j = findFactor(d);
			clickQ(factorBoard[j]);
		}
	}

	function findFactor(d) {
		for(var j in factorBoard) {
			if(factorBoard[j].id == getCleanString(d.factor)) { 
		    		return 	j;
			}
		}
	}

    function tickQ() {
 		 		
 	  linkQEnter.attr("x1", function(d) {	return d.source.x; })
    	  .attr("y1", function(d) { return d.source.y; })
    	  .attr("x2", function(d) { return	d.target.x; })
    	  .attr("y2", function(d) {   return d.target.y; });

  
	  nodeQEnter.attr("transform", function(d) { if(d.level==2 || d.level==1) {return "translate(" + d.x + "," + d.y + ")"; }});

 	}	
 	
 	function initializeQ() {
	  
	  rootQue.x = centerW;
	  rootQue.y = h / 2 - 60; 
	  rootQue.fixed=true;
	  
	  nodesQue.filter( function(d) { if(d.level==1){ return true;};})
    			.forEach( function(d) { 
    				var j = findFactor(d);
		    		d.x = factorBoard[j].x;
		    		d.y = factorBoard[j].y;
		    		d.fixed=true;
		});
		
		
		nodesQue.filter( function(d) { if(d.level==2){ return true;};})
    			.forEach(function(d) { 
    				var j = findFactor(d);
		    		var tmp = (d.id2).split("_");
		    		d.x = factorBoard[j].x - 30*Math.cos(25*tmp[1]);
		    		d.y =  factorBoard[j].y - 30*Math.sin(25*tmp[1]);
		    	});
	  
	   updateFunctionality();

	 
	 }
	 

}

function getCirlceSize(d) {
	 	
	 	if(d.level ==0 ) { return 0;}
	 	if(d.level == 3 ) { return 0;}
	 	 	
	 	var ret=0;
	 	switch(d.level) {
	 		case 1: {
	 			ret = 2; // Minimum Value
	 			
	 			var questionNo =0; // Whole amount of questions in Factor..
	 			for(var l in d.children) { questionNo +=  d.children[l].children.length;} 
	 			
	 			for( var j in d.children){
	 				for(var k in d.children[j].children) { console.log("MAX: "+maxSizeFactor+ " question:  "+ questionNo);
	 					ret +=d.children[j].children[k].result*(maxSizeFactor /questionNo ) ;
	 					 	   console.log("AFTER: "+(maxSizeFactor /  questionNo));
	 				}
	 			}
	 			break; 	
	 		}	 		
	 		case 2: { 
	 			ret = 2; // Minimum Value
	 			for(var j in d.children) {	
	 				ret += d.children[j].result* (maxSize / d.children.length) ;	
	 			}
	 			break;
	 		}
	   };


	   return ret;
	}
