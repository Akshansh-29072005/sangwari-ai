FROM golang:alpine AS builder

WORKDIR /app

# Install dependencies required for some go packages (e.g. CGO, if any)
RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build the application
RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./main.go

# Run stage
FROM alpine:latest

RUN apk add --no-cache tzdata

WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /app/main .

# Expose port
EXPOSE 8000

# Notice: You can copy .env over here, or use docker-compose environment vars
# COPY .env .env

CMD ["./main"]
