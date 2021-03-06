// Tordenskjold som lille

// global variabels
let image = document.querySelector('img');
let heightLarge = 300;
let heightSmall = 100;
let text = document.querySelector('p');
let textSmall = 'Klik på billedet hvis du vil se Tordenskjold som lille';
let textLarge = 'Klik på billedet hvis du vil se Tordenskjold som stor ';

image.onclick = function() {

    // local variabel
    let height = image.getAttribute('height');
    
    if( height == heightLarge) {
	image.setAttribute ('height', heightSmall);
	text.textContent = textLarge;
	setCookie('imageSize', 'Small', 30);
    } else {
	image.setAttribute ('height', heightLarge);
	text.textContent = textSmall;
	setCookie('imageSize', 'Large', 30);
    }
}

function setCookie(cname,cvalue,exdays) {
    
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}


function getCookie(cname) {
    
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function checkCookie() {
    
  var size = getCookie('imageSize');
  if (size == "") {
	
    // Set large image, textSmall and imageSize cookie	
    image.setAttribute ('height', heightLarge);
    text.textContent = textSmall;
    setCookie('imageSize', 'Large', 30);
  
  } else {

    // Set state according to the value of the cookie  
    if( size == 'Large') {
	text.textContent = textSmall;
	image.setAttribute('height', heightLarge);
    } else {
	text.textContent = textLarge; 
	image.setAttribute('height', heightSmall);
    }
  }
}

checkCookie();
