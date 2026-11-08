package com.jamesthew.culinary.data.remote.api

import com.jamesthew.culinary.data.remote.model.ApiResponse
import com.jamesthew.culinary.data.remote.model.CategoryDto
import com.jamesthew.culinary.data.remote.model.RecipeDto
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface RecipeApiService {
    @GET("recipes")
    suspend fun getRecipes(
        @Query("search") search: String? = null,
        @Query("categoryId") categoryId: Int? = null,
        @Query("isFree") isFree: Boolean? = null
    ): Response<ApiResponse<List<RecipeDto>>>

    @GET("recipes/{id}")
    suspend fun getRecipeById(@Path("id") id: Int): Response<ApiResponse<RecipeDto>>

    @GET("categories")
    suspend fun getCategories(): Response<ApiResponse<List<CategoryDto>>>
}

