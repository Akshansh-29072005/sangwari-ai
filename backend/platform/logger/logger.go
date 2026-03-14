package logger

import (
	"os"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

// Setup initializes the global zerolog logger.
func Setup() {
	zerolog.TimeFieldFormat = time.RFC3339

	if os.Getenv("APP_ENV") == "development" {
		// Human-readable colored output for dev
		log.Logger = zerolog.New(zerolog.ConsoleWriter{
			Out:        os.Stderr,
			TimeFormat: "15:04:05",
		}).With().Timestamp().Caller().Logger()
	} else {
		// Structured JSON output for production
		log.Logger = zerolog.New(os.Stdout).With().Timestamp().Logger()
	}

	log.Info().Str("env", os.Getenv("APP_ENV")).Msg("Logger initialized")
}

// Get returns the global zerolog logger.
func Get() zerolog.Logger {
	return log.Logger
}
