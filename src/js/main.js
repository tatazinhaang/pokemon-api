const pokemon_container = document.getElementById('pokemon_container');
const search_bar = document.getElementById('search_bar');
const search_error = document.getElementById('search_error');
const generation_container = document.getElementById('generation_container');
const pokedex_name = document.getElementById('pokedex_name');
const loading = document.getElementById('loading');

const card_anim_speed = 1000;

let timeout = null;
let generations = null;

let current_generation = 1;

let number = 0;
let promises = null;
let anim_timeouts = [];

const changeGeneration = async (url, new_generation, button_id) => {
    current_generation = new_generation;

    const children = Array.from(generation_container.children);
    children.forEach(child => {
        const button = Array.from(child.children)[0];

        if (button.id == button_id) {
            button.disabled = true;
            button.style.color = '#fff';
            button.style.cursor = 'default';
        } else {
            button.disabled = false;
            button.style.color = '#999';
            button.style.cursor = 'pointer';
        }
    });

    search_bar.value = '';
    try {
        const result = await fetch(url);

        if (result.ok) {
            const generation = await result.json();

            const limit = generation.pokemon_species.length;
            const offset = generation.pokemon_species[0].url.slice(-4, -1) - 1;
            const name = generation.main_region.name[0].toUpperCase() + generation.main_region.name.slice(1);
            
            pokedex_name.innerHTML = `${name} Pokédex`;
            pokemon_container.innerHTML = '';
            search_error.textContent = '';

            getAllPokemon(`https://pokeapi.co/api/v2/pokemon/?limit=${limit}&offset=${offset}`, current_generation);
        }
    } catch(e) {
        errorShake(e);
    }
}
const getGenerations = async (url) => {
    try {
        const result = await fetch(url);

        if (result.ok) {
            generations = await result.json();

            for (let number = 0; number < generations.count; number++) {
                const generation_button = document.createElement('div');
                generation_button.classList.add('generation_button_container');

                generation_button.innerHTML = `
                    <button type="button" id="generation_button_${number + 1}" onclick="changeGeneration('${generations.results[number].url}', ${number + 1}, 'generation_button_${number + 1}')">${number + 1}</button>`;
                
                if ((number + 1) == 1) {
                    const button = Array.from(generation_button.children)[0];
                    button.disabled = true;
                    button.style.color = '#fff';
                    button.style.cursor = 'default';
                }

                generation_container.appendChild(generation_button);
            }
        }
    } catch(e) {errorShake(e);}
}


const type_colors = {
    normal:'#a8a878',
    fire:'#f08030',
    water:'#6890f0',
    grass:'#78c850',
    electric:'#f8d030',
    ice:'#98d8d8',
    fighting:'#c03028',
    poison:'#a040a0',
    ground:'#e0c068',
    flying:'#a890f0',
    psychic:'#f85888',
    bug:'#a8b820',
    rock:'#b8a038',
    ghost:'#705898',
    dark:'#705848',
    dragon:'#7038f8',
    steel:'#b8b8d0',
    fairy:'#f0b6bc'
}

const getAllPokemon = async (url, generation) => {
    loading.style.display = 'block';

    try {
        const result = await fetch(url);

        if (result.ok) {
            const pokemon = await result.json();
            
            const all_pokemon = pokemon.results.map((a_pokemon) => {
                return getPokemon(a_pokemon.name);
            });
            promises = await Promise.all(all_pokemon);

            number = 0;
            
            promises.forEach(pokemon => {
                if (current_generation == generation) {
                    createPokemonCard(pokemon);
                }
            });
        } else {errorShake(`No results found for ${id}...`);}
    } catch(e) {errorShake(e);}

    loading.style.display = 'none';
    
}

getPokemon = async (id) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${id}`;

    try {
        const result = await fetch(url);

        if (result.ok) {
            const pokemon = await result.json();
            return Promise.resolve(pokemon);
        } else {errorShake(`No results found for ${id}...`);}
    } catch(e) {errorShake(e);}
}


function errorShake(error_text) {
    search_error.textContent = error_text;

    search_bar.classList.add('error_shake');
    setTimeout(function() {
        search_bar.classList.remove('error_shake');
    }, 500);
}


const searchPokemon = async () => {
    clearTimeout(timeout);

    search_error.textContent = '';

    timeout = setTimeout(function() {
        const search_value = search_bar.value.toLowerCase();
        const pokemon_cards = Array.from(pokemon_container.children);
        let search_results = [];

        if (search_value != '') {
            for (let index = 0; index < promises.length; index++) {
              
                if (promises[index].name.search(search_value) != -1) {
                    search_results.push(index);
                }

                
                for (let type_index = 0; type_index < promises[index].types.length; type_index++)
                    if (promises[index].types[type_index].type.name.search(search_value) != -1) {
                        search_results.push(index);
                    }
            }

            
            anim_timeouts.forEach(anim_timeout => {
                clearTimeout(anim_timeout);
            });

            
            for (let index = 0; index < pokemon_cards.length; index++) {
                if (pokemon_cards[index].classList.contains('move_card_up')) {
                    pokemon_cards[index].classList.remove('move_card_up');
                    pokemon_cards[index].style.animationPlayState = 'paused';
                }
                pokemon_cards[index].style.display = 'none';
            }     

            anim_timeouts = [];
            number = 0;

            
            search_results.forEach(index => {
                addMoveUpAnim(pokemon_cards[index]);
            });
        
        } else {
            
            anim_timeouts.forEach(anim_timeout => {
                clearTimeout(anim_timeout);
            });

            anim_timeouts = [];
            number = 0;

            pokemon_cards.forEach(pokemon_card => {
                addMoveUpAnim(pokemon_card);
            });
        }
    }, 1000);
}

function addMoveUpAnim(pokemon_card) {
    pokemon_card.style.display = 'flex';
                    
    pokemon_card.classList.add('move_card_up');

    
    let anim_timeout = setTimeout(() => {
        pokemon_card.style.animationPlayState = 'running';
        pokemon_card.style.display = 'flex';
        setTimeout(() => {
            pokemon_card.classList.remove('move_card_up');
            pokemon_card.style.animationPlayState = 'paused';
        }, card_anim_speed);
    }, number * 100);

    anim_timeouts.push(anim_timeout);
    number += 1;
}

function createPokemonCard(pokemon) {
    const pokemon_card = document.createElement('div');
    pokemon_card.classList.add('pokemon_card');
    
    const types = pokemon.types.map(element => element.type.name);
    let type_innerHTML = `<span class='type'>${types[0].toUpperCase()}</span>`;
    if (types.length > 1) {
        type_innerHTML += `<span class='type'>${types[1].toUpperCase()}</span>`;
    }

    const female_index = pokemon.species.name.search('-f')
    const male_index = pokemon.species.name.search('-m')
    let name = '';
    
    if (female_index != -1 || male_index != -1) {
    
        if (female_index != -1) {
            name = pokemon.species.name[0].toUpperCase() + pokemon.species.name.slice(1, -2) + '♀';
        } else {
            name = pokemon.species.name[0].toUpperCase() + pokemon.species.name.slice(1, -2) + '♂';
        }
    } else {
        name = pokemon.species.name[0].toUpperCase() + pokemon.species.name.slice(1);
    }

    let sprite = pokemon['sprites']['versions']['generation-viii']['icons']['front_default'];

   
    if (sprite == null) {
        sprite = `src/img/unknown.png`;
    }

    let total_stats = 0;
    pokemon['stats'].forEach(stat => {
        total_stats += stat.base_stat;
    });

    let stats_innerHTML = `
        <table class='stats'>
            <tr>
                <th>
                    <div class='stat_box hp'></div>
                    HP
                </th>
                <th>${pokemon['stats'][0].base_stat}</th>
                <th>
                    <div class='stat_box sp_atk'></div>
                    SP. ATK
                </th>
                <th>${pokemon['stats'][3].base_stat}</th>
            </tr>
            <tr>
                <th>
                    <div class='stat_box atk'></div>
                    ATK
                </th>
                <th>${pokemon['stats'][1].base_stat}</th>
                <th>
                    <div class='stat_box sp_def'></div>
                    SP. DEF
                </th>
                <th>${pokemon['stats'][4].base_stat}</th>
            </tr>
            <tr>
                <th>
                    <div class='stat_box def'></div>
                    DEF
                </th>
                <th>${pokemon['stats'][2].base_stat}</th>
                <th>
                    <div class='stat_box speed'></div>
                    SPEED
                </th>
                <th>${pokemon['stats'][5].base_stat}</th>
            </tr>
            <tr>
                <th class='total'>TOTAL</th>
                <th>${total_stats}</th>
                <th></th>
            </tr>
        </table>
    `;

    const pokemon_innerHTML = `
        <div class='pokemon_card_inner' ontouchstart='flipCard(this)'>
            <div class='pokemon_card_front'>
                <div class='info'>
                    <div class='basic_info'>
                        <span class='number'>#${('000' + pokemon.id).slice (-3)}</span>
                        <div class='sprite_and_name'>
                            <h3 class='name'>${name}</h3>
                            <div class='sprite_container'>
                                <img class='sprite' src='
                                    ${sprite}
                                '>
                            </div>
                        </div>
                    </div>
                    <div class='types'>
                        ${type_innerHTML}
                    </div>
                </div>
                <div class='img-container'>
                    <img src='${pokemon['sprites']['other']['official-artwork']['front_default']}'>
                </div>
            </div>
            <div class='pokemon_card_back' onclick="addFavorite(${pokemon.id})">
                ${stats_innerHTML}
                <div onclick="addFavorite(this, ${pokemon.id})" class="${verifyFavorite(pokemon.id) ? "star-active" : "star"  }"> </div>
            </div>
        </div>
    `;

    pokemon_card.innerHTML = pokemon_innerHTML;

    const pokemon_card_front = Array.from(Array.from(pokemon_card.children)[0].children)[0];
    const pokemon_card_back = Array.from(Array.from(pokemon_card.children)[0].children)[1];
    if (types.length > 1) {
        pokemon_card_front.style = `background: -webkit-linear-gradient(
            to right,
            ${type_colors[types[0]]},
            ${type_colors[types[1]]})`;
        pokemon_card_back.style = `background: -webkit-linear-gradient(
            to right,
            ${type_colors[types[0]]},
            ${type_colors[types[1]]})`;

        pokemon_card_front.style = `background: linear-gradient(
        to right,
        ${type_colors[types[0]]},
        ${type_colors[types[1]]})`;
        pokemon_card_back.style = `background: linear-gradient(
            to right,
            ${type_colors[types[0]]},
            ${type_colors[types[1]]})`;
    } else {
        pokemon_card_front.style = `background:${type_colors[types[0]]}`;
        pokemon_card_back.style = `background:${type_colors[types[0]]}`;
    }
    pokemon_container.appendChild(pokemon_card);

    addMoveUpAnim(pokemon_card);
}

function flipCard(card) {
    if(/Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        if (card.style.transform == 'rotateX(180deg)') {
            card.style.transform = '';
        } else {
            card.style.transform = 'rotateX(180deg)';
        }
    }
}

search_bar.value = '';

getGenerations('https://pokeapi.co/api/v2/generation/');
getAllPokemon(`https://pokeapi.co/api/v2/pokemon/?limit=151&offset=0`, 1);

