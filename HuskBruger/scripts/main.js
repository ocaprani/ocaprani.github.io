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

function setUserName() {
  let name = prompt('Skriv dit navn: ');
  if(!name) {
    setUserName();
  } else {
    localStorage.setItem('name', name);
    heading.innerHTML =  headingText + ', ' + name;
  }
}

function deleteUserName() {
  localStorage.clear();
  heading.innerHTML =  headingText;
}

let storedName = localStorage.getItem('name');
if( storedName ) {
  heading.textContent = headingText + ', ' + storedName;
}
