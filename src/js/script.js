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
})

const players = [
    {
    name: "Eugene Chi", 
    username: "Awerock", 
    img: "./img/me.jpg",
    games: ["Apex", "FIFA"], 
    handle: "@Awerock" 
    },
    {
        name: "Daniel Yefimov", 
        username: "Patrick_INCorp",
        img: "./img/danya.jpg",
        games: ["Apex"], 
        handle: "@INC_PatrIck" 
    },
    {
        name: "Igor Baranov", 
        username: "Vindemaitrix",
        img: "./img/igor.jpg", 
        games: ["Apex"], 
        handle: "@_sqpo_1206" 
    },
    {
        name: "Mikhail Bolyabkin", 
        username: "I'M MIHA, SORRY!",
        img: "./img/bolyabkin.jpg", 
        games: ["Apex"], 
        handle: "@bolyabkin" 
    },
    {
        name: "Andrey Feshenko", 
        username: "andreeew94",
        img: "./img/nos.jpg", 
        games: ["FIFA"], 
        handle: "@andreeew94" 
    },
  ];

const createGameCard = function (game) {
    const gamePlayers = players.filter(player => player.games.includes(game) || game === 'all');
    const cardContainer = document.getElementById('cardContainer');

    gamePlayers.forEach(player => {
            const contentItem = document.createElement('div');
            contentItem.classList.add('team__content-item');
            cardContainer.appendChild(contentItem);
    
            const contentImgBox = document.createElement('div');
            contentImgBox.classList.add('team__content-img');
            contentItem.appendChild(contentImgBox);
    
            const contentImg = document.createElement('img');
            contentImg.src = player.img;
            contentImg.alt = player.name;
            contentImgBox.appendChild(contentImg);
    
            const contentName = document.createElement('h2');
            contentName.classList.add('team__content-username');
            contentName.textContent = player.name;
            contentItem.appendChild(contentName);
    
            const contentHandle = document.createElement('small');
            contentHandle.classList.add('team__content-handle');
            contentHandle.textContent = player.handle;
            contentItem.appendChild(contentHandle);
    
            const contentButtons = document.createElement('div');
            contentButtons.classList.add('team__content-buttons');
            contentItem.appendChild(contentButtons);
    
            const contentButtonsInfo = document.createElement('button');
            contentButtonsInfo.classList.add('team_button-alt');
            contentButtonsInfo.classList.add('team_button-alt__primary');
            contentButtonsInfo.textContent = 'More info';
            contentButtons.appendChild(contentButtonsInfo);
    
            const contentButtonsShare = document.createElement('button');
            contentButtonsShare.classList.add('team_button-alt');
            contentButtonsShare.classList.add('team_button-alt__icon');
            contentButtonsShare.innerHTML = `<i class="ph-export"></i>`;
            contentButtons.appendChild(contentButtonsShare);
        });
};

createGameCard('all');

const allButton = document.getElementById('allButton');
allButton.addEventListener("click", (event) => {
    cardContainer.innerHTML = "";
    createGameCard('all');
    allButton.classList.add("team__button-active");
    fifaButton.classList.remove("team__button-active");
    apexButton.classList.remove("team__button-active");
});

const fifaButton = document.getElementById('fifaButton');
fifaButton.addEventListener("click", (event) => {
    cardContainer.innerHTML = "";
    createGameCard('FIFA');
    allButton.classList.remove("team__button-active");
    fifaButton.classList.add("team__button-active");
    apexButton.classList.remove("team__button-active");
});

const apexButton = document.getElementById('apexButton');
apexButton.addEventListener("click", (event) => {
    cardContainer.innerHTML = "";
    createGameCard('Apex');
    allButton.classList.remove("team__button-active");
    fifaButton.classList.remove("team__button-active");
    apexButton.classList.add("team__button-active");
});

