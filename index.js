d3.select("#graph").graphviz().renderDot('digraph  {0 -> 1}');
var neurons = [];

const display = 'Editing Neuron: <span></span><br> Excitatory connections: <br><input type="text"><br>Inhibitory connections: <br><input type="text"><br>Stimulate neuron? ';

$("#newneuron").click(function(){
    var neuron = {
        name: neurons.length,
        stimulated: false,
        excitatory: [],
        inhibitory: []
    }
    neurons.push(neuron);
    addNeuronToEditor(neuron);
});

//5, 9, 12

function addNeuronToEditor(neuron){
    let newListNode = document.createElement("li");
    newListNode.style = "padding-top: 10px"
    let d = document.createElement("div");
    d.className = "hidden";
    d.innerHTML = display;
    d.style = "position: relative;";
    d.firstElementChild.innerText = neuron.name;
    let stimulate = document.createElement("input");
    stimulate.type = "checkbox";
    d.appendChild(stimulate);
    d.appendChild(document.createElement("br"));
    var fields = d.childNodes;
    fields[5].value = neuron.excitatory.toString();
    fields[9].value = neuron.inhibitory.toString();
    fields[12].checked = neuron.stimulated;
    let update = document.createElement("button");
    update.innerText = "Update Connections";
    update.onclick = function(){
        let legal = true;

        let einput = fields[5].value;
        let earr = einput.split(",").map(Number);
        if (einput.length != 0){
            earr.forEach(function (connection){
                //prevent connections to unexisting neurons or to itself
                if (connection == neuron.name || connection >= neurons.length){
                    legal = false;                    
                }
            });
        }
        let iinput = fields[9].value;
        let iarr = iinput.split(",").map(Number);
        if (iinput.length != 0){
            iarr.forEach(function (connection){
                //prevent connections to unexisting neurons or to itself
                if (connection == neuron.name || connection >= neurons.length){
                    legal = false;                    
                }
            });
        }
        if (legal){
            neurons[neuron.name].excitatory = einput.length == 0 ? [] : earr;
            neurons[neuron.name].inhibitory = iinput.length == 0 ? [] : iarr;
            neurons[neuron.name].stimulated = stimulate.checked;
            $(this).parent().slideToggle(500);
        }
        else {
            $("#modalMsg").modal("toggle");
            setModalText("Error!", "Neurons cannot connect to themselves or non-existent neurons!");
        }
    };
    update.className = "btn btn-info btn-sm";
    d.appendChild(update);
    let del = document.createElement('button');
    del.innerHTML = "X";
    del.style = "position: absolute; top: 0; right: 0";
    del.className = "btn btn-danger btn-sm";
    del.onclick = function (){
        let x = confirm("Are you sure you want to delete this neuron?");
        if (x){
            //delete neuron
            var list = document.getElementById("neuronlist");
            list.removeChild(newListNode);
            neurons.splice(neuron.name, 1);
            for (var i=neuron.name; i<neurons.length; i++){
                neurons[i].name--;
                var s = list.childNodes[i].firstChild.innerText;
                list.childNodes[i].firstChild.innerText = s.substring(0, s.length-2) + " " + (parseInt(s.charAt(s.length-1))-1);
                list.childNodes[i].lastChild.firstElementChild.innerText = list.childNodes[i].lastChild.firstElementChild.innerText-1;
            }
            for (var i=0; i<neurons.length; i++){
                for (var j=0; j<neurons[i].excitatory.length; j++){
                    if (neurons[i].excitatory[j] == neuron.name){
                        neurons[i].excitatory.splice(j, 1);
                    }
                    if (neurons[i].excitatory[j] > neuron.name){
                        neurons[i].excitatory[j]--;
                    }
                }
                for (var j=0; j<neurons[i].inhibitory.length; j++){
                    if (neurons[i].inhibitory[j] == neuron.name){
                        neurons[i].inhibitory.splice(j, 1);
                    }
                    if (neurons[i].inhibitory[j] > neuron.name){
                        neurons[i].inhibitory[j]--;
                    }
                }
                let fields = list.childNodes[i].lastChild.childNodes;
                fields[5].value = neurons[i].excitatory.toString();
                fields[9].value = neurons[i].inhibitory.toString();
            }
        }
    }
    d.appendChild(del);
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
}

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

const verifyCode = "bananabread";

$("#loadCircuit").click(function(){
    var t = $("#toLoad").val();
    var index = t.indexOf(verifyCode);
    //check if t is a valid circuit
    if (index !== -1){
        //set neurons = t
        let n = t.substring(0, index);
        neurons = JSON.parse(n);
        //change the neuron editor
        var editor = document.getElementById("neuronlist");
        editor.innerHTML = '';
        editor.id = 'neuronlist';
        neurons.forEach(function(neuron){
            addNeuronToEditor(neuron);
        });
    }
    else {
        $("#modalMsg").modal("toggle");
        setModalText("Error!", "The circuit is invalid!");
    }
    $("#toLoad").val('');
})

var preload = ['[{"name":0,"stimulated":true,"excitatory":[1],"inhibitory":[]},{"name":1,"stimulated":false,"excitatory":[2],"inhibitory":[]},{"name":2,"stimulated":false,"excitatory":[],"inhibitory":[]}]',
'[{"name":0,"stimulated":true,"excitatory":[1,2],"inhibitory":[]},{"name":1,"stimulated":false,"excitatory":[3],"inhibitory":[]},{"name":2,"stimulated":false,"excitatory":[],"inhibitory":[3]},{"name":3,"stimulated":false,"excitatory":[],"inhibitory":[]}]',
'[{"name":0,"stimulated":true,"excitatory":[4],"inhibitory":[]},{"name":1,"stimulated":true,"excitatory":[4],"inhibitory":[]},{"name":2,"stimulated":true,"excitatory":[5],"inhibitory":[]},{"name":3,"stimulated":true,"excitatory":[5],"inhibitory":[]},{"name":4,"stimulated":false,"excitatory":[6],"inhibitory":[]},{"name":5,"stimulated":false,"excitatory":[6],"inhibitory":[]},{"name":6,"stimulated":false,"excitatory":[],"inhibitory":[]}]'
]
for (var i=0; i<preload.length; i++){
    let l = document.createElement("li");
    let b = document.createElement("button");
    b.innerText = "Example " + (i+1);
    b.className = "btn btn-primary btn-sm";
    b.value = i;
    b.onclick = function(){
        neurons = JSON.parse(preload[$(this).val()]);
        var editor = document.getElementById("neuronlist");
        editor.innerHTML = '';
        editor.id = 'neuronlist';
        neurons.forEach(function(neuron){
            addNeuronToEditor(neuron);
        });
    }
    l.appendChild(b);
    document.getElementById("preloadlist").appendChild(l);
}

$("#save").click(function(){
    $("#modalMsg").modal("toggle");
    let send = JSON.stringify(neurons) + verifyCode;
    setModalText("Copy this!", send);
})

$("#closeModal").click(function(){
    $("#modalMsg").modal("toggle");
})

function setModalText(header, body){
    $("#modalTitle").text(header);
    $("#modalText").text(body);
}

$(".collapsible").click(function(){
    var nextItem = $(this).next();
    nextItem.slideToggle(500);
});
