package main

import (
	"context"
	"errors"

	"github.com/go-sql-driver/mysql"
	"gorm.io/gorm"
)

var (
	// ErrDuplicateEntry is duplicate entry error
	ErrDuplicateEntry = errors.New("duplicate entry")
	// ErrCustomerNotFound is customer not found error
	ErrCustomerNotFound = errors.New("customer not found")
)

// CustomerRepository is the customer repository interface
type CustomerRepository interface {
	GetCustomerPersonalInfo(ctx context.Context, customerID uint64) (*CustomerPersonalInfo, error)
	UpdateCustomerPersonalInfo(ctx context.Context, customerID uint64, personalInfo *CustomerPersonalInfo) error
}

// CustomerRepositoryImpl implements CustomerRepository interface
type CustomerRepositoryImpl struct {
	db *gorm.DB
}

// NewCustomerRepository is the factory of CustomerRepository
func NewCustomerRepository(db *gorm.DB) CustomerRepository {
	return &CustomerRepositoryImpl{
		db: db,
	}
}

// GetCustomerPersonalInfo queries customer personal info by customer id
func (repo *CustomerRepositoryImpl) GetCustomerPersonalInfo(ctx context.Context, customerID uint64) (*CustomerPersonalInfo, error) {
	var info CustomerPersonalInfo
	if err := repo.db.Model(&DBCustomer{}).Select("first_name", "last_name", "email").
		Where("id = ?", customerID).First(&info).WithContext(ctx).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCustomerNotFound
		}
		return nil, err
	}
	return &info, nil
}

// UpdateCustomerInfo updates a customer's personal info
func (repo *CustomerRepositoryImpl) UpdateCustomerPersonalInfo(ctx context.Context, customerID uint64, personalInfo *CustomerPersonalInfo) error {
	if err := repo.db.Model(&DBCustomer{}).Where("id = ?", customerID).
		Updates(DBCustomer{
			FirstName: personalInfo.FirstName,
			LastName:  personalInfo.LastName,
			Email:     personalInfo.Email,
		}).WithContext(ctx).Error; err != nil {
		return err
	}
	return nil
}

// JWTAuthRepository is the JWTAuth repository interface
type JWTAuthRepository interface {
	CheckCustomer(ctx context.Context, customerID uint64) (bool, bool, error)
	CreateCustomer(ctx context.Context, customer *Customer) error
	GetCustomerCredentials(ctx context.Context, email string) (bool, *CustomerCredentials, error)
}

// JWTAuthRepositoryImpl implements JWTAuthRepository interface
type JWTAuthRepositoryImpl struct {
	db *gorm.DB
}

// CustomerCredentials encapsulates customer credentials
type CustomerCredentials struct {
	ID               uint64
	Active           bool
	BcryptedPassword string
}

type customerCheckStatus struct {
	Active bool
}

// NewJWTAuthRepository is the factory of JWTAuthRepository
func NewJWTAuthRepository(db *gorm.DB) JWTAuthRepository {
	return &JWTAuthRepositoryImpl{
		db: db,
	}
}

// CheckCustomer checks whether a customer exists and is active
func (repo *JWTAuthRepositoryImpl) CheckCustomer(ctx context.Context, customerID uint64) (bool, bool, error) {
	var status customerCheckStatus
	if err := repo.db.Model(&DBCustomer{}).Select("active").
		Where("id = ?", customerID).First(&status).WithContext(ctx).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return false, false, nil
		}
		return false, false, err
	}
	return true, status.Active, nil
}

// CreateCustomer creates a new customer
// it returns error if ID or email duplicates
func (repo *JWTAuthRepositoryImpl) CreateCustomer(ctx context.Context, customer *Customer) error {
	bcryptedPassword, err := HashPassword(customer.Password)
	if err != nil {
		return err
	}
	if err := repo.db.Create(&DBCustomer{
		ID:               customer.ID,
		Active:           customer.Active,
		FirstName:        customer.PersonalInfo.FirstName,
		LastName:         customer.PersonalInfo.LastName,
		Email:            customer.PersonalInfo.Email,
		BcryptedPassword: bcryptedPassword,
	}).WithContext(ctx).Error; err != nil {
		var mysqlErr *mysql.MySQLError
		if errors.As(err, &mysqlErr) && mysqlErr.Number == 1062 {
			return ErrDuplicateEntry
		}
		return err
	}
	return nil
}

// GetCustomerCredentials finds customer credentials by customer id
func (repo *JWTAuthRepositoryImpl) GetCustomerCredentials(ctx context.Context, email string) (bool, *CustomerCredentials, error) {
	var credentials CustomerCredentials
	if err := repo.db.Model(&DBCustomer{}).Select("id", "active", "bcrypted_password").
		Where("email = ?", email).First(&credentials).WithContext(ctx).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return false, nil, nil
		}
		return false, nil, err
	}
	return true, &credentials, nil
}
