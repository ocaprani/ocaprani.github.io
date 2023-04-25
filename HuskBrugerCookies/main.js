let buttonCreate = document.querySelector('#Create');
let buttonChange = document.querySelector('#Change');
let buttonDelete = document.querySelector('#Delete');

let heading = document.querySelector('h1');
let headingText = heading.innerHTML;

buttonCreate.onclick = function() {
  setUserName();
}

buttonChange.onclick = function() {
  setUserName();
}

buttonDelete.onclick = function() {
  deleteUserName();
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

function deleteCookie(cname) {
    
  document.cookie = cname + "=" + ";" + "expires=Thu, 01 Jan 1970 00:00:00 UTC;" + ";path=/";
}

function setUserName() {
    
  let name = prompt('Skriv dit navn: ');
  if(!name) {
    setUserName();
  } else {
    setCookie('name', name, 2);
    heading.innerHTML =  headingText + ', ' + name;
  }
}

function deleteUserName() {
  deleteCookie('name');
  heading.innerHTML =  headingText;
}

let storedName = getCookie('name');

if( storedName ) {
  heading.textContent = headingText + ', ' + storedName;
}
