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
    } else {
	image.setAttribute ('height', heightLarge);
	text.textContent = textSmall; 
    }
}

image.setAttribute ('height', heightLarge);
text.textContent = textSmall;
