package com.jamesthew.culinary.data.repository

import com.jamesthew.culinary.core.datastore.TokenManager
import com.jamesthew.culinary.core.network.NetworkResult
import com.jamesthew.culinary.data.remote.api.AuthApiService
import com.jamesthew.culinary.data.remote.model.AuthResponseDto
import com.jamesthew.culinary.data.remote.model.LoginRequest
import com.jamesthew.culinary.data.remote.model.UserDto
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val authApi: AuthApiService,
    private val tokenManager: TokenManager
) {
    val tokenFlow: Flow<String?> = tokenManager.tokenFlow
    val roleFlow: Flow<String?> = tokenManager.roleFlow

    suspend fun login(emailOrUsername: String, password: String): NetworkResult<AuthResponseDto> {
        return try {
            val response = authApi.login(LoginRequest(emailOrUsername, password))
            val body = response.body()
            if (response.isSuccessful && body != null && body.success && body.data != null) {
                val data = body.data
                tokenManager.saveAuth(
                    token = data.token,
                    role = data.user.role,
                    username = data.user.username
                )
                NetworkResult.Success(data)
            } else {
                val errorMsg = body?.message ?: body?.errors?.firstOrNull() ?: "Đăng nhập thất bại"
                NetworkResult.Error(errorMsg, response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.localizedMessage ?: "Lỗi kết nối máy chủ")
        }
    }

    suspend fun logout() {
        tokenManager.clearAuth()
    }

    suspend fun getCurrentUser(): NetworkResult<UserDto> {
        return try {
            val response = authApi.getCurrentUser()
            val body = response.body()
            if (response.isSuccessful && body != null && body.success && body.data != null) {
                NetworkResult.Success(body.data)
            } else {
                NetworkResult.Error(body?.message ?: "Không thể lấy thông tin người dùng")
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.localizedMessage ?: "Lỗi kết nối")
        }
    }
}

