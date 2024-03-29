var name;
var timeAtPost;
    
// Convert H:M:S to seconds
function hmsToSeconds(s) {
   var b = s.split(':');
   return parseInt(b[0])*3600 + parseInt(b[1])*60 + parseInt(b[2]);
}

// Convert digit to text with leading 0 
function z(n){return (n<10?'0':'') + n;} 

// Convert seconds to hh:mm:ss
function secondsToHMS(secs) {
   return z(Math.floor(secs/3600)) + ':' + z(Math.floor((secs%3600) / 60)) + ':' + z(secs%60);
}

// Convert Date to hh:mm:ss
function timeToHMS() {
   var d = new Date();
   return( z(d.getHours())+":"+z(d.getMinutes())+":"+z(d.getSeconds()) )
}

function getCookie(cname) {   
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');

  console.log('getCookie' + " " + decodedCookie);
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    console.log(c);
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}


function setCookie(cname, cvalue, exdays) {   
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    console.log( cname + "=" + cvalue + ";" + expires + ";path=/");
}

function deleteCookie(cname) {
    document.cookie = cname + "=" + ";" + "expires=Thu, 01 Jan 1970 00:00:00 UTC;" + ";path=/";
    console.log(cname + "=" + ";" + "expires=Thu, 01 Jan 1970 00:00:00 UTC;" + ";path=/");
}

function logOutName() {   
    console.log("logOutName");
    var name  = getCookie('deltager');

    if ( name == "" ) {
	var btn = document.querySelector("button");
        btn.remove();
	    
	document.getElementById("text1").innerHTML = "Du er ikke tilmeldt løbet.";
        document.getElementById("text2").innerHTML = "";
        document.getElementById("text3").innerHTML = "";
        document.getElementById("text4").innerHTML = "";
        document.getElementById("text5").innerHTML = "";
    } else {
        var posts = getCookie('poster');
        var time  = secondsToHMS(hmsToSeconds(timeToHMS())-
			     hmsToSeconds(getCookie('starttid')));

        var btn = document.querySelector("button");
        btn.remove();
	
        document.getElementById("text1").innerHTML = "Hej " + name + ", du er meldt ud af løbet.";
        document.getElementById("text2").innerHTML = "Du har besøgt post " + posts + ".";
        document.getElementById("text3").innerHTML = "Din tid er " + time + ".";
        document.getElementById("text4").innerHTML = "";
        document.getElementById("text5").innerHTML = "";
	
        deleteCookie('deltager');
        deleteCookie('poster');
        deleteCookie('starttid'); 
    }
}

function logInName() {    
    console.log("logInName");
    name = document.querySelector("input").value;

    if ( name == "" ) {
	document.getElementById("text5").innerHTML = "<b>Skriv navn i firkant</b>";
    } else {
	console.log(name);
	document.getElementById("text1").innerHTML = "Du har besøgt post " + post + ".";
	document.getElementById("text2").innerHTML = "";
	document.getElementById("text3").innerHTML = "";
        document.getElementById("text4").innerHTML = "";
        
        document.getElementById("text5").innerHTML = "Nu er du tilmeldt som "+ name + ".";
	var btn = document.querySelector("button");
        btn.remove();
	var nameInput = document.querySelector("input");
        nameInput.remove();

	btn = document.createElement("button");
        btn.innerHTML = "<b>Meld dig ud af løbet</b>";
        document.body.appendChild(btn);
        btn.addEventListener("click",logOutName);
	
	setCookie('deltager', name, 30);
	setCookie('starttid', timeAtPost, 30);
	setCookie('poster', post, 30);
	
    }
}

function showState() {
    var name  = getCookie('deltager');
    
    if ( name != "") {
	
	document.getElementById("text2").innerHTML = "";
	    
	var posts = getCookie('poster');
	    
        document.getElementById("text3").innerHTML = "Du har allerede besøgt post " + posts + ".";
	console.log(posts + ", " + post);
	setCookie('poster', posts + ", " + post, 30);
	    
	var btn = document.createElement("button");
        btn.innerHTML = "<b>Meld dig ud af løbet</b>";
        document.body.appendChild(btn);
        btn.addEventListener("click", logOutName);
	
    } else {
	
        document.getElementById("text2").innerHTML = "Da det er første gang du besøger en post,";
        document.getElementById("text3").innerHTML = "skal du skrive dit navn i firkanten og trykke";
        document.getElementById("text4").innerHTML = "på knappen Tilmeld dig til løbet.";

        var nameInput = document.createElement("input");
        document.body.appendChild(nameInput);

        var p = document.createElement("p");
        document.body.appendChild(p);

        var btn = document.createElement("button");
        btn.innerHTML = "<b>Tilmeld dig til løbet</b>";
        document.body.appendChild(btn);
        btn.addEventListener("click", logInName);
  }
}


console.log("Du har nu besøgt post "+ post);
timeAtPost = timeToHMS();
console.log(timeAtPost);
showState();


