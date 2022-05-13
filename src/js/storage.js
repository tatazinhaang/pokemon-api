const starFavorite = JSON.parse(localStorage.getItem('favorite'));


function getItem() {
    if(!starFavorite) {
        localStorage.setItem('favorite', '[]');
    }
}

function addFavorite(id) {
    let listFavorite = (starFavorite);
    if(listFavorite) {
    listFavorite.push(id);
    localStorage.setItem('favorite', JSON.stringify(listFavorite));


    changeGeneration();

    }
}

function verifyFavorite(id) {
    const idFavorite = starFavorite.find(e => e === id);
    if(idFavorite) return true;
    else return false;
}

function toggleFavorite(e) {
    console.log(e)
}

getItem();


