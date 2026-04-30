package com.example.notesapp.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.Date
import java.util.UUID

@Entity(tableName = "notes")
data class Note(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val uuid: String = UUID.randomUUID().toString(),
    val title: String,
    val content: String,
    val category: String = "Personal",
    val createdAt: Date = Date(),
    val updatedAt: Date = Date()
)
