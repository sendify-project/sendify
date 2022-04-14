package main

import "github.com/golang-jwt/jwt/v4"

// AuthPayload value object
type AuthPayload struct {
	AccessToken string
}

// AuthResponse value object
type AuthResponse struct {
	CustomerID uint64
	Expired    bool
}

// JWTClaims defines JWT claim attributes
type JWTClaims struct {
	CustomerID uint64
	Refresh    bool
	jwt.RegisteredClaims
}

// Customer entity
type Customer struct {
	ID           uint64
	Active       bool
	Password     string
	PersonalInfo *CustomerPersonalInfo
}

// CustomerPersonalInfo value object
type CustomerPersonalInfo struct {
	FirstName string `json:"firstname" binding:"required"`
	LastName  string `json:"lastname" binding:"required"`
	Email     string `json:"email" binding:"required,email"`
}

type CustomerName struct {
	FirstName string `json:"firstname"`
	LastName  string `json:"lastname"`
}

// SignUpCustomer request payload
type SignUpCustomer struct {
	Password    string `json:"password" binding:"required,min=8,max=128"`
	FirstName   string `json:"firstname" binding:"required"`
	LastName    string `json:"lastname" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
	PhoneNumber string `json:"phone_number" binding:"required"`
}

// LoginCustomer request payload
type LoginCustomer struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// RefreshToken request payload
type RefreshToken struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// TokenPair response payload
type TokenPair struct {
	RefreshToken string `json:"refresh_token"`
	AccessToken  string `json:"access_token"`
}
