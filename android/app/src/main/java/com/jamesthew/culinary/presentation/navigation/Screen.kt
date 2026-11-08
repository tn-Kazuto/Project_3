package com.jamesthew.culinary.presentation.navigation

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Home : Screen("home")
    object RecipeDetail : Screen("recipe_detail/{recipeId}") {
        fun createRoute(recipeId: Int) = "recipe_detail/$recipeId"
    }
    object CookingMode : Screen("cooking_mode/{recipeId}/{title}") {
        fun createRoute(recipeId: Int, title: String) = "cooking_mode/$recipeId/$title"
    }
}

