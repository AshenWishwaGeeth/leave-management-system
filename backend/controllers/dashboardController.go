package controllers

import (
    "net/http"

    "github.com/gin-gonic/gin"
    "leave-management-system/database"
    "leave-management-system/models"
)

func DashboardSummary(c *gin.Context) {
    // Get user role and user ID from context
    roleValue, _ := c.Get("user_role")
    userRole, _ := roleValue.(string)

    userIDValue, _ := c.Get("user_id")
    userID, _ := userIDValue.(uint)

    var pendingCount int64
    var approvedCount int64
    var rejectedCount int64
    var totalEmployees int64
    var initialLeaveBalance int64

    // Get initial leave balance for employee
    if userRole == "employee" {
        database.DB.Model(&models.Employee{}).
            Where("id = ?", userID).
            Select("leave_balance").
            Scan(&initialLeaveBalance)
    } else {
        // Count total employees for manager
        database.DB.Model(&models.Employee{}).Count(&totalEmployees)
    }

    // Base query for leaves
    leaveQuery := database.DB.Model(&models.Leave{})
    if userRole == "employee" {
        leaveQuery = leaveQuery.Where("employee_id = ?", userID)
    }

    // Count leaves by status
    if err := leaveQuery.Where("LOWER(status) = ?", "pending").Count(&pendingCount).Error; handleDBError(c, err) {
        return
    }
    if err := leaveQuery.Where("LOWER(status) = ?", "approved").Count(&approvedCount).Error; handleDBError(c, err) {
        return
    }
    if err := leaveQuery.Where("LOWER(status) = ?", "rejected").Count(&rejectedCount).Error; handleDBError(c, err) {
        return
    }

    // Calculate remaining leave balance for employee
    // Only approved leaves reduce balance
    myLeaveBalance := initialLeaveBalance - approvedCount
    if myLeaveBalance < 0 {
        myLeaveBalance = 0
    }

    // Send JSON response
    c.JSON(http.StatusOK, gin.H{
        "pending_requests":  pendingCount,
        "approved_requests": approvedCount,
        "rejected_requests": rejectedCount,
        "total_employees":   totalEmployees,
        "my_leave_balance":  myLeaveBalance,
    })
}