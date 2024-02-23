var originalImage = null;
var originalImageFileURL = null;

var scaleHeight = 32;
var scaleWidth = 128;

var rotateAngle = 0;

var onColor = 'white';
var offColor = 'black';
var edgeOnColor = offColor;
var edgeOffColor = onColor;

var arrayHorizontal = true;

var backgroundColor = hexToRgb('#000000');

function hexToRgb(hex) {
  var rgb = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
    , (m, r, g, b) => '#' + r + r + g + g + b + b)
    .substring(1).match(/.{2}/g)
    .map(x => parseInt(x, 16))
  rgb.push(255);
  return rgb;
}

function toggleArrayOrder() {
  arrayHorizontal = !arrayHorizontal;
}

function updateScale() {
  scaleWidth = document.getElementById("widthInput").value;
  scaleHeight = document.getElementById("heightInput").value;
}

function rotateImage() {
  var canvas = document.getElementById("imageEditorCanvas");
  var ctx = canvas.getContext("2d");

  rotateAngle += 90;

  var x = canvas.width / 2;
  var y = canvas.height / 2;
  var width = originalImage.width;
  var height = originalImage.height;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rotateAngle * Math.PI) / 180);
  ctx.drawImage(originalImage, -width / 2, -height / 2, width, height);
  ctx.restore();
}

function setBackgroundColor(colorWheel) {
  var colorSelector = document.getElementById("backgroundColor")
  var colorHex = document.getElementById("backgroundColorHex")

  if (colorWheel) {
    backgroundColor = colorSelector.value;
  } else {
    backgroundColor = colorHex.value;
  }

  colorSelector.value = backgroundColor;
  colorHex.value = backgroundColor;

  backgroundColor = hexToRgb(backgroundColor);
}

function scaleImage() {
  var editorCanvas = document.getElementById("imageEditorCanvas");

  var canvas = document.getElementById("imageDisplay");
  var ctx = canvas.getContext("2d");

  canvas.height = scaleHeight;
  canvas.width = scaleWidth;

  ctx.save();
  ctx.scale(scaleWidth / originalImage.width, scaleHeight / originalImage.height);
  ctx.drawImage(editorCanvas, 0, 0);
  ctx.restore();
}


function setEditorImage(imageFilePath) {
  return new Promise((resolve, reject) => {
    var canvas = document.getElementById("imageEditorCanvas");
    var ctx = canvas.getContext("2d");
    originalImage = new Image();

    originalImage.onload = function() {
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      ctx.drawImage(originalImage, 0, 0, originalImage.width, originalImage.height);
      resolve()
    };
    originalImage.onerror = reject;
    originalImage.src = imageFilePath;
  });
}

function toggleEdgeColors() {
  [edgeOnColor, edgeOffColor] = [edgeOffColor, edgeOnColor]
}

function exportEdgeColors() {
  resetCanvas();
  runEdgeFilter();
  dumpHexData();
}

function readFile(input) {
  let file = input.files[0];
  let reader = new FileReader();

  reader.readAsDataURL(file);

  reader.onload = async function() {
    originalImageFileURL = reader.result;
    await setEditorImage(reader.result);
  };

  reader.onerror = function() {
    console.log(reader.error);
  };
}

function isSameColor(colorA, colorB) {
  if (colorA === null || colorB === null)
    return false;

  const red = Math.abs(colorA[0] - colorB[0]);
  const green = Math.abs(colorA[1] - colorB[1]);
  const blue = Math.abs(colorA[2] - colorB[2]);
  const alpha = Math.abs(colorA[3] - colorB[3]);
  return (red + green + blue + alpha) < 50;
}

function runEdgeFilter() {
  var canvas = document.getElementById("imageDisplay");
  var ctx = canvas.getContext("2d");

  var prevColor = null;

  for (let row = 0; row < canvas.height; row++) {
    for (let col = 0; col < canvas.width; col++) {
      var color = ctx.getImageData(col, row, 1, 1).data;

      var fillColor = row + col === 0 ? edgeOnColor : edgeOffColor;
      if (isSameColor(prevColor, color)) {
        fillColor = edgeOnColor;
      }
      prevColor = color;

      ctx.fillStyle = fillColor;
      ctx.fillRect(col, row, 1, 1);
    }
  }
}

function toHexString(binaryString) {
  const intValue = parseInt(binaryString, 2); // Parse binary string to integer
  return "0x" + intValue.toString(16).padStart(2, '0'); // Convert to hex and pad if nec
}

function convertBitsToHexArray(bits) {
  var hexArray = []

  for (let index = 0; index < bits.length; index += 8) {
    var byte = bits.substring(index, index + 8);
    var hex = toHexString(byte);
    hexArray.push(hex);
  }

  return hexArray.toString();
}

function dumpHexData() {
  var div = document.getElementById("hexDataDiv");
  div.className = "";

  var canvas = document.getElementById("imageDisplay");
  var ctx = canvas.getContext("2d");

  var convertToBit = (color) => {
    const isWhite = color[0] === 255 && color[1] === 255 && color[2] === 255;
    return isWhite ? 1 : 0;
  }

  var bitsDump = "";

  if (arrayHorizontal) {
    for (let row = 0; row < canvas.height; row++) {
      for (let col = 0; col < canvas.width; col++) {
        var color = ctx.getImageData(col, row, 1, 1).data;
        bitsDump += convertToBit(color);
      }
    }
  } else {
    for (let rowJump = 0; rowJump < canvas.height / 8; rowJump++) {
      for (let col = 0; col < canvas.width; col++) {
        for (let row = rowJump; row < rowJump + 8; row++) {
          var color = ctx.getImageData(col, row, 1, 1).data;
          bitsDump += convertToBit(color);
        }
      }
    }
  }

  var dumpTextArea = document.getElementById("hexDataDump");
  dumpTextArea.innerText = convertBitsToHexArray(bitsDump);
}

function resetCanvas() {
  scaleImage();
}

function removeBackground() {
  var canvas = document.getElementById("imageDisplay");
  var ctx = canvas.getContext("2d");

  var isBackground = (color) => {
    return isSameColor(backgroundColor, color);
  }

  for (let row = 0; row < canvas.height; row++) {
    for (let col = 0; col < canvas.width; col++) {
      var color = ctx.getImageData(col, row, 1, 1).data;

      var fillColor = onColor;
      if (isBackground(color)) {
        fillColor = offColor;
      }

      ctx.fillStyle = fillColor;
      ctx.fillRect(col, row, 1, 1);
    }
  }

}

function exportCanvas() {
  resetCanvas();
  removeBackground();
  dumpHexData();
}

