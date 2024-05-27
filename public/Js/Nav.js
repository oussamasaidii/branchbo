window.onload = function() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('mouseover', function() {
            this.querySelector('img').style.display = 'inline';
            this.querySelector('span').style.display = 'none';
        });
        link.addEventListener('mouseout', function() {
            this.querySelector('img').style.display = 'none';
            this.querySelector('span').style.display = 'inline';
        });
    });
};
