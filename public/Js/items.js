window.onload = function () {
    fetch('https://fortnite-api.com/v2/items/list')
        .then(response => response.json())
        .then(data => {
            const items = data.data.items;
            const itemsContainer = document.querySelector('.Items');
            itemsContainer.innerHTML = '';

            items.forEach(item => {
                const img = document.createElement('img');
                img.src = item.images.icon;
                img.alt = item.name;
                itemsContainer.appendChild(img);
            });
        })
        .catch(error => console.error('Error:', error));
};

