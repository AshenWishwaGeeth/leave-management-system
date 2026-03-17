package models

import "time"

type Employee struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    Name      string    `json:"name"`
    Email     string    `gorm:"unique" json:"email"`
    Role      string    `json:"role"` // employee/manager/admin
    CreatedAt time.Time `json:"created_at"`
}