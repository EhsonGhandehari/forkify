import axios from 'axios';

export default class Recipe {
    constructor(id){
        this.id = id;
    }
    
    async getRecipe() {
        try {
          const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;   
        } catch (err){
            cosole.log(err);
            alert('Something went wrong :(');
        }
    }
    
    calcTime(){
        const numIng = this.ingredients.length;
        const period = Math.ceil(numIng / 3);
        this.time = period * 15; // 15 min for every 3 ingredients
    }
    
    calcServings(){
        this.servings = 4;
    }
    
    parseIngredients(){
        const unitLong = ['tablepoons', 'tablesoon', 'ounces', 'ounce', 'teaspoons','teaspoon','cups','pounds'];
        const unitShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitShort, 'kg', 'g']
        
        const newIngredients = this.ingredients.map(el => {
            // Uniform units
            let ingredient = el.toLowerCase();
            unitLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, units[i]);
            
            });
            
            // Remove parantheses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');
            
            // Parse ingredients into count, unit, and ingredient
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));
             
            let objIng;
            if (unitIndex > -1){
                const arrCount = arrIng.slice(0, unitIndex);
                
                let count;
                if (arrCount.length === 1){
                    count = eval(arrIng[0].replace('-','+'));
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }
                
                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                }
                
            } else if (parseInt(arrIng[0], 10)){
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }
            } else if (unitIndex === -1){
                //There is no unit and No number in the 1st position
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }
            
            return objIng;
        })
        this.ingredients = newIngredients;
    }
    
    updateServings (type) {
        // Servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;
        
        // Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings/ this.servings)
        });
        
        
        this.servings = newServings;
    }
    
}