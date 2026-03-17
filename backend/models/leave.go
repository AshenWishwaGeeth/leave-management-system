package models

import "time"

type Leave struct {
    ID         uint      `gorm:"primaryKey" json:"id"`
    EmployeeID uint      `json:"employee_id"`
    LeaveType  string    `json:"leave_type"`
    StartDate  time.Time `json:"start_date"`
    EndDate    time.Time `json:"end_date"`
    Status     string    `json:"status"` // Pending, Approved, Rejected
    Reason     string    `json:"reason"`
    CreatedAt  time.Time `json:"created_at"`
}