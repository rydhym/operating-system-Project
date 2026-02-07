# CPU Scheduling Simulator (Multicore Support)

## Overview
A high-performance **CPU Scheduling Simulator** written in C++ that models Operating System scheduling algorithms. This project demonstrates advanced systems programming concepts, including **Symmetric Multiprocessing (SMP)** support, modular architecture, and modern build systems.

## Features
-   **Algorithms Implemented**:
    -   First Come First Serve (FCFS)
    -   Round Robin (RR)
    -   Shortest Process Next (SPN)
    -   Shortest Remaining Time (SRT)
    -   Highest Response Ratio Next (HRRN)
    -   Multi-level Feedback Queues (FB-1, FB-2i)
    -   Aging
-   **Multicore Support**: Simulate 1, 2, 4, or N cores handling processes in parallel.
-   **Visualization**: Timeline (Gantt Char) generation for process execution.
-   **Metrics**: Calculates Turnaround Time, Waiting Time, and Normalized Turnaround Time.

## Tech Stack
-   **Language**: C++ (STL, Templates)
-   **Build System**: CMake & Make
-   **Testing**: Google Test Framework

## How to Build & Run

### Prerequisites
-   C++ Compiler (g++ or clang)
-   CMake (Optional, for modern build)
-   Make (Optional)

### Using Makefile (Quick Start)
```bash
# Build
make

# Run Single Core (Default)
./lab4 < testcases/basic_fcfs.txt

# Run Dual Core
./lab4 2 < testcases/basic_fcfs.txt
```

### Using CMake
```bash
mkdir build && cd build
cmake ..
cmake --build .
./lab4 < ../testcases/basic_fcfs.txt
```

## Input Format
The input file follows this structure:
```text
[trace|stats]      # Output mode
[algorithm_id]     # 1=FCFS, 2=RR, 3=SPN, etc.
[last_instant]     # Simulation duration
[process_count]    # Number of processes
[ProcessName],[Arrival],[ServiceTime]
...
```

## License
MIT License
