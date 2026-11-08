package com.jamesthew.culinary.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.jamesthew.culinary.presentation.auth.AuthViewModel
import com.jamesthew.culinary.presentation.auth.LoginScreen
import com.jamesthew.culinary.presentation.home.HomeScreen
import com.jamesthew.culinary.presentation.home.HomeViewModel
import com.jamesthew.culinary.presentation.recipe.CookingModeScreen

@Composable
fun AppNavGraph(
    navController: NavHostController,
    startDestination: String = Screen.Home.route
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        // Home Screen (Default)
        composable(Screen.Home.route) {
            val homeViewModel: HomeViewModel = hiltViewModel()
            HomeScreen(
                viewModel = homeViewModel,
                onNavigateToLogin = {
                    navController.navigate(Screen.Login.route)
                },
                onStartCookingMode = { recipeId, title ->
                    navController.navigate(Screen.CookingMode.createRoute(recipeId, title))
                }
            )
        }

        // Login Screen
        composable(Screen.Login.route) {
            val authViewModel: AuthViewModel = hiltViewModel()
            LoginScreen(
                viewModel = authViewModel,
                onLoginSuccess = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onContinueAsGuest = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }

        // In-Kitchen Cooking Mode Screen
        composable(
            route = Screen.CookingMode.route,
            arguments = listOf(
                navArgument("recipeId") { type = NavType.IntType },
                navArgument("title") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val recipeId = backStackEntry.arguments?.getInt("recipeId") ?: 0
            val title = backStackEntry.arguments?.getString("title") ?: "Công thức"
            CookingModeScreen(
                recipeId = recipeId,
                recipeTitle = title,
                onClose = { navController.popBackStack() }
            )
        }
    }
}

