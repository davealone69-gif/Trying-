package com.mandela.matrixos

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MandelaMatrixOSApp()
        }
    }
}

data class AuditLog(
    val id: String,
    val source: String,
    val score: Int,
    val status: String,
    val timestamp: Long = System.currentTimeMillis()
)

object MatrixCore {
    private val _logs = MutableStateFlow<List<AuditLog>>(
        listOf(
            AuditLog("M-101", "Devator", 98, "APPROVED"),
            AuditLog("M-102", "Evaluateor", 95, "APPROVED"),
            AuditLog("M-103", "MandelaCore", 100, "STABLE_REALITY")
        )
    )
    val logs: StateFlow<List<AuditLog>> = _logs

    fun dispatchMutation(source: String, score: Int) {
        val newLog = AuditLog("M-${System.currentTimeMillis() % 1000}", source, score, if (score >= 90) "APPROVED" else "REJECTED")
        _logs.value = listOf(newLog) + _logs.value
    }
}

@Composable
fun MandelaMatrixOSApp() {
    val logs by MatrixCore.logs.collectAsState()
    var inputSource by remember { mutableStateOf("Devator") }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = Color(0xFF050811)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            // Header
            Text(
                text = "MANDELA MATRIX OS",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF00FFCC),
                fontFamily = FontFamily.Monospace
            )
            Text(
                text = "CYBER-BRUTALIST MUTATION & BUILD AUDIT MATRIX",
                fontSize = 12.sp,
                color = Color(0xFF888888),
                fontFamily = FontFamily.Monospace,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            // Status Card
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF0D1222), RoundedCornerShape(8.dp))
                    .border(1.dp, Color(0xFF00FFCC), RoundedCornerShape(8.dp))
                    .padding(16.dp)
            ) {
                Column {
                    Text("MATRIX ENGINE STATUS: ONLINE", color = Color(0xFF00FF66), fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                    Text("PACKAGE: com.mandela.matrixos", color = Color.White, fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                    Text("BUILD TARGET: SDK 35 (Kotlin Android)", color = Color.LightGray, fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Control Actions
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Button(
                    onClick = { MatrixCore.dispatchMutation("Devator", (85..100).random()) },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF0055)),
                    shape = RoundedCornerShape(4.dp)
                ) {
                    Text("TRIGGER DEVATOR MUTATION", color = Color.White, fontFamily = FontFamily.Monospace)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "AUDIT REALITY LOGS:",
                color = Color.White,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                modifier = Modifier.padding(bottom = 8.dp)
            )

            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(logs) { log ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFF101628), RoundedCornerShape(4.dp))
                            .border(1.dp, if (log.status == "APPROVED" || log.status == "STABLE_REALITY") Color(0xFF00FF66) else Color(0xFFFF0055), RoundedCornerShape(4.dp))
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(text = "${log.id} | ${log.source}", color = Color.White, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                            Text(text = "EVALUATEOR SCORE: ${log.score}/100", color = Color.Gray, fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                        }
                        Text(
                            text = log.status,
                            color = if (log.status == "APPROVED" || log.status == "STABLE_REALITY") Color(0xFF00FF66) else Color(0xFFFF0055),
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }
            }
        }
    }
}
