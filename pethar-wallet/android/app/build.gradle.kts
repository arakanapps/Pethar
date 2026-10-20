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
            // For direct APK distribution, you can use a self-signed key
            // Generate with: keytool -genkey -v -keystore pethar-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias pethar
            storeFile = file("pethar-release.jks")
            storePassword = System.getenv("PETHAR_KEYSTORE_PASSWORD") ?: "pethar2026"
            keyAlias = "pethar"
            keyPassword = System.getenv("PETHAR_KEY_PASSWORD") ?: "pethar2026"
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
            signingConfig = signingConfigs.getByName("release")
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
