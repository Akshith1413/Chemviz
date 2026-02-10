# ChemViz - Chemical Equipment Parameter Visualizer

A hybrid **Web + Desktop** application for uploading, analyzing, and visualizing chemical equipment CSV data. Features real-time charts, summary statistics, data tables, upload history management, and report export.

---

## Tech Stack

| Layer              | Technology                          | Purpose                             |
|--------------------|-------------------------------------|-------------------------------------|
| Frontend (Web)     | Next.js 16 + React 19 + Recharts   | Dashboard, charts, data table       |
| Frontend (Desktop) | PyQt5 + Matplotlib                  | Same visualization in desktop       |
| Backend            | Next.js API Routes (Node.js)        | REST API for upload, data, reports  |
| Data Handling      | Pandas (Desktop) / TypeScript (Web) | CSV parsing and analytics           |
| Storage            | In-memory store (Web) / Local (Desktop) | Store last 5 uploaded datasets |
| Styling            | Tailwind CSS + shadcn/ui            | Dark gold premium theme             |
| 3D Engine          | React Three Fiber + Three.js        | Molecular 3D background scene       |
| Animations         | Framer Motion + spring physics      | Page transitions, counting, tabs    |

---

## Features

- **CSV Upload** - Drag-and-drop or file browser upload with animated feedback
- **Data Summary** - Real-time computed averages with 3D perspective stat cards
- **Charts** - Bar chart (parameter comparison), donut pie chart (type distribution), area chart (trends)
- **Data Table** - Full equipment data with color-coded type badges
- **Upload History** - Last 5 datasets stored with quick-switch and delete
- **Export Report** - Download a formatted text report of the current dataset
- **Animated Background** - Canvas-rendered wireframe 3D shapes (cylinder, sphere, diamond, cube, hexagon) with particle system
- **Sample Data** - Pre-loaded with `sample_equipment_data.csv` for immediate demo

---

## Sample CSV Format

The CSV file must contain these columns (names are flexible, e.g., "Equipment Name" or "Name"):

```csv
Equipment Name,Type,Flowrate,Pressure,Temperature
Pump-1,Pump,120,5.2,110
Compressor-1,Compressor,95,8.4,95
Valve-1,Valve,60,4.1,105
HeatExchanger-1,HeatExchanger,150,6.2,130
Reactor-1,Reactor,140,7.5,140
Condenser-1,Condenser,160,6.8,125
```

A sample file is provided at `desktop_app/sample_equipment_data.csv`.

---

## Part 1: Web Application

### Prerequisites

- Node.js 18+ installed
- pnpm package manager (or npm/yarn)

### Installation & Running

```bash
# 1. Clone or download the project
cd chemviz-project

# 2. Install dependencies
pnpm install

# 3. Start the development server
pnpm dev
```

The app will be available at **http://localhost:3000**

### How to Test the Web App

1. Open http://localhost:3000 in your browser
2. The app loads with **sample data pre-loaded** (15 equipment items)
3. You will see:
   - **Animated wireframe background** with floating 3D shapes and particles
   - **Summary cards** with 3D tilt hover effects showing total count, avg flowrate, avg pressure, avg temperature
   - **Visualizations tab** with bar chart, pie chart, and area chart
   - **Raw Data tab** with all equipment rows and color-coded type badges
   - **Upload History** panel on the right showing the sample dataset
4. **Upload a new CSV**: Either drag-and-drop a CSV file onto the upload area, or click "Browse Files"
5. **Switch datasets**: Click any item in the Upload History panel
6. **Delete a dataset**: Hover over a history item and click the trash icon
7. **Export report**: Click the "Export Report" button in the header to download a text report

### API Endpoints

| Method | Endpoint              | Description                    |
|--------|-----------------------|--------------------------------|
| POST   | `/api/upload`         | Upload a CSV file              |
| GET    | `/api/datasets`       | List all dataset summaries     |
| GET    | `/api/datasets/:id`   | Get full dataset with data     |
| DELETE | `/api/datasets/:id`   | Delete a dataset               |
| GET    | `/api/report/:id`     | Download text report           |

---

## Part 2: Desktop Application (PyQt5)

### Prerequisites

- Python 3.8+ installed
- pip package manager

### Installation & Running

```bash
# 1. Navigate to the desktop app folder
cd desktop_app

# 2. (Recommended) Create a virtual environment
python -m venv venv

# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Run the desktop application
python chemviz_desktop.py
```

### Python Dependencies (requirements.txt)

```
PyQt5>=5.15
matplotlib>=3.5
pandas>=1.4
requests>=2.28
```

### How to Test the Desktop App

1. Launch the app with `python chemviz_desktop.py`
2. The app opens with **sample data pre-loaded** (same 15 equipment items)
3. You will see:
   - A warm dark-themed window with the **ChemViz** header
   - **Summary cards** at the top (Total Equipment, Avg Flowrate, Avg Pressure, Avg Temperature)
   - **Charts tab** with bar chart, donut pie chart, and line chart (Matplotlib)
   - **Data Table tab** with all equipment rows
   - **Upload History** panel on the right (max 5 datasets)
4. **Upload a CSV**: Click "Upload CSV" in the header, select a `.csv` file
5. **Switch datasets**: Click any item in the Upload History list
6. **Delete a dataset**: Select a history item, then click "Delete Selected"
7. **Export report**: Click "Export Report" to save a `.txt` report file
8. The status bar at the bottom shows current dataset info

### Optional: Connect to Web Backend

If the web app is running on `http://localhost:3000`, the desktop app will automatically attempt to sync uploads to the web backend API. Set a custom URL with:

```bash
export CHEMVIZ_API_URL=http://localhost:3000
python chemviz_desktop.py
```

---

## Project Structure

```
chemviz-project/
|-- app/
|   |-- api/
|   |   |-- datasets/
|   |   |   |-- [id]/route.ts    # GET/DELETE single dataset
|   |   |   |-- route.ts         # GET all datasets
|   |   |-- report/
|   |   |   |-- [id]/route.ts    # GET download report
|   |   |-- upload/
|   |       |-- route.ts         # POST upload CSV
|   |-- globals.css              # Theme + custom animations
|   |-- layout.tsx               # Root layout with serif/sans fonts
|   |-- page.tsx                 # Main page entry
|
|-- components/
|   |-- scene-3d.tsx             # React Three Fiber molecular 3D scene
|   |-- csv-uploader.tsx         # Drag & drop CSV upload
|   |-- dashboard.tsx            # Main dashboard layout
|   |-- equipment-charts.tsx     # Bar, Pie, Area charts (Recharts)
|   |-- equipment-table.tsx      # Data table with type badges
|   |-- summary-cards.tsx        # 3D perspective stat cards
|   |-- upload-history.tsx       # History panel with select/delete
|   |-- ui/                      # shadcn/ui components
|
|-- lib/
|   |-- data-store.ts            # In-memory data store + CSV parser
|
|-- desktop_app/
|   |-- chemviz_desktop.py       # Full PyQt5 desktop application
|   |-- requirements.txt         # Python dependencies
|   |-- sample_equipment_data.csv # Sample test data
|
|-- package.json                 # Node.js dependencies
|-- README.md                    # This file
```

---

## Design

The web app uses a **warm industrial editorial** design language:
- **Color palette**: Copper/terracotta primary, sage green accent, gold and warm red for charts, on a warm cream background
- **Typography**: Playfair Display (serif) for headings, DM Sans for body text
- **3D Effects**: CSS perspective transforms on stat cards, canvas-rendered wireframe shapes (cylinder, sphere, diamond, cube, hexagon) as animated background
- **Animations**: Floating particles, morphing logo shape, fade-up entrance animations, lift-on-hover cards
- **Layout**: Editorial whitespace with rounded-3xl cards and decorative corner brackets

---

## Troubleshooting

### Web App Issues
- **Port 3000 in use**: Run `pnpm dev -- -p 3001` to use a different port
- **Dependencies missing**: Run `pnpm install` to reinstall
- **Empty charts**: Make sure you have data loaded (sample data loads automatically)

### Desktop App Issues
- **PyQt5 won't install on macOS**: Try `pip install PyQt5 --config-settings --confirm-license`
- **Matplotlib backend error**: The app sets `Qt5Agg` backend automatically
- **"No module named pandas"**: Run `pip install -r requirements.txt`
- **Window doesn't open**: Ensure you have a display server running (Linux: X11/Wayland)
