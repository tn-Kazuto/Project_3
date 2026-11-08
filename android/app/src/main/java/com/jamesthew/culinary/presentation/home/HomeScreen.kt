package com.jamesthew.culinary.presentation.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.jamesthew.culinary.core.theme.*
import com.jamesthew.culinary.data.remote.model.RecipeDto
import com.jamesthew.culinary.presentation.common.LuxuryBadge
import com.jamesthew.culinary.presentation.common.LuxuryCard
import com.jamesthew.culinary.presentation.common.LuxuryTopBar

@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onNavigateToLogin: () -> Unit,
    onStartCookingMode: (recipeId: Int, title: String) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            LuxuryTopBar(
                title = "James Thew Culinary",
                actions = {
                    if (uiState.userRole != null) {
                        IconButton(onClick = { viewModel.logout() }) {
                            Icon(Icons.Default.ExitToApp, contentDescription = "Đăng xuất", tint = LuxuryGold)
                        }
                    } else {
                        TextButton(onClick = onNavigateToLogin) {
                            Text("Đăng nhập", color = LuxuryGold, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            )
        },
        containerColor = LuxuryCharcoal
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // User Role Welcome Banner
            item {
                Surface(
                    color = LuxurySurfaceElevated,
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = when (uiState.userRole) {
                                    "ADMIN" -> "👑 Xin chào Chef Executive James Thew"
                                    "MEMBER" -> "⭐ Thành viên VIP (Toàn quyền công thức)"
                                    else -> "👋 Chào Quý khách (Xem công thức miễn phí)"
                                },
                                style = MaterialTheme.typography.titleMedium,
                                color = LuxuryGoldLight
                            )
                            Text(
                                text = "Khám phá ẩm thực 5 sao & lớp học thực hành",
                                style = MaterialTheme.typography.bodyMedium,
                                color = LuxuryTextMuted
                            )
                        }
                    }
                }
            }

            // Category Filter Chips
            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    item {
                        FilterChip(
                            selected = uiState.selectedCategoryId == null,
                            onClick = { viewModel.selectCategory(null) },
                            label = { Text("Tất cả", color = if (uiState.selectedCategoryId == null) LuxuryCharcoal else LuxuryAlabaster) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = LuxuryGold,
                                containerColor = LuxurySurface
                            )
                        )
                    }
                    items(uiState.categories) { cat ->
                        val isSelected = uiState.selectedCategoryId == cat.categoryId
                        FilterChip(
                            selected = isSelected,
                            onClick = { viewModel.selectCategory(cat.categoryId) },
                            label = { Text(cat.categoryName, color = if (isSelected) LuxuryCharcoal else LuxuryAlabaster) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = LuxuryGold,
                                containerColor = LuxurySurface
                            )
                        )
                    }
                }
            }

            // Loading Indicator
            if (uiState.isLoading) {
                item {
                    Box(modifier = Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = LuxuryGold)
                    }
                }
            }

            // Empty State
            if (!uiState.isLoading && uiState.recipes.isEmpty()) {
                item {
                    Box(modifier = Modifier.fillMaxWidth().padding(48.dp), contentAlignment = Alignment.Center) {
                        Text(
                            text = "Chưa có công thức nào phù hợp.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = LuxuryTextMuted
                        )
                    }
                }
            }

            // Recipe Cards
            items(uiState.recipes) { recipe ->
                RecipeCard(
                    recipe = recipe,
                    onStartCooking = { onStartCookingMode(recipe.recipeId, recipe.title) }
                )
            }

            item {
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

@Composable
fun RecipeCard(
    recipe: RecipeDto,
    onStartCooking: () -> Unit
) {
    LuxuryCard {
        Column {
            // Recipe Image
            if (!recipe.imageUrl.isNullOrBlank()) {
                AsyncImage(
                    model = recipe.imageUrl,
                    contentDescription = recipe.title,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp)
                        .clip(RoundedCornerShape(topStart = 6.dp, topEnd = 6.dp)),
                    contentScale = ContentScale.Crop
                )
            }

            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = recipe.categoryName.uppercase(),
                        style = MaterialTheme.typography.labelSmall,
                        color = LuxuryGold
                    )
                    LuxuryBadge(
                        text = if (recipe.isFree) "Miễn phí" else "Thành viên VIP",
                        isVip = !recipe.isFree
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = recipe.title,
                    style = MaterialTheme.typography.titleLarge.copy(
                        fontFamily = FontFamily.Serif,
                        fontSize = 20.sp
                    ),
                    color = LuxuryAlabaster
                )

                Text(
                    text = "Tác giả: ${recipe.authorName}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = LuxuryTextMuted,
                    modifier = Modifier.padding(top = 4.dp, bottom = 12.dp)
                )

                // Quick Action: Hands-free cooking mode
                Button(
                    onClick = onStartCooking,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(4.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = LuxurySurfaceElevated,
                        contentColor = LuxuryGoldLight
                    )
                ) {
                    Icon(
                        Icons.Default.Restaurant,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Vào Bếp Nấu Ăn (Cooking Mode)")
                }
            }
        }
    }
}

