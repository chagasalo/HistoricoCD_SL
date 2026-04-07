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

## 📊 Automatización y Datos

La aplicación utiliza un pipeline de datos (ETL) en Node.js que:

1. Descarga el archivo oficial de Google Sheets.
2. Procesa y normaliza nombres de candidatos y agrupaciones.
3. Clasifica las participaciones según el órgano (CD, Asamblea, Fiscalizadora).
4. Genera un archivo `data.json` enriquecido con metadatos de sincronización.

### Automatización con GitHub Actions

El proyecto incluye un flujo de trabajo (`.github/workflows/redeploy.yml`) que dispara un despliegue en Vercel cada 6 horas para garantizar la frescura de la información sin intervención manual.

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
