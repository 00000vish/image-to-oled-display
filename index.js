function setCanvasImage(imageFile) {
  var canvas = document.getElementById("imageDisplay");
  var ctx = canvas.getContext("2d");

  var image = new Image();
  image.onload = function() {
    ctx.drawImage(image, 0, 0);
    console.log("print done ")
  };

  image.src = imageFile;
}

function readFile(input) {

  let file = input.files[0];

  let reader = new FileReader();

  reader.readAsDataURL(file);

  reader.onload = function() {
    setCanvasImage(reader.result);
  };

  reader.onerror = function() {
    console.log(reader.error);
  };
}
