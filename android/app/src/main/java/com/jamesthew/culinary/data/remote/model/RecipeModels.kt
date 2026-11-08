package com.jamesthew.culinary.data.remote.model

import com.google.gson.annotations.SerializedName

data class RecipeDto(
    @SerializedName("recipeId") val recipeId: Int,
    @SerializedName("authorId") val authorId: Int,
    @SerializedName("authorName") val authorName: String,
    @SerializedName("categoryId") val categoryId: Int,
    @SerializedName("categoryName") val categoryName: String,
    @SerializedName("title") val title: String,
    @SerializedName("ingredients") val ingredients: String,
    @SerializedName("cookingProcedure") val cookingProcedure: String,
    @SerializedName("imageUrl") val imageUrl: String?,
    @SerializedName("isFree") val isFree: Boolean,
    @SerializedName("contentType") val contentType: String,
    @SerializedName("videoUrl") val videoUrl: String?,
    @SerializedName("shareCount") val shareCount: Int,
    @SerializedName("feedbackCount") val feedbackCount: Int
)

data class CategoryDto(
    @SerializedName("categoryId") val categoryId: Int,
    @SerializedName("categoryName") val categoryName: String,
    @SerializedName("description") val description: String?
)

