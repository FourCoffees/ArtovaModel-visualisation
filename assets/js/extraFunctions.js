var w = 450,
    h = 400,
    centerW = w/2;

var language = "en";

    
var maxDiameter = 80;
var scaleParameter = [ 1, 3.5 , 4 ];
var tmpHERE;
var  root;

var clicked = 0;

var colorCode = {"VisionGoals" : "#ffc01f", "Group" : "#78c0ef", "Partnerships":"#c93a5c", "ExternalCommunications":"#aa73ad", 
				"PersonalResources" : "#99ad6c" };

var code  = [
{"Abrev":"mha","Name":"My House Arabia","Link":"https://docs.google.com/spreadsheet/pub?key=0AiVJjmNPOjDmdExrVjhRYkRnSnpXckE5ZWJMdzZVMGc&single=true&gid=0&output=html"},
{"Abrev":"aff","Name":"Artova Film Festival","Link":"https://docs.google.com/spreadsheet/pub?key=0AiVJjmNPOjDmdEs5V19PLTU0dkhybG9fYjc4c3pheEE&output=html"},
{"Abrev":"asf","Name":"Arabia Street Festival","Link":"https://docs.google.com/spreadsheet/pub?key=0AiVJjmNPOjDmdEU2c09CcEJWOVVuckhEUjlYSU5QX2c&single=true&gid=0&output=html"},
{"Abrev":"ak","Name":"Artova Kino","Link":"https://docs.google.com/spreadsheet/pub?key=0AiVJjmNPOjDmdHBFTl9kVkZTS1J4OE9TLU1Za1h3Z0E&single=true&gid=0&output=html"},
{"Abrev":"ea","Name":"Edible Arabia","Link":"https://docs.google.com/spreadsheet/pub?key=0AiVJjmNPOjDmdDNHRUNFZ05rRjBVX0t2dTdraXpYNVE&single=true&gid=0&output=html"},
{"Abrev":"ddp","Name":"Design Dog Park","Link":"https://docs.google.com/spreadsheet/pub?key=0AiVJjmNPOjDmdDU5VTFTSk5TT05kWWFLb1g4V1Z2SEE&single=true&gid=0&output=html"}
] ;

function rotate_point(pointX, pointY, originX, originY, angle) {
    angle = angle * Math.PI / 180.0;
    return {
        x: Math.cos(angle) * (pointX-originX) - Math.sin(angle) * (pointY-originY) + originX,
        y: Math.sin(angle) * (pointX-originX) + Math.cos(angle) * (pointY-originY) + originY
    };
}


/*  Returns angle between 2 points and the x-axis. 
*   Used for offset calculation between links & nodes.
*/
function getangle(x1, y1, x2, y2) { return Math.atan2((y2-y1), (x2 - x1)); }


/* Returns Circle radius depending on the level
*  of depth of the node
*/
function getRadius(data) { return maxDiameter/(2*scaleParameter[data.level]); }

function makeToJson(data){

	var jsonText = '';
	var recurseLevel = -1;
	var positionIndex = 0;
		//console.log(data);

	
	//siblingNo : how many nodes on the same level (so as to put the commas..)
	// i: current child node
	function getData(current,i, siblingNo) {
	  recurseLevel++;
	  childrenCount = 0;
	
	  for(var index in current) {
	  	  if(typeof current[index] === 'string'){
		  current[index] = current[index].replace(/\n/g,"");
		  //console.log(current[index]);
		  current[index] = current[index].replace(/\\/g,"\\\\");
		  current[index] = current[index].replace(/"/g,"&quot");
		  }
	  }	
	  
	 // console.log(current);

	  jsonText += ' { "Name" : "'+current.name +
	 					'", "TagLine" :"' +current.tagline+
	 					'", "DescriptionP1" :"' +current.descriptionp1+
	 					'", "DescriptionP2" :"' +current.descriptionp2+
	 					'", "DescriptionP3" :"' +current.descriptionp3+
	 					'", "DescriptionP4" :"' +current.descriptionp4+
	 					'", "DescriptionP5" :"' +current.descriptionp5+
	 					'", "questions" :"' +current.questions+
	 					'", "ExampleProject1" :"' +current.exampleproject1+
						'", "ExampleProject2" :"' +current.exampleproject2+
						'", "ExampleProject3" :"' +current.exampleproject3+
						'", "Parent" :"' + current.parent+
						'", "level":'+recurseLevel+
						', "position":'+i;
						
						
						if(current.haschild == "yes") {							
							jsonText += ', "children" : [' ;
							for(var l=0; l< data.length; l++){		
						   		if(data[l].parent == current.name){
						   			childrenCount++;
						   		}
						   	}
						   	var ik = 0;
						   	for(var l=0; l< data.length; l++){		
						   		if(data[l].parent == current.name){
    								 getData(data[l],ik, childrenCount);
    								 ik++;
    								 if(ik!=childrenCount-1) {
    									jsonText += ',';
    								 }
    							}
    						}
    						jsonText += ']';
   					}
    					
    					recurseLevel--;
    					jsonText +='}';

	}
	
  getData(data[0],0,5);

  //console.log("JSON: " +jsonText);

  return eval("(" + jsonText + ")");

}

function makeToJsonTimeline(data){

	var jsonText = '';
	
	function getData(current) {

	  for(var index in current) {
	  	  if(typeof current[index] === 'string'){
		  current[index] = current[index].replace(/\n/g,"");
		 // console.log(current[index]);
		  current[index] = current[index].replace(/\\/g,"\\\\");
		  current[index] = current[index].replace(/"/g,"&quot");
		  }
	  }	
	
	jsonText += ' { 	"id" : ' + current.id+
						', "Time" : "'+current.monthstime +
	 					'", "Title" :"' +current.title+
	 					'", "Description" :"' +current.description+
	 					'", "GeneralLink" :"' +current.generallink+
	 					'", "VisionGoals" :"' +current.visiongoals+
	 					'", "Group" :"' +current.group+
	 					'", "Partnerships" :"' +current.partnerships+
	 					'", "selected" :' + 'false'+ 
	 					', "PersonalResources" :"' +current.personalresources+
						'", "ExternalCommunications" :"' +current.externalcommunications+
						'", "Motivation" :"' +current.value+
						'", "QuoteNo" :' +current.quoteno ;
						
						for( var i=1; i<=current.quoteno ; i++) {
		 					jsonText +=	', "QuoteText'+i+'" :"' +eval("current.quotetext"+i)+
		 								'", "Who'+i+'" :"' +eval("current.whosaidrole"+i)+
		 								'", "Translation'+i+'" :"' +eval("current.translationnotes"+i)+
		 								'", "Link'+i+'" :"' +eval("current.link"+i) + '"';
						}

    					jsonText +='} ,';

	}
	
  for( var l=0; l< data.length; l++){		
	  getData(data[l]);
  }

  return eval("[" + jsonText.slice(0,-1) + "]");

}

////////////////////

function makeToJsonQuestions(data) {

	var jsonText = '{"id2":"root","level":0, "children": [ ';
	
	function getData(current) {

	  for(var index in current) {
	  	  if(typeof current[index] === 'string'){
		  current[index] = current[index].replace(/\n/g,"");
		  //console.log(current[index]);
		  current[index] = current[index].replace(/\\/g,"\\\\");
		  current[index] = current[index].replace(/"/g,"&quot");
		  }
	  }	
	//console.log(jsonText);
	jsonText += ' { 	"id2" : "' + current.id+
						'", "level":3'+
						', "factor" : "'+current.factor +
	 					'", "subfactor" :"' +current.subfactor+
	 					'", "question" :"' +current.questiontext+
	 					'", "questionDesc" :"' +current.questiondesc+
	 					'", "AnswerNo" :' +current.answerno+
	 					', "Answer1" :"' +current.answer1+
	 					'", "Answer2" :"' +current.answer2+
	 					'", "Answer3" :"' +current.answer3+
	 					'", "RecommendationP1" :"' +current.recommendationp1+
						'", "RecommendationP2" :"' +current.recommendationp2+
						'", "RecommendationP3" :"' +current.recommendationp3+
						'", "RecommendationP4" :"' +current.recommendationP4+ 
						'", "RecommendationP5" :"' +current.recommendationp5+
						'", "result":0';

    		jsonText +='} ,';

	}
	
	function addFactorNode(name){
		jsonText += '{"factor":"' + name+'","level":1, "children": [ ' ;	
	}
	
	function addSubFactorNode(d){
		jsonText += '{"subfactor":"' + d.subfactor +'","level":2, "id2":"'+d.id+'", "factor":"'+d.factor+'" , "children": [ ' ;	
	}

  var dif = (data[0].id).split("_");	
  addFactorNode(data[0].factor); 
  addSubFactorNode(data[0]);
  
  for( var l=0; l< data.length; l++){	
  
	  var tmp = (data[l].id).split("_");
	  //new factor 
	  if(tmp[0]!=dif[0]) { 
	  	jsonText +="]},]},";
    	dif = tmp; 		
    	addFactorNode(data[l].factor);
    	addSubFactorNode(data[l]); 
 		
      }
      
      //new subsfactor
      if(tmp[1]!=dif[1]) { 
	  	jsonText +="]},";
    	dif = tmp; 		
    	addSubFactorNode(data[l]);  		
      }

	  getData(data[l]);

  }
  
  jsonText +="]}, ]}, ]}";

  console.log("JSON: "+jsonText);
  return eval("[" + jsonText+ "]");

}


 

////////////////////////

function getCleanString(str){
	var dataClass = str.replace(/\s+/g, '');
	dataClass = dataClass.replace(/[^a-zA-Z0-9]/g,'');

	return dataClass;
}

/*
* Accepts a node and returns which branch it belongs to. 
* ( Basically the class name)
*/
function findClass(d) {
  
  var factor = d.Parent;
  var extraClass="subfactor";
  
  if(factor == "null" || d.level==0) { return "root"; }
  
  if(factor == "Artova Model"){ factor = d.Name; extraClass=""; }
  
  if(factor == "Vision & Goals" ) { factor = "VisionGoals";}
  if(factor == "Group") { factor = "Group";} 
  if(factor == "Partnerships") { factor = "Partnerships";}
  if(factor == "Personal Resources") {factor = "PersonalResources";}
  if(factor == "External Communications"){ factor = "ExternalCommunications";}
  
  return factor+" "+extraClass ;
}  

function freezeNodesExcept(currentNode, nodes) {

	nodes.forEach( function(d) { 
	
		if(d == currentNode){ wiggle(currentNode);}
		if( d.Parent== currentNode.Name) { return (d.fixed = false); }
		else{ return (d.fixed = true);} });	
}

function unfreezeNodes(currentNode, nodes) {

	nodes.forEach( function(d) { 
		if(d == currentNode) { wiggle(currentNode);}
		else{ return (d.fixed = false);} });
	
}

// Returns a list of all nodes under the root.
function flatten(root) {

  var nodesJ = [], i = 0;
 
  function recurse(node) {
   // console.log(node);

    if (node.children) node.children.forEach(recurse);
    if (!node.id) node.id = ++i;
    nodesJ.push(node);
  }
 
  recurse(root);
  return nodesJ;
}

//////////////////
// Returns a list of all nodes under the root.
function flattenQue(root) {

  var nodesJ = [], i = 0;
 
  function recurse(node) {

    if (node.children) node.children.forEach(recurse);
    if (!node.id) node.id = ++i;
    nodesJ.push(node);
  }
 
  recurse(root[0]);
  return nodesJ;
}
///////////////////
function wiggle(currentNode){
	
	currentNode.fixed = true;
}

$(document).ready(function(){
    $('.node circle').on('click',function (e) { //console.log("HERE");
        var target = this.attr("href");
        $target = $(target);
        $('html, body').stop().animate({
            'scrollTop': $target.offset().top
        }, 900, 'swing', function () {
		return false;     
	   });
    });
});

function hideParts(id) {

	$(".part").css("display","none");
	$('li').css("text-decoration","none");

}


function showPart(id, th) {
	
	$('#part'+id).css("display", "block"); 
	$(th).css("text-decoration","underline");
	
	
	if(clicked ==1 ) {
		$("#back2").css("display","inline");	
		clicked = 0;
	}else {
		$("#back2").css("display","none");	
	}

	
	
}


function checkHowTo() {
	
	if($('#part1').css("display")=="block") { return lightbox(null, "assets/extra/howToUse1.html");}
	
	if($('#part2').css("display")=="block") { return lightbox(null, "assets/extra/howToUse2.html");}
	
	if($('#part3').css("display")=="block") { return lightbox(null, "assets/extra/howToUse3.html");}

}
