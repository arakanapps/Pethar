plugins {
    id("com.android.application")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

android {
    namespace = "uk.co.pethar.wallet"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    // Signing configuration for direct distribution
    signingConfigs {
        create("release") {
            // Release credentials must be supplied by the CI secret store or environment.
            val keystorePassword = System.getenv("PETHAR_KEYSTORE_PASSWORD")
            val keyPassword = System.getenv("PETHAR_KEY_PASSWORD")
            val keystorePath = System.getenv("PETHAR_KEYSTORE_PATH")
            if (!keystorePath.isNullOrBlank() && !keystorePassword.isNullOrBlank() && !keyPassword.isNullOrBlank()) {
                storeFile = file(keystorePath)
                storePassword = keystorePassword
                keyAlias = "pethar"
                this.keyPassword = keyPassword
            }
        }
    }

    defaultConfig {
        applicationId = "uk.co.pethar.wallet"
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
        
        // App metadata for direct distribution
        resValue("string", "app_name", "PÃ©thar Wallet")
        resValue("string", "download_url", "https://pethar.co.uk/download")
    }

    buildTypes {
        release {
            val releaseConfig = signingConfigs.getByName("release")
            signingConfig = if (releaseConfig.storeFile != null) releaseConfig else signingConfigs.getByName("debug")
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            signingConfig = signingConfigs.getByName("debug")
            applicationIdSuffix = ".debug"
        }
    }
}

kotlin {
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
}

flutter {
    source = "../.."
}
