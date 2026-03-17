package controllers

import (
    "strconv"
    "strings"
    "time"

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

    if leave.EmployeeID == 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "employee_id is required"})
        return
    }

    if userRole, ok := c.Get("user_role"); ok && userRole == "employee" {
        if userIDValue, ok := c.Get("user_id"); ok {
            leave.EmployeeID = userIDValue.(uint)
        }
    }

    if leave.StartDate.IsZero() || leave.EndDate.IsZero() {
        c.JSON(http.StatusBadRequest, gin.H{"error": "start_date and end_date are required"})
        return
    }

    leave.Status = "Pending"

    if err := database.DB.Create(&leave).Error; handleDBError(c, err) {
        return
    }
    c.JSON(http.StatusCreated, leave)
}

func GetLeaves(c *gin.Context) {
    var leaves []models.Leave

    query := database.DB.Model(&models.Leave{}).Preload("Employee")

    if userRole, ok := c.Get("user_role"); ok && userRole == "employee" {
        if userIDValue, ok := c.Get("user_id"); ok {
            query = query.Where("employee_id = ?", userIDValue.(uint))
        }
    }

    if status := strings.TrimSpace(c.Query("status")); status != "" {
        query = query.Where("LOWER(status) = ?", strings.ToLower(status))
    }
    if employeeID := strings.TrimSpace(c.Query("employee_id")); employeeID != "" {
        if parsed, err := strconv.Atoi(employeeID); err == nil {
            query = query.Where("employee_id = ?", parsed)
        }
    }
    if from := strings.TrimSpace(c.Query("from")); from != "" {
        if fromDate, err := time.Parse("2006-01-02", from); err == nil {
            query = query.Where("start_date >= ?", fromDate)
        }
    }
    if to := strings.TrimSpace(c.Query("to")); to != "" {
        if toDate, err := time.Parse("2006-01-02", to); err == nil {
            query = query.Where("end_date <= ?", toDate)
        }
    }

    if err := query.Order("id DESC").Find(&leaves).Error; handleDBError(c, err) {
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
        Status         string `json:"status"`
        ManagerComment string `json:"manager_comment"`
    }
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    if input.Status != "Approved" && input.Status != "Rejected" && input.Status != "Pending" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "status must be Approved, Rejected, or Pending"})
        return
    }

    leave.Status = input.Status
    leave.ManagerComment = strings.TrimSpace(input.ManagerComment)
    if err := database.DB.Save(&leave).Error; handleDBError(c, err) {
        return
    }
    c.JSON(http.StatusOK, leave)
}