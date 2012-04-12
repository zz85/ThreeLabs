/* 
 * @author https://github.com/zz85 | @blurspline
 *
 * a generative UV Texture Grids use for use checking UVs
 * 
 * I created this because I was trying to fix some uvs using the online editors.
 * Couldn't hotlink to github as they can't do cors, so I base64 encoded it with my bookmarklet.
 * Due to the large size, jsfiddle syntax highlight chokes the browser, JSbin codemirror manages it okay,
 * but a bug was trancating the huge javascript source. so i decided to write a simple procedural one here.
 *
 * but really, the uv wraps here are really pretty :) http://www.pixelcg.com/blog/?p=146 
 */
function generateImage() {
  
  var canvas = document.createElement('canvas');
  var width = 1024;
  var height = 1024;
  var gridx = 10;
  var gridy = 10;
  var gridwidth = width/gridx;
  var gridheight = height/gridy;
  
  canvas.width = width;
  canvas.height = height;

  var ctx = canvas.getContext('2d');
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  
  var abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var abci = 0;
  
  // https://developer.mozilla.org/en/Canvas_tutorial/Applying_styles_and_colors
  for (var i=0;i<gridx;i++){  
    for (var j=0;j<gridy;j++){  
      ctx.fillStyle = 'rgb(' + Math.floor(255-255*i/gridx) + ',' +   
                       Math.floor(255-255*j/gridy) + ',0)';  
      ctx.fillRect(j*gridwidth,i*gridheight,gridwidth,gridheight);
      ctx.strokeRect(j*gridwidth,i*gridheight,gridwidth,gridheight);
      
      if ((j + i) % 2 === 0) {
        ctx.font = "25pt Arial bold";
        ctx.fillStyle = 'rgba(255,255,255, 0.5)';
        ctx.fillText(abc[abci], j*gridwidth+ 4,(i +1)*gridheight -4);
        ctx.font = "20pt Arial bold";
        ctx.fillStyle = 'rgba(255,255,0, 1)';
        ctx.fillText(j, (j+1)*gridwidth - 30,(i +1)*gridheight -10);

      }
    }

    abci++;
  }
  return canvas;
  
}