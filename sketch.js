let webcam;
let detector;

let videoFrame;

let state = 0;


let btn_pause = [];
let btn_record = [];
let btn_stop = [];
let stateIndicator = [];

let recordingTime = '00:00:00';
let recordingStartTime;

let peopleNumber = 0;


let pausedStartTime = 0; //Number type variable
let pausedTime = 0; //Number type variable
let totalPausedTime = 0; //Number type variable


let detectedObjects = [];

let myWriter;
let writerMsg='';



function preload() {  
  detector = ml5.objectDetector('cocossd');
  
  videoFrame = loadImage('img/video_preview.png');
  
  btn_pause[0] = loadImage('img/pause_disabled.png');
  btn_pause[1] = loadImage('img/pause_activated.png');
  
  btn_record[0] = loadImage('img/record_stop.png');
  btn_record[1] = loadImage('img/record_recording.png');
  btn_record[2] = loadImage('img/record_paused.png');
  btn_record[3] = loadImage('img/record_saved.png');
  
  btn_stop[0] = loadImage('img/stop_disabled.png');
  btn_stop[1] = loadImage('img/stop_activated.png');
  
}


function setup() {
  createCanvas(1920, 1080);
  webcam = createCapture(VIDEO);
  webcam.size(1329, 1080);
  webcam.hide();

  myVideoRec = new P5MovRec();
  
  
  detector.detect(webcam, gotDetections);
}

function draw() {
  background(255);
  
  calculateRecordingTime();

  drawVideoPreview(0,0,1329,1080);

  peopleNumber = 0;
  
  doCOCOSSD(state);
  
  drawButtons(state);
  
  drawStatusBar(state);  

  

  writeLog(state); 



  fill(0); 
  textFont('Inter');
  textSize(32);
  
  let currentTime = ''+nf(hour(),2,0)+':'+nf(minute(),2,0)+':'+nf(second(),2,0);
  let currentDate = ''+year()+'.'+nf(month(),2,0)+'.'+nf(day(),2,0)+'.';
  
  textAlign(LEFT);
  text("Recording time: " + recordingTime, 1407, 140);
  textAlign(LEFT);
  text("Current time: " + currentTime, 1407, 70);
  textAlign(LEFT);
  text("Passengers: " + peopleNumber, 1407, 210);

  
}



//==================== 1.Draw Video Preview
function drawVideoPreview(x, y, w, h){
  image(webcam, x, y, w, h);
  image(videoFrame, x, y, w, h);
}


//==================== 2.Draw Buttons

function drawButtons(currentState){
  let pause_stop_button_number = 0;
  if(currentState == 1){
    pause_stop_button_number = 1;
  }  
  image(btn_pause[pause_stop_button_number], 1482, 898, 80, 80); //42부분 바꾸면 크기 바뀜
  image(btn_record[currentState], 1583, 898, 80, 80);
  image(btn_stop[pause_stop_button_number], 1684, 898, 80, 80);
  
  
}




//==================== 3.Draw Status Bar
function drawStatusBar(currentState){


  fill(0, 0, 0, 150);  // 검정색 배경, 150은 투명도
  rect(47, 41, 282 , 58, 40);  // 모서리 반지름을 40으로 설정

  fill(0, 0, 0, 150);  // 검정색 배경, 150은 투명도
  rect(350, 41, 141 , 58, 40);  // 모서리 반지름을 40으로 설정
  
  fill(0, 0, 0, 150);  // 검정색 배경, 150은 투명도
  rect(47, 115, 282 , 58, 40);  // 모서리 반지름을 40으로 설정  

  
  textFont('Inter');
  textSize(32);
  
  let currentTime = ''+nf(hour(),2,0)+':'+nf(minute(),2,0)+':'+nf(second(),2,0);
  let currentDate = ''+year()+'.'+nf(month(),2,0)+'.'+nf(day(),2,0)+'.';
  
  if(currentState == 0){
    noFill();
    stroke(255,153);  
    strokeWeight(2);
    ellipse(80,145,32,32); 
    fill(255,153);
    noStroke();
    textAlign(LEFT);
    text(recordingTime, 119, 155); 
    textAlign(CENTER);
    fill(255);  
    text(currentTime, 420, 80); 
    textAlign(LEFT);
    text(currentDate, 101, 80); 
    fill(0);
    textAlign(LEFT);
    text("Tap to record", 1510, 866);
    
  }else if(currentState == 1){
    fill(202,38,38);
    noStroke();
    ellipse(80,145,32,32); 
    fill(202,38,38);
    noStroke();
    textAlign(LEFT);
    text(recordingTime, 119, 155); 
    fill(255);  
    textAlign(CENTER);
    text(currentTime, 420, 80); 
    textAlign(LEFT);
    text(currentDate, 101, 80); 
    fill(255, 0, 0);
    textAlign(LEFT);
    text("Recording", 1535, 866);
  }else if(currentState == 2){
    noFill();
    stroke(202,38,38);
    strokeWeight(2);
    ellipse(80,145,32,32); 
    fill(202,38,38);
    noStroke();
    textAlign(LEFT);
    text(recordingTime, 119, 155); 
    fill(255,153);
    textAlign(CENTER);
    text(currentTime, 420, 80); 
    textAlign(LEFT);
    text(currentDate, 101, 80);
    fill(0);
    textAlign(LEFT);
    text("Paused", 1560, 866);
  }else if(currentState == 3){
    noFill();
    stroke(255,153);
    strokeWeight(2);
    ellipse(80,145,32,32); 
    fill(255,153);
    noStroke();
    textAlign(LEFT);
    text(recordingTime, 119, 155); 
    textAlign(CENTER);
    fill(255);  
    text(currentTime, 420, 80); 
    textAlign(LEFT);
    text(currentDate, 101, 80); 
    fill(255, 0, 0);
    textAlign(LEFT);
    text("Saved", 1565, 866);
  }
}

function gotDetections(error, results) {
  if (error) {
    console.error(error);
  }
  
  detectedObjects = results;
  detector.detect(webcam, gotDetections);
}

//==========================BUTTON ACTION ADDED===============================
function mouseReleased(){
  if(state == 0){
    if(dist(mouseX, mouseY, 1626, 935) <= 40){ // for Recording BTN
      state = 1; //go to 1.Recording Page from 0.Main Page.
      recordingStartTime = millis();
      startLog();
      myVideoRec.startRec(); // start recording video
    }
  }else if(state == 1){
    if(dist(mouseX, mouseY, 1521, 935) <= 40){ // for Pause BTN
      state = 2; //go to 2.Paused Page from 1.Recording Page.
      pausedStartTime = millis();
    }
    if(dist(mouseX, mouseY, 1721, 935) <= 40){ // for Stop BTN
      state = 3; //go to 3.Saved Page from 1.Recording Page.
      initializeTimes();
      saveLog();
      myVideoRec.stopRec(); // stop and save the video
    }
  }else if(state == 2){
    if(dist(mouseX, mouseY, 1626, 935) <= 40){ // for Recording BTN
      state = 1; //go to 1.Recording Page from 2.Paused Page.
      totalPausedTime = totalPausedTime + pausedTime;
    }
  }else if(state == 3){
    if(dist(mouseX, mouseY, 1626, 935) <= 21){ // for Recording BTN
      state = 0; //go to 0.Main Page from 3.Saved Page.
    }
  }
}


function initializeTimes(){
  recordingStartTime = 0;
  pausedStartTime = 0;
  pausedTime = 0;
  totalPausedTime = 0;
}

function calculateRecordingTime(){
  let cur_time = millis();
  
  if(state == 0){ //0.Main Page
    recordingTime = '00:00:00';
  }else if(state == 1){ //1.Recording Page
    let rec_time = cur_time - recordingStartTime - totalPausedTime;
    let rec_sec = int(rec_time / 1000) % 60;
    let rec_min = int(rec_time / (1000*60)) % 60;
    let rec_hour = int(rec_time / (1000*60*60)) % 60;
    
    recordingTime = ''+nf(rec_hour,2,0)+':'+nf(rec_min,2,0)+':'+nf(rec_sec,2,0);
  }else if(state == 2){ //2.Paused Page
    pausedTime = millis() - pausedStartTime;
  }else if(state == 3){ //3.Saved Page
    recordingTime = '00:00:00';
  }
}
//==========================COCOSSD ADDED===============================
function doCOCOSSD(){
  let tempMsg='';

  push();
  for (let i = 0; i < detectedObjects.length; i++) {
    let object = detectedObjects[i];
    
    if(object.label == 'person'){
      peopleNumber = peopleNumber + 1;
      
      stroke(255,0,254);
      strokeWeight(2);
      noFill();
      rect(object.x, object.y, object.width, object.height);
      noStroke();
      fill(255,0,254);
      textSize(10);
      text(object.label+' '+peopleNumber, object.x, object.y - 5);
      
      let centerX = object.x + (object.width/2);
      let centerY = object.y + (object.height/2);
      strokeWeight(4);
      stroke(255,0,254);
      point(centerX, centerY);
      
      tempMsg = tempMsg+','+peopleNumber+','+centerX+','+centerY;
      //개별 사람마다의 X, Y 좌표값 저장
    }
  }
  pop();
  let millisTime = int(millis() - recordingStartTime - totalPausedTime);
  writerMsg = ''+recordingTime+','+millisTime+','+peopleNumber+''+tempMsg;
  // 현재 레코딩 타임과 함께 tempMsg 저장
}
//==========================WRITER ADDED===============================
function startLog(){
  let mm = nf(month(),2,0);
  let dd = nf(day(),2,0);
  let ho = nf(hour(),2,0);
  let mi = nf(minute(),2,0);
  let se = nf(second(),2,0);
  
  let fileName = 'data_'+ mm + dd +'_'+ ho + mi + se+'.csv';
  
  myWriter = createWriter(fileName);
}
function saveLog(){
  myWriter.close();
  myWriter.clear();
}
function writeLog(currentState){
  if(currentState == 1){
    myWriter.print(writerMsg);
  }
}





















