package main

import (
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type DBCustomer struct {
	ID               uint64 `gorm:"primaryKey"`
	Active           bool   `gorm:"default:true"`
	FirstName        string `gorm:"type:varchar(50);not null"`
	LastName         string `gorm:"type:varchar(50);not null"`
	Email            string `gorm:"type:varchar(320);unique;not null"`
	BcryptedPassword string `gorm:"type:binary(60);not null"`
	UpdatedAt        int64  `gorm:"autoUpdateTime:milli"`
	CreatedAt        int64  `gorm:"autoCreateTime:milli"`
}

// NewDatabaseConnection returns the db connection instance
func NewDatabaseConnection(config *Config) (*gorm.DB, error) {
	db, err := gorm.Open(mysql.Open(config.DBConfig.Dsn), &gorm.Config{
		PrepareStmt: true,
	})
	if err != nil {
		return nil, err
	}
	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}
	// SetMaxIdleConns sets the maximum number of connections in the idle connection pool.
	sqlDB.SetMaxIdleConns(config.DBConfig.MaxIdleConns)

	// SetMaxOpenConns sets the maximum number of open connections to the database.
	sqlDB.SetMaxOpenConns(config.DBConfig.MaxOpenConns)
	return db, nil
}

// Migrator migrates DB schemas on startup
type Migrator struct {
	db *gorm.DB
}

// NewMigrator is the factory of Migrator
func NewMigrator(db *gorm.DB) *Migrator {
	return &Migrator{
		db: db,
	}
}

// Migrate method migrates db schemas
func (m *Migrator) Migrate() error {
	return m.db.AutoMigrate(&DBCustomer{})
}
