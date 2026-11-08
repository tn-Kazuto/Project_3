package com.jamesthew.culinary.presentation.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jamesthew.culinary.core.network.NetworkResult
import com.jamesthew.culinary.data.remote.model.CategoryDto
import com.jamesthew.culinary.data.remote.model.RecipeDto
import com.jamesthew.culinary.data.repository.AuthRepository
import com.jamesthew.culinary.data.repository.RecipeRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class HomeUiState(
    val isLoading: Boolean = false,
    val recipes: List<RecipeDto> = emptyList(),
    val categories: List<CategoryDto> = emptyList(),
    val selectedCategoryId: Int? = null,
    val searchQuery: String = "",
    val error: String? = null,
    val userRole: String? = null
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val recipeRepository: RecipeRepository,
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        observeUserRole()
        loadInitialData()
    }

    private fun observeUserRole() {
        viewModelScope.launch {
            authRepository.roleFlow.collect { role ->
                _uiState.value = _uiState.value.copy(userRole = role)
            }
        }
    }

    fun loadInitialData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            loadCategories()
            loadRecipes()
        }
    }

    private suspend fun loadCategories() {
        when (val result = recipeRepository.getCategories()) {
            is NetworkResult.Success -> {
                _uiState.value = _uiState.value.copy(categories = result.data)
            }
            else -> {}
        }
    }

    fun selectCategory(categoryId: Int?) {
        val newCat = if (_uiState.value.selectedCategoryId == categoryId) null else categoryId
        _uiState.value = _uiState.value.copy(selectedCategoryId = newCat)
        loadRecipes()
    }

    fun searchRecipes(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        loadRecipes()
    }

    fun loadRecipes() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val currentState = _uiState.value

            // If user is guest, only fetch free recipes
            val isFreeFilter = if (currentState.userRole == null) true else null

            when (val result = recipeRepository.getRecipes(
                search = currentState.searchQuery.ifBlank { null },
                categoryId = currentState.selectedCategoryId,
                isFree = isFreeFilter
            )) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        recipes = result.data
                    )
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = result.message
                    )
                }
                else -> {}
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            _uiState.value = _uiState.value.copy(userRole = null)
            loadRecipes()
        }
    }
}

