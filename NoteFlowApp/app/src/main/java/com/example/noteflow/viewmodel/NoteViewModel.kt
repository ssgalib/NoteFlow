package com.example.noteflow.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.noteflow.data.Note
import com.example.noteflow.data.NoteDatabase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.io.File
import java.io.FileWriter

class NoteViewModel(application: Application) : AndroidViewModel(application) {
    private val database = NoteDatabase.getDatabase(application)
    private val noteDao = database.noteDao()

    private val _selectedCategory = MutableStateFlow("All")
    val selectedCategory: StateFlow<String> = _selectedCategory

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery

    val notes: StateFlow<List<Note>> = combine(
        _selectedCategory,
        _searchQuery
    ) { category, query ->
        Pair(category, query)
    }.flatMapLatest { (category, query) ->
        when {
            query.isNotEmpty() -> noteDao.searchNotes(query)
            category == "All" -> noteDao.getAllNotes()
            else -> noteDao.getNotesByCategory(category)
        }
    }.stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())

    fun setCategory(category: String) {
        _selectedCategory.value = category
    }

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun saveNote(note: Note) {
        viewModelScope.launch {
            if (note.id == 0) {
                noteDao.insertNote(note)
            } else {
                noteDao.updateNote(note.copy(updatedAt = java.util.Date()))
            }
            exportToMarkdown(note)
        }
    }

    fun deleteNote(note: Note) {
        viewModelScope.launch {
            noteDao.deleteNote(note)
        }
    }

    private suspend fun exportToMarkdown(note: Note) {
        withContext(Dispatchers.IO) {
            try {
                val vaultDir = getVaultDirectory()
                if (vaultDir != null) {
                    val categoryDir = File(vaultDir, note.category)
                    if (!categoryDir.exists()) {
                        categoryDir.mkdirs()
                    }
                    val file = File(categoryDir, "${note.title.replace("/", "-")}.md")
                    val writer = FileWriter(file)
                    writer.write("# ${note.title}\n\n${note.content}")
                    writer.close()
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun getVaultDirectory(): File? {
        val prefs = getApplication<Application>().getSharedPreferences("noteflow", android.content.Context.MODE_PRIVATE)
        val uriString = prefs.getString("vault_uri", null)
        if (uriString != null) {
            try {
                val uri = android.net.Uri.parse(uriString)
                // For SAF, we need to handle content:// URIs differently
                // For now, just return the path if it's a file path
                val path = uri.path
                if (path != null) {
                    return File(path)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        return null
    }
}
