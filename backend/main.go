 
package main

import (
    "fmt"
    "log"
    "net/http"
    "os"
    "strconv"
    "strings"

    "github.com/gin-gonic/gin"
    "leave-management-system/database"
    "leave-management-system/routes"
)

func main() {
    database.Connect()

    mode := os.Getenv("GIN_MODE")
    if mode == "" {
        mode = gin.ReleaseMode
    }
    gin.SetMode(mode)

    router := gin.Default()

    allowedOrigin := os.Getenv("CORS_ORIGIN")
    if allowedOrigin == "" {
        allowedOrigin = "http://localhost:3000"
    }

    router.Use(func(c *gin.Context) {
        origin := c.GetHeader("Origin")
        if origin == allowedOrigin {
            c.Header("Access-Control-Allow-Origin", origin)
        }
        c.Header("Vary", "Origin")
        c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
        c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization")
        if c.Request.Method == http.MethodOptions {
            c.AbortWithStatus(http.StatusNoContent)
            return
        }
        c.Next()
    })

    trustedProxies := []string{"127.0.0.1", "::1"}
    if envTrustedProxies := strings.TrimSpace(os.Getenv("TRUSTED_PROXIES")); envTrustedProxies != "" {
        trustedProxies = strings.Split(envTrustedProxies, ",")
    }
    if err := router.SetTrustedProxies(trustedProxies); err != nil {
        log.Printf("[warn] failed to set trusted proxies: %v", err)
    }

    routes.SetupRoutes(router)

   port := os.Getenv("PORT")
if port == "" {
    port = "8081"
}

basePort, err := strconv.Atoi(port)
if err != nil {
    log.Fatalf("[error] invalid PORT value %q", port)
}

for offset := 0; offset < 5; offset++ {
    candidatePort := basePort + offset
    addr := fmt.Sprintf(":%d", candidatePort)

    fmt.Printf("🚀 Trying to start server on http://localhost:%d\n", candidatePort)

    err = router.Run(addr)
    if err == nil {
        fmt.Printf("✅ Server started successfully on http://localhost:%d\n", candidatePort)
        return
    }

    errText := strings.ToLower(err.Error())
    if strings.Contains(errText, "address already in use") {
        log.Printf("[warn] port %d is busy, trying %d", candidatePort, candidatePort+1)
        continue
    }

    log.Fatalf("[error] failed to start server on %s: %v", addr, err)
}

log.Fatalf("[error] unable to find an available port in range %d-%d", basePort, basePort+4)
}