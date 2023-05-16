let logo = document.getElementById('parallax__logo');
let miniStar = document.getElementById('parallax__mini-stars');
let bigStar = document.getElementById('parallax__big-stars');
let luna = document.getElementById('parallax__luna');
let earth = document.getElementById('parallax__earth');

window.addEventListener('scroll', () => {
    let value = window.scrollY;

    if (value > 800) {
        value = 0;
    } else {
        logo.style.marginTop = value * 0.5 + `px`;
        miniStar.style.marginTop = value * 1.5 + `px`;
        bigStar.style.marginTop = value * 0.5 + `px`;
        earth.style.width = value * 0.3 + 873 + `px`;
        earth.style.marginTop = value * -0.3 + `px`;
    }
    console.log(value);
})
