package models

import "time"

type Employee struct {
    ID           uint      `gorm:"primaryKey" json:"id"`
    Name         string    `json:"name"`
    Email        string    `gorm:"unique" json:"email"`
    Department   string    `json:"department"`
    Role         string    `json:"role"` // employee/manager
    Status       string    `gorm:"default:active" json:"status"`
    PasswordHash string    `json:"-"`
    LeaveBalance int       `gorm:"default:24" json:"leave_balance"`
    CreatedAt    time.Time `json:"created_at"`
}