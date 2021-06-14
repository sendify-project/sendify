package main

import (
	"fmt"
	"os"

	"github.com/gin-gonic/gin"
)

var (
	ginMode  = os.Getenv("GIN_MODE")
	httpPort = os.Getenv("HTTP_PORT")

	engine *gin.Engine
	logger *Logger

	app = "store"
)

func init() {
	gin.SetMode(ginMode)
	engine = gin.New()

	logger = newLogger(app)
	engine.Use(gin.Recovery())
	engine.Use(LogMiddleware(logger.ContextLogger))
	engine.Use(CORSMiddleware())
}

func main() {
	if httpPort == "" {
		httpPort = "80"
	}
	apiGroup := engine.Group("/api")

	apiGroup.POST("/channel", CreateChannel)
	apiGroup.GET("/channels", ListChannels)

	apiGroup.POST("/message", CreateMessage)
	apiGroup.GET("/messages", ListMessages)

	logger.ContextLogger.Infof("listening on port %s", httpPort)
	engine.Run(fmt.Sprintf(":%s", httpPort))
}
