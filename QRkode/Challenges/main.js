var name;
var timeAtPost;
var textNode;
    
// Convert H:M:S to seconds
function hmsToSeconds(s) {
   var b = s.split(':');
   return parseInt(b[0])*3600 + parseInt(b[1])*60 + parseInt(b[2]);
}
   
// Convert seconds to hh:mm:ss
function secondsToHMS(secs) {
   function z(n){return (n<10?'0':'') + n;}
   return z(Math.floor(secs/3600)) + ':' + z(Math.floor((secs%3600) / 60)) + ':' + z(secs%60);
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

function clearListCookies(){
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++){   
        var spcook =  cookies[i].split("=");
        document.cookie = spcook[0] + "=;expires=Thu, 21 Sep 1979 00:00:01 UTC;" + ";path=/";                                
    }
}

function logOutName() {
    
    console.log("deleteName");
    var name  = getCookie('deltager');
    var posts = getCookie('poster');
    var time  = secondsToHMS(hmsToSeconds(new Date().toLocaleTimeString())-
			     hmsToSeconds(getCookie('starttid')));
	
    document.getElementById("text1").innerHTML = "Hej " + name + ", du er meldt ud af løbet.";
    document.getElementById("text2").innerHTML = "Du har besøgt post " + posts + ".";
    document.getElementById("text3").innerHTML = "Din tid er " + time + ".";
    document.getElementById("text4").innerHTML = "";
    document.getElementById("text5").innerHTML = "Dine svar på udfordringerne:";

    // textNode.remove();

    for (let i = 1; i < 7; i++) {
       	textNode1 = document.createTextNode("Post "+ i + ":  ");
	document.body.appendChild(textNode1);

	svar = getCookie('Svar'+i);
	textNode2 = document.createTextNode(svar);
	document.body.appendChild(textNode2);

	const para = document.createElement("p");
        document.body.appendChild(para);
    }
    
    deleteCookie('deltager');
    deleteCookie('poster');
    deleteCookie('starttid');
    clearListCookies();

    const btn = document.querySelector("button");
    btn.remove();
    
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

	const btn = document.querySelector("button");
        btn.remove();
	const nameInput = document.querySelector("input");
        nameInput.remove();

	const answer = document.createElement("button");
        answer.innerHTML = "<b>" + "Svar på udfordring" + " post " + post + "</b>";
        document.body.appendChild(answer);
        answer.addEventListener("click",getAnswer);

	const para = document.createElement("p");
        document.body.appendChild(para);

	const answerInput = document.createElement("input");
        document.body.appendChild(answerInput);

        const p = document.createElement("p");
        document.body.appendChild(p);
	
	setCookie('deltager', name, 30);
	setCookie('starttid', timeAtPost, 30);
	setCookie('poster', post, 30);

	textNode = document.createTextNode("Nu er du tilmeldt som "+ name + ".");
	document.body.appendChild(textNode);
	
	const para1 = document.createElement("p");
        document.body.appendChild(para1);
	
	const btn1 = document.createElement("button");
        btn1.innerHTML = "<b>Meld dig ud af løbet</b>";
        document.body.appendChild(btn1);
        btn1.addEventListener("click", logOutName);
	
    }
}

function getAnswer() {
    console.log("getAnswer");
    answer = document.querySelector("input").value;

    if ( answer == "" ) {
	document.getElementById("text5").innerHTML = "<b>Skriv svar i firkant</b>";
    } else {
	console.log(answer);
	document.getElementById("text5").innerHTML = "Du har svaret på udfordringen på post " + post + ".";

	const btn = document.querySelector("button");
        btn.remove();
	const nameInput = document.querySelector("input");
        nameInput.remove();

	setCookie('Svar'+ post, answer, 30);
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

	const answer = document.createElement("button");
        answer.innerHTML = "<b>Svar på udfordring"  + " post " + post +  "</b>";
        document.body.appendChild(answer);
        answer.addEventListener("click",getAnswer);
	    
	const p = document.createElement("p");
        document.body.appendChild(p);
	    
	const answerInput = document.createElement("input");
        document.body.appendChild(answerInput);

	const p1 = document.createElement("p");
        document.body.appendChild(p1);
	    
	const btn = document.createElement("button");
        btn.innerHTML = "<b>Meld dig ud af løbet</b>";
        document.body.appendChild(btn);
        btn.addEventListener("click",logOutName);
	
    } else {
	
        document.getElementById("text2").innerHTML = "Da det er første gang du besøger en post,";
        document.getElementById("text3").innerHTML = "skal du skrive dit navn i firkanten og trykke";
        document.getElementById("text4").innerHTML = "på knappen Tilmeld dig til løbet.";

        const nameInput = document.createElement("input");
        document.body.appendChild(nameInput);

        const p = document.createElement("p");
        document.body.appendChild(p);

        const btn = document.createElement("button");
        btn.innerHTML = "<b>Tilmeld dig til løbet</b>";
        document.body.appendChild(btn);
        btn.addEventListener("click",logInName);
  }
}


console.log("Du har nu besøgt post "+ post);
timeAtPost = new Date().toLocaleTimeString();
console.log(timeAtPost);
showState();


