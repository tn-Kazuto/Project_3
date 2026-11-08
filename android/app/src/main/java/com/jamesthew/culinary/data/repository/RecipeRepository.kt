package com.jamesthew.culinary.data.repository

import com.jamesthew.culinary.core.network.NetworkResult
import com.jamesthew.culinary.data.remote.api.RecipeApiService
import com.jamesthew.culinary.data.remote.model.CategoryDto
import com.jamesthew.culinary.data.remote.model.RecipeDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class RecipeRepository @Inject constructor(
    private val recipeApi: RecipeApiService
) {
    suspend fun getRecipes(
        search: String? = null,
        categoryId: Int? = null,
        isFree: Boolean? = null
    ): NetworkResult<List<RecipeDto>> {
        return try {
            val response = recipeApi.getRecipes(search, categoryId, isFree)
            val body = response.body()
            if (response.isSuccessful && body != null && body.data != null) {
                NetworkResult.Success(body.data)
            } else {
                NetworkResult.Error(body?.message ?: "Lỗi tải danh sách công thức")
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.localizedMessage ?: "Lỗi kết nối máy chủ")
        }
    }

    suspend fun getRecipeById(id: Int): NetworkResult<RecipeDto> {
        return try {
            val response = recipeApi.getRecipeById(id)
            val body = response.body()
            if (response.isSuccessful && body != null && body.data != null) {
                NetworkResult.Success(body.data)
            } else {
                NetworkResult.Error(body?.message ?: "Không tìm thấy công thức")
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.localizedMessage ?: "Lỗi kết nối")
        }
    }

    suspend fun getCategories(): NetworkResult<List<CategoryDto>> {
        return try {
            val response = recipeApi.getCategories()
            val body = response.body()
            if (response.isSuccessful && body != null && body.data != null) {
                NetworkResult.Success(body.data)
            } else {
                NetworkResult.Error(body?.message ?: "Lỗi tải danh mục")
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.localizedMessage ?: "Lỗi kết nối")
        }
    }
}

