const starFavorite = JSON.parse(localStorage.getItem('favorite'));

function getItem() {
    if(!starFavorite) {
        const x = [];
        localStorage.setItem('favorite', JSON.stringify(x));
    }
}

function addFavorite(imgElement, id) {
    imgElement.className = imgElement.className === "star" ? "star-active" : "star";

    localStorage.setItem( JSON.stringify([1,2,3] ));

    const star = JSON.parse(localStorage.getItem("favorite", "[]"));

    if(star.includes(id)){
        const newStar = star.filter((itemId) => itemId !== id);

        localStorage.setItem('favorite', JSON.stringify(newStar));
    } else {
        localStorage.setItem('favorite', JSON.stringify([...star, id]));
    }

    changeGeneration();
}

function verifyFavorite(id) {
    const idFavorite = starFavorite.find(e => e === id);
    if(idFavorite) return true;
    else return false;
}

getItem();





