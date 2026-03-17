package models

import "time"

type Leave struct {
    ID             uint      `gorm:"primaryKey" json:"id"`
    EmployeeID     uint      `json:"employee_id"`
    Employee       Employee  `json:"employee"`
    LeaveType      string    `json:"leave_type"`
    StartDate      time.Time `json:"start_date"`
    EndDate        time.Time `json:"end_date"`
    Status         string    `gorm:"default:Pending" json:"status"` // Pending, Approved, Rejected
    Reason         string    `json:"reason"`
    ManagerComment string    `json:"manager_comment"`
    CreatedAt      time.Time `json:"created_at"`
}