allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}
subprojects {
    project.evaluationDependsOn(":app")
}

subprojects {
    val configureAndroid: () -> Unit = {
        project.extensions.findByName("android")?.let { ext ->
            try {
                val method = ext.javaClass.getMethod("compileSdkVersion", Int::class.javaPrimitiveType)
                method.invoke(ext, 36)
            } catch (e: Exception) {
                try {
                    val method = ext.javaClass.getMethod("setCompileSdk", Integer::class.java)
                    method.invoke(ext, 36)
                } catch (e2: Exception) {}
            }
        }
    }
    if (project.state.executed) {
        configureAndroid()
    } else {
        project.afterEvaluate { configureAndroid() }
    }
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
