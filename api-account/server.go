package main

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
)

// Server is the http wrapper
type Server struct {
	App            string
	Port           string
	Engine         *gin.Engine
	Router         *Router
	svr            *http.Server
	jwtAuthChecker *JWTAuthChecker
}

func NewEngine(config *Config) *gin.Engine {
	gin.SetMode(gin.DebugMode)
	engine := gin.New()
	engine.Use(gin.Recovery())
	engine.Use(CORSMiddleware())

	return engine
}

// NewServer is the factory for server instance
func NewServer(config *Config, engine *gin.Engine, router *Router, jwtAuthChecker *JWTAuthChecker) *Server {
	return &Server{
		Port:           config.HTTPPort,
		Engine:         engine,
		Router:         router,
		jwtAuthChecker: jwtAuthChecker,
	}
}

// RegisterRoutes method register all endpoints
func (s *Server) RegisterRoutes() {
	apiGroup := s.Engine.Group("/api/account")
	apiGroup.GET("/name/:id", s.Router.GetCustomerName)
	{
		forwardAuthGroup := apiGroup.Group("/forwardauth")
		forwardAuthGroup.Use(s.jwtAuthChecker.JWTAuth())
		{
			forwardAuthGroup.Any("", s.Router.Auth)
		}
		authGroup := apiGroup.Group("/auth")
		{
			authGroup.POST("/signup", s.Router.SignUp)
			authGroup.POST("/login", s.Router.Login)
			authGroup.POST("/refresh", s.Router.RefreshToken)
		}
		withJWT := apiGroup.Group("/info")
		withJWT.Use(s.jwtAuthChecker.JWTAuth())
		{
			withJWT.GET("/person", s.Router.GetCustomerPersonalInfoWithId)
			withJWT.PUT("/person", s.Router.UpdateCustomerPersonalInfo)
		}
	}
}

// Run is a method for starting server
func (s *Server) Run() error {
	s.RegisterRoutes()
	addr := ":" + s.Port
	s.svr = &http.Server{
		Addr:    addr,
		Handler: s.Engine,
	}
	log.Infoln("http server listening on ", addr)
	err := s.svr.ListenAndServe()
	if err != nil && err != http.ErrServerClosed {
		return err
	}
	return nil
}

// GracefulStop the server
func (s *Server) GracefulStop(ctx context.Context, done chan bool) {
	if err := s.svr.Shutdown(ctx); err != nil {
		log.Error(err)
	}
	log.Info("gracefully shutdowned")
	done <- true
}
