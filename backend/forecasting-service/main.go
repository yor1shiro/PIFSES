package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
	"go.uber.org/zap"
)

var (
	temporalClient client.Client
	logger         *zap.Logger
)

func init() {
	var err error
	logger, err = zap.NewProduction()
	if err != nil {
		log.Fatalf("Failed to create logger: %v", err)
	}
}

func main() {
	defer logger.Sync()

	// Initialize Temporal client
	var err error
	temporalClient, err = client.Dial(client.Options{
		HostPort: "temporal:7233",
	})
	if err != nil {
		logger.Fatal("Failed to create Temporal client", zap.Error(err))
	}
	defer temporalClient.Close()

	// Create Gin router
	router := gin.Default()

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "forecasting-service",
		})
	})

	// Forecasting endpoints
	router.POST("/forecast/predict", predictDemand)
	router.POST("/forecast/train", trainModels)
	router.GET("/forecast/models/status", getModelStatus)
	router.POST("/reorder/execute", executeReorderWorkflow)
	router.GET("/workflow/:workflowID", getWorkflowStatus)

	// Start Temporal worker in goroutine
	go startTemporalWorker()

	// Start HTTP server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	go func() {
		logger.Info("Starting Forecasting Service", zap.String("port", port))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Server error", zap.Error(err))
		}
	}()

	// Graceful shutdown
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

func startTemporalWorker() {
	// Create worker
	w := worker.New(temporalClient, "forecasting-tasks", worker.Options{})

	// Register activities
	w.RegisterActivity(ExecuteReorderActivity)
	w.RegisterActivity(PublishMetricsActivity)

	// Register workflows
	// w.RegisterWorkflow(ReorderWorkflow)

	if err := w.Run(worker.InterruptCh()); err != nil {
		logger.Fatal("Worker error", zap.Error(err))
	}
}

// API Handlers
func predictDemand(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"forecast": map[string]interface{}{
			"days":     14,
			"accuracy": 0.85,
			"prediction": []int{100, 105, 102, 108, 115, 120, 118, 125, 130, 128, 135, 140, 138, 145},
		},
	})
}

func trainModels(c *gin.Context) {
	c.JSON(http.StatusAccepted, gin.H{
		"message":    "model training started",
		"job_id":     "train-001",
		"estimated_time": "5 minutes",
	})
}

func getModelStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"models": map[string]interface{}{
			"arima": map[string]interface{}{
				"status":     "deployed",
				"accuracy":   0.82,
				"last_train": "2025-01-01T00:00:00Z",
			},
			"lstm": map[string]interface{}{
				"status":     "deployed",
				"accuracy":   0.88,
				"last_train": "2025-01-01T00:00:00Z",
			},
		},
	})
}

func executeReorderWorkflow(c *gin.Context) {
	// Start Temporal workflow
	workflowOptions := client.StartWorkflowOptions{
		ID:        "reorder-" + time.Now().Format("20060102150405"),
		TaskQueue: "forecasting-tasks",
	}

	run, err := temporalClient.ExecuteWorkflow(context.Background(), workflowOptions, "ReorderWorkflow", nil)
	if err != nil {
		logger.Error("Failed to execute workflow", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "workflow execution failed"})
		return
	}

	c.JSON(http.StatusAccepted, gin.H{
		"workflow_id": run.GetID(),
		"run_id":      run.GetRunID(),
	})
}

func getWorkflowStatus(c *gin.Context) {
	workflowID := c.Param("workflowID")
	c.JSON(http.StatusOK, gin.H{
		"workflow_id": workflowID,
		"status":      "completed",
		"result":      "reorder executed successfully",
	})
}

// Temporal Activities
func ExecuteReorderActivity(ctx context.Context) error {
	logger.Info("Executing reorder activity")
	// Call supplier API to place order
	return nil
}

func PublishMetricsActivity(ctx context.Context) error {
	logger.Info("Publishing metrics")
	// Publish metrics to Prometheus
	return nil
}
