CREATE KEYSPACE IF NOT EXISTS pifses
  WITH replication = {'class': 'SimpleStrategy', 'replication_factor' : 1};

USE pifses;

-- Sales Events table (time-series data)
CREATE TABLE IF NOT EXISTS sales_events (
    store_id UUID,
    timestamp TIMESTAMP,
    event_id UUID,
    product_id TEXT,
    quantity INT,
    price DECIMAL,
    channel TEXT,
    currency TEXT,
    PRIMARY KEY ((store_id), timestamp, event_id)
) WITH CLUSTERING ORDER BY (timestamp DESC)
AND default_time_to_live = 7776000;  -- 90 days TTL

-- Forecasts table
CREATE TABLE IF NOT EXISTS forecasts (
    store_id UUID,
    product_id TEXT,
    forecast_date TIMESTAMP,
    days_ahead INT,
    predictions LIST<FLOAT>,
    confidence_lower LIST<FLOAT>,
    confidence_upper LIST<FLOAT>,
    model_accuracy FLOAT,
    created_at TIMESTAMP,
    PRIMARY KEY ((store_id, product_id), forecast_date)
) WITH CLUSTERING ORDER BY (forecast_date DESC);

-- Reorder Rules table
CREATE TABLE IF NOT EXISTS reorder_rules (
    store_id UUID,
    rule_id UUID,
    product_id TEXT,
    min_stock_level INT,
    max_stock_level INT,
    reorder_quantity INT,
    supplier_id UUID,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY ((store_id), rule_id)
);

-- Inventory Snapshots table
CREATE TABLE IF NOT EXISTS inventory_snapshots (
    store_id UUID,
    product_id TEXT,
    snapshot_date TIMESTAMP,
    quantity_on_hand INT,
    quantity_reserved INT,
    quantity_available INT,
    PRIMARY KEY ((store_id, product_id), snapshot_date)
) WITH CLUSTERING ORDER BY (snapshot_date DESC);

-- Reorder Executions table
CREATE TABLE IF NOT EXISTS reorder_executions (
    store_id UUID,
    execution_id UUID,
    product_id TEXT,
    order_date TIMESTAMP,
    quantity_ordered INT,
    supplier_id UUID,
    status TEXT,
    estimated_delivery TIMESTAMP,
    created_at TIMESTAMP,
    PRIMARY KEY ((store_id), order_date, execution_id)
) WITH CLUSTERING ORDER BY (order_date DESC);

-- Anomalies table
CREATE TABLE IF NOT EXISTS anomalies (
    store_id UUID,
    product_id TEXT,
    detected_at TIMESTAMP,
    anomaly_type TEXT,
    severity TEXT,
    value FLOAT,
    threshold FLOAT,
    details TEXT,
    acknowledged BOOLEAN,
    PRIMARY KEY ((store_id, product_id), detected_at)
) WITH CLUSTERING ORDER BY (detected_at DESC);

-- Create indices for common queries
CREATE INDEX IF NOT EXISTS sales_events_product_idx ON sales_events(product_id);
CREATE INDEX IF NOT EXISTS forecasts_product_idx ON forecasts(product_id);
CREATE INDEX IF NOT EXISTS inventory_product_idx ON inventory_snapshots(product_id);
