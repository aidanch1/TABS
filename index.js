d3.select("#graph").graphviz().renderDot('digraph  {0 -> 1}');
var neurons = [];

const display = 'Editing Neuron: <span class="neuronname"></span><br> Excitatory connections: <br><input type="text"><br>Inhibitory connections: <br><input type="text"><br>Stimulate neuron? ';

$("#newneuron").click(function(){
    var neuron = {
        name: neurons.length,
        stimulated: false,
        excitatory: [],
        inhibitory: []
    }
    neurons.push(neuron);
    let newListNode = document.createElement("li");
    newListNode.style = "padding-top: 10px"
    let d = document.createElement("div");
    d.className = "hidden";
    d.id = "neuron";
    d.innerHTML = display;
    d.firstElementChild.innerText = neuron.name;
    let stimulate = document.createElement("input");
    stimulate.type = "checkbox";
    d.appendChild(stimulate);
    d.appendChild(document.createElement("br"));
    let update = document.createElement("button");
    update.innerText = "Update Connections";
    update.onclick = function(){
        let fields = d.childNodes;
        console.log(fields);
        let einput = fields[5].value;
        let iinput = fields[9].value;
        neurons[neuron.name].excitatory = einput.length == 0 ? [] : einput.split(",").map(Number);
        neurons[neuron.name].inhibitory = iinput.length == 0 ? [] : iinput.split(",").map(Number);
        neurons[neuron.name].stimulated = stimulate.checked;
        $(this).parent().slideToggle(500);
    };
    update.className = "btn btn-info btn-sm";
    d.appendChild(update);
    let b = document.createElement("button");
    b.innerHTML = "Neuron " + neuron.name;
    b.onclick = function(){
        var nextItem = $(this).next();
        nextItem.slideToggle(500);
    };
    b.className = "btn btn-info btn-sm";
    newListNode.appendChild(b);
    newListNode.appendChild(d);
    document.getElementById("neuronlist").appendChild(newListNode);
});

$("#render").click(function(){
    prepareRender(getGraph());
    render();
})

function getGraph(){
    var result = [];
    result.push("digraph {");
    result.push('node [style=filled];');
    neurons.forEach(function(neuron){
        if (neuron.stimulated){
            result.push(neuron.name + '[fillcolor="yellow"];');
        } else {
            result.push(neuron.name + '[fillcolor="white"];');
        }
    })
    neurons.forEach(function(neuron){
        helper(neuron.name, neuron.excitatory, '[color="green"]').forEach(function(connection){
            result.push(connection);
        });
        helper(neuron.name, neuron.inhibitory, '[color="red"]').forEach(function(connection){
            result.push(connection);
        });
    });
    result.push("}");
    console.log(result);
    return result;
}

function helper(presynaptic, connections, color){
    var result = [];
    for (var i=0; i<connections.length; i++){
        result.push(presynaptic + "->" + connections[i] + " " + color + ";");
    }
    return result;
}

$(".collapsible").click(function(){
    var nextItem = $(this).next();
    nextItem.slideToggle(500);
});
