/*
 * Yeah, I had another crazy idea I had while in the bath just now - 
 * the ability to render THREE.js scenes in ASCII - 
 * with a THREE.AsciiRenderer. Okay, maybe this isn't original (https://github.com/trevlovett/AsciiTracer)
 * and ASCII has been quite a "popular" thing I think 
 * like http://256.io/escapes.js/ but I thought I could do a quick meshup in 15 minutes.
 * okay, at least with some help from some ASCII converters. I looked quickly at 
 * https://github.com/saw/Canvas-ASCII-Art#readme, https://github.com/horndude77/ascii-canvas
 * but finally decided to go with http://www.nihilogic.dk/labs/jsascii/
 * 'cause it looked the most hackable :)
 * okay, ended up i took more than 15 minutes, because most of the time turned into debugging 
 * and squashing some bugs.
 * 
 * 16 April 2012 - @blurspline
 */
  
THREE.ASCIIRenderer = function() {

	// Some ASCII settings
	var bResolution = 0.15;
	var iScale = 1;
	var bColor = false; // nice but slows down rendering!
	var bAlpha = false;
	var bBlock = false;
	var bInvert = false;
	var strResolution = 'low';

	
	var charSet = ' .:-=+*#%@';
	// darker bolder character set from https://github.com/saw/Canvas-ASCII-Art/
	//' .\'`^",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'.split('');

	var canvasRenderer = new THREE.CanvasRenderer();
	var width, height;

	var domElement = document.createElement('div');
	var oAscii = document.createElement("table");
	domElement.appendChild(oAscii);

	var iWidth, iHeight;
	var oImg;

	this.setSize = function(w, h) {
		width = w;
		height = h;
		canvasRenderer.setSize( w, h );

		initAsciiSize();

	}


	this.render = function() {
		canvasRenderer.render.apply(canvasRenderer, arguments);
		asciifyImage(canvasRenderer, oAscii);
	}

	this.domElement = domElement;


	// Throw in ascii library from http://www.nihilogic.dk/labs/jsascii/jsascii.js
	/*
	* jsAscii 0.1
	* Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
	* MIT License [http://www.nihilogic.dk/licenses/mit-license.txt]
	*/

	function initAsciiSize() {
		iWidth = Math.round(width * fResolution);
		iHeight = Math.round(height * fResolution);

		oCanvas.width = iWidth;
		oCanvas.height = iHeight;
		// oCanvas.style.display = "none";
		// oCanvas.style.width = iWidth;
		// oCanvas.style.height = iHeight;

		oImg = canvasRenderer.domElement;
		if (oImg.style.backgroundColor) {
			oAscii.rows[0].cells[0].style.backgroundColor = oImg.style.backgroundColor;
			oAscii.rows[0].cells[0].style.color = oImg.style.color;
		}

		oAscii.cellSpacing = 0;
		oAscii.cellPadding = 0;

		var oStyle = oAscii.style;
		oStyle.display = "inline";
		oStyle.width = Math.round(iWidth/fResolution*iScale) + "px";
		oStyle.height = Math.round(iHeight/fResolution*iScale) + "px";
		oStyle.whiteSpace = "pre";
		oStyle.margin = "0px";
		oStyle.padding = "0px";
		oStyle.letterSpacing = fLetterSpacing + "px";
		oStyle.fontFamily = strFont;
		oStyle.fontSize = fFontSize + "px";
		oStyle.lineHeight = fLineHeight + "px";
		oStyle.textAlign = "left";
		oStyle.textDecoration = "none";
	}


	var aDefaultCharList = (" .,:;i1tfLCG08@").split("");
	var aDefaultColorCharList = (" CGO08@").split("");
	var strFont = "courier new, monospace";

	var oCanvasImg = canvasRenderer.domElement;

	var oCanvas = document.createElement("canvas");
	if (!oCanvas.getContext) {
		return;
	}
	var oCtx = oCanvas.getContext("2d");
	if (!oCtx.getImageData) {
		return;
	}

	var aCharList = (bColor ? aDefaultColorCharList : aDefaultCharList);

	if (charSet) aCharList = charSet; 

	var fResolution = 0.5;
	switch (strResolution) {
		case "low" : 	fResolution = 0.25; break;
		case "medium" : fResolution = 0.5; break;
		case "high" : 	fResolution = 1; break;
	}

	if (bResolution) fResolution = bResolution;

	// Setup dom
	var fFontSize = (2/fResolution)*iScale;
	var fLineHeight = (2/fResolution)*iScale;

	// adjust letter-spacing for all combinations of scale and resolution to get it to fit the image width.
	var fLetterSpacing = 0;
	if (strResolution == "low") {
		switch (iScale) {
			case 1 : fLetterSpacing = -1; break;
			case 2 : 
			case 3 : fLetterSpacing = -2.1; break;
			case 4 : fLetterSpacing = -3.1; break;
			case 5 : fLetterSpacing = -4.15; break;
		}
	}
	if (strResolution == "medium") {
		switch (iScale) {
			case 1 : fLetterSpacing = 0; break;
			case 2 : fLetterSpacing = -1; break;
			case 3 : fLetterSpacing = -1.04; break;
			case 4 : 
			case 5 : fLetterSpacing = -2.1; break;
		}
	}
	if (strResolution == "high") {
		switch (iScale) {
			case 1 : 
			case 2 : fLetterSpacing = 0; break;
			case 3 : 
			case 4 : 
			case 5 : fLetterSpacing = -1; break;
		}
	}


	// can't get a span or div to flow like an img element, but a table works?


	// convert img element to ascii
	function asciifyImage(canvasRenderer, oAscii) 
	{

		oCtx.clearRect(0, 0, iWidth, iHeight);
		oCtx.drawImage(oCanvasImg, 0, 0, iWidth, iHeight);
		var oImgData = oCtx.getImageData(0, 0, iWidth, iHeight).data;

		// Coloring loop starts now
		var strChars = "";

		for (var y=0;y<iHeight;y+=2) {
			for (var x=0;x<iWidth;x++) {
				var iOffset = (y*iWidth + x) * 4;
	
				var iRed = oImgData[iOffset];
				var iGreen = oImgData[iOffset + 1];
				var iBlue = oImgData[iOffset + 2];
				var iAlpha = oImgData[iOffset + 3];
				var iCharIdx;

				var fBrightness;
			  
				fBrightness = (0.3*iRed + 0.59*iGreen + 0.11*iBlue) / 255;
				// fBrightness = (0.3*iRed + 0.5*iGreen + 0.3*iBlue) / 255;
				
				if (iAlpha == 0) {
  					// should calculate alpha instead, but quick hack :)
					//fBrightness *= (iAlpha / 255); 
					fBrightness = 1;
					
				} 
							 
				iCharIdx = Math.floor((1-fBrightness) * (aCharList.length-1));

				if (bInvert) {
					iCharIdx = aCharList.length - iCharIdx - 1;
				}
			  
				// good for debugging
				//fBrightness = Math.floor(fBrightness * 10);
				//strThisChar = fBrightness;
			  
				var strThisChar = aCharList[iCharIdx];		
			  
				if (strThisChar===undefined || strThisChar == " ") 
					strThisChar = "&nbsp;";
			  
				if (bColor) {
					strChars += "<span style='"
						+ "color:rgb("+iRed+","+iGreen+","+iBlue+");"
						+ (bBlock ? "background-color:rgb("+iRed+","+iGreen+","+iBlue+");" : "")
						+ (bAlpha ? "opacity:" + (iAlpha/255) + ";" : "")
						+ "'>" + strThisChar + "</span>";
				} else {
					strChars += strThisChar;
				}
			}
			strChars += "<br/>";
		}
	

		oAscii.innerHTML = "<tr><td>" + strChars + "</td></tr>";
		
		// return oAscii;
	}


	// end modified asciifyImage block

	
};