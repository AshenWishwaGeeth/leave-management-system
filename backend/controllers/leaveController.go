package controllers

import (
    "github.com/gin-gonic/gin"
    "leave-management-system/database"
    "leave-management-system/models"
    "net/http"
)

func RequestLeave(c *gin.Context) {
    var leave models.Leave
    if err := c.ShouldBindJSON(&leave); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    leave.Status = "Pending"

    if err := database.DB.Create(&leave).Error; handleDBError(c, err) {
        return
    }
    c.JSON(http.StatusOK, leave)
}

func GetLeaves(c *gin.Context) {
    var leaves []models.Leave
    if err := database.DB.Preload("Employee").Find(&leaves).Error; handleDBError(c, err) {
        return
    }
    if leaves == nil {
        leaves = []models.Leave{}
    }
    c.JSON(http.StatusOK, leaves)
}

func UpdateLeaveStatus(c *gin.Context) {
    var leave models.Leave
    id := c.Param("id")
    if err := database.DB.First(&leave, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Leave not found"})
        return
    }

    var input struct {
        Status string `json:"status"`
    }
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    leave.Status = input.Status
    if err := database.DB.Save(&leave).Error; handleDBError(c, err) {
        return
    }
    c.JSON(http.StatusOK, leave)
}