package com.jamesthew.culinary.core.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LuxuryDarkColorScheme = darkColorScheme(
    primary = LuxuryGold,
    onPrimary = LuxuryCharcoal,
    primaryContainer = LuxuryGoldDark,
    onPrimaryContainer = LuxuryAlabaster,
    secondary = LuxuryGoldLight,
    onSecondary = LuxuryCharcoal,
    background = LuxuryCharcoal,
    onBackground = LuxuryAlabaster,
    surface = LuxurySurface,
    onSurface = LuxuryAlabaster,
    surfaceVariant = LuxurySurfaceElevated,
    onSurfaceVariant = LuxuryTextMuted,
    outline = LuxuryBorder,
    error = LuxuryError,
    onError = LuxuryAlabaster
)

@Composable
fun JamesThewTheme(
    content: @Composable () -> Unit
) {
    val colorScheme = LuxuryDarkColorScheme
    val view = LocalView.current

    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window
            if (window != null) {
                window.statusBarColor = colorScheme.background.toArgb()
                window.navigationBarColor = colorScheme.background.toArgb()
                WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}

