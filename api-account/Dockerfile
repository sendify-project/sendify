FROM golang:1.17 AS builder

RUN mkdir -p /app
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o server .

FROM alpine:3.14
RUN apk update && apk add --no-cache ca-certificates

RUN mkdir -p /app
WORKDIR /app
COPY --from=builder /app/server /app/config.yml ./

ENTRYPOINT ["/app/server"]