package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/segmentio/kafka-go"
	"go.uber.org/zap"
)

var (
	logger      *zap.Logger
	kafkaWriter *kafka.Writer
)

type SalesEvent struct {
	StoreID   string    `json:"store_id"`
	ProductID string    `json:"product_id"`
	Quantity  int       `json:"quantity"`
	Price     float64   `json:"price"`
	Channel   string    `json:"channel"` // "shopify" or "etsy"
	Timestamp time.Time `json:"timestamp"`
}

func init() {
	var err error
	logger, err = zap.NewProduction()
	if err != nil {
		log.Fatalf("Failed to create logger: %v", err)
	}

	// Initialize Kafka writer
	kafkaWriter = &kafka.Writer{
		Addr:     kafka.TCP("kafka:9092"),
		Topic:    "sales-events",
		Balancer: &kafka.LeastBytes{},
	}
}

func main() {
	defer logger.Sync()
	defer kafkaWriter.Close()

	router := gin.Default()

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "integration-service",
		})
	})

	// Shopify integration
	router.POST("/integrations/shopify/webhook", handleShopifyWebhook)
	router.GET("/integrations/shopify/sync", syncShopifyData)

	// Etsy integration
	router.POST("/integrations/etsy/webhook", handleEtsyWebhook)
	router.GET("/integrations/etsy/sync", syncEtsyData)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	go func() {
		logger.Info("Starting Integration Service", zap.String("port", port))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Server error", zap.Error(err))
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Fatal("Server forced to shutdown", zap.Error(err))
	}
}

func handleShopifyWebhook(c *gin.Context) {
	var event SalesEvent
	if err := c.BindJSON(&event); err != nil {
		logger.Error("Failed to parse Shopify webhook", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}

	event.Channel = "shopify"
	event.Timestamp = time.Now()

	// Publish to Kafka
	if err := publishToKafka(event); err != nil {
		logger.Error("Failed to publish event", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "publication failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "event received"})
}

func handleEtsyWebhook(c *gin.Context) {
	var event SalesEvent
	if err := c.BindJSON(&event); err != nil {
		logger.Error("Failed to parse Etsy webhook", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}

	event.Channel = "etsy"
	event.Timestamp = time.Now()

	if err := publishToKafka(event); err != nil {
		logger.Error("Failed to publish event", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "publication failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "event received"})
}

func syncShopifyData(c *gin.Context) {
	storeID := c.Query("store_id")
	logger.Info("Syncing Shopify data", zap.String("store_id", storeID))

	c.JSON(http.StatusOK, gin.H{
		"message":     "sync started",
		"store_id":    storeID,
		"sync_job_id": "sync-shopify-" + time.Now().Format("20060102150405"),
	})
}

func syncEtsyData(c *gin.Context) {
	storeID := c.Query("store_id")
	logger.Info("Syncing Etsy data", zap.String("store_id", storeID))

	c.JSON(http.StatusOK, gin.H{
		"message":     "sync started",
		"store_id":    storeID,
		"sync_job_id": "sync-etsy-" + time.Now().Format("20060102150405"),
	})
}

func publishToKafka(event SalesEvent) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}

	msg := kafka.Message{
		Key:   []byte(event.StoreID),
		Value: data,
	}

	return kafkaWriter.WriteMessages(context.Background(), msg)
}
