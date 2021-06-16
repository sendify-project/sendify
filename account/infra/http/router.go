package http

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/minghsu0107/saga-account/config"
	domain_model "github.com/minghsu0107/saga-account/domain/model"
	"github.com/minghsu0107/saga-account/infra/http/presenter"
	"github.com/minghsu0107/saga-account/repo"
	"github.com/minghsu0107/saga-account/service/account"
	"github.com/minghsu0107/saga-account/service/auth"
)

// Router wraps http handlers
type Router struct {
	authSvc     auth.JWTAuthService
	customerSvc account.CustomerService
}

// CustomerPersonalInfo request/response payload
type CustomerPersonalInfo struct {
	ID        uint64 `json:"id"`
	FirstName string `json:"firstname" binding:"required"`
	LastName  string `json:"lastname" binding:"required"`
	Email     string `json:"email" binding:"required,email"`
}

// NewRouter is a factory for router instance
func NewRouter(authSvc auth.JWTAuthService, customerSvc account.CustomerService) *Router {
	return &Router{
		authSvc:     authSvc,
		customerSvc: customerSvc,
	}
}

// SignUp new customer
func (r *Router) SignUp(c *gin.Context) {
	var customer presenter.SignUpCustomer
	if err := c.ShouldBindJSON(&customer); err != nil {
		response(c, http.StatusBadRequest, presenter.ErrInvalidParam)
		return
	}
	accessToken, refreshToken, err := r.authSvc.SignUp(c.Request.Context(), &domain_model.Customer{
		Password: customer.Password,
		PersonalInfo: &domain_model.CustomerPersonalInfo{
			FirstName: customer.FirstName,
			LastName:  customer.LastName,
			Email:     customer.Email,
		},
		ShippingInfo: &domain_model.CustomerShippingInfo{
			Address:     customer.Address,
			PhoneNumber: customer.PhoneNumber,
		},
	})
	switch err {
	case repo.ErrDuplicateEntry:
		response(c, http.StatusBadRequest, repo.ErrDuplicateEntry)
	case nil:
		c.JSON(http.StatusCreated, &presenter.TokenPair{
			RefreshToken: refreshToken,
			AccessToken:  accessToken,
		})
	default:
		response(c, http.StatusInternalServerError, presenter.ErrServer)
		return
	}
}

// Login customer
func (r *Router) Login(c *gin.Context) {
	var customer presenter.LoginCustomer
	if err := c.ShouldBindJSON(&customer); err != nil {
		response(c, http.StatusBadRequest, presenter.ErrInvalidParam)
		return
	}
	accessToken, refreshToken, err := r.authSvc.Login(c.Request.Context(), customer.Email, customer.Password)
	switch err {
	case auth.ErrCustomerNotFound:
		response(c, http.StatusNotFound, auth.ErrCustomerNotFound)
	case auth.ErrCustomerInactive:
		response(c, http.StatusUnauthorized, auth.ErrCustomerInactive)
	case auth.ErrAuthentication:
		response(c, http.StatusUnauthorized, auth.ErrAuthentication)
	case nil:
		c.JSON(http.StatusOK, &presenter.TokenPair{
			RefreshToken: refreshToken,
			AccessToken:  accessToken,
		})
	default:
		response(c, http.StatusInternalServerError, presenter.ErrServer)
		return
	}
}

// RefreshToken of a customer
func (r *Router) RefreshToken(c *gin.Context) {
	var refreshToken presenter.RefreshToken
	if err := c.ShouldBindJSON(&refreshToken); err != nil {
		response(c, http.StatusBadRequest, presenter.ErrInvalidParam)
		return
	}
	newAccessToken, newRefreshToken, err := r.authSvc.RefreshToken(c.Request.Context(), refreshToken.RefreshToken)
	switch err {
	case auth.ErrInvalidToken:
		response(c, http.StatusUnauthorized, auth.ErrInvalidToken)
	case auth.ErrTokenExpired:
		response(c, http.StatusUnauthorized, auth.ErrTokenExpired)
	case auth.ErrCustomerNotFound:
		response(c, http.StatusNotFound, auth.ErrCustomerNotFound)
	case auth.ErrCustomerInactive:
		response(c, http.StatusUnauthorized, auth.ErrCustomerInactive)
	case nil:
		c.JSON(http.StatusOK, &presenter.TokenPair{
			RefreshToken: newRefreshToken,
			AccessToken:  newAccessToken,
		})
	default:
		response(c, http.StatusInternalServerError, presenter.ErrServer)
		return
	}
}

func (r *Router) Auth(c *gin.Context) {
	customerID, ok := c.Request.Context().Value(config.CustomerKey).(uint64)
	if !ok {
		response(c, http.StatusUnauthorized, presenter.ErrUnautorized)
		return
	}
	info, err := r.customerSvc.GetCustomerPersonalInfo(c.Request.Context(), customerID)
	if err != nil {
		response(c, http.StatusInternalServerError, presenter.ErrServer)
		return
	}
	c.Writer.Header().Set("X-User-Id", strconv.FormatUint(customerID, 10))
	c.Writer.Header().Set("X-Username", info.FirstName)
	c.Status(http.StatusOK)
}

// GetCustomerPersonalInfo gets customer personal info
func (r *Router) GetCustomerPersonalInfo(c *gin.Context) {
	customerID, ok := c.Request.Context().Value(config.CustomerKey).(uint64)
	if !ok {
		response(c, http.StatusUnauthorized, presenter.ErrUnautorized)
		return
	}
	personalInfo, err := r.customerSvc.GetCustomerPersonalInfo(c.Request.Context(), customerID)
	switch err {
	case repo.ErrCustomerNotFound:
		response(c, http.StatusNotFound, repo.ErrCustomerNotFound)
	case nil:
		c.JSON(http.StatusOK, &CustomerPersonalInfo{
			ID:        customerID,
			FirstName: personalInfo.FirstName,
			LastName:  personalInfo.LastName,
			Email:     personalInfo.Email,
		})
		return
	default:
		response(c, http.StatusInternalServerError, presenter.ErrServer)
		return
	}
}

// GetCustomerPersonalInfoInternal gets customer personal info
func (r *Router) GetCustomerPersonalInfoInternal(c *gin.Context) {
	id := c.Param("id")
	customerID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		response(c, http.StatusBadRequest, presenter.ErrInvalidParam)
		return
	}
	personalInfo, err := r.customerSvc.GetCustomerPersonalInfo(c.Request.Context(), customerID)
	switch err {
	case repo.ErrCustomerNotFound:
		response(c, http.StatusNotFound, repo.ErrCustomerNotFound)
	case nil:
		c.JSON(http.StatusOK, &CustomerPersonalInfo{
			ID:        customerID,
			FirstName: personalInfo.FirstName,
			LastName:  personalInfo.LastName,
			Email:     personalInfo.Email,
		})
		return
	default:
		response(c, http.StatusInternalServerError, presenter.ErrServer)
		return
	}
}

func response(c *gin.Context, httpCode int, err error) {
	message := err.Error()
	c.JSON(httpCode, presenter.ErrResponse{
		Message: message,
	})
}
