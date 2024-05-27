window.onload = function() {
    var errorProjects = document.getElementsByClassName('ErrorMessage');

    for (var i = 0; i < errorProjects.length; i++) {
        errorProjects[i].addEventListener('click', function(event) {
            event.preventDefault();
            
            var errorMessage = document.createElement('div');
            errorMessage.className = 'error-box';
            errorMessage.textContent = 'Je hebt geen toegang tot deze game!';
            document.body.appendChild(errorMessage);

            setTimeout(function() {
                errorMessage.remove();
            }, 2000); 
        });
    }
};
