-- Tabla de pagos
CREATE TABLE IF NOT EXISTS pagos (
  id SERIAL PRIMARY KEY,
  reserva_id INTEGER NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  estado VARCHAR(50) DEFAULT 'pending' CHECK (estado IN ('pending', 'completed', 'failed', 'refunded')),
  metodo_pago VARCHAR(50) DEFAULT 'stripe',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de facturas
CREATE TABLE IF NOT EXISTS facturas (
  id SERIAL PRIMARY KEY,
  pago_id INTEGER NOT NULL REFERENCES pagos(id) ON DELETE CASCADE,
  reserva_id INTEGER NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
  numero_factura VARCHAR(50) UNIQUE NOT NULL,
  cliente_nombre VARCHAR(255) NOT NULL,
  cliente_email VARCHAR(255) NOT NULL,
  cliente_telefono VARCHAR(50),
  subtotal DECIMAL(10, 2) NOT NULL,
  impuestos DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  items JSONB NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_pagos_reserva_id ON pagos(reserva_id);
CREATE INDEX idx_pagos_stripe_id ON pagos(stripe_payment_intent_id);
CREATE INDEX idx_pagos_estado ON pagos(estado);
CREATE INDEX idx_facturas_pago_id ON facturas(pago_id);
CREATE INDEX idx_facturas_reserva_id ON facturas(reserva_id);
CREATE INDEX idx_facturas_numero ON facturas(numero_factura);

-- Trigger para actualizar updated_at en pagos
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pagos_updated_at BEFORE UPDATE ON pagos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
