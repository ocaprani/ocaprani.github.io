

if (location.hash) {
    var n = parseInt(location.hash.slice(1));
} else {
    var n = 4;
}

for (let i = 0; i < n; i++) {
    let iframe = document.createElement('iframe');
    iframe.src = '../src/index.html#'+i.toString();
    document.body.appendChild(iframe);
}
