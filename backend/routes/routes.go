package routes

import (
    "github.com/gin-gonic/gin"
    "leave-management-system/controllers"
)

func SetupRoutes(router *gin.Engine) {
    emp := router.Group("/employees")
    {
        emp.GET("/", controllers.GetEmployees)
        emp.POST("/", controllers.CreateEmployee)
    }

    leave := router.Group("/leaves")
    {
        leave.GET("/", controllers.GetLeaves)
        leave.POST("/", controllers.RequestLeave)
        leave.PUT("/:id", controllers.UpdateLeaveStatus)
    }
}