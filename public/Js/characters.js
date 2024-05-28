fetch("https://fortnite-api.com/v2/cosmetics/br/search/all?type=outfit&api_key=3ca10d0e-b9d0-4dac-9940-14a45dcd9572")    
.then(response => response.json())
    .then(data => {
        const characterContainer = document.getElementById('character-container');
        console.log(data);

        //Filter voor Npc en null data
        const filteredData = data.data.filter(item => {
            return item.name && item.name.toLowerCase() !== 'npc' && item.name.toLowerCase() !== 'null';
        });

        filteredData.slice(0, 56).forEach(item => {
            const characterArticle = document.createElement('article');
            characterArticle.classList.add('character');
            const img = document.createElement('img');
            img.src = item.images.icon;
            img.alt = item.name;
            const p = document.createElement('p');
            p.textContent = item.name;
            characterArticle.appendChild(img);
            characterArticle.appendChild(p);
            characterContainer.appendChild(characterArticle);
        });
    })
    .catch(error => console.error('Error fetching data:', error));
