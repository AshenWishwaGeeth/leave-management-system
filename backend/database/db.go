package database

import (
    "fmt"
    "log"
    "os"
    "strings"

    "github.com/joho/godotenv"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
    "leave-management-system/models"
)

var DB *gorm.DB

func Connect() {
    // Load environment variables from .env
    err := godotenv.Overload()
    if err != nil {
        log.Println("[warn] .env file not found, using fallback values")
    }

    host := getEnv("DB_HOST", "127.0.0.1")
    port := getEnv("DB_PORT", "5432")
    user := getEnv("DB_USER", "leave_admin")
    password := getEnv("DB_PASSWORD", "1234")
    dbName := getEnv("DB_NAME", "leave_management")
    sslMode := getEnv("DB_SSLMODE", "disable")

    dsn := fmt.Sprintf(
        "host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
        host, user, password, dbName, port, sslMode,
    )

    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatalf("[error] failed to connect to database: %v", err)
    }

    fmt.Println("Database connected successfully!")

    autoMigrate := strings.ToLower(getEnv("AUTO_MIGRATE", "true")) == "true"
    if autoMigrate {
        // Auto-create tables when permissions allow it.
        err = db.AutoMigrate(&models.Employee{}, &models.Leave{})
        if err != nil {
            if isSchemaPermissionError(err) {
                log.Printf("[warn] migration skipped due to DB schema permissions: %v", err)
                log.Println("[warn] Run schema SQL with a privileged user or set AUTO_MIGRATE=false")
            } else if isRelationAlreadyExistsError(err) {
                log.Printf("[warn] migration skipped because relation already exists: %v", err)
                log.Println("[warn] Existing tables detected. Set AUTO_MIGRATE=false if schema is managed manually.")
            } else {
                log.Fatalf("[error] failed to migrate tables: %v", err)
            }
        }
    } else {
        log.Println("[info] AUTO_MIGRATE=false, skipping migrations")
    }

    DB = db
}

// helper to read env variables with fallback
func getEnv(key, fallback string) string {
    value := os.Getenv(key)
    if value == "" {
        return fallback
    }
    return value
}

func isSchemaPermissionError(err error) bool {
    errText := strings.ToLower(err.Error())
    return strings.Contains(errText, "permission denied for schema") || strings.Contains(errText, "sqlstate 42501")
}

func isRelationAlreadyExistsError(err error) bool {
    errText := strings.ToLower(err.Error())
    return strings.Contains(errText, "already exists") || strings.Contains(errText, "sqlstate 42p07")
}