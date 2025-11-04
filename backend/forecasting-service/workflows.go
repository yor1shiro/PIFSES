package main

import (
	"fmt"
	"log"

	"go.temporal.io/sdk/workflow"
)

// ReorderWorkflowInput defines the input for reorder workflow
type ReorderWorkflowInput struct {
	StoreID      string
	ProductID    string
	Quantity     int
	SupplierID   string
	PredictedDemand float64
}

// ReorderWorkflowOutput defines the output of reorder workflow
type ReorderWorkflowOutput struct {
	OrderID            string
	ExecutionStatus    string
	EstimatedDelivery  string
	PublishedMetrics   bool
}

// ReorderWorkflow orchestrates the automated reorder process
// Flow:
// 1. Validate reorder rules and thresholds
// 2. Check supplier availability
// 3. Execute order placement
// 4. Publish metrics and notifications
// 5. Handle failures with retries
func ReorderWorkflow(ctx workflow.Context, input ReorderWorkflowInput) (*ReorderWorkflowOutput, error) {
	log.Printf("Starting reorder workflow for product %s (store: %s)", input.ProductID, input.StoreID)

	// Set workflow options
	retryPolicy := &temporal.RetryPolicy{
		InitialInterval:    time.Second,
		BackoffCoefficient: 2,
		MaximumInterval:    time.Minute,
		MaximumAttempts:    3,
	}

	ctx = workflow.WithRetryPolicy(ctx, retryPolicy)

	// Step 1: Validate reorder rules
	var validateResult bool
	err := workflow.ExecuteActivity(ctx, ValidateReorderActivity, input).Get(ctx, &validateResult)
	if err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	if !validateResult {
		return &ReorderWorkflowOutput{
			ExecutionStatus: "rejected",
		}, nil
	}

	// Step 2: Check supplier availability
	var supplierStatus string
	err = workflow.ExecuteActivity(ctx, CheckSupplierActivity, input).Get(ctx, &supplierStatus)
	if err != nil {
		return nil, fmt.Errorf("supplier check failed: %w", err)
	}

	if supplierStatus != "available" {
		return &ReorderWorkflowOutput{
			ExecutionStatus: "supplier_unavailable",
		}, nil
	}

	// Step 3: Execute order placement
	var orderID string
	err = workflow.ExecuteActivity(ctx, ExecuteReorderActivity, input).Get(ctx, &orderID)
	if err != nil {
		return nil, fmt.Errorf("order execution failed: %w", err)
	}

	// Step 4: Publish metrics
	var metricsPublished bool
	err = workflow.ExecuteActivity(ctx, PublishMetricsActivity, input).Get(ctx, &metricsPublished)
	if err != nil {
		log.Printf("Warning: metrics publication failed: %v", err)
		// Don't fail the workflow for metrics
	}

	// Step 5: Send notification
	_ = workflow.ExecuteActivity(ctx, SendNotificationActivity, input).Get(ctx, nil)

	return &ReorderWorkflowOutput{
		OrderID:          orderID,
		ExecutionStatus:  "completed",
		EstimatedDelivery: "2025-01-10",
		PublishedMetrics: metricsPublished,
	}, nil
}

// Activity implementations
func ValidateReorderActivity(ctx context.Context, input ReorderWorkflowInput) (bool, error) {
	log.Printf("Validating reorder rules for %s", input.ProductID)
	// Check against stored reorder rules
	// Return true if validation passes
	return true, nil
}

func CheckSupplierActivity(ctx context.Context, input ReorderWorkflowInput) (string, error) {
	log.Printf("Checking supplier %s availability", input.SupplierID)
	// Call supplier API to check availability
	// Return "available" or "unavailable"
	return "available", nil
}

func ExecuteReorderActivity(ctx context.Context, input ReorderWorkflowInput) (string, error) {
	log.Printf("Executing reorder: %d units of %s from supplier %s", input.Quantity, input.ProductID, input.SupplierID)
	// Call supplier API to place order
	// Publish event to Kafka
	orderID := fmt.Sprintf("ORDER-%d", time.Now().Unix())
	return orderID, nil
}

func PublishMetricsActivity(ctx context.Context, input ReorderWorkflowInput) (bool, error) {
	log.Printf("Publishing metrics for reorder event")
	// Publish metrics to Prometheus
	// Store execution record in database
	return true, nil
}

func SendNotificationActivity(ctx context.Context, input ReorderWorkflowInput) error {
	log.Printf("Sending notification for reorder completion")
	// Send email/webhook notification
	return nil
}
