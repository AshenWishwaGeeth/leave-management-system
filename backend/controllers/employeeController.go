package controllers

import (
    "strconv"
    "strings"

    "github.com/gin-gonic/gin"
    "leave-management-system/database"
    "leave-management-system/models"
    "net/http"
    "golang.org/x/crypto/bcrypt"
)

func GetEmployees(c *gin.Context) {
    var employees []models.Employee

    query := database.DB.Model(&models.Employee{})
    if search := strings.TrimSpace(c.Query("search")); search != "" {
        like := "%" + strings.ToLower(search) + "%"
        query = query.Where("LOWER(name) LIKE ? OR LOWER(email) LIKE ?", like, like)
    }
    if role := strings.TrimSpace(c.Query("role")); role != "" {
        query = query.Where("LOWER(role) = ?", strings.ToLower(role))
    }
    if status := strings.TrimSpace(c.Query("status")); status != "" {
        query = query.Where("LOWER(status) = ?", strings.ToLower(status))
    }

    if err := query.Order("id DESC").Find(&employees).Error; handleDBError(c, err) {
        return
    }
    if employees == nil {
        employees = []models.Employee{}
    }
    c.JSON(http.StatusOK, employees)
}

func CreateEmployee(c *gin.Context) {
    var input struct {
        Name       string `json:"name"`
        Email      string `json:"email"`
        Department string `json:"department"`
        Role       string `json:"role"`
        Status     string `json:"status"`
        Password   string `json:"password"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    if strings.TrimSpace(input.Name) == "" || strings.TrimSpace(input.Email) == "" || strings.TrimSpace(input.Role) == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "name, email and role are required"})
        return
    }

    role := strings.ToLower(strings.TrimSpace(input.Role))
    if role != "employee" && role != "manager" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "role must be employee or manager"})
        return
    }

    if input.Password == "" {
        input.Password = "welcome123"
    }
    hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
        return
    }

    emp := models.Employee{
        Name:         strings.TrimSpace(input.Name),
        Email:        strings.TrimSpace(strings.ToLower(input.Email)),
        Department:   strings.TrimSpace(input.Department),
        Role:         role,
        Status:       valueOrDefault(strings.TrimSpace(input.Status), "active"),
        PasswordHash: string(hash),
        LeaveBalance: 24,
    }

    if err := database.DB.Create(&emp).Error; handleDBError(c, err) {
        return
    }
    c.JSON(http.StatusCreated, emp)
}

func UpdateEmployee(c *gin.Context) {
    id := c.Param("id")
    var employee models.Employee
    if err := database.DB.First(&employee, id).Error; handleDBError(c, err) {
        return
    }

    var input map[string]interface{}
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    updates := map[string]interface{}{}
    if v, ok := input["name"].(string); ok {
        updates["name"] = strings.TrimSpace(v)
    }
    if v, ok := input["email"].(string); ok {
        updates["email"] = strings.TrimSpace(strings.ToLower(v))
    }
    if v, ok := input["department"].(string); ok {
        updates["department"] = strings.TrimSpace(v)
    }
    if v, ok := input["role"].(string); ok {
        updates["role"] = strings.ToLower(strings.TrimSpace(v))
    }
    if v, ok := input["status"].(string); ok {
        updates["status"] = strings.ToLower(strings.TrimSpace(v))
    }
    if v, ok := input["leave_balance"]; ok {
        switch typed := v.(type) {
        case float64:
            updates["leave_balance"] = int(typed)
        case string:
            parsed, err := strconv.Atoi(typed)
            if err == nil {
                updates["leave_balance"] = parsed
            }
        }
    }

    if v, ok := input["password"].(string); ok && strings.TrimSpace(v) != "" {
        hash, err := bcrypt.GenerateFromPassword([]byte(v), bcrypt.DefaultCost)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
            return
        }
        updates["password_hash"] = string(hash)
    }

    if len(updates) == 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "no valid fields to update"})
        return
    }

    if err := database.DB.Model(&employee).Updates(updates).Error; handleDBError(c, err) {
        return
    }

    if err := database.DB.First(&employee, id).Error; handleDBError(c, err) {
        return
    }

    c.JSON(http.StatusOK, employee)
}

func DeleteEmployee(c *gin.Context) {
    id := c.Param("id")
    if err := database.DB.Delete(&models.Employee{}, id).Error; handleDBError(c, err) {
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "employee deleted"})
}

func valueOrDefault(value string, fallback string) string {
    if value == "" {
        return fallback
    }
    return value
}