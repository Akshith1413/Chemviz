"""
ChemViz Desktop Application
Chemical Equipment Parameter Visualizer - PyQt5 + Matplotlib

Requirements:
  pip install PyQt5 matplotlib pandas requests

Usage:
  python chemviz_desktop.py

This desktop app connects to the same backend API as the web application.
By default it connects to http://localhost:3000. You can change the
API_BASE_URL variable below or pass it as a command-line argument.
"""

import sys
import os
import csv
import io
import json
from datetime import datetime

try:
    from PyQt5.QtWidgets import (
        QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
        QPushButton, QLabel, QFileDialog, QTableWidget, QTableWidgetItem,
        QTabWidget, QGroupBox, QMessageBox, QListWidget, QListWidgetItem,
        QSplitter, QFrame, QHeaderView, QSizePolicy, QStatusBar
    )
    from PyQt5.QtCore import Qt, QSize
    from PyQt5.QtGui import QFont, QColor, QPalette, QIcon
except ImportError:
    print("PyQt5 is not installed. Install it with: pip install PyQt5")
    sys.exit(1)

try:
    import matplotlib
    matplotlib.use("Qt5Agg")
    from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
    from matplotlib.figure import Figure
    import matplotlib.pyplot as plt
except ImportError:
    print("Matplotlib is not installed. Install it with: pip install matplotlib")
    sys.exit(1)

try:
    import pandas as pd
except ImportError:
    print("Pandas is not installed. Install it with: pip install pandas")
    sys.exit(1)

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

# Configuration
API_BASE_URL = os.environ.get("CHEMVIZ_API_URL", "http://localhost:3000")

# Color palette matching the web app (dark gold theme)
COLORS = {
    "primary": "#f5a623",      # Gold
    "accent": "#2dd4a8",       # Teal
    "chart_blue": "#38bdf8",   # Sky blue
    "chart_pink": "#f472b6",   # Pink
    "chart_purple": "#a78bfa", # Violet
    "bg_dark": "#0a0a0a",      # Pure dark
    "bg_card": "#121212",      # Card dark
    "text_light": "#e6d5b0",   # Warm cream
    "text_muted": "#665e4d",   # Warm muted
    "border": "#1e1e1e",       # Border
}

CHART_COLORS = [
    COLORS["primary"],
    COLORS["accent"],
    COLORS["chart_blue"],
    COLORS["chart_pink"],
    COLORS["chart_purple"],
]


class EquipmentData:
    """Holds parsed equipment data and computes summaries."""

    def __init__(self, file_name: str, df: pd.DataFrame):
        self.file_name = file_name
        self.uploaded_at = datetime.now().isoformat()
        self.df = df.copy()

        # Normalize column names
        col_map = {}
        for col in df.columns:
            lower = col.strip().lower()
            if "name" in lower or "equipment" in lower:
                col_map[col] = "name"
            elif lower == "type":
                col_map[col] = "type"
            elif "flow" in lower:
                col_map[col] = "flowrate"
            elif "press" in lower:
                col_map[col] = "pressure"
            elif "temp" in lower:
                col_map[col] = "temperature"

        self.df = self.df.rename(columns=col_map)

        # Ensure numeric
        for col in ["flowrate", "pressure", "temperature"]:
            self.df[col] = pd.to_numeric(self.df[col], errors="coerce").fillna(0)

    @property
    def total_count(self):
        return len(self.df)

    @property
    def avg_flowrate(self):
        return round(self.df["flowrate"].mean(), 2)

    @property
    def avg_pressure(self):
        return round(self.df["pressure"].mean(), 2)

    @property
    def avg_temperature(self):
        return round(self.df["temperature"].mean(), 2)

    @property
    def type_distribution(self):
        return self.df["type"].value_counts().to_dict()


class BarChartCanvas(FigureCanvas):
    """Bar chart comparing equipment parameters."""

    def __init__(self, data: EquipmentData, parent=None):
        fig = Figure(figsize=(10, 5), dpi=100)
        fig.patch.set_facecolor(COLORS["bg_card"])
        super().__init__(fig)
        self.setParent(parent)

        ax = fig.add_subplot(111)
        ax.set_facecolor(COLORS["bg_card"])

        names = data.df["name"].tolist()
        x = range(len(names))
        width = 0.25

        ax.bar([i - width for i in x], data.df["flowrate"], width,
               label="Flowrate", color=COLORS["primary"], alpha=0.9)
        ax.bar(list(x), data.df["pressure"] * 10, width,
               label="Pressure (x10)", color=COLORS["accent"], alpha=0.9)
        ax.bar([i + width for i in x], data.df["temperature"], width,
               label="Temperature", color=COLORS["chart_orange"], alpha=0.9)

        ax.set_xticks(list(x))
        ax.set_xticklabels(names, rotation=45, ha="right",
                           fontsize=8, color=COLORS["text_muted"])
        ax.tick_params(axis="y", colors=COLORS["text_muted"])
        ax.legend(fontsize=9, facecolor=COLORS["bg_dark"],
                  edgecolor=COLORS["border"], labelcolor=COLORS["text_light"])
        ax.set_title("Equipment Parameters Comparison",
                     color=COLORS["text_light"], fontsize=13, pad=12)
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)
        ax.spines["bottom"].set_color(COLORS["border"])
        ax.spines["left"].set_color(COLORS["border"])

        fig.tight_layout()


class PieChartCanvas(FigureCanvas):
    """Pie chart for equipment type distribution."""

    def __init__(self, data: EquipmentData, parent=None):
        fig = Figure(figsize=(5, 5), dpi=100)
        fig.patch.set_facecolor(COLORS["bg_card"])
        super().__init__(fig)
        self.setParent(parent)

        ax = fig.add_subplot(111)
        ax.set_facecolor(COLORS["bg_card"])

        dist = data.type_distribution
        labels = list(dist.keys())
        sizes = list(dist.values())
        colors = CHART_COLORS[:len(labels)]

        wedges, texts, autotexts = ax.pie(
            sizes, labels=labels, autopct="%1.0f%%",
            colors=colors, startangle=90,
            wedgeprops={"edgecolor": COLORS["bg_card"], "linewidth": 2},
            pctdistance=0.78
        )

        for text in texts:
            text.set_color(COLORS["text_light"])
            text.set_fontsize(10)
        for text in autotexts:
            text.set_color("white")
            text.set_fontsize(9)
            text.set_fontweight("bold")

        # Draw donut hole
        centre_circle = plt.Circle((0, 0), 0.55, fc=COLORS["bg_card"])
        ax.add_artist(centre_circle)

        ax.set_title("Equipment Type Distribution",
                     color=COLORS["text_light"], fontsize=13, pad=12)
        fig.tight_layout()


class LineChartCanvas(FigureCanvas):
    """Line chart showing parameter trends."""

    def __init__(self, data: EquipmentData, parent=None):
        fig = Figure(figsize=(5, 5), dpi=100)
        fig.patch.set_facecolor(COLORS["bg_card"])
        super().__init__(fig)
        self.setParent(parent)

        ax = fig.add_subplot(111)
        ax.set_facecolor(COLORS["bg_card"])

        names = data.df["name"].tolist()
        x = range(len(names))

        ax.plot(list(x), data.df["flowrate"], "-o", label="Flowrate",
                color=COLORS["primary"], markersize=4, linewidth=2)
        ax.plot(list(x), data.df["pressure"], "-o", label="Pressure",
                color=COLORS["accent"], markersize=4, linewidth=2)
        ax.plot(list(x), data.df["temperature"], "-o", label="Temperature",
                color=COLORS["chart_orange"], markersize=4, linewidth=2)

        ax.set_xticks(list(x))
        ax.set_xticklabels(names, rotation=45, ha="right",
                           fontsize=8, color=COLORS["text_muted"])
        ax.tick_params(axis="y", colors=COLORS["text_muted"])
        ax.legend(fontsize=9, facecolor=COLORS["bg_dark"],
                  edgecolor=COLORS["border"], labelcolor=COLORS["text_light"])
        ax.set_title("Parameter Trends Across Equipment",
                     color=COLORS["text_light"], fontsize=13, pad=12)
        ax.grid(True, alpha=0.15, color=COLORS["text_muted"])
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)
        ax.spines["bottom"].set_color(COLORS["border"])
        ax.spines["left"].set_color(COLORS["border"])

        fig.tight_layout()


class ChemVizApp(QMainWindow):
    """Main application window."""

    def __init__(self):
        super().__init__()
        self.setWindowTitle("ChemViz - Chemical Equipment Parameter Visualizer")
        self.setMinimumSize(1100, 700)
        self.datasets: list[EquipmentData] = []
        self.current_data: EquipmentData | None = None

        self._apply_dark_theme()
        self._build_ui()

        # Load sample data on startup
        self._load_sample_data()

    def _apply_dark_theme(self):
        palette = QPalette()
        palette.setColor(QPalette.Window, QColor(COLORS["bg_dark"]))
        palette.setColor(QPalette.WindowText, QColor(COLORS["text_light"]))
        palette.setColor(QPalette.Base, QColor(COLORS["bg_card"]))
        palette.setColor(QPalette.AlternateBase, QColor(COLORS["bg_dark"]))
        palette.setColor(QPalette.Text, QColor(COLORS["text_light"]))
        palette.setColor(QPalette.Button, QColor(COLORS["bg_card"]))
        palette.setColor(QPalette.ButtonText, QColor(COLORS["text_light"]))
        palette.setColor(QPalette.Highlight, QColor(COLORS["primary"]))
        palette.setColor(QPalette.HighlightedText, QColor("white"))
        self.setPalette(palette)

        self.setStyleSheet(f"""
            QMainWindow {{
                background-color: {COLORS["bg_dark"]};
            }}
            QTabWidget::pane {{
                border: 1px solid {COLORS["border"]};
                border-radius: 6px;
                background-color: {COLORS["bg_card"]};
            }}
            QTabBar::tab {{
                background-color: {COLORS["bg_dark"]};
                color: {COLORS["text_muted"]};
                padding: 8px 16px;
                margin-right: 2px;
                border-top-left-radius: 6px;
                border-top-right-radius: 6px;
                font-size: 13px;
            }}
            QTabBar::tab:selected {{
                background-color: {COLORS["bg_card"]};
                color: {COLORS["text_light"]};
                font-weight: bold;
            }}
            QGroupBox {{
                border: 1px solid {COLORS["border"]};
                border-radius: 8px;
                margin-top: 12px;
                padding-top: 16px;
                font-size: 13px;
                font-weight: bold;
                color: {COLORS["text_light"]};
            }}
            QGroupBox::title {{
                subcontrol-origin: margin;
                left: 12px;
                padding: 0 6px;
            }}
            QPushButton {{
                background-color: {COLORS["primary"]};
                color: white;
                border: none;
                border-radius: 6px;
                padding: 8px 18px;
                font-size: 13px;
                font-weight: bold;
            }}
            QPushButton:hover {{
                background-color: #0b93d5;
            }}
            QPushButton:pressed {{
                background-color: #0a7fb8;
            }}
            QPushButton#secondary {{
                background-color: {COLORS["bg_card"]};
                border: 1px solid {COLORS["border"]};
                color: {COLORS["text_light"]};
            }}
            QPushButton#secondary:hover {{
                background-color: {COLORS["border"]};
            }}
            QTableWidget {{
                background-color: {COLORS["bg_card"]};
                color: {COLORS["text_light"]};
                gridline-color: {COLORS["border"]};
                border: none;
                font-size: 12px;
            }}
            QTableWidget::item {{
                padding: 6px;
            }}
            QHeaderView::section {{
                background-color: {COLORS["bg_dark"]};
                color: {COLORS["text_muted"]};
                border: none;
                border-bottom: 1px solid {COLORS["border"]};
                padding: 8px;
                font-size: 12px;
                font-weight: bold;
            }}
            QListWidget {{
                background-color: {COLORS["bg_card"]};
                color: {COLORS["text_light"]};
                border: 1px solid {COLORS["border"]};
                border-radius: 6px;
                font-size: 12px;
                outline: none;
            }}
            QListWidget::item {{
                padding: 8px;
                border-bottom: 1px solid {COLORS["border"]};
            }}
            QListWidget::item:selected {{
                background-color: {COLORS["primary"]}33;
                color: {COLORS["text_light"]};
            }}
            QListWidget::item:hover {{
                background-color: {COLORS["border"]};
            }}
            QStatusBar {{
                background-color: {COLORS["bg_dark"]};
                color: {COLORS["text_muted"]};
                border-top: 1px solid {COLORS["border"]};
                font-size: 12px;
            }}
            QLabel {{
                color: {COLORS["text_light"]};
            }}
        """)

    def _build_ui(self):
        central = QWidget()
        self.setCentralWidget(central)

        # Header
        header_layout = QHBoxLayout()
        header_layout.setContentsMargins(16, 12, 16, 12)

        title_label = QLabel("ChemViz")
        title_label.setFont(QFont("Arial", 18, QFont.Bold))
        title_label.setStyleSheet(f"color: {COLORS['primary']};")
        header_layout.addWidget(title_label)

        subtitle_label = QLabel("Chemical Equipment Parameter Visualizer")
        subtitle_label.setStyleSheet(f"color: {COLORS['text_muted']}; font-size: 13px;")
        header_layout.addWidget(subtitle_label)
        header_layout.addStretch()

        # Upload button
        upload_btn = QPushButton("Upload CSV")
        upload_btn.clicked.connect(self._upload_csv)
        header_layout.addWidget(upload_btn)

        # Export button
        export_btn = QPushButton("Export Report")
        export_btn.setObjectName("secondary")
        export_btn.clicked.connect(self._export_report)
        header_layout.addWidget(export_btn)

        # Main splitter
        splitter = QSplitter(Qt.Horizontal)

        # Left panel - main content
        left_widget = QWidget()
        left_layout = QVBoxLayout(left_widget)
        left_layout.setContentsMargins(0, 0, 0, 0)
        left_layout.setSpacing(12)

        # Summary cards
        self.summary_frame = QFrame()
        self.summary_layout = QHBoxLayout(self.summary_frame)
        self.summary_layout.setContentsMargins(0, 0, 0, 0)
        self.summary_layout.setSpacing(12)
        left_layout.addWidget(self.summary_frame)

        # Tabs
        self.tabs = QTabWidget()
        left_layout.addWidget(self.tabs)

        # Charts tab
        charts_widget = QWidget()
        self.charts_layout = QVBoxLayout(charts_widget)
        self.charts_layout.setContentsMargins(8, 8, 8, 8)
        self.tabs.addTab(charts_widget, "Charts")

        # Table tab
        table_widget = QWidget()
        table_layout = QVBoxLayout(table_widget)
        table_layout.setContentsMargins(8, 8, 8, 8)
        self.data_table = QTableWidget()
        self.data_table.setAlternatingRowColors(True)
        self.data_table.horizontalHeader().setStretchLastSection(True)
        self.data_table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.data_table.verticalHeader().setVisible(False)
        self.data_table.setSelectionBehavior(QTableWidget.SelectRows)
        table_layout.addWidget(self.data_table)
        self.tabs.addTab(table_widget, "Data Table")

        splitter.addWidget(left_widget)

        # Right panel - history
        right_widget = QWidget()
        right_layout = QVBoxLayout(right_widget)
        right_layout.setContentsMargins(0, 0, 0, 0)
        right_layout.setSpacing(8)

        history_label = QLabel("Upload History (max 5)")
        history_label.setFont(QFont("Arial", 13, QFont.Bold))
        right_layout.addWidget(history_label)

        self.history_list = QListWidget()
        self.history_list.itemClicked.connect(self._on_history_select)
        right_layout.addWidget(self.history_list)

        delete_btn = QPushButton("Delete Selected")
        delete_btn.setObjectName("secondary")
        delete_btn.clicked.connect(self._delete_selected)
        right_layout.addWidget(delete_btn)

        splitter.addWidget(right_widget)
        splitter.setSizes([800, 280])

        # Assemble main layout
        main_layout = QVBoxLayout(central)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        header_frame = QFrame()
        header_frame.setLayout(header_layout)
        header_frame.setStyleSheet(
            f"background-color: {COLORS['bg_card']}; "
            f"border-bottom: 1px solid {COLORS['border']};"
        )
        main_layout.addWidget(header_frame)

        content_wrapper = QWidget()
        content_layout = QVBoxLayout(content_wrapper)
        content_layout.setContentsMargins(16, 12, 16, 12)
        content_layout.addWidget(splitter)
        main_layout.addWidget(content_wrapper)

        # Status bar
        self.statusBar().showMessage("Ready - Upload a CSV file or view the sample data")

    def _load_sample_data(self):
        """Load the built-in sample dataset."""
        sample_csv = """Equipment Name,Type,Flowrate,Pressure,Temperature
Pump-1,Pump,120,5.2,110
Compressor-1,Compressor,95,8.4,95
Valve-1,Valve,60,4.1,105
HeatExchanger-1,HeatExchanger,150,6.2,130
Pump-2,Pump,132,5.6,118
Valve-2,Valve,58,4.0,102
Reactor-1,Reactor,140,7.5,140
Pump-3,Pump,125,5.3,115
Condenser-1,Condenser,160,6.8,125
Compressor-2,Compressor,100,8.0,98
HeatExchanger-2,HeatExchanger,155,6.3,132
Valve-3,Valve,62,4.2,107
Pump-4,Pump,130,5.9,119
Reactor-2,Reactor,145,7.2,138
Condenser-2,Condenser,165,6.9,128"""

        df = pd.read_csv(io.StringIO(sample_csv))
        data = EquipmentData("sample_equipment_data.csv", df)
        self._add_dataset(data)

    def _upload_csv(self):
        """Open file dialog and load a CSV file."""
        file_path, _ = QFileDialog.getOpenFileName(
            self, "Open CSV File", "", "CSV Files (*.csv);;All Files (*)"
        )
        if not file_path:
            return

        try:
            df = pd.read_csv(file_path)
            file_name = os.path.basename(file_path)
            data = EquipmentData(file_name, df)
            self._add_dataset(data)

            # Also try to upload to the API backend if available
            if HAS_REQUESTS:
                try:
                    with open(file_path, "rb") as f:
                        requests.post(
                            f"{API_BASE_URL}/api/upload",
                            files={"file": (file_name, f, "text/csv")},
                            timeout=5,
                        )
                except Exception:
                    pass  # API might not be running

            self.statusBar().showMessage(f"Loaded: {file_name} ({len(df)} rows)")
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Failed to load CSV:\n{str(e)}")

    def _add_dataset(self, data: EquipmentData):
        """Add dataset to history and display it."""
        self.datasets.insert(0, data)
        if len(self.datasets) > 5:
            self.datasets = self.datasets[:5]

        self._refresh_history()
        self._display_data(data)

    def _refresh_history(self):
        """Update the history list widget."""
        self.history_list.clear()
        for d in self.datasets:
            dt = datetime.fromisoformat(d.uploaded_at).strftime("%b %d, %Y %I:%M %p")
            item = QListWidgetItem(f"{d.file_name}\n{dt} - {d.total_count} items")
            self.history_list.addItem(item)

        if self.history_list.count() > 0:
            self.history_list.setCurrentRow(0)

    def _on_history_select(self, item: QListWidgetItem):
        """Handle clicking on a history item."""
        idx = self.history_list.row(item)
        if 0 <= idx < len(self.datasets):
            self._display_data(self.datasets[idx])

    def _delete_selected(self):
        """Delete the selected history item."""
        row = self.history_list.currentRow()
        if row < 0:
            return
        self.datasets.pop(row)
        self._refresh_history()
        if self.datasets:
            self._display_data(self.datasets[0])
        else:
            self.current_data = None
            self._clear_display()

    def _clear_display(self):
        """Clear all displayed data."""
        # Clear summary cards
        while self.summary_layout.count():
            child = self.summary_layout.takeAt(0)
            if child.widget():
                child.widget().deleteLater()

        # Clear charts
        while self.charts_layout.count():
            child = self.charts_layout.takeAt(0)
            if child.widget():
                child.widget().deleteLater()

        # Clear table
        self.data_table.setRowCount(0)
        self.data_table.setColumnCount(0)

    def _display_data(self, data: EquipmentData):
        """Display dataset in summary, charts, and table."""
        self.current_data = data
        self._clear_display()

        # Summary cards
        summaries = [
            ("Total Equipment", str(data.total_count), COLORS["primary"]),
            ("Avg Flowrate", str(data.avg_flowrate), COLORS["accent"]),
            ("Avg Pressure", str(data.avg_pressure), COLORS["chart_orange"]),
            ("Avg Temperature", str(data.avg_temperature), COLORS["chart_red"]),
        ]

        for label, value, color in summaries:
            card = QFrame()
            card.setStyleSheet(
                f"background-color: {COLORS['bg_card']}; "
                f"border: 1px solid {COLORS['border']}; "
                f"border-radius: 8px; padding: 12px;"
            )
            card_layout = QVBoxLayout(card)
            card_layout.setSpacing(4)

            lbl = QLabel(label)
            lbl.setStyleSheet(f"color: {COLORS['text_muted']}; font-size: 12px; border: none;")
            card_layout.addWidget(lbl)

            val = QLabel(value)
            val.setFont(QFont("Arial", 22, QFont.Bold))
            val.setStyleSheet(f"color: {color}; border: none;")
            card_layout.addWidget(val)

            self.summary_layout.addWidget(card)

        # Charts
        bar_chart = BarChartCanvas(data)
        self.charts_layout.addWidget(bar_chart)

        bottom_charts = QHBoxLayout()
        pie_chart = PieChartCanvas(data)
        line_chart = LineChartCanvas(data)
        bottom_charts.addWidget(pie_chart)
        bottom_charts.addWidget(line_chart)

        bottom_widget = QWidget()
        bottom_widget.setLayout(bottom_charts)
        self.charts_layout.addWidget(bottom_widget)

        # Table
        df = data.df
        self.data_table.setColumnCount(len(df.columns))
        self.data_table.setRowCount(len(df))
        self.data_table.setHorizontalHeaderLabels(
            [c.title() for c in df.columns]
        )

        for row_idx in range(len(df)):
            for col_idx, col in enumerate(df.columns):
                val = str(df.iloc[row_idx, col_idx])
                item = QTableWidgetItem(val)
                item.setFlags(item.flags() & ~Qt.ItemIsEditable)
                self.data_table.setItem(row_idx, col_idx, item)

        self.statusBar().showMessage(
            f"Viewing: {data.file_name} | "
            f"{data.total_count} equipment | "
            f"Avg Flow: {data.avg_flowrate} | "
            f"Avg Press: {data.avg_pressure} | "
            f"Avg Temp: {data.avg_temperature}"
        )

    def _export_report(self):
        """Export current dataset as a text report."""
        if not self.current_data:
            QMessageBox.warning(self, "No Data", "Please load a dataset first.")
            return

        file_path, _ = QFileDialog.getSaveFileName(
            self, "Save Report", f"equipment_report_{self.current_data.file_name.replace('.csv', '')}.txt",
            "Text Files (*.txt);;All Files (*)"
        )
        if not file_path:
            return

        data = self.current_data
        lines = []
        lines.append("=" * 60)
        lines.append("CHEMICAL EQUIPMENT PARAMETER REPORT")
        lines.append("=" * 60)
        lines.append("")
        lines.append(f"File: {data.file_name}")
        lines.append(f"Generated: {datetime.now().isoformat()}")
        lines.append(f"Upload Date: {data.uploaded_at}")
        lines.append("")
        lines.append("-" * 60)
        lines.append("SUMMARY STATISTICS")
        lines.append("-" * 60)
        lines.append(f"Total Equipment Count: {data.total_count}")
        lines.append(f"Average Flowrate: {data.avg_flowrate}")
        lines.append(f"Average Pressure: {data.avg_pressure}")
        lines.append(f"Average Temperature: {data.avg_temperature}")
        lines.append("")
        lines.append("-" * 60)
        lines.append("EQUIPMENT TYPE DISTRIBUTION")
        lines.append("-" * 60)

        for eq_type, count in data.type_distribution.items():
            pct = round(count / data.total_count * 100, 1)
            lines.append(f"  {eq_type}: {count} ({pct}%)")

        lines.append("")
        lines.append("-" * 60)
        lines.append("DETAILED EQUIPMENT DATA")
        lines.append("-" * 60)
        lines.append("")

        header = f"{'Equipment Name':<22} {'Type':<16} {'Flowrate':>10} {'Pressure':>10} {'Temp':>8}"
        lines.append(header)
        lines.append("-" * len(header))

        for _, row in data.df.iterrows():
            lines.append(
                f"{str(row['name']):<22} {str(row['type']):<16} "
                f"{str(row['flowrate']):>10} {str(row['pressure']):>10} "
                f"{str(row['temperature']):>8}"
            )

        lines.append("")
        lines.append("=" * 60)
        lines.append("END OF REPORT")
        lines.append("=" * 60)

        try:
            with open(file_path, "w") as f:
                f.write("\n".join(lines))
            self.statusBar().showMessage(f"Report saved to: {file_path}")
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Failed to save report:\n{str(e)}")


def main():
    app = QApplication(sys.argv)
    app.setApplicationName("ChemViz")
    app.setStyle("Fusion")

    window = ChemVizApp()
    window.show()
    sys.exit(app.exec_())


if __name__ == "__main__":
    main()
