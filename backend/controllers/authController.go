package controllers

import (
    "net/http"
    "os"
    "strings"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/golang-jwt/jwt/v5"
    "golang.org/x/crypto/bcrypt"
    "leave-management-system/database"
    "leave-management-system/models"
)

type loginRequest struct {
    Email    string `json:"email"`
    Password string `json:"password"`
    Role     string `json:"role"`
}

type registerRequest struct {
    Name       string `json:"name"`
    Email      string `json:"email"`
    Department string `json:"department"`
    Role       string `json:"role"`
    Password   string `json:"password"`
}

func Login(c *gin.Context) {
    var req loginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    req.Email = strings.TrimSpace(strings.ToLower(req.Email))
    req.Role = strings.TrimSpace(strings.ToLower(req.Role))
    if req.Role != "employee" && req.Role != "manager" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "role must be employee or manager"})
        return
    }

    if req.Email == "" || req.Password == "" || req.Role == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "email, password, and role are required"})
        return
    }

    var employee models.Employee
    if err := database.DB.Where("LOWER(email) = ?", req.Email).First(&employee).Error; err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
        return
    }

    if strings.ToLower(employee.Role) != req.Role {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid role for this user"})
        return
    }

    if err := bcrypt.CompareHashAndPassword([]byte(employee.PasswordHash), []byte(req.Password)); err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
        return
    }

    tokenString, err := createJWT(employee)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "unable to create token"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "token": tokenString,
        "user": gin.H{
            "id":          employee.ID,
            "name":        employee.Name,
            "email":       employee.Email,
            "department":  employee.Department,
            "role":        employee.Role,
            "status":      employee.Status,
            "leave_balance": employee.LeaveBalance,
        },
    })
}

func Register(c *gin.Context) {
    var req registerRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    req.Name = strings.TrimSpace(req.Name)
    req.Email = strings.TrimSpace(strings.ToLower(req.Email))
    req.Department = strings.TrimSpace(req.Department)
    req.Role = strings.TrimSpace(strings.ToLower(req.Role))

    if req.Name == "" || req.Email == "" || req.Password == "" || req.Role == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "name, email, password, and role are required"})
        return
    }

    if req.Role != "employee" && req.Role != "manager" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "role must be employee or manager"})
        return
    }

    var existing models.Employee
    if err := database.DB.Where("LOWER(email) = ?", req.Email).First(&existing).Error; err == nil {
        c.JSON(http.StatusConflict, gin.H{"error": "email already exists"})
        return
    }

    hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to process password"})
        return
    }

    employee := models.Employee{
        Name:         req.Name,
        Email:        req.Email,
        Department:   req.Department,
        Role:         req.Role,
        Status:       "active",
        PasswordHash: string(hash),
        LeaveBalance: 24,
    }

    if err := database.DB.Create(&employee).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, gin.H{"message": "registration successful"})
}

func GetMe(c *gin.Context) {
    userIDValue, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "missing user context"})
        return
    }

    userID, ok := userIDValue.(uint)
    if !ok {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user context"})
        return
    }

    var employee models.Employee
    if err := database.DB.First(&employee, userID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
        return
    }

    c.JSON(http.StatusOK, employee)
}

func createJWT(employee models.Employee) (string, error) {
    claims := jwt.MapClaims{
        "user_id": employee.ID,
        "role":    strings.ToLower(employee.Role),
        "exp":     time.Now().Add(12 * time.Hour).Unix(),
        "iat":     time.Now().Unix(),
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(getJWTSecret()))
}

func getJWTSecret() string {
    secret := os.Getenv("JWT_SECRET")
    if secret == "" {
        secret = "change-me-in-env"
    }
    return secret
}
