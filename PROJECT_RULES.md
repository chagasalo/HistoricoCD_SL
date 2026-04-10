# Reglas y Definiciones del Proyecto - Mapa de Candidatos San Lorenzo

Este documento contiene las reglas de negocio y definiciones técnicas críticas que deben respetarse en cada actualización o modificación del sistema.

## 1. Composición de Órganos de Gobierno

### Asamblea de Representantes
La cantidad de asambleístas electos varía según el año y el estatuto vigente:
- **2004 a 2016**: Debe haber exactamente **60** asambleístas.
- **2019 en adelante**: Debe haber exactamente **90** asambleístas (60 por la mayoría, 30 por la minoría).

### Comisión Directiva
- Compuesta por **20** miembros (Presidente, 2 Vices, Secretario, Tesorero, Pro-Secretario, Pro-Tesorero, Intendente, Pro-Intendente y 11 Vocales).

### Comisión Fiscalizadora
- Compuesta habitualmente por **7** miembros (o según el estatuto del año).

## 2. Lógica de Identificación de Electos (ETL)

### Fuente de Verdad
- **Color Verde**: En las hojas de matriz (`ASAMBLEISTAS`, `FISCALIZADORA`, `CANDIDATOS A CD`), la presencia de color verde (`FF00FF00` o `tema 6`) es el indicador definitivo de que el candidato fue electo.
- **Marcadores de Texto**: Los caracteres "X" o "SI" en estas matrices a menudo indican que la persona fue **Candidata**, pero no necesariamente electa (especialmente en la Asamblea).
- **Hojas Especiales**: Las hojas que contienen `E.O`, `E.E`, `A.E` o `ASAMBLEA 2025` suelen ser listas completas de candidatos por agrupación, NO solo de electos. Se usan para extraer nombres, cargos y posiciones, pero su estado de elección debe ser validado contra la matriz principal o color.

## 3. Unificación de Datos (Deduplicación)

### Alias
- Cualquier inconsistencia en nombres de agrupaciones o personas se resuelve exclusivamente en `aliases.json`.
- Estructura: 
  - `candidates`: Unificación de personas.
  - `lists`: Unificación de agrupaciones políticas.

### Colisiones por Slot
- Si dos nombres diferentes ocupan el mismo (Año, Categoría, Agrupación, Posición Numérica), se consideran la misma persona y el sistema intentará unificarlos automáticamente.
- **Excepción**: No se unifican si la posición es genérica (ej: "Vocal") sin número, a menos que haya alta confianza.
