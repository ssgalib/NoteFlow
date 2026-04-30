package com.example.noteflow.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.BorderStroke
import androidx.navigation.NavController
import com.example.noteflow.data.Note
import com.example.noteflow.viewmodel.NoteViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import java.util.Date

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditorScreen(
    navController: NavController,
    noteId: Int = 0,
    viewModel: NoteViewModel = viewModel()
) {
    var title by remember { mutableStateOf("Untitled") }
    var content by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("Personal") }
    val categories = listOf("Personal", "Work", "Ideas")
    val scrollState = rememberScrollState()

    fun saveNoteAndExit() {
        if (title.isNotBlank() || content.isNotBlank()) {
            val note = Note(
                id = if (noteId > 0) noteId else 0,
                title = title.ifBlank { "Untitled" },
                content = content,
                category = selectedCategory,
                updatedAt = Date()
            )
            viewModel.saveNote(note)
        }
        navController.popBackStack()
    }

    Scaffold(
        containerColor = Color.White.copy(alpha = 0.95f),
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = if (noteId == 0) "New Note" else "Edit Note",
                        color = Color.DarkGray
                    )
                },
                navigationIcon = {
                    IconButton(onClick = { saveNoteAndExit() }) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.Blue
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White,
                    titleContentColor = Color.DarkGray
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Category Selection - Liquid Glass
            LazyRow(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(categories) { category ->
                    val isSelected = category == selectedCategory
                    Surface(
                        modifier = Modifier.graphicsLayer { alpha = 0.9f },
                        color = if (isSelected) Color.Blue.copy(alpha = 0.8f) else Color.White.copy(alpha = 0.6f),
                        shape = RoundedCornerShape(16.dp),
                        border = if (!isSelected) androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.5f)) else null
                    ) {
                        Text(
                            text = category,
                            modifier = Modifier
                                .padding(horizontal = 16.dp, vertical = 8.dp)
                                .clickable { selectedCategory = category },
                            color = if (isSelected) Color.White else Color.DarkGray
                        )
                    }
                }
            }

            // Title Input - Liquid Glass
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                color = Color.White.copy(alpha = 0.7f),
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(1.dp, Color.White.copy(alpha = 0.5f))
            ) {
                BasicTextField(
                    value = title,
                    onValueChange = { title = it },
                    textStyle = TextStyle(
                        color = Color.DarkGray,
                        fontSize = 28.sp
                    ),
                    modifier = Modifier.padding(16.dp),
                    singleLine = true
                )
            }

            // Content Input - Liquid Glass
            Surface(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp)
                    .verticalScroll(scrollState),
                color = Color.White.copy(alpha = 0.7f),
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(1.dp, Color.White.copy(alpha = 0.5f))
            ) {
                BasicTextField(
                    value = content,
                    onValueChange = { content = it },
                    textStyle = TextStyle(
                        color = Color.DarkGray,
                        fontSize = 16.sp,
                        lineHeight = 24.sp
                    ),
                    modifier = Modifier.padding(16.dp)
                )
            }
        }
    }
}
