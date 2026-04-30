package com.example.notesapp.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.notesapp.data.Note
import com.example.notesapp.data.NoteDatabase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withContext
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
        if (query.isNotEmpty()) {
            noteDao.searchNotes(query)
        } else if (category == "All") {
            noteDao.getAllNotes()
        } else {
            noteDao.getNotesByCategory(category)
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun setCategory(category: String) {
        _selectedCategory.value = category
    }

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun getNote(id: Int): Note? = runBlocking {
        noteDao.getNoteById(id)
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
        val prefs = getApplication<Application>().getSharedPreferences("notesapp", android.content.Context.MODE_PRIVATE)
        val uriString = prefs.getString("vault_uri", null)
        if (uriString != null) {
            try {
                val uri = android.net.Uri.parse(uriString)
                getApplication<Application>().contentResolver.takePersistableUriPermission(
                    uri,
                    android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION or android.content.Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                )
                return File(uri.path ?: return null)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        return null
    }

    companion object {
        fun provideFactory(application: Application): ViewModelProvider.Factory {
            return object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : androidx.lifecycle.ViewModel> create(modelClass: Class<T>): T {
                    return NoteViewModel(application) as T
                }
            }
        }
    }
}
