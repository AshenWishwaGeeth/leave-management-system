package routes

import (
    "github.com/gin-gonic/gin"
    "leave-management-system/controllers"
    "leave-management-system/middleware"
)

func SetupRoutes(router *gin.Engine) {
    auth := router.Group("/auth")
    {
        auth.POST("/register", controllers.Register)
        auth.POST("/login", controllers.Login)
    }

    secured := router.Group("/")
    secured.Use(middleware.AuthRequired())

    secured.GET("/auth/me", controllers.GetMe)
    secured.GET("/dashboard/summary", controllers.DashboardSummary)

    emp := secured.Group("/employees")
    {
        emp.GET("/", controllers.GetEmployees)
        emp.POST("/", middleware.RolesAllowed("manager"), controllers.CreateEmployee)
        emp.PUT("/:id", middleware.RolesAllowed("manager"), controllers.UpdateEmployee)
        emp.DELETE("/:id", middleware.RolesAllowed("manager"), controllers.DeleteEmployee)
    }

    leave := secured.Group("/leaves")
    {
        leave.GET("/", controllers.GetLeaves)
        leave.POST("/", middleware.RolesAllowed("employee", "manager"), controllers.RequestLeave)
        leave.PUT("/:id", middleware.RolesAllowed("manager"), controllers.UpdateLeaveStatus)
    }
}