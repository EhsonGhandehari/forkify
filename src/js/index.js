import Search from './models/Search';
import List from './models/List'
import Recipe from './models/Recipes'
import Like from './models/Likes'
import * as searchView from './views/searchView'; 
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likeView';
import {elements, renderLoader, clearLoader} from './views/base';

/** Global state if the app
* - Search object
* - Current recipe object
* - Shopping list object
* - Liked recipes
*/

const state = {};

const controlSearch = async () =>{
    // 1) Should het the query from the view
    const query = searchView.getInput();
    console.log(query);
    if (query){
        
        // 2) New search object and add it to the state
        state.search = new Search(query);
        
        // 3) Prepare UI for the results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchResults);
        // 4) Search for recipes
        try {
            await state.search.getResults();
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (err){
            alert('Something wrong with the search...');
            clearLoader();
            
        }
        
        // 5) Render results on UI
        
    }
}


elements.searchFrom.addEventListener('submit', e =>{
   e.preventDefault();
   controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline')
    if (btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
})

const controlRecipes = async () =>{
    // Get ID from URL
    const id = window.location.hash.replace('#', '');
    if (id){
        // Prepare UI for Changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        
        // Highlight selected search item
        if (state.search) searchView.highlightSelected(id);
        
        // Create new Recipe object
        state.recipe = new Recipe(id);
        try {
            await state.recipe.getRecipe();
            console.log(state.recipe);
            state.recipe.parseIngredients();
            // Get Recipe data
        
            // Calculate the serving and time
            state.recipe.calcTime();
            state.recipe.calcServings();
            // Render Recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe, 
                                    state.likes.isLiked(id));
        } catch (err){
            alert('Error processing recipe!');
        }
    }
}

// List controller
const controlList = () => {
    // Create a new list if non
    if (!state.list) state.list = new List();
    
    // add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    })
}

// Like controller

const controlLike = () =>{
    if (!state.likes) state.likes = new Like();
    const currentID = state.recipe.id;
    
    // User has NOT yet liked current recipe
    if (!state.likes.isLiked(currentID)) { 
        // Add like the the state
        const newLike = state.likes.addLike(currentID, 
                            state.recipe.title,
                            state.recipe.author,
                            state.recipe.img
                           );
        // Toggle the like button
        likesView.toggleLikeBtn(true);
        // Add like to the UI list
        likesView.renderLike(newLike);
        // User HAS liked the current recipe
    } else {
        // Remove like the the state
        state.likes.deleteLike(currentID);
        // Toggle the like button
        likesView.toggleLikeBtn(false);
        // Remove like from the UI list
        likesView.deleteLike(currentID);
    }
    
    likesView.toggleLikeMenu(state.likes.getNumberLikes());
}

// Handle delete and upade list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    console.log(e.target.closest('.shopping__item').dataset);
    // handle the delete event
    if (e.target.matches('.shopping__delete, .shopping__delete *')){
        // delete from list
        state.list.deleteItem(id);
        // delete from the UI
        listView.deleteItem(id);

        // handle the count update.
    } else if (e.target.matches('.shopping__count-value')){
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
    
});


// Recipe controller
['hashchange','load'].forEach(event => window.addEventListener(event, controlRecipes));
window.addEventListener('load', () => {
    state.likes = new Like();
    
    // Restore the previous likes
    state.likes.readStorage();
    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumberLikes());
    
    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Hanfdling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        if (state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
        
    } else if (e.target.matches('.btn-increase, .btn-increase *')){
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')){
        controlLike();
    }
})

