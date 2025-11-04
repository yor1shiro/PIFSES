#!/bin/bash

# Initialize test data and seed databases

set -e

echo "🌱 Seeding test data..."

# Wait for services to be ready
echo "⏳ Waiting for services to initialize..."
sleep 5

# Seed Cassandra with sample data
echo "📊 Seeding Cassandra..."
docker exec pifses-cassandra cqlsh -u cassandra -p cassandra << EOF
USE pifses;

-- Insert sample sales events
INSERT INTO sales_events (store_id, timestamp, event_id, product_id, quantity, price, channel, currency)
VALUES (550e8400-e29b-41d4-a716-446655440000, 2025-01-05T10:00:00Z, 123e4567-e89b-12d3-a456-426614174000, 'SKU-001', 5, 29.99, 'shopify', 'USD');

INSERT INTO sales_events (store_id, timestamp, event_id, product_id, quantity, price, channel, currency)
VALUES (550e8400-e29b-41d4-a716-446655440000, 2025-01-04T15:30:00Z, 223e4567-e89b-12d3-a456-426614174000, 'SKU-002', 3, 49.99, 'etsy', 'USD');

-- Insert sample inventory
INSERT INTO inventory_snapshots (store_id, product_id, snapshot_date, quantity_on_hand, quantity_reserved, quantity_available)
VALUES (550e8400-e29b-41d4-a716-446655440000, 'SKU-001', 2025-01-05T00:00:00Z, 50, 10, 40);

INSERT INTO inventory_snapshots (store_id, product_id, snapshot_date, quantity_on_hand, quantity_reserved, quantity_available)
VALUES (550e8400-e29b-41d4-a716-446655440000, 'SKU-002', 2025-01-05T00:00:00Z, 25, 5, 20);

-- Insert sample reorder rules
INSERT INTO reorder_rules (store_id, rule_id, product_id, min_stock_level, max_stock_level, reorder_quantity, supplier_id, is_active, created_at, updated_at)
VALUES (550e8400-e29b-41d4-a716-446655440000, 650e8400-e29b-41d4-a716-446655440001, 'SKU-001', 20, 100, 50, 750e8400-e29b-41d4-a716-446655440001, true, 2025-01-01T00:00:00Z, 2025-01-01T00:00:00Z);

INSERT INTO reorder_rules (store_id, rule_id, product_id, min_stock_level, max_stock_level, reorder_quantity, supplier_id, is_active, created_at, updated_at)
VALUES (550e8400-e29b-41d4-a716-446655440000, 650e8400-e29b-41d4-a716-446655440002, 'SKU-002', 15, 80, 40, 750e8400-e29b-41d4-a716-446655440001, true, 2025-01-01T00:00:00Z, 2025-01-01T00:00:00Z);

-- Insert sample forecasts
INSERT INTO forecasts (store_id, product_id, forecast_date, days_ahead, predictions, confidence_lower, confidence_upper, model_accuracy, created_at)
VALUES (550e8400-e29b-41d4-a716-446655440000, 'SKU-001', 2025-01-05T00:00:00Z, 14, 
  [100, 105, 102, 108, 115, 120, 118, 125, 130, 128, 135, 140, 138, 145],
  [85, 89, 87, 92, 98, 102, 100, 106, 111, 109, 115, 119, 117, 123],
  [115, 121, 117, 124, 132, 138, 136, 144, 149, 147, 155, 161, 159, 167],
  0.85, 2025-01-05T00:00:00Z);

EOF

echo "✅ Cassandra seeding complete"

# Seed Redis with feature data
echo "📦 Seeding Redis..."
docker exec pifses-redis redis-cli << EOF
SET cache:features:550e8400-e29b-41d4-a716-446655440000:SKU-001 '{"quantity": 50, "trend": "increasing", "seasonality": 1.2}'
SET cache:features:550e8400-e29b-41d4-a716-446655440000:SKU-002 '{"quantity": 25, "trend": "stable", "seasonality": 0.95}'
SET cache:rules:550e8400-e29b-41d4-a716-446655440000 '{"auto_reorder": true, "notification_email": "seller@example.com"}'
EXPIRE cache:features:550e8400-e29b-41d4-a716-446655440000:SKU-001 86400
EXPIRE cache:features:550e8400-e29b-41d4-a716-446655440000:SKU-002 86400
EXPIRE cache:rules:550e8400-e29b-41d4-a716-446655440000 86400
EOF

echo "✅ Redis seeding complete"

echo ""
echo "✅ Test data seeded successfully!"
echo ""
echo "Sample Store ID: 550e8400-e29b-41d4-a716-446655440000"
echo "Sample Products: SKU-001, SKU-002"
echo ""
echo "You can now test the API endpoints:"
echo "  curl http://localhost:8080/api/v1/forecasts"
echo "  curl http://localhost:8080/api/v1/inventory"
