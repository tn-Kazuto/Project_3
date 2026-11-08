package com.jamesthew.culinary

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class JamesThewApp : Application() {
    override fun onCreate() {
        super.onCreate()
    }
}

