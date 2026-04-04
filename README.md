# CPU Scheduler Pro 🚀

A high-performance **CPU Scheduling Simulator** designed to model Operating System scheduling algorithms and visualize their execution. 

![CPU Scheduler Pro](https://github.com/rydhym/operating-system-Project/assets/placeholder.png) <!-- Update this path if you add a real screenshot -->

## 🌟 Features

- **8 CPU Scheduling Algorithms**:
  - First Come First Serve (FCFS)
  - Round Robin (RR)
  - Shortest Process Next (SPN)
  - Shortest Remaining Time (SRT)
  - Highest Response Ratio Next (HRRN)
  - Multi-level Feedback Queues (FB-1, FB-2i)
  - Aging
- **Kinetic Glass Visualizer**: A beautiful, dark-themed UI that plots a **Gantt Chart** timeline for process execution.
- **Performance Metrics**: Automatically calculates Turnaround Time, Waiting Time, and Normalized Turnaround Time for each execution.
- **Algorithm Comparison Mode (**🏆**)**: Instantly run a workload through *all 8 algorithms* to compare their average waiting and turnaround times side by side.

## 🏗️ Architecture & Evolution

This project was originally built with a **C++ Backend** (`lab4.exe`) and a Python HTTP server, communicating via pipes. 

To improve accessibility and enable **zero-downtime serverless deployment**, the architecture was fundamentally refactored:
1. **Event-Driven JavaScript Port**: All 8 algorithms were faithfully ported from C++ to pure JavaScript.
2. **Client-Side Execution**: The simulation now runs entirely locally within the browser, eliminating network latency and backend complexity.
3. **Static Deployment**: The application is now a Static Site hosted on Vercel, demonstrating modern Jamstack principles.

*(The original C++ source files remain in the `src/` directory for reference and historical context).*

## 🚀 Live Demo

[Provide your live Vercel link here, e.g., https://cpu-scheduler-pro.vercel.app]

## 🛠️ Tech Stack

- **Frontend Core**: Vanilla HTML, CSS, JavaScript
- **Styling**: TailwindCSS (via CDN), Glassmorphism Design System
- **Legacy Backend**: C++17, Python 3
- **Deployment**: Vercel

## 🏃‍♂️ Running Locally

Since the application is now fully client-side, running it locally is easier than ever:

```bash
# Clone the repository
git clone https://github.com/rydhym/operating-system-Project.git

# Navigate to the web directory
cd operating-system-Project/web

# Simply open index.html in any modern web browser
# (or use a local server for a better dev experience)
python -m http.server 8000
```
Open `http://localhost:8000/index.html` in your browser.

## 📝 License
MIT License
