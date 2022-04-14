package main

import (
	"context"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
)

// CORSMiddleware adds CORS headers to each response
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, Accept, Origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, DELETE, GET, PUT, PATCH, OPTIONS")
		c.Writer.Header().Set("Access-Control-Max-Age", "86400")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func extractToken(r *http.Request) string {
	bearToken := r.Header.Get(JWTAuthHeader)
	strArr := strings.Split(bearToken, " ")
	if len(strArr) == 2 {
		return strArr[1]
	}
	return ""
}

// JWTAuth authorize a request by checking jwt token in the Authentication header
func (m *JWTAuthChecker) JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		accessToken := extractToken(c.Request)
		if accessToken == "" {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		authResult, err := m.authSvc.Auth(c.Request.Context(), &AuthPayload{
			AccessToken: accessToken,
		})
		if err != nil {
			log.Error(err)
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		if authResult.Expired {
			c.AbortWithStatusJSON(http.StatusUnauthorized, ErrResponse{
				Message: ErrTokenExpired.Error(),
			})
			return
		}
		c.Request = c.Request.WithContext(context.WithValue(c.Request.Context(), CustomerKey, authResult.CustomerID))
		c.Next()
	}
}

// JWTAuthChecker is the jwt authorization middleware type
type JWTAuthChecker struct {
	authSvc JWTAuthService
}

// NewJWTAuthChecker is the factory of JWTAuthChecker
func NewJWTAuthChecker(config *Config, authSvc JWTAuthService) *JWTAuthChecker {
	return &JWTAuthChecker{
		authSvc: authSvc,
	}
}
