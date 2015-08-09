var ekg = {};

//Sounds
var beepSound = new buzz.sound("sounds/beep.wav");
var flatlineSound = new buzz.sound("sounds/flatline.wav");
var alarmSound = new buzz.sound("sounds/alarm.wav");

//Variables
//PrevPoint is on global coordinates
var prevPoint = {
    x: 0,
    y: 0
};
//The coordinates below are in our 1500 point system not overall
var currentQValue = {
    x: 0,
    y: 0
}
var currentSValue = {
    x: 0,
    y: 0
}
var currentTValue = {
    x: 0,
    y: 0
}

// FLAGS FOR STATUS DISPLAY:
var qrs_long = false;
var qrs_short = false;
var qt_long = false;
var qt_short = false;
var bpm_low = false;
var bpm_high = false;
var is_flatline = false;

var isRTriggered = false;
var isSTriggered = false;
var isTTriggered = false;
var lastTime = 0.0;
var beatTimes = [];
var maxPointX = 0;
var maxPointY = 0;
var minPointX = 0;
var minPointY = 1000;
var tMaxPointX = 0;
var tMaxPointY = 0;
var rThreshold_counter = 1000;
var tThreshold_counter = 1000;
var currentPos = 0;
var dataLength = 1500; // number of dataPoints visible at any point
var lastRTime = 0;
var nowPlaying = false;
var nowPlayingAlarm = false;
var lowestSPoint = 1000;
var sThreshold = 400;
var hasFoundQ = false;
var hasUsedS = false;
var tThreshold_range_counter = 0;
var tConsecutives = 0;
var hasNotifiedCritical = false;
var avgBPM = 0;
var calcRR = 0;

//Test timer values
var startTime = Date.now() - (updateFrequency - 20000);

function sendMessage(subject, message){
$.ajax({
  type: "POST",
  url: "https://mandrillapp.com/api/1.0/messages/send.json",
  data: {
    'key': 'dFEEIMRSJOqqh9oC1x8UaA',
    'message': {
      'from_email': 'NOTIFY@SOHACKS.com',
      'to': [
          {
            'email': '2108679274@txt.att.net',
            'name': '',
            'type': 'to'
          }
        ],
      'autotext': 'true',
      'subject': subject,
      'html': message
    }
  }
 }).done(function(response) {
   console.log(response); // if you're into that sorta thing
 })

 
 console.log("Submitted message request");
}

function checkHeart(graphPoint){

    if(nowPlaying === true && flatlineSound.isEnded()){
        nowPlaying = false;
        //console.log("No longer playing");
    } 
    if(nowPlayingAlarm === true && alarmSound.isEnded()){
        nowPlayingAlarm = false;
    }
    if(rThreshold_counter > 0){
        rThreshold_counter -= 1;
    } else if (tThreshold_counter > 0){
        tThreshold_counter -= 1;
    }
    if(tThreshold_range_counter > 0){
        tThreshold_range_counter -= 1;
    }
    if(rThreshold_counter == 1){
        rThreshold = maxPointY - 200;
        sThreshold = minPointY + 75;
        //console.log("Set rThreshold to " + rThreshold);
        //console.log("Set sThreshold to " + sThreshold);
    }
    if(tThreshold_counter == 1){
        tThreshold = tMaxPointY - 75;
        //console.log("Set tThreshold to " + tThreshold);
    }

    if(graphPoint.y > maxPointY && graphPoint.y < 2023){
        maxPointY = graphPoint.y;
        maxPointX = currentPos;
        //console.log("New max is " + maxPointY);
    }

    if(graphPoint.y < minPointY){
        minPointY = graphPoint.y;
        minPointX = currentPos;
    }

    if(graphPoint.y > tMaxPointY && tThreshold_range_counter > 0){
        tMaxPointY = graphPoint.y;
        tMaxPointX = currentPos;
    }

    // Check for R peak
    if(rThreshold_counter <= 0){
        if((graphPoint.y < prevPoint.y) && (graphPoint.y > rThreshold) && (!isRTriggered)){
            //Heartbeat occured(R peak)
            beepSound.play();
            isRTriggered = true;
            var BPM = (60000.0 / (Date.now() - lastTime));
            calcRR = (Date.now() - lastTime);

            setDebugRValue(ekg.vals[currentPos-1].y);
            setDebugRPosition(currentPos-1);

            lastRTime = Date.now();
            lastTime = Date.now();
            hasNotifiedCritical = false;
            
            if(beatTimes.length >= 10){
                beatTimes.shift();
            } 

            if(!(BPM > 200)){
                beatTimes.push(BPM);
            }

            var totalTimes = 0;
            for(var i=0; i < beatTimes.length; i++){
                totalTimes += beatTimes[i];
            }

            avgBPM = Math.round(totalTimes/beatTimes.length);
            updateBPM(avgBPM);
            setDebugRThreshold("Current rThreshold: " + rThreshold);
            if(avgBPM <= 40){
                bpm_low = true;
            } else if(avgBPM > 40 && avgBPM < 140){
                bpm_low = false;
                bpm_high = false;
            } else if(avgBPM >= 140){
                bpm_high = true;
            }

            setBPMStatus(bpm_high, bpm_low);
            
            //Search for Q
            for(var i = currentPos-1; i > 3; i--){
                //console.log("Current position is " + currentPos);
                previousValue = ekg.vals[i-3].y;
                currentValue = ekg.vals[i-2].y;
                //console.log(currentValue - previousValue);
                if((currentValue - previousValue) < 0){
                    currentQValue = ekg.vals[i - 2];
                    hasFoundQ = true;
                    setDebugQValue(currentSValue.y);
                    setDebugQPosition(currentSValue.x);
                    break;
                } 
                if((currentPos - i) > 50){
                    //console.log("Q Not Found. Aborting");
                    break;
                }
            }

        } else if(graphPoint.y > prevPoint.y){
            isRTriggered = false;
        }
    }

    //Check for S dip
    if((graphPoint.y > prevPoint.y) && (graphPoint.y < sThreshold) && (!isSTriggered)){
        currentSValue = ekg.vals[currentPos-1];
        isSTriggered = true;
        setDebugSValue(currentSValue.y);
        setDebugSPosition(currentSValue.x);
        hasUsedS = false;
        tThreshold_range_counter = 100;
        isTTriggered = false;
    } else if(graphPoint.y < prevPoint.y){
        //console.log("Not triggered");
        isSTriggered = false;
        //lowestSPoint = graphPoint.y;
    }
    
    // Check for T wave
    if((graphPoint.y < prevPoint.y) && tThreshold_range_counter > 0 && !isTTriggered){
        tConsecutives += 1;
        if(tConsecutives >= 10){
            currentTValue = ekg.vals[currentPos-10];
            isTTriggered = true;
            setDebugTValue(currentTValue.y);
            setDebugTPosition(currentTValue.x);
        }
    } else { 
        tConsecutives = 0; 
    }

    //Check for flatline
    if(((Date.now() - lastRTime) > 3000) && rThreshold_counter === 0 && ekg.pointCount > dataLength){
        is_flatline = true;
        if(nowPlaying === false){
            flatlineSound.play();
            nowPlaying = true;
            updateBPM("-");
            if(!hasNotifiedCritical && smsNotify){
                sendMessage("ALERT", "THE PATIENT IS IN CRITICAL CONDITION");
                hasNotifiedCritical = true;
            }
        }
    } else {
        is_flatline = false;
    }

    setFlatlineStatus(is_flatline);

    //Find irregularities------------------------------

    if(currentSValue != undefined && currentQValue != undefined){
        var qrs = Math.abs(((currentQValue.x - currentSValue.x) * 5))
        if(qrs < 500){
            if(qrs <= 50){
                qrs_short = true;
                setDebugQRS("QRS Interval: " + qrs, "red");
            }
            if(qrs > 50 && qrs < 120){
                setDebugQRS("QRS Interval: " + qrs, "#00F925");
                qrs_short = false;
                qrs_long = false;
            } 
            if(qrs >= 100){
                setDebugQRS("QRS Interval: " + qrs, "red");
                qrs_long = true;
            }
        }
        setQRSStatus(qrs_long, qrs_short);
    }

    if(currentTValue != undefined && currentQValue != undefined){
        var qt = Math.abs(((currentQValue.x - currentTValue.x) * 5));
        //console.log("QT is " + qt);
        var qtc = Math.round(qt/Math.sqrt((calcRR/1000)));
        //console.log("RR is " + calcRR);
        //console.log("QTC is " + qtc);
        if(qtc < 500){
            if(qtc <= 200){
                qt_short = true;
                setDebugQT("QTc Interval: " + qtc, "red");
            }
            if(qtc > 200 && qtc < 460){
                setDebugQT("QTc Interval: " + qtc, "#00F925");
                qt_short = false;
                qt_long = false;
            } 
            if(qtc >= 460){
                setDebugQT("QTc Interval: " + qtc, "red");
                qt_long = true;
            }
        }
        setQTStatus(qt_long, qt_short);
    }

    prevPoint = graphPoint;

    if(((Date.now() - startTime) > updateFrequency) && smsNotify){
        console.log("Sending patient update: " + avgBPM);
        sendMessage("Patient Update", "The current patient BPM is " + avgBPM);
        startTime = Date.now();
    }

    if(qrs_long == false
        && qrs_short == false
        && qt_long == false
        && qt_short == false
        && bpm_low == false
        && bpm_high == false
        && is_flatline == false){
        setNormal(true);
    } else { setNormal(false); }
    
}

//***********************************************\\

byteArrayToLong = function(/*byte[]*/byteArray) {
        var value = 0;
        for ( var i = byteArray.length - 1; i >= 0; i--) {
                value = (value * 256) + byteArray[i];
        }

        return value;
};

ekg.onConnected = function(connectionInfo) {
    console.log("connected to ekg");
    ekg.serialID = connectionInfo.connectionId;
};

ekg.connect = function() {
    // FOR 2013 MACBOOK PRO
    chrome.serial.connect("/dev/tty.usbmodem1411", {bitrate: 57600}, ekg.onConnected);

    // FOR 2010 MACBOOK PRO
    //chrome.serial.connect("/dev/tty.usbmodemfa141", {bitrate: 57600}, ekg.onConnected);
};

ekg.resetBuffer = function() {
    ekg.buffer=[]
};

ekg.pointCount = 0;
ekg.vals = [];
for(var i = 0; i < dataLength; i += 1){
    ekg.vals.push({
        x: i,
        y: 200
    })
}

ekg.processPacket = function() {
    //console.log(
    //  byteArrayToLong([ekg.buffer[5], ekg.buffer[4]])+ ","+
    //  byteArrayToLong([ekg.buffer[7], ekg.buffer[6]])+ ","+
    //  byteArrayToLong([ekg.buffer[9], ekg.buffer[8]])
    //);
    ekg.pointCount++;
    var graphPoint = {
        y: byteArrayToLong([ekg.buffer[7], ekg.buffer[6]]),
        x: ekg.pointCount
    };

    checkHeart(graphPoint);
    if(currentPos >= dataLength){
        currentPos = 0;
    }

    ekg.vals[currentPos].y = graphPoint.y;
    currentPos += 1;
    

    /*
    ekg.vals.push(graphPoint);
    if (ekg.vals.length > 500)
    {
        ekg.vals.shift();
    }
    */

    chart.render();
    ekg.resetBuffer();
};

ekg.handleData = function(data) {
    if (data.data) {
        vals = new Uint8Array(data.data);
        for (var i = 0; i < vals.length; i++) {
            if (ekg.buffer.length === 0) {
                if (vals[i] === 165) {
                    ekg.buffer.push(165);
                }
            } else if (ekg.buffer.length === 1) {
                if (vals[i] === 90) {
                    ekg.buffer.push(90);
                } else {
                    ekg.resetBuffer();
                }
            } else if (ekg.buffer.length >= 2) {
                if (ekg.buffer.length === 16) {
                    if (vals[i] === 1) {
                        ekg.processPacket();
                    } else {
                        ekg.resetBuffer();
                    }
                } else {
                    ekg.buffer.push(vals[i]);
                }
            }
        }
    }
};

var dps;
var chart;

$(document).ready(function() {
    dps = []; // dataPoints

    chart = new CanvasJS.Chart("chartContainer",{
        title :{
            text: "Electrocardiograph"
        },
        backgroundColor:"black",
        axisY:{
            gridColor: "black",
            interval: 200,
            maximum: 1000
        },
        toolTip: {
            enabled: false
        },
        data: [{
            color: "#00F925",
            type: "line",
            lineThickness: 3,
            dataPoints: ekg.vals
        }]
    });
});

var xVal = 0;
var yVal = 100;
var updateInterval = 20;

// actually do stuff
ekg.resetBuffer();
chrome.serial.onReceive.addListener(ekg.handleData);
ekg.connect();


