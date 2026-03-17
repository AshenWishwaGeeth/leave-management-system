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
            "error": "database permission denied. Grant SELECT/INSERT/UPDATE/DELETE on employees and leaves to your DB user",
            "details": err.Error(),
        })
        return true
    }

    c.JSON(500, gin.H{"error": err.Error()})
    return true
}
