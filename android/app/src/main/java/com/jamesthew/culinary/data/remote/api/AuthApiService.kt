package com.jamesthew.culinary.data.remote.api

import com.jamesthew.culinary.data.remote.model.ApiResponse
import com.jamesthew.culinary.data.remote.model.AuthResponseDto
import com.jamesthew.culinary.data.remote.model.LoginRequest
import com.jamesthew.culinary.data.remote.model.UserDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface AuthApiService {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<ApiResponse<AuthResponseDto>>

    @GET("auth/me")
    suspend fun getCurrentUser(): Response<ApiResponse<UserDto>>
}

