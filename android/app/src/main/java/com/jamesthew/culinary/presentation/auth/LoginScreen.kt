package com.jamesthew.culinary.presentation.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jamesthew.culinary.core.theme.*
import com.jamesthew.culinary.presentation.common.LuxuryButton

@Composable
fun LoginScreen(
    viewModel: AuthViewModel,
    onLoginSuccess: () -> Unit,
    onContinueAsGuest: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    var username by remember { mutableStateOf("member_monthly") }
    var password by remember { mutableStateOf("Member@123") }

    LaunchedEffect(uiState.isSuccess) {
        if (uiState.isSuccess) {
            onLoginSuccess()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(LuxuryCharcoal)
            .padding(24.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Luxury Crest / Brand
        Text(
            text = "JAMES THEW",
            style = MaterialTheme.typography.displayLarge.copy(
                fontFamily = FontFamily.Serif,
                fontWeight = FontWeight.Bold,
                letterSpacing = 3.sp,
                color = LuxuryGold
            )
        )
        Text(
            text = "EXECUTIVE CHEF PLATFORM",
            style = MaterialTheme.typography.labelSmall.copy(
                letterSpacing = 2.sp,
                color = LuxuryTextMuted
            ),
            modifier = Modifier.padding(top = 4.dp, bottom = 32.dp)
        )

        // Error message
        if (uiState.error != null) {
            Surface(
                color = LuxuryError.copy(alpha = 0.15f),
                shape = RoundedCornerShape(4.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp)
            ) {
                Text(
                    text = uiState.error ?: "",
                    color = LuxuryError,
                    style = MaterialTheme.typography.bodyMedium,
                    modifier = Modifier.padding(12.dp)
                )
            }
        }

        // Username Input
        OutlinedTextField(
            value = username,
            onValueChange = { username = it },
            label = { Text("Tên đăng nhập hoặc Email", color = LuxuryTextMuted) },
            leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = LuxuryGold) },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = LuxuryGold,
                unfocusedBorderColor = LuxuryBorder,
                focusedTextColor = LuxuryAlabaster,
                unfocusedTextColor = LuxuryAlabaster,
                focusedContainerColor = LuxurySurface,
                unfocusedContainerColor = LuxurySurface
            )
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Password Input
        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Mật khẩu", color = LuxuryTextMuted) },
            leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = LuxuryGold) },
            visualTransformation = PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = LuxuryGold,
                unfocusedBorderColor = LuxuryBorder,
                focusedTextColor = LuxuryAlabaster,
                unfocusedTextColor = LuxuryAlabaster,
                focusedContainerColor = LuxurySurface,
                unfocusedContainerColor = LuxurySurface
            )
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Submit Button
        LuxuryButton(
            text = "Đăng Nhập Thành Viên",
            isLoading = uiState.isLoading,
            onClick = { viewModel.login(username, password) }
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Guest Access
        TextButton(onClick = onContinueAsGuest) {
            Text(
                text = "Tiếp tục với tư cách Khách vãng lai (Guest)",
                color = LuxuryGoldLight,
                style = MaterialTheme.typography.bodyMedium
            )
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Quick Credentials for Testing
        Text(
            text = "Tài khoản mẫu để test nhanh:",
            color = LuxuryTextMuted,
            style = MaterialTheme.typography.labelSmall
        )
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 8.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            OutlinedButton(
                onClick = {
                    username = "member_monthly"
                    password = "Member@123"
                },
                colors = ButtonDefaults.outlinedButtonColors(contentColor = LuxuryGold)
            ) {
                Text("Member", fontSize = 12.sp)
            }
            OutlinedButton(
                onClick = {
                    username = "james"
                    password = "Admin@123456"
                },
                colors = ButtonDefaults.outlinedButtonColors(contentColor = LuxuryGold)
            ) {
                Text("Admin (Chef)", fontSize = 12.sp)
            }
        }
    }
}

