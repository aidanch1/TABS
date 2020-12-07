const inh = -1;
const exc = 1;

var graphviz = d3.select("#graph").graphviz();

graphviz.transition(function () {
    return d3.transition()
        .ease(d3.easeLinear)
        .delay(500)
        .duration(1000);
})
.logEvents(false)

function attributer(datum, index, nodes) {
    var selection = d3.select(this);
    if (datum.tag == "svg") {
        var width = document.getElementById("graph").offsetWidth;
        var height = document.getElementById("graph").offsetHeight;
        var x = "10";
        var y = "10";
        selection
            .attr("width", width + "pt")
            .attr("height", height + "pt")
            .attr("viewBox", -x + " " + -y + " " + width + " " + height);
        datum.attributes.width = width + "pt";
        datum.attributes.height = height + "pt";
        datum.attributes.viewBox = -x + " " + -y + " " + width + " " + height;
    }
}

var dots = [];
var dotIndex = 0;

function prepareRender(digraph){
    dots = [];
    dotIndex = 0;
    establishDots(digraph);
}

function render() {
    var dotLines = dots[dotIndex % dots.length];
    var dot = dotLines.join('');
    graphviz
//        .tweenPaths(false)
        .tweenShapes(false)
        .dot(dot)
        .attributer(attributer)
        .render()
        .on('end', function () {
            if (dotIndex != 0) {
                render();
            }
        });
    dotIndex += 1;
}

function digraphToArray(digraph) {
  var arr = [];
  var nodes = 0;
  //count number of nodes;
  for(var i = 0; i < digraph.length; i++){
    if(digraph[i].includes("fillcolor")){
      nodes++;
    }
  }
  //initialize array
  for(var i = 0; i < nodes; i++){
    arr[i] = []
    for(var j = 0; j < nodes; j++){
      if(i == j && digraph[i + 2].includes("yellow")) {
        arr[i][i] = 1;
      } else {
        arr[i][j] = 0;
      }
    }
  }
  //add edges
  for(var i = 0; i < digraph.length; i++){
    if(digraph[i].includes("->")){
      if(digraph[i].includes("green")){
        arr[parseInt(digraph[i].substring(
          0,
          digraph[i].indexOf("->")))
        ][parseInt(digraph[i].substring(
          digraph[i].indexOf("->") + 2,
          digraph[i].indexOf(' ')))] = exc;
      } else {
        arr[parseInt(digraph[i].substring(
          0,
          digraph[i].indexOf("->")))
        ][parseInt(digraph[i].substring(
          digraph[i].indexOf("->") + 2,
          digraph[i].indexOf(' ')))] = inh;
      }
    }
  }
  return(arr);
}

function arrayToDigraph(array) {
  var digraph = [
    'digraph  {',
    'node [style="filled"]',
  ]
  for(var i = 0; i < array.length; i++) {
    if(array[i][i] == 1) {
      digraph.push(i + '[fillcolor="yellow"]')
    } else {
      digraph.push(i + '[fillcolor="white"]')
    }
  }
  for(var i = 0; i < array.length; i++) {
    for(var j = 0; j < array[i].length; j++) {
      if(array[i][j] == exc && i != j) {
        digraph.push(i + '->' + j + ' [color="green"]')
      } else if(array[i][j] == inh && i != j) {
        digraph.push(i + '->' + j + ' [color="red"]')
      }
    }
  }
  digraph.push('}');
  return(digraph)
}

function stepThrough(array) {
  arrayNext = [];
  for(var i = 0; i < array.length; i++){
    arrayNext[i] = []
    for(var j = 0; j < array[i].length; j++){
      arrayNext[i][j] = array[i][j];
    }
  }
  for(var i = 0; i < array.length; i++) {
    var value = 0;
    for(var j = 0; j < array[i].length; j++) {
      if (i != j) {
        if((array[j][i] == exc && array[j][j] == 1)
        ||(array[j][i] == inh && array[j][j] == 0)) {
          value = 1;
        } else if((array[j][i] == exc && array[j][j] == 0)
        ||(array[j][i] == inh && array[j][j] == 1)) {
          value = -1;
          break;
        }
      }
    }
    arrayNext[i][i] = value > 0 && array[i][i] != 1? 1 : 0;
  }
  return arrayNext;
}

function isItLit(array) {
  var value = 0;
  for(var i = 0; i < array.length; i++) {
    value = value + array[i][i];
  }
  return value > 0;
}

function establishDots(digraph){
    inputNetwork = digraphToArray(digraph);
    console.log(inputNetwork);
    dots.push(arrayToDigraph(inputNetwork));
    var generationCount = 0;
    const maxGen = 10;
    while (isItLit(inputNetwork) && generationCount < maxGen) {
        inputNetwork = stepThrough(inputNetwork);
        dots.push(arrayToDigraph(inputNetwork));
        generationCount++;
    }
    console.log("the end");
}
