const height = 128;
const width = 32;

var lastFileUrl = null;

var emptyColor = 'black';
var nonEmptyColor = 'white';

async function resetCanvas() {
  await setCanvasImage(lastFileUrl);
}

function toggleEdgeColors() {
  [emptyColor, nonEmptyColor] = [nonEmptyColor, emptyColor]
}

function setCanvasImage(imageFile) {
  return new Promise((resolve, reject) => {
    var canvas = document.getElementById("imageDisplay");
    var ctx = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    var image = new Image();
    image.onload = function() {
      ctx.drawImage(image, 0, 0, width, height);
      resolve()
    };

    image.onerror = reject;

    image.src = imageFile;
  });
}

function readFile(input) {
  let file = input.files[0];
  let reader = new FileReader();

  reader.readAsDataURL(file);

  reader.onload = async function() {
    lastFileUrl = reader.result;
    await setCanvasImage(reader.result);
  };

  reader.onerror = function() {
    console.log(reader.error);
  };
}

function runEdgeFilter() {
  var canvas = document.getElementById("imageDisplay");
  var ctx = canvas.getContext("2d");

  var prevColor = null;

  var isSameColor = (colorA, colorB) => {
    if (colorA === null || prevColor === null)
      return false;

    const red = Math.abs(colorA[0] - colorB[0]);
    const green = Math.abs(colorA[1] - colorB[1]);
    const blue = Math.abs(colorA[2] - colorB[2]);
    const alpha = Math.abs(colorA[3] - colorB[2]);
    return (red + green + blue + alpha) > 50;
  }

  for (let col = 0; col < width; col++) {
    for (let row = 0; row < height; row++) {
      var color = ctx.getImageData(col, row, 1, 1).data;

      var fillColor = nonEmptyColor;
      if (isSameColor(prevColor, color)) {
        fillColor = emptyColor;
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

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      var color = ctx.getImageData(col, row, 1, 1).data;
      bitsDump += convertToBit(color);
    }
  }

  var dumpTextArea = document.getElementById("hexDataDump");
  dumpTextArea.innerText = convertBitsToHexArray(bitsDump);
}

async function convert() {
  await resetCanvas();
  runEdgeFilter();
  dumpHexData();
}












