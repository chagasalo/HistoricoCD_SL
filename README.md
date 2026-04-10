# 🟦🟥 Mapa de Candidatos - San Lorenzo de Almagro

Una aplicación web interactiva diseñada para explorar y analizar el historial político completo de los candidatos del Club Atlético San Lorenzo de Almagro. Permite visualizar trayectorias en múltiples órganos, pases entre agrupaciones y la conformación histórica de las comisiones.

## ✨ Características Principales

- **Explorador Multicategoría**: Visualizá participaciones consolidadas en **Comisión Directiva**, **Comisión Fiscalizadora** y **Asamblea**.
- **Ordenamiento Estratégico**: Ranking inteligente que prioriza la jerarquía política:
  1. Cantidad de veces **Efectivamente Electo** en CD 🥇
  2. Trayectoria total en CD.
  3. Cantidad de veces Electo en Fiscalizadora.
  4. ...y así sucesivamente.
- **Mapa de Pases**: Visualiza el "transfuguismo" histórico, identificando candidatos que han participado en múltiples listas a lo largo de los años.
- **Conformaciones Históricas**: Análisis detallado de la composición de los órganos de gobierno tras cada elección.
- **Deep Linking**: Compartí enlaces directos a secciones específicas (Candidatos, Pases o Conformaciones) mediante rutas basadas en hash.
- **Sincronización Automática**: El sistema se actualiza automáticamente cada 6 horas consultando el Excel oficial.

## 📊 Arquitectura de Datos y ETL

La aplicación utiliza un motor de datos (ETL) avanzado en Node.js que consolida la información institucional y genera múltiples salidas:

1. **Unificación de Identidades**: Utiliza un sistema de `aliases.json` para resolver discrepancias de nombres (ej. "Juan Perez" vs "Perez J.") y fusionar trayectorias.
2. **Normalización Institucional**:
   - Expansión automática de "SL" a "**San Lorenzo**".
   - Estandarización de conectores (ej. "x" → "por") y mayúsculas.
3. **Captura de Metadatos**:
   - **Biografías**: Extracción automática de reseñas desde el Excel.
   - **Detección de Bajas**: Análisis de texto (NLP) para identificar flags de **renuncia, fallecimiento o fin de mandato anticipado**.
4. **Bases de Datos Paralelas**: Además del `data.json` para la web, genera tres archivos CSV en `/public/` para auditoría y análisis en Excel/Tableau:
   - `candidates.csv`: Listado único de actores políticos con sus biografías.
   - `history.csv`: Base relacional de todas las participaciones electorales.
   - `agrupaciones.csv`: Catálogo de partidos con sus reseñas históricas.

### Automatización y Despliegue

El proyecto incluye un flujo de trabajo (`.github/workflows/redeploy.yml`) que dispara un despliegue en Vercel cada 6 horas. Durante la compilación, el script `fetchData.js` se sincroniza con el Google Sheet oficial, regenerando todas las bases mencionadas.

## 🚀 Inicio Rápido

### Requisitos Previos

- [Node.js](https://nodejs.org/) (v18 o superior)
- [Git](https://git-scm.com/)

### Instalación Local

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/chagasalo/HistoricoCD_SL.git
   cd HistoricoCD_SL
   ```

2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Actualizar datos locales (requiere `SHEET_URL` en `.env`):

   ```bash
   npm run update-data
   ```

4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 🛠️ Tecnologías

- **Frontend**: React 19 + Vite
- **Animaciones**: Framer Motion & AnimatePresence
- **Iconografía**: Lucide React
- **Procesamiento de Datos**: ExcelJS + Axios (Node.js)
- **Automatización**: GitHub Actions + Vercel Deploy Hooks
- **Estilos**: Vanilla CSS (Variables & Flexbox/Grid)

## 🤝 Créditos

- **Data Source**: Información recopilada y actualizada por [Mariano Casla (@mariano_casla99)](https://x.com/mariano_casla99).
- **Vibecodeado por**: [Gonzalo Suarez (@chagasalo)](https://x.com/chagasalo) & Antigravity AI.

---

_Hecho por y para los hinchas y socios de San Lorenzo. ¡Aguante el Ciclón!_ ❤️💙
