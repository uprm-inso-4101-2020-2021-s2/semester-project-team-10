// Menu Hamburger effect var
const menu = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('.navbar__menu');

// Carousel effect var
const carouselSlide = document.querySelector('.carousel--slide');
const carouselImages = document.querySelectorAll('.carousel--slide img');

// button caurosel effect var
const prev__btn = document.querySelector('#prev__btn');
const next__btn = document.querySelector('#next__btn');

// Menu Hamburger effect
menu.addEventListener('click', function(){
    menu.classList.toggle('is-active');
    menuLinks.classList.toggle('active');
});

// Slide Carousel effect
let count = 1;
const size = carouselImages[0].clientWidth;

carouselSlide.style.transform = 'translateX(' + (-size * count) + 'px)';

// button Listener
next__btn.addEventListener('click', () => { 
    if (count >= carouselImages.length - 1) return;
    carouselSlide.style.transition = "transform 0.4s ease-in-out";
    count++;
    carouselSlide.style.transform = 'translateX(' + (-size * count) + 'px)';
});

prev__btn.addEventListener('click', () => {
    if (count <= 0) return;
    carouselSlide.style.transition = "transform 0.4s ease-in-out";
    count--;
    carouselSlide.style.transform = 'translateX(' + (-size * count) + 'px)';
});

// NOT WORKING
carouselSlide.addEventListener('transitionend', () => {
    if (carouselImages[count].id === 'lastClone'){
        carouselSlide.style.transition = "transform 0.4s ease-in-out";
        carouselSlide.style.transition = "none";
        count = carouselImages.length - 2;
        carouselSlide.style.transform = 'translateX(' + (-size * count) + 'px)';
    }

    if (carouselImages[count].id === 'firstClone'){
        carouselSlide.style.transition = "transform 0.4s ease-in-out";
        carouselSlide.style.transition = "none";
        count = carouselImages.length - count;
        carouselSlide.style.transform = 'translateX(' + (-size * count) + 'px)';
    }
});