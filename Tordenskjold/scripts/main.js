// Tordenskjold som lille


let image = document.querySelector('img'); // global variabel
let heightLarge = 300;
let heightSmall = 100;
let text = document.querySelector('p');

image.setAttribute('height', heightLarge);

image.onclick = function() {

    let height = image.getAttribute('height'); // lokal variabel
    
    if( height == heightLarge) {
	image.setAttribute ('height', heightSmall);
	text.textContent = 'Clik på billedet hvis du vil se Tordenskjold som stor';
    } else {
	image.setAttribute ('height', heightLarge);
	text.textContent = 'Clik på billedet hvis du vil se Tordenskjold som lille'; 
    }
}
