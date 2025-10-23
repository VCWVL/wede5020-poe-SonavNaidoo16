const navLinks = document.querySelectorAll('nav a');

navLinks.forEach((link) => {
    link.addEventListener('click', () => {
        const href = link.getAttribute('href');
        if (href === '#') {
            return;
        }
        const section = document.querySelector(href);
        section.scrollIntoView({ behavior: 'smooth' });
    });
});
//https://codezup.com/build-a-personal-website-with-javascript/ 