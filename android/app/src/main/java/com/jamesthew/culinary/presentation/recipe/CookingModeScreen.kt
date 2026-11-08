package com.jamesthew.culinary.presentation.recipe

import android.app.Activity
import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.view.WindowManager
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jamesthew.culinary.core.theme.*
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CookingModeScreen(
    recipeId: Int,
    recipeTitle: String,
    onClose: () -> Unit
) {
    val context = LocalContext.current

    // Keep screen awake while cooking
    DisposableEffect(Unit) {
        val window = (context as? Activity)?.window
        window?.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        onDispose {
            window?.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        }
    }

    // Mock cooking steps for demo/cooking flow
    val steps = remember {
        listOf(
            "Sơ chế nguyên liệu: Rửa sạch rau củ dưới vòi nước chảy. Thái hạt lựu hành tây, băm nhỏ tỏi tươi và ớt chuông.",
            "Làm nóng chảo: Bật bếp lửa vừa, cho 2 thìa dầu ô liu nguyên chất vào chảo chống dính. Đợi 1 phút đến khi dầu lăn tăn.",
            "Xào và đảo đều: Cho tỏi băm và hành tây vào phi thơm vàng (khoảng 3 phút). Sau đó trút thịt hoặc nấm vào đảo săn.",
            "Hầm chín & Hoàn thiện: Nêm 1 thìa sốt đặc chế của Chef James Thew, đậy nắp và hạ lửa nhỏ hầm trong 10 phút. Tắt bếp và rắc tiêu đen lên trên."
        )
    }

    var currentStepIndex by remember { mutableStateOf(0) }

    // Kitchen Timer state (seconds)
    var initialTimerSeconds by remember { mutableStateOf(300) } // Default 5 minutes
    var remainingSeconds by remember { mutableStateOf(300) }
    var isTimerRunning by remember { mutableStateOf(false) }

    // Timer countdown effect
    LaunchedEffect(isTimerRunning, remainingSeconds) {
        if (isTimerRunning && remainingSeconds > 0) {
            delay(1000L)
            remainingSeconds -= 1
        } else if (isTimerRunning && remainingSeconds == 0) {
            isTimerRunning = false
            triggerVibration(context)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "CHẾ ĐỘ LÀM BẾP",
                        style = MaterialTheme.typography.titleMedium.copy(
                            letterSpacing = 2.sp,
                            fontWeight = FontWeight.Bold,
                            color = LuxuryGold
                        )
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onClose) {
                        Icon(Icons.Default.Close, contentDescription = "Đóng", tint = LuxuryAlabaster)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = LuxuryCharcoal)
            )
        },
        containerColor = LuxuryCharcoal
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(20.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                // Recipe Title
                Text(
                    text = recipeTitle,
                    style = MaterialTheme.typography.titleLarge.copy(
                        fontFamily = FontFamily.Serif,
                        color = LuxuryAlabaster
                    ),
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Step Indicator Badge
                Surface(
                    color = LuxuryGold,
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = "BƯỚC ${currentStepIndex + 1} / ${steps.size}",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = LuxuryCharcoal
                        ),
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                // High Contrast Step Content (Easy to read in kitchen)
                Surface(
                    color = LuxurySurface,
                    shape = RoundedCornerShape(8.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, LuxuryBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = steps[currentStepIndex],
                        style = MaterialTheme.typography.bodyLarge.copy(
                            fontSize = 20.sp,
                            lineHeight = 32.sp,
                            color = LuxuryAlabaster
                        ),
                        modifier = Modifier.padding(24.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ==========================================
            // KITCHEN TIMER (HẸN GIỜ NẤU ĂN)
            // ==========================================
            Surface(
                color = LuxurySurfaceElevated,
                shape = RoundedCornerShape(12.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, LuxuryGoldDark),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "ĐỒNG HỒ BẾP (KITCHEN TIMER)",
                        style = MaterialTheme.typography.labelSmall.copy(
                            letterSpacing = 1.sp,
                            color = LuxuryGold
                        )
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    val minutes = remainingSeconds / 60
                    val seconds = remainingSeconds % 60
                    Text(
                        text = String.format("%02d:%02d", minutes, seconds),
                        style = MaterialTheme.typography.displayLarge.copy(
                            fontSize = 44.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (remainingSeconds == 0) LuxuryError else LuxuryAlabaster
                        )
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    // Timer controls
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Button(
                            onClick = { isTimerRunning = !isTimerRunning },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (isTimerRunning) LuxuryError else LuxuryGold,
                                contentColor = LuxuryCharcoal
                            )
                        ) {
                            Icon(Icons.Default.PlayArrow, contentDescription = null)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(if (isTimerRunning) "Tạm Dừng" else "Bắt Đầu")
                        }

                        IconButton(
                            onClick = {
                                isTimerRunning = false
                                remainingSeconds = initialTimerSeconds
                            }
                        ) {
                            Icon(Icons.Default.Refresh, contentDescription = "Đặt lại", tint = LuxuryAlabaster)
                        }

                        // Presets: 3m, 5m, 10m
                        OutlinedButton(
                            onClick = {
                                isTimerRunning = false
                                initialTimerSeconds = 180
                                remainingSeconds = 180
                            }
                        ) {
                            Text("3p", color = LuxuryGoldLight, fontSize = 12.sp)
                        }
                        OutlinedButton(
                            onClick = {
                                isTimerRunning = false
                                initialTimerSeconds = 600
                                remainingSeconds = 600
                            }
                        ) {
                            Text("10p", color = LuxuryGoldLight, fontSize = 12.sp)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Step Navigation Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                OutlinedButton(
                    onClick = { if (currentStepIndex > 0) currentStepIndex -= 1 },
                    enabled = currentStepIndex > 0,
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = LuxuryAlabaster)
                ) {
                    Icon(Icons.Default.ArrowBack, contentDescription = null)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Bước trước")
                }

                Button(
                    onClick = {
                        if (currentStepIndex < steps.size - 1) {
                            currentStepIndex += 1
                        } else {
                            onClose()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = LuxuryGold,
                        contentColor = LuxuryCharcoal
                    )
                ) {
                    Text(if (currentStepIndex < steps.size - 1) "Bước tiếp theo" else "Hoàn Tất Món Ăn")
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(Icons.Default.ArrowForward, contentDescription = null)
                }
            }
        }
    }
}

private fun triggerVibration(context: Context) {
    try {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
            vibratorManager?.defaultVibrator?.vibrate(
                VibrationEffect.createOneShot(1000, VibrationEffect.DEFAULT_AMPLITUDE)
            )
        } else {
            @Suppress("DEPRECATION")
            val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
            vibrator?.vibrate(1000)
        }
    } catch (_: Exception) {}
}

