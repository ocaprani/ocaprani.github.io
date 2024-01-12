var name;
var timeAtPost;

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

function deleteName() {
    
    console.log("deleteName");
    var name  = getCookie('deltager');
    var posts = getCookie('poster');
    var time  = Math.floor(Date.now()/1000) - getCookie('starttid');
    var hour  = Math.floor(time/(60*60));
    var min   = Math.floor((time - hour*60*60)/60);
    var sec   = time - hour*60*60 - min*60;
    var tid   = "";
	
    document.getElementById("text1").innerHTML = "Hej " + name + ", du er meldt ud af løbet.";
    document.getElementById("text2").innerHTML = "Du har besøgt post " + posts + ".";

    if ( hour != 0 ) {
	if ( hour == 1 ) {
	   tid = tid + hour + " time, ";
	} else {
	   tid = tid + hour + " timer, ";
	}
    }
    if ( min != 0 ) {
	if ( min == 1 ) {
	   tid = tid + min + " minut, ";
	} else {
	   tid = tid + min + " minuter, ";
	}
    }
    if ( sec == 1 ) {
	tid = tid + sec + " sekund";
    } else {
	tid = tid + sec + " sekunder";
    }	
    document.getElementById("text3").innerHTML = "Du har brugt " + tid + ".";
    document.getElementById("text4").innerHTML = "";
    document.getElementById("text5").innerHTML = "";
    deleteCookie('deltager');
    deleteCookie('poster');
    deleteCookie('starttid');

    const btn = document.querySelector("button");
    btn.remove();
    
}

function getName() {
    
    console.log("getName");
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
	const btn = document.querySelector("button");
        btn.remove();
	const nameInput = document.querySelector("input");
        nameInput.remove();
	
	setCookie('deltager', name, 30);
	setCookie('starttid', timeAtPost, 30);
	setCookie('poster', post, 30);
	

	const btn1 = document.createElement("button");
        btn1.innerHTML = "<b>Meld dig ud af løbet</b>";
        document.body.appendChild(btn1);
        btn1.addEventListener("click",deleteName);
	
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
	    
	const btn = document.createElement("button");
        btn.innerHTML = "<b>Meld dig ud af løbet</b>";
        document.body.appendChild(btn);
        btn.addEventListener("click",deleteName);
	
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
        btn.addEventListener("click",getName);
  }
}


console.log("Du har nu besøgt post "+ post);
timeAtPost = Math.floor(Date.now()/1000);
showState();


