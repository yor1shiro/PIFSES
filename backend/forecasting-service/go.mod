module github.com/pifses/forecasting-service

go 1.21

require (
	github.com/gin-gonic/gin v1.9.1
	go.temporal.io/sdk v1.24.0
	go.temporal.io/api v1.26.0
	github.com/google/uuid v1.4.0
	go.uber.org/zap v1.26.0
	github.com/segmentio/kafka-go v0.4.44
	github.com/go-redis/redis/v8 v8.11.5
	github.com/gocql/gocql v1.6.0
)

require (
	github.com/cespare/xxhash/v2 v2.2.0 // indirect
	github.com/golang/protobuf v1.5.3 // indirect
	github.com/hailocab/go-hostpool v0.0.0-20160801081237-e8ab8340a6ac // indirect
	go.uber.org/multierr v1.11.0 // indirect
	golang.org/x/net v0.18.0 // indirect
	golang.org/x/sys v0.14.0 // indirect
	google.golang.org/grpc v1.59.0 // indirect
	google.golang.org/protobuf v1.31.0 // indirect
)
