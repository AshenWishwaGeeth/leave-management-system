package controllers

import (
    "github.com/gin-gonic/gin"
    "leave-management-system/database"
    "leave-management-system/models"
    "net/http"
)

func GetEmployees(c *gin.Context) {
    var employees []models.Employee
    if err := database.DB.Find(&employees).Error; handleDBError(c, err) {
        return
    }
    if employees == nil {
        employees = []models.Employee{}
    }
    c.JSON(http.StatusOK, employees)
}

func CreateEmployee(c *gin.Context) {
    var emp models.Employee
    if err := c.ShouldBindJSON(&emp); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    if err := database.DB.Create(&emp).Error; handleDBError(c, err) {
        return
    }
    c.JSON(http.StatusOK, emp)
}