const inh = -1;
const exc = 1;
const wide = document.getElementById("graph").offsetWidth;
const high = document.getElementById("graph").offsetHeight - 2;
const duration = 1000;

var graphviz = d3.select("#graph").graphviz();

graphviz.transition(function (){
  return d3.transition()
  .ease(d3.easeLinear)
  .duration(duration);
}).logEvents(false);

$("#simSpeed").on('input', function(){
  let m = duration * $(this).val();
  graphviz.transition(function(){
    return d3.transition()
    .ease(d3.easeLinear)
    .duration(m);
  }).logEvents(false);
})

function attributer(datum, index, nodes) {
    var selection = d3.select(this);
    if (datum.tag == "svg") {
        var width = wide;
        var height = high;
        var x = "10";
        var y = "10";
        selection
            .attr("width", width + "px")
            .attr("height", height + "px")
            .attr("viewBox", -x + " " + -y + " " + width + " " + height);
        datum.attributes.width = width + "px";
        datum.attributes.height = height + "px";
        datum.attributes.viewBox = -x + " " + -y + " " + width + " " + height;
    }
}

var dots = [];
var dotIndex = 0;
var wordArray = [];
var litArray = [];

function prepareRender(digraph){
    dots = [];
    dotIndex = 0;
    wordArray = [];
    establishDots(digraph);
    renderSteps();
}

function renderSteps() {
  var list = document.querySelector('#stepsList');
  list.innerHTML = '';
  for(var i = 0; i < wordArray.length; i++) {
    let li = document.createElement('li');
    li.textContent = wordArray[i];
    li.id = "step"+i;
    list.appendChild(li);
  }
}

function prepActionPotential(nodes) {
  var list = document.querySelector('#actionPotentialList');
  list.innerHTML = '';
  for(var i = 0; i < nodes; i++) {
    let li = document.createElement('li');
    li.textContent = "Neuron " + i;
    li.id = "node"+i;
    list.appendChild(li);
  }
}

function render() {
    var stepsList = document.querySelector('#stepsList');
    var actionPotentialList = document.querySelector('#actionPotentialList');

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

      if (actionPotentialList.childNodes.length > 0 && (dotIndex % dots.length) < litArray.length) {
        for(var i = 0; i < litArray[dotIndex % dots.length].length; i++) {
          var previous = actionPotentialList.childNodes[i];
          if(previous.childNodes.length > 1) {
            previous.removeChild(previous.lastElementChild);
          }
          var picture = document.createElement("img");
          picture.style = "width: 35px; height: 35px";
          picture.setAttribute("src", "./noPotential.svg");
          previous.appendChild(picture);
        }
        for(var i = 0; i < litArray[dotIndex % dots.length].length; i++) {
          if(litArray[dotIndex % dots.length][i] > 0) {
            var current = actionPotentialList.childNodes[i];
            if(current.childNodes.length > 1) {
              current.removeChild(current.lastElementChild);
            }
            var picture = document.createElement("img");
            picture.style = "width: 35px; height: 35px";
            if(litArray[dotIndex % dots.length][i] == 1) {
              picture.setAttribute("src", "./actionPotential.png");
            } else if(litArray[dotIndex % dots.length][i] == 2) {
              picture.setAttribute("src", "./actionStart.svg");
            }
            current.appendChild(picture);
          }
        }
      }

    if (stepsList.childNodes.length > 0){
      var current = document.querySelector('#step' + (dotIndex % dots.length));
      current.style.backgroundColor = "yellow";
      if((dotIndex % dots.length) > 0) {
        var previous = document.querySelector('#step' + ((dotIndex % dots.length) - 1));
        previous.style.backgroundColor = "white";
      } else {
        var previous = document.querySelector('#step' + (dots.length - 1));
        previous.style.backgroundColor = "white";
      }
    }
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
  prepActionPotential(nodes);
  //initialize arrays
  litArray[litArray.length] = [];
  for(var i = 0; i < nodes; i++){
    arr[i] = []
    litArray[litArray.length - 1][i] = 0;
    for(var j = 0; j < nodes; j++){
      if(i == j && digraph[i + 2].includes("yellow")) {
        wordArray.push(i + " excites")
        litArray[litArray.length - 1][i] = 2;
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
  var currentStep = "";
  litArray[litArray.length] = [];

  arrayNext = [];
  for(var i = 0; i < array.length; i++){
    arrayNext[i] = []
    litArray[litArray.length - 1][i] = 0;
    for(var j = 0; j < array[i].length; j++){
      arrayNext[i][j] = array[i][j];
    }
  }
  for(var i = 0; i < array.length; i++) {
    var value = 0;
    for(var j = 0; j < array[i].length; j++) {
      if (i != j) {
        if(array[j][i] == exc && array[j][j] == 1) {
          litArray[litArray.length - 1][i] = 1;
          value = 1;
          currentStep += j + " excites " + i + "; ";
        } else if (array[j][i] == inh && array[j][j] == 0) {
          litArray[litArray.length - 1][i] = 1;
          value = 1;
          currentStep += i + " excites as it isn't being inhibited; "
        } else if(array[j][i] == inh && array[j][j] == 1) {
          value = -1;
          currentStep += j + " inhibits " + i + " from exciting; ";
          break;
        } else if(array[j][i] == exc && array[j][j] == 0) {
          value = -1;
          currentStep += i + " doesn't get stimulated because " + j + " isn't stimulated; ";
          break;
        }
      }
    }
    arrayNext[i][i] = value > 0 && array[i][i] != 1? 1 : 0;
  }
  wordArray.push(currentStep.substring(0, currentStep.length - 2));
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
    console.log(litArray);
    console.log("the end");
}
