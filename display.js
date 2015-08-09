function updateBPM(value){
	if(value === "-"){
		document.getElementById("bpm").innerHTML = '<h1 style="color: red">BPM: ' + value + "</h1>";
	} else {
	if(value <= 40){
		document.getElementById("bpm").innerHTML = '<h1 style="color: red">BPM: ' + value + "</h1>";
	}
	if(value > 40 && value < 140){
		document.getElementById("bpm").innerHTML = '<h1 style="color: #00F925">BPM: ' + value + "</h1>";
	}
	if(value >= 140){
		document.getElementById("bpm").innerHTML = '<h1 style="color: red">BPM: ' + value + "</h1>";
	}
}
}

function setDebugInfo(value){
	document.getElementById("debug").innerHTML = value;
}

function setQRSStatus(qrs_long, qrs_short){
	if(rThreshold_counter === 0){
		if(qrs_long){
			document.getElementById("qrs_status").innerHTML = '<h1 style="color:red">QRS LONG</h1>';
		} else if(qrs_short){
			document.getElementById("qrs_status").innerHTML = '<h1 style="color:red">QRS SHORT</h1>';
		} else {
			document.getElementById("qrs_status").innerHTML = "";
		}
	}
	if(is_flatline){
		document.getElementById("qrs_status").innerHTML = "";
	}
}

function setQTStatus(qt_long, qt_short){
	if(rThreshold_counter === 0){
		if(qt_long){
			document.getElementById("qt_status").innerHTML = '<h1 style="color:red">QTc LONG</h1>';
		} else if(qt_short){
			document.getElementById("qt_status").innerHTML = '<h1 style="color:red">QTc SHORT</h1>';
		} else {
			document.getElementById("qt_status").innerHTML = "";
		}
	}
	if(is_flatline){
		document.getElementById("qt_status").innerHTML = "";
	}
}

function setBPMStatus(bpm_high, bpm_low){
	if(rThreshold_counter == 0){
		if(bpm_high){
			document.getElementById("bpm_status").innerHTML = '<h1 style="color:red">BPM HIGH</h1>';
		} else if(bpm_low){
			document.getElementById("bpm_status").innerHTML = '<h1 style="color:red">BPM LOW</h1>';
		} else {
			document.getElementById("bpm_status").innerHTML = "";
		}
	}
	if(is_flatline){
		document.getElementById("bpm_status").innerHTML = "";
	}

	
}

function setFlatlineStatus(is_flatline){
	if(rThreshold_counter == 0){
		if(is_flatline){
			document.getElementById("flatline_status").innerHTML = '<h1 style="color:red">CONDITION CRITICAL</h1>';
		} else {
			document.getElementById("flatline_status").innerHTML = '';
		}
	}
}

function setNormal(is_normal){
	if(is_normal){
		document.getElementById("normal_status").innerHTML = '<h1 style="color:#00F925">Normal</h1>';
	} else {
		document.getElementById("normal_status").innerHTML = '';
	}
}

function setDebugRThreshold(value){
	document.getElementById("debugRThreshold").innerHTML = value;
}

function setDebugRValue(value){
	document.getElementById("rValue").innerHTML = value;
}

function setDebugQValue(value){
	document.getElementById("qValue").innerHTML = value;
}

function setDebugSValue(value){
	document.getElementById("sValue").innerHTML = value;
}

function setDebugTValue(value){
	document.getElementById("tValue").innerHTML = value;
}
function setDebugRPosition(value){
	document.getElementById("rPosition").innerHTML = value;
}

function setDebugQPosition(value){
	document.getElementById("qPosition").innerHTML = value;
}

function setDebugSPosition(value){
	document.getElementById("sPosition").innerHTML = value;
}

function setDebugTPosition(value){
	document.getElementById("tPosition").innerHTML = value;
}

function setDebugQRS(value, color){
	document.getElementById("debugQRS").innerHTML = '<h1 style="color:' + color + '">' + value + "</h1>";
}
function setDebugQT(value, color){
	document.getElementById("debugQT").innerHTML = '<h1 style="color:' + color + '">' + value + "</h1>";
}

function resetThresholds(){
	rThreshold_counter = 1000;
	tThreshold_counter = 1000;
}

function clickHandler(e){
	console.log("Button Works");
	resetThresholds();
}

document.addEventListener('DOMContentLoaded', function(){
	document.querySelector('button').addEventListener('click', clickHandler);
});