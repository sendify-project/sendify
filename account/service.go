package main

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v4"
	log "github.com/sirupsen/logrus"
)

var (
	// ErrInvalidToken is invalid token error
	ErrInvalidToken = errors.New("invalid token")
	// ErrTokenExpired is token expired error
	ErrTokenExpired = errors.New("token expired")
	// ErrAuthentication is authentication failed error
	ErrAuthentication = errors.New("authentication failed")
	// ErrCustomerInactive is customer inactive error
	ErrCustomerInactive = errors.New("customer inactive")
)

type CustomerService interface {
	GetCustomerPersonalInfo(ctx context.Context, customerID uint64) (*CustomerPersonalInfo, error)
	UpdateCustomerPersonalInfo(ctx context.Context, customerID uint64, personalInfo *CustomerPersonalInfo) error
}

// CustomerServiceImpl implements CustomerService interface
type CustomerServiceImpl struct {
	customerRepo CustomerRepository
}

// NewCustomerService is the factory of CustomerService
func NewCustomerService(config *Config, customerRepo CustomerRepository) CustomerService {
	return &CustomerServiceImpl{
		customerRepo: customerRepo,
	}
}

// GetCustomerPersonalInfo gets customer personal info
func (svc *CustomerServiceImpl) GetCustomerPersonalInfo(ctx context.Context, customerID uint64) (*CustomerPersonalInfo, error) {
	info, err := svc.customerRepo.GetCustomerPersonalInfo(ctx, customerID)
	if err != nil {
		if err != ErrCustomerNotFound {
			log.Error(err.Error())
		}
		return nil, err
	}
	return &CustomerPersonalInfo{
		FirstName: info.FirstName,
		LastName:  info.LastName,
		Email:     info.Email,
	}, nil
}

// UpdateCustomerPersonalInfo updates customer's personal info
func (svc *CustomerServiceImpl) UpdateCustomerPersonalInfo(ctx context.Context, customerID uint64, personalInfo *CustomerPersonalInfo) error {
	return svc.customerRepo.UpdateCustomerPersonalInfo(ctx, customerID, personalInfo)
}

// JWTAuthService defines jwt authentication interface
type JWTAuthService interface {
	Auth(ctx context.Context, authPayload *AuthPayload) (*AuthResponse, error)
	SignUp(ctx context.Context, customer *Customer) (string, string, error)
	Login(ctx context.Context, email string, password string) (string, string, error)
	RefreshToken(ctx context.Context, refreshToken string) (string, string, error)
}

// JWTAuthServiceImpl implements JWTAuthService interface
type JWTAuthServiceImpl struct {
	jwtSecret                string
	accessTokenExpireSecond  int64
	refreshTokenExpireSecond int64
	jwtAuthRepo              JWTAuthRepository
	sf                       IDGenerator
}

// NewJWTAuthService is the factory of JWTAuthService
func NewJWTAuthService(config *Config, jwtAuthRepo JWTAuthRepository, sf IDGenerator) JWTAuthService {
	return &JWTAuthServiceImpl{
		jwtSecret:                config.JWTConfig.Secret,
		accessTokenExpireSecond:  config.JWTConfig.AccessTokenExpireSecond,
		refreshTokenExpireSecond: config.JWTConfig.RefreshTokenExpireSecond,
		jwtAuthRepo:              jwtAuthRepo,
		sf:                       sf,
	}
}

// Auth authenticates an user by checking access token
func (svc *JWTAuthServiceImpl) Auth(ctx context.Context, authPayload *AuthPayload) (*AuthResponse, error) {
	token, err := svc.parseToken(authPayload.AccessToken)
	if err != nil {
		v := err.(*jwt.ValidationError)
		if v.Errors == jwt.ValidationErrorExpired {
			return &AuthResponse{
				Expired: true,
			}, nil
		}
		return nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(*JWTClaims)
	if !(ok && token.Valid) {
		return nil, ErrInvalidToken
	}

	if claims.Refresh {
		return nil, ErrInvalidToken
	}

	return &AuthResponse{
		CustomerID: claims.CustomerID,
		Expired:    false,
	}, nil
}

// SignUp creates a new customer and returns a token pair
func (svc *JWTAuthServiceImpl) SignUp(ctx context.Context, customer *Customer) (string, string, error) {
	sonyflakeID, err := svc.sf.NextID()
	if err != nil {
		return "", "", err
	}
	customer.ID = sonyflakeID
	customer.Active = true
	if err := svc.jwtAuthRepo.CreateCustomer(ctx, customer); err != nil {
		if err != ErrDuplicateEntry {
			log.Error(err.Error())
		}
		return "", "", err
	}
	return svc.newTokenPair(customer.ID)
}

// Login authenticate the user and returns a new token pair if succeed
func (svc *JWTAuthServiceImpl) Login(ctx context.Context, email string, password string) (string, string, error) {
	exist, credentials, err := svc.jwtAuthRepo.GetCustomerCredentials(ctx, email)
	if err != nil {
		log.Error(err.Error())
		return "", "", err
	}
	if !exist {
		return "", "", ErrCustomerNotFound
	}
	if !credentials.Active {
		return "", "", ErrCustomerInactive
	}
	if CheckPasswordHash(password, credentials.BcryptedPassword) {
		return svc.newTokenPair(credentials.ID)
	}
	return "", "", ErrAuthentication
}

// RefreshToken checks the given refresh token and return a new token pair if the refresh token is valid
func (svc *JWTAuthServiceImpl) RefreshToken(ctx context.Context, refreshToken string) (string, string, error) {
	token, err := svc.parseToken(refreshToken)
	if err != nil {
		v := err.(*jwt.ValidationError)
		if v.Errors == jwt.ValidationErrorExpired {
			return "", "", ErrTokenExpired
		}
		return "", "", ErrInvalidToken
	}

	claims, ok := token.Claims.(*JWTClaims)
	if !(ok && token.Valid) {
		return "", "", ErrInvalidToken
	}

	if !claims.Refresh {
		return "", "", ErrInvalidToken
	}

	customerID := claims.CustomerID
	exist, active, err := svc.jwtAuthRepo.CheckCustomer(ctx, customerID)
	if err != nil {
		return "", "", err
	}
	if !exist {
		return "", "", ErrCustomerNotFound
	}
	if !active {
		return "", "", ErrCustomerInactive
	}

	return svc.newTokenPair(customerID)
}

func (svc *JWTAuthServiceImpl) newTokenPair(customerID uint64) (string, string, error) {
	now := time.Now()
	accessTokenExpiresAt := now.Add(time.Duration(svc.accessTokenExpireSecond) * time.Second)
	accessToken, err := newJWT(customerID, accessTokenExpiresAt, svc.jwtSecret, false)
	if err != nil {
		log.Error(err.Error())
		return "", "", err
	}
	refreshTokenExpiresAt := now.Add(time.Duration(svc.refreshTokenExpireSecond) * time.Second)
	refreshToken, err := newJWT(customerID, refreshTokenExpiresAt, svc.jwtSecret, true)
	if err != nil {
		log.Error(err.Error())
		return "", "", err
	}
	return accessToken, refreshToken, nil
}

func newJWT(customerID uint64, expiresAt time.Time, jwtSecret string, refresh bool) (string, error) {
	jwtClaims := &JWTClaims{
		CustomerID: customerID,
		Refresh:    refresh,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwtClaims)
	accessToken, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return "", err
	}
	return accessToken, nil
}

func (svc *JWTAuthServiceImpl) parseToken(accessToken string) (*jwt.Token, error) {
	return jwt.ParseWithClaims(accessToken, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(svc.jwtSecret), nil
	})
}
