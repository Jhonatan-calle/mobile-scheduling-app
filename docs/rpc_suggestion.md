# Sugerencia: RPC para incrementar `occurrences`

Actualmente el incremento de `occurrences` se hace desde la app con
lectura + suma + escritura. Es simple y funcional para un admin
single-user, pero tiene una race condition teórica si dos sesiones
completan turnos del mismo cliente al mismo tiempo.

## Solución recomendada (futuro)

### 1. Crear función en Supabase

```sql
CREATE OR REPLACE FUNCTION increment_client_occurrences(client_id BIGINT)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE clients
  SET occurrences = COALESCE(occurrences, 0) + 1
  WHERE id = client_id;
END;
$$;
```

### 2. Llamarla desde la app

```ts
await supabase.rpc('increment_client_occurrences', {
  client_id: appointment.client.id,
});
```

## Ventajas
- Sin race condition (UPDATE atómico en DB)
- No necesita leer el valor actual ni hacer cálculos en el cliente
- Mínimo overhead de red (un solo RPC call)

## Cuándo implementar
Si en el futuro hay múltiples admins operando simultáneamente
y se detectan inconsistencias en `occurrences`.
