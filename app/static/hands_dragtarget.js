const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
videoElement.setAttribute('autoplay', '');
videoElement.setAttribute('muted', '');
videoElement.setAttribute('playsinline', '');
var x,y,width, height;
x = 100;
y = 100;
width = 100;
height = 100;
var bordercolor =[0, 0, 255, 255];

function onResults(results) {
  
  var cx,cy;
  var dx,dy;	
  canvasCtx.save();
  //canvasCtx.translate(canvasElement.width, 0);
  //canvasCtx.scale(-1, 1);
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);
  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
	  var myJSON = JSON.stringify(landmarks[8]);
	  var myJSON2 = JSON.parse(myJSON);
	  cx = parseInt(myJSON2.x*canvasElement.width);
	  cy = parseInt(myJSON2.y*canvasElement.height);
	  
	  var AmyJSON = JSON.stringify(landmarks[12]);
	  var AmyJSON2 = JSON.parse(AmyJSON);
	  dx = parseInt(AmyJSON2.x*canvasElement.width);
	  dy = parseInt(AmyJSON2.y*canvasElement.height);	
	  
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
                     {color: '#00FF00', lineWidth: 5});
      drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 2});
	  
	  if (cx > (x - width/2) && cx < (x + width/2) && cy > (y - height/2) && cy<(y + height/2))
	  {
		  if (dx > (x - width/2) && dx < (x + width/2) && dy > (y - height/2) && dy<(y + height/2))
		  {
			  x = cx;
			  y = cy;
        bordercolor = [255, 0, 0, 255];
		  }else
      {
        bordercolor = [0, 0, 255, 255];
      }
	  }else{
      bordercolor = [0, 0, 255, 255];
    }

    }
  }
  canvasCtx.restore();
  
  let src = cv.imread('output_canvas');
  let pointx1 =  x - width/2;
  let pointy1 =  y - height/2;
  let pointx2 =  x + width/2;
  let pointy2 =  y + height/2;
  
  cv.rectangle(src, new cv.Point(pointx1, pointy1), new cv.Point(pointx2, pointy2), bordercolor, 4);

  
  if (pointx1 > 100 && pointx1 < 250 && pointy1 > 200 && pointy1<350)
  {
	  if (pointx2 > 100 && pointx2 < 250 && pointy2 > 200 && pointy2<350)
	  {
		  cv.putText(src,'Inside', new cv.Point(110, 340), cv.FONT_HERSHEY_SIMPLEX, 1, [255, 0, 0, 255]);
      cv.rectangle(src, new cv.Point(100, 200), new cv.Point(250, 350), [255, 0, 0, 255], 4);
	  }else
	  {
		  cv.putText(src,'Outside', new cv.Point(110, 340), cv.FONT_HERSHEY_SIMPLEX, 1, [0, 0, 255, 255]);
      cv.rectangle(src, new cv.Point(100, 200), new cv.Point(250, 350), [0, 0, 255, 255], 4);
	  }
  }else
  {
	  cv.putText(src,'Outside', new cv.Point(110, 340), cv.FONT_HERSHEY_SIMPLEX, 1, [0, 0, 255, 255]);
    cv.rectangle(src, new cv.Point(100, 200), new cv.Point(250, 350), [0, 0, 255, 255], 4);
  }
  
  cv.imshow('output_canvas', src);
  src.delete();
}

const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});
hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
hands.onResults(onResults);



const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({image: videoElement});
  },
  width: 480,
  height: 480
});
camera.start();
