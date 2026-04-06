# 🟦🟥 Historial de Candidatos - San Lorenzo de Almagro

Una aplicación web interactiva diseñada para explorar y analizar el historial político de los candidatos a la Comisión Directiva de San Lorenzo. Permite visualizar trayectorias, "traspasos" entre agrupaciones y la conformación histórica de las comisiones.

## ✨ Características

- **Explorador de Candidatos**: Filtra por nombre, agrupación o año de elección.
- **Mapa de Pases**: Visualiza el "transfuguismo" o cambios de lista de los candidatos a lo largo de los años.
- **Conformaciones Históricas**: Análisis de cómo quedaron compuestas las Comisiones Directivas en cada elección.
- **Diseño Premium**: Interfaz moderna, rápida y adaptada a la identidad visual de San Lorenzo.
- **Actualización en Tiempo Real**: Sincronización con base de datos en Google Sheets.

## 🚀 Inicio Rápido

### Requisitos Previos

- [Node.js](https://nodejs.org/) (v18 o superior recomendado)
- [Git](https://git-scm.com/)

### Instalación

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/TU_USUARIO/TU_REPO.git
   cd proyecto-sl
   ```

2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 📊 Actualización de Datos

La aplicación utiliza un script de Node para extraer la información más reciente desde el Excel oficial:

```bash
npm run update-data
```

Este comando descargará los datos del Google Sheet, los procesará y generará un nuevo archivo `public/data.json` que la web consume automáticamente.

## 🛠️ Tecnologías

- **Frontend**: React 19 + Vite
- **Animaciones**: Framer Motion
- **Iconografía**: Lucide React
- **Procesamiento de Datos**: ExcelJS + Axios (ETL en Node.js)
- **Estilos**: Vanilla CSS con variables personalizadas

## 🤝 Créditos

- **Data Source**: Información recopilada y actualizada por [Mariano Casla (@mariano_casla99)](https://x.com/mariano_casla99).
- **Vibecodeado por**: [Gonzalo Suarez (@chagasalo)](https://x.com/chagasalo) Antigravity AI.

---

_Hecho por y para los socios de San Lorenzo._
