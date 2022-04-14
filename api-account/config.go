package main

import (
	"os"

	"github.com/kelseyhightower/envconfig"
	log "github.com/sirupsen/logrus"
	"gopkg.in/yaml.v3"
)

type HTTPContextKey string

var (
	// JWTAuthHeader is the auth header containing customer ID
	JWTAuthHeader = "Authorization"
	// CustomerKey is the key name for retrieving jwt-decoded customer id in a http request context
	CustomerKey HTTPContextKey = "customer_key"
)

type Config struct {
	HTTPPort  string     `yaml:"httpPort" envconfig:"HTTP_PORT"`
	JWTConfig *JWTConfig `yaml:"jwtConfig"`
	DBConfig  *DBConfig  `yaml:"dbConfig"`
}

// JWTConfig is jwt config type
type JWTConfig struct {
	Secret                   string `yaml:"secret" envconfig:"JWT_SECRET"`
	AccessTokenExpireSecond  int64  `yaml:"accessTokenExpireSecond" envconfig:"JWT_ACCESS_TOKEN_EXPIRE_SECOND"`
	RefreshTokenExpireSecond int64  `yaml:"refreshTokenExpireSecond" envconfig:"JWT_REFRESH_TOKEN_EXPIRE_SECOND"`
}

// DBConfig is database config type
type DBConfig struct {
	Dsn          string `yaml:"dsn" envconfig:"DB_DSN"`
	MaxIdleConns int    `yaml:"maxIdleConns" envconfig:"DB_MAX_IDLE_CONNS"`
	MaxOpenConns int    `yaml:"maxOpenConns" envconfig:"DB_MAX_OPEN_CONNS"`
}

// NewConfig is the factory of Config instance
func NewConfig() (*Config, error) {
	var config Config
	if err := readFile(&config); err != nil {
		return nil, err
	}
	if err := readEnv(&config); err != nil {
		return nil, err
	}
	log.SetOutput(os.Stderr)

	return &config, nil
}

func readFile(config *Config) error {
	f, err := os.Open("config.yml")
	if err != nil {
		return err
	}
	defer f.Close()

	decoder := yaml.NewDecoder(f)
	err = decoder.Decode(config)
	if err != nil {
		return err
	}
	return nil
}

func readEnv(config *Config) error {
	err := envconfig.Process("", config)
	if err != nil {
		return err
	}
	return nil
}
