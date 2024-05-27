function changeUsername() {
    var newUsername = document.getElementById('new-username').value;
    if(newUsername) {
        document.querySelector('.username').textContent = newUsername;
    }
}