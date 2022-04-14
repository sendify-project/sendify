package main

func InitializeServer() (*Server, error) {
	config, err := NewConfig()
	if err != nil {
		return nil, err
	}
	engine := NewEngine(config)
	gormDB, err := NewDatabaseConnection(config)
	if err != nil {
		return nil, err
	}
	jwtAuthRepository := NewJWTAuthRepository(gormDB)
	idGenerator, err := NewSonyFlake()
	if err != nil {
		return nil, err
	}
	jwtAuthService := NewJWTAuthService(config, jwtAuthRepository, idGenerator)
	customerRepository := NewCustomerRepository(gormDB)
	customerService := NewCustomerService(config, customerRepository)
	router := NewRouter(jwtAuthService, customerService)
	jwtAuthChecker := NewJWTAuthChecker(config, jwtAuthService)
	server := NewServer(config, engine, router, jwtAuthChecker)
	return server, nil
}

func InitializeMigrator() (*Migrator, error) {
	configConfig, err := NewConfig()
	if err != nil {
		return nil, err
	}
	gormDB, err := NewDatabaseConnection(configConfig)
	if err != nil {
		return nil, err
	}
	migrator := NewMigrator(gormDB)
	return migrator, nil
}
