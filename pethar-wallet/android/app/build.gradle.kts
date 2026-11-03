import java.util.Properties
import java.io.FileInputStream

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

    val keystorePropertiesFile = rootProject.file("key.properties")
    val keystoreProperties = Properties()
    if (keystorePropertiesFile.exists()) {
        keystoreProperties.load(FileInputStream(keystorePropertiesFile))
    }

    // Signing configuration for direct distribution
    signingConfigs {
        create("release") {
            // Read strictly from environment variables or key.properties (no hardcoded passwords)
            val keystorePassword = System.getenv("PETHAR_KEYSTORE_PASSWORD")
                ?: keystoreProperties.getProperty("storePassword")
            val keyPassword = System.getenv("PETHAR_KEY_PASSWORD")
                ?: keystoreProperties.getProperty("keyPassword")
            val keystorePath = System.getenv("PETHAR_KEYSTORE_PATH")
                ?: keystoreProperties.getProperty("storeFile")
            val keyAliasName = System.getenv("PETHAR_KEY_ALIAS")
                ?: keystoreProperties.getProperty("keyAlias") ?: "pethar"

            if (!keystorePath.isNullOrBlank() && !keystorePassword.isNullOrBlank() && !keyPassword.isNullOrBlank()) {
                storeFile = file(keystorePath)
                storePassword = keystorePassword
                keyAlias = keyAliasName
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
        resValue("string", "app_name", "Péthar Wallet")
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
