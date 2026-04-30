package com.example.notesapp.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.notesapp.data.Note
import com.example.notesapp.ui.theme.Blue
import com.example.notesapp.ui.theme.DarkGray
import com.example.notesapp.ui.theme.LightGray
import com.example.notesapp.ui.theme.White
import com.example.notesapp.viewmodel.NoteViewModel
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditorScreen(
    noteId: Int,
    viewModel: NoteViewModel,
    onBack: () -> Unit
) {
    var title by remember { mutableStateOf("") }
    var content by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("Personal") }
    var currentNote by remember { mutableStateOf<Note?>(null) }
    val categories = listOf("Personal", "Work", "Ideas")

    LaunchedEffect(noteId) {
        if (noteId > 0) {
            val note = viewModel.getNote(noteId)
            note?.let {
                currentNote = it
                title = it.title
                content = it.content
                selectedCategory = it.category
            }
        }
    }

    fun saveAndExit() {
        if (title.isNotBlank() || content.isNotBlank()) {
            val note = if (noteId <= 0) {
                Note(
                    title = title.ifBlank { "Untitled" },
                    content = content,
                    category = selectedCategory
                )
            } else {
                currentNote?.copy(
                    title = title.ifBlank { "Untitled" },
                    content = content,
                    category = selectedCategory,
                    updatedAt = java.util.Date()
                )
            }
            note?.let {
                viewModel.saveNote(it)
            }
        }
        onBack()
    }

    Scaffold(
        containerColor = White,
        topBar = {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = { saveAndExit() },
                    modifier = Modifier.padding(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Back",
                        tint = Blue
                    )
                }
                Text(
                    text = if (noteId <= 0) "New Note" else "Edit Note",
                    fontFamily = FontFamily.Serif,
                    color = DarkGray,
                    style = MaterialTheme.typography.titleLarge
                )
                Spacer(modifier = Modifier.width(48.dp))
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .imePadding()
        ) {
            // Category Selection
            LazyRow(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(categories) { category ->
                    val isSelected = category == selectedCategory
                    Surface(
                        modifier = Modifier.clip(RoundedCornerShape(16.dp)),
                        color = if (isSelected) Blue else LightGray,
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Text(
                            text = category,
                            modifier = Modifier
                                .clickable { selectedCategory = category }
                                .padding(horizontal = 16.dp, vertical = 8.dp),
                            color = if (isSelected) White else DarkGray,
                            fontFamily = FontFamily.Monospace,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }
            }

            // Title Input
            BasicTextField(
                value = title,
                onValueChange = { title = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                textStyle = TextStyle(
                    color = DarkGray,
                    fontSize = 28.sp,
                    fontFamily = FontFamily.Serif
                ),
                cursorBrush = SolidColor(Blue),
                singleLine = true
            )

            // Content Input
            BasicTextField(
                value = content,
                onValueChange = { content = it },
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                textStyle = TextStyle(
                    color = DarkGray,
                    fontSize = 16.sp,
                    fontFamily = FontFamily.Monospace,
                    lineHeight = 24.sp
                ),
                cursorBrush = SolidColor(Blue)
            )
        }
    }
}
