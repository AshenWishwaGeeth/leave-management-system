package controllers

import (
    "net/http"

    "github.com/gin-gonic/gin"
    "leave-management-system/database"
    "leave-management-system/models"
)

func DashboardSummary(c *gin.Context) {
    roleValue, _ := c.Get("user_role")
    userRole, _ := roleValue.(string)

    var pendingCount int64
    var approvedCount int64
    var rejectedCount int64
    var totalEmployees int64
    var myLeaveBalance int64

    leaveQuery := database.DB.Model(&models.Leave{})
    if userRole == "employee" {
        if userIDValue, ok := c.Get("user_id"); ok {
            leaveQuery = leaveQuery.Where("employee_id = ?", userIDValue.(uint))
            database.DB.Model(&models.Employee{}).Where("id = ?", userIDValue.(uint)).Select("leave_balance").Scan(&myLeaveBalance)
        }
    } else {
        database.DB.Model(&models.Employee{}).Count(&totalEmployees)
    }

    if err := leaveQuery.Where("LOWER(status) = ?", "pending").Count(&pendingCount).Error; handleDBError(c, err) {
        return
    }
    if err := leaveQuery.Where("LOWER(status) = ?", "approved").Count(&approvedCount).Error; handleDBError(c, err) {
        return
    }
    if err := leaveQuery.Where("LOWER(status) = ?", "rejected").Count(&rejectedCount).Error; handleDBError(c, err) {
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "pending_requests": pendingCount,
        "approved_requests": approvedCount,
        "rejected_requests": rejectedCount,
        "total_employees": totalEmployees,
        "my_leave_balance": myLeaveBalance,
    })
}
