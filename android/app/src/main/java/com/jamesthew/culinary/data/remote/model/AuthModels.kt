package com.jamesthew.culinary.data.remote.model

import com.google.gson.annotations.SerializedName

data class LoginRequest(
    @SerializedName("emailOrUsername") val emailOrUsername: String,
    @SerializedName("password") val password: String
)

data class AuthResponseDto(
    @SerializedName("token") val token: String,
    @SerializedName("expiresAt") val expiresAt: String,
    @SerializedName("user") val user: UserDto
)

data class UserDto(
    @SerializedName("userId") val userId: Int,
    @SerializedName("username") val username: String,
    @SerializedName("fullName") val fullName: String,
    @SerializedName("email") val email: String,
    @SerializedName("phone") val phone: String?,
    @SerializedName("role") val role: String,
    @SerializedName("subscriptionPlan") val subscriptionPlan: String?,
    @SerializedName("subscriptionAmount") val subscriptionAmount: Double?,
    @SerializedName("isSubscriptionActive") val isSubscriptionActive: Boolean
)

