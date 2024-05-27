fetch('https://fortnite-api.com/v2/cosmetics/br/search/all?type=outfit&api_key=91adadf6-2fef-446b-8455-e5bdd97894ab')
    .then(response => response.json())
    .then(data => {
        const element = document.getElementById('myElement');
        console.log(data)
        data.data.slice(0, 30).forEach(item => {
            const characterArticle = document.createElement('article');
            characterArticle.classList.add('character');
            const img = document.createElement('img');
            img.src = item.images.icon;
            img.alt = item.name;
            const p = document.createElement('p');
            p.textContent = item.name;
            characterArticle.appendChild(img);
            characterArticle.appendChild(p);
            element.appendChild(characterArticle);
        });
    });
