// Tordenskjold som lille

// global variabels
let image = document.querySelector('img');
let heightLarge = 300;
let heightSmall = 100;
let text = document.querySelector('p');
let textSmall = 'Klik på billedet hvis du vil se Tordenskjold som lille';
let textLarge = 'Klik på billedet hvis du vil se Tordenskjold som stor ';

let size = localStorage.getItem('imageSize'); // get status of image size

image.onclick = function() {

    // local variabel
    let height = image.getAttribute('height');
    
    if( height == heightLarge) {
	image.setAttribute ('height', heightSmall);
	text.textContent = textLarge;
	// set image size status to small
	localStorage.setItem('imageSize', heightSmall);
    } else {
	image.setAttribute ('height', heightLarge);
	text.textContent = textSmall;
	// set image size status to large
        localStorage.setItem('imageSize', heightLarge);
    }

}

// set image size depending on state stored on previous visit
if ( size ) {
    image.setAttribute ('height', size);
    if ( size == heightLarge ) {
        text.textContent = textSmall;
    } else {
	text.textContent = textLarge;
    }	
} else {
    image.setAttribute ('height', heightLarge);
    text.textContent = textSmall;   
}
