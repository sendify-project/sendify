package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"
	"time"

	log "github.com/sirupsen/logrus"
)

func main() {
	migrator, err := InitializeMigrator()
	if err != nil {
		log.Fatal(err)
	}
	if err := migrator.Migrate(); err != nil {
		log.Fatal(err)
	}

	server, err := InitializeServer()
	if err != nil {
		log.Fatal(err)
	}

	go func() {
		if err := server.Run(); err != nil {
			log.Fatal(err)
		}
	}()

	// catch shutdown
	done := make(chan bool, 1)
	go func() {
		sig := make(chan os.Signal, 1)
		signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
		<-sig

		// graceful shutdown
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		server.GracefulStop(ctx, done)
	}()

	// wait for graceful shutdown
	<-done
}
