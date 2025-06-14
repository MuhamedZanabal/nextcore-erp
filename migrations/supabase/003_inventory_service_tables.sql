-- =============================================
-- Inventory Service Tables Migration
-- =============================================

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    name VARCHAR NOT NULL,
    sku VARCHAR NOT NULL UNIQUE,
    description TEXT,
    "listPrice" DECIMAL(10,2),
    currency VARCHAR DEFAULT 'USD',
    active BOOLEAN DEFAULT true,
    "trackInventory" BOOLEAN DEFAULT true,
    "inventoryMethod" VARCHAR DEFAULT 'fifo',
    "trackSerialNumbers" BOOLEAN DEFAULT false,
    "trackLots" BOOLEAN DEFAULT false,
    "reorderPoint" DECIMAL(10,2) DEFAULT 0,
    "reorderQuantity" DECIMAL(10,2) DEFAULT 0,
    attributes JSONB,
    "categoryId" UUID,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    name VARCHAR NOT NULL,
    code VARCHAR NOT NULL UNIQUE,
    address TEXT,
    active BOOLEAN DEFAULT true,
    "operatingHours" JSONB,
    capabilities JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create warehouse_zones table
CREATE TABLE IF NOT EXISTS warehouse_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "warehouseId" UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    code VARCHAR NOT NULL,
    type VARCHAR DEFAULT 'storage',
    active BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("warehouseId", code)
);

-- Create warehouse_bins table
CREATE TABLE IF NOT EXISTS warehouse_bins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "zoneId" UUID NOT NULL REFERENCES warehouse_zones(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    code VARCHAR NOT NULL,
    active BOOLEAN DEFAULT true,
    "maxWeight" DECIMAL(10,2),
    "maxVolume" DECIMAL(10,2),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("zoneId", code)
);

-- Create stock_levels table
CREATE TABLE IF NOT EXISTS stock_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "productId" UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    "warehouseId" UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    "binId" UUID REFERENCES warehouse_bins(id) ON DELETE SET NULL,
    quantity DECIMAL(10,2) DEFAULT 0,
    "reservedQuantity" DECIMAL(10,2) DEFAULT 0,
    "availableQuantity" DECIMAL(10,2) DEFAULT 0,
    "lastCounted" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("productId", "warehouseId")
);

-- Create stock_movements table
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    reference VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    "sourceWarehouseId" UUID REFERENCES warehouses(id) ON DELETE SET NULL,
    "destinationWarehouseId" UUID REFERENCES warehouses(id) ON DELETE SET NULL,
    status VARCHAR DEFAULT 'draft',
    "orderId" UUID,
    notes TEXT,
    "createdById" UUID,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create stock_movement_lines table
CREATE TABLE IF NOT EXISTS stock_movement_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "movementId" UUID NOT NULL REFERENCES stock_movements(id) ON DELETE CASCADE,
    "productId" UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    "sourceBinId" UUID REFERENCES warehouse_bins(id) ON DELETE SET NULL,
    "destinationBinId" UUID REFERENCES warehouse_bins(id) ON DELETE SET NULL,
    quantity DECIMAL(10,2) NOT NULL,
    "unitCost" DECIMAL(10,2),
    "serialNumber" VARCHAR,
    "lotNumber" VARCHAR,
    "expiryDate" DATE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON products("tenantId");
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products("categoryId");

CREATE INDEX IF NOT EXISTS idx_warehouses_tenant_id ON warehouses("tenantId");
CREATE INDEX IF NOT EXISTS idx_warehouses_code ON warehouses(code);

CREATE INDEX IF NOT EXISTS idx_warehouse_zones_warehouse_id ON warehouse_zones("warehouseId");
CREATE INDEX IF NOT EXISTS idx_warehouse_bins_zone_id ON warehouse_bins("zoneId");

CREATE INDEX IF NOT EXISTS idx_stock_levels_product_id ON stock_levels("productId");
CREATE INDEX IF NOT EXISTS idx_stock_levels_warehouse_id ON stock_levels("warehouseId");
CREATE INDEX IF NOT EXISTS idx_stock_levels_bin_id ON stock_levels("binId");

CREATE INDEX IF NOT EXISTS idx_stock_movements_tenant_id ON stock_movements("tenantId");
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_status ON stock_movements(status);
CREATE INDEX IF NOT EXISTS idx_stock_movements_source_warehouse ON stock_movements("sourceWarehouseId");
CREATE INDEX IF NOT EXISTS idx_stock_movements_destination_warehouse ON stock_movements("destinationWarehouseId");
CREATE INDEX IF NOT EXISTS idx_stock_movements_order_id ON stock_movements("orderId");

CREATE INDEX IF NOT EXISTS idx_stock_movement_lines_movement_id ON stock_movement_lines("movementId");
CREATE INDEX IF NOT EXISTS idx_stock_movement_lines_product_id ON stock_movement_lines("productId");
CREATE INDEX IF NOT EXISTS idx_stock_movement_lines_serial_number ON stock_movement_lines("serialNumber");
CREATE INDEX IF NOT EXISTS idx_stock_movement_lines_lot_number ON stock_movement_lines("lotNumber");

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warehouse_zones_updated_at BEFORE UPDATE ON warehouse_zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warehouse_bins_updated_at BEFORE UPDATE ON warehouse_bins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_levels_updated_at BEFORE UPDATE ON stock_levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_movements_updated_at BEFORE UPDATE ON stock_movements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_movement_lines_updated_at BEFORE UPDATE ON stock_movement_lines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();