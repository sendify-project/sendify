package main

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

var (
	// ErrInvalidParam is invalid parameter error
	ErrInvalidParam = errors.New("invalid parameter")
	// ErrUnauthorized is unauthorized error
	ErrUnauthorized = errors.New("unauthorized")
	// ErrServer is server error
	ErrServer = errors.New("server error")
)

// SuccessMessage is the success response type
type SuccessMessage struct {
	Message string `json:"msg" example:"ok"`
}

// OkMsg is the default success response for 200 status code
var OkMsg SuccessMessage = SuccessMessage{
	Message: "ok",
}

// ErrResponse is the error response type
type ErrResponse struct {
	Message string `json:"msg"`
}

// Router wraps http handlers
type Router struct {
	authSvc     JWTAuthService
	customerSvc CustomerService
}

// NewRouter is a factory for router instance
func NewRouter(authSvc JWTAuthService, customerSvc CustomerService) *Router {
	return &Router{
		authSvc:     authSvc,
		customerSvc: customerSvc,
	}
}

// SignUp new customer
func (r *Router) SignUp(c *gin.Context) {
	var customer SignUpCustomer
	if err := c.ShouldBindJSON(&customer); err != nil {
		response(c, http.StatusBadRequest, ErrInvalidParam)
		return
	}
	accessToken, refreshToken, err := r.authSvc.SignUp(c.Request.Context(), &Customer{
		Password: customer.Password,
		PersonalInfo: &CustomerPersonalInfo{
			FirstName: customer.FirstName,
			LastName:  customer.LastName,
			Email:     customer.Email,
		},
	})
	switch err {
	case ErrDuplicateEntry:
		response(c, http.StatusBadRequest, ErrDuplicateEntry)
	case nil:
		c.JSON(http.StatusCreated, &TokenPair{
			RefreshToken: refreshToken,
			AccessToken:  accessToken,
		})
	default:
		response(c, http.StatusInternalServerError, ErrServer)
		return
	}
}

// Login customer
func (r *Router) Login(c *gin.Context) {
	var customer LoginCustomer
	if err := c.ShouldBindJSON(&customer); err != nil {
		response(c, http.StatusBadRequest, ErrInvalidParam)
		return
	}
	accessToken, refreshToken, err := r.authSvc.Login(c.Request.Context(), customer.Email, customer.Password)
	switch err {
	case ErrCustomerNotFound:
		response(c, http.StatusNotFound, ErrCustomerNotFound)
	case ErrCustomerInactive:
		response(c, http.StatusUnauthorized, ErrCustomerInactive)
	case ErrAuthentication:
		response(c, http.StatusUnauthorized, ErrAuthentication)
	case nil:
		c.JSON(http.StatusOK, &TokenPair{
			RefreshToken: refreshToken,
			AccessToken:  accessToken,
		})
	default:
		response(c, http.StatusInternalServerError, ErrServer)
		return
	}
}

// RefreshToken of a customer
func (r *Router) RefreshToken(c *gin.Context) {
	var refreshToken RefreshToken
	if err := c.ShouldBindJSON(&refreshToken); err != nil {
		response(c, http.StatusBadRequest, ErrInvalidParam)
		return
	}
	newAccessToken, newRefreshToken, err := r.authSvc.RefreshToken(c.Request.Context(), refreshToken.RefreshToken)
	switch err {
	case ErrInvalidToken:
		response(c, http.StatusUnauthorized, ErrInvalidToken)
	case ErrTokenExpired:
		response(c, http.StatusUnauthorized, ErrTokenExpired)
	case ErrCustomerNotFound:
		response(c, http.StatusNotFound, ErrCustomerNotFound)
	case ErrCustomerInactive:
		response(c, http.StatusUnauthorized, ErrCustomerInactive)
	case nil:
		c.JSON(http.StatusOK, &TokenPair{
			RefreshToken: newRefreshToken,
			AccessToken:  newAccessToken,
		})
	default:
		response(c, http.StatusInternalServerError, ErrServer)
		return
	}
}

func (r *Router) Auth(c *gin.Context) {
	customerID, ok := c.Request.Context().Value(CustomerKey).(uint64)
	if !ok {
		response(c, http.StatusUnauthorized, ErrUnauthorized)
		return
	}
	info, err := r.customerSvc.GetCustomerPersonalInfo(c.Request.Context(), customerID)
	if err != nil {
		response(c, http.StatusInternalServerError, ErrServer)
		return
	}
	c.Writer.Header().Set("X-User-Id", strconv.FormatUint(customerID, 10))
	c.Writer.Header().Set("X-Username", info.FirstName)
	c.Status(http.StatusOK)
}

// GetCustomerPersonalInfo gets customer personal info
func (r *Router) GetCustomerPersonalInfo(c *gin.Context) {
	customerID, ok := c.Request.Context().Value(CustomerKey).(uint64)
	if !ok {
		response(c, http.StatusUnauthorized, ErrUnauthorized)
		return
	}
	personalInfo, err := r.customerSvc.GetCustomerPersonalInfo(c.Request.Context(), customerID)
	switch err {
	case ErrCustomerNotFound:
		response(c, http.StatusNotFound, ErrCustomerNotFound)
	case nil:
		c.JSON(http.StatusOK, &CustomerPersonalInfo{
			FirstName: personalInfo.FirstName,
			LastName:  personalInfo.LastName,
			Email:     personalInfo.Email,
		})
		return
	default:
		response(c, http.StatusInternalServerError, ErrServer)
		return
	}
}

func (r *Router) GetCustomerName(c *gin.Context) {
	id := c.Param("id")
	customerID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		response(c, http.StatusBadRequest, ErrInvalidParam)
		return
	}
	personalInfo, err := r.customerSvc.GetCustomerPersonalInfo(c.Request.Context(), customerID)
	switch err {
	case ErrCustomerNotFound:
		response(c, http.StatusNotFound, ErrCustomerNotFound)
	case nil:
		c.JSON(http.StatusOK, &CustomerName{
			FirstName: personalInfo.FirstName,
			LastName:  personalInfo.LastName,
		})
		return
	default:
		response(c, http.StatusInternalServerError, ErrServer)
		return
	}
}

// UpdateCustomerPersonalInfo updates customer personal info
func (r *Router) UpdateCustomerPersonalInfo(c *gin.Context) {
	var personalInfo CustomerPersonalInfo
	if err := c.ShouldBindJSON(&personalInfo); err != nil {
		response(c, http.StatusBadRequest, ErrInvalidParam)
		return
	}
	customerID, ok := c.Request.Context().Value(CustomerKey).(uint64)
	if !ok {
		response(c, http.StatusUnauthorized, ErrUnauthorized)
		return
	}
	err := r.customerSvc.UpdateCustomerPersonalInfo(c.Request.Context(), customerID, &CustomerPersonalInfo{
		FirstName: personalInfo.FirstName,
		LastName:  personalInfo.LastName,
		Email:     personalInfo.Email,
	})
	switch err {
	case nil:
		c.JSON(http.StatusOK, OkMsg)
		return
	default:
		response(c, http.StatusInternalServerError, ErrServer)
		return
	}
}

func response(c *gin.Context, httpCode int, err error) {
	message := err.Error()
	c.JSON(httpCode, ErrResponse{
		Message: message,
	})
}
