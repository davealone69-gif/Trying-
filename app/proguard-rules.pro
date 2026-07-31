# R8 / ProGuard rules for Mandela Matrix OS
-keep class com.mandela.matrixos.** { *; }
-dontwarn com.mandela.matrixos.**
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

# Keep Jetpack Compose classes
-keep class androidx.compose.** { *; }
-dontwarn androidx.compose.**
