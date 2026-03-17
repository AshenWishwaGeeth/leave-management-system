package controllers

import (
    "strings"

    "github.com/gin-gonic/gin"
)

func handleDBError(c *gin.Context, err error) bool {
    if err == nil {
        return false
    }

    errText := strings.ToLower(err.Error())
    if strings.Contains(errText, "sqlstate 42501") || strings.Contains(errText, "permission denied") {
        c.JSON(403, gin.H{
            "error": "Insufficient permissions to complete this operation. Please ask your system administrator to run: GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO leave_admin;",
        })
        return true
    }

    c.JSON(500, gin.H{"error": err.Error()})
    return true
}
