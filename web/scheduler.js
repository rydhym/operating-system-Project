/**
 * CPU Scheduling Algorithms — Pure JavaScript Implementation
 * Ported from the C++ source files in src/
 *
 * Entry point: runScheduler(algorithmId, quantum, lastInstant, processes)
 * Returns: { algorithm, processes: [...], timeline: [...] }
 */

const ALGORITHM_NAMES = {
    '1': 'FCFS',
    '2': 'RR-',
    '3': 'SPN',
    '4': 'SRT',
    '5': 'HRRN',
    '6': 'FB-1',
    '7': 'FB-2i',
    '8': 'AGING',
};

// ─── Helpers ───────────────────────────────────────────────

function createTimeline(lastInstant, processCount) {
    const tl = [];
    for (let i = 0; i < lastInstant; i++) {
        tl.push(new Array(processCount).fill(' '));
    }
    return tl;
}

function fillInWaitTime(timeline, processes, finishTime, lastInstant) {
    for (let i = 0; i < processes.length; i++) {
        const arrival = processes[i].arrival;
        const finish = finishTime[i] || lastInstant;
        for (let k = arrival; k < finish; k++) {
            if (k < lastInstant && timeline[k][i] !== '*') {
                timeline[k][i] = '.';
            }
        }
    }
}

// ─── 1. FCFS ───────────────────────────────────────────────

function firstComeFirstServe(processes, lastInstant) {
    const n = processes.length;
    const timeline = createTimeline(lastInstant, n);
    const finishTime = new Array(n).fill(0);
    const turnAroundTime = new Array(n).fill(0);
    const normTurn = new Array(n).fill(0);

    let currentTime = 0;

    for (let i = 0; i < n; i++) {
        const arrival = processes[i].arrival;
        const service = processes[i].service;

        const startTime = Math.max(arrival, currentTime);
        const finish = startTime + service;

        finishTime[i] = finish;
        turnAroundTime[i] = finish - arrival;
        normTurn[i] = turnAroundTime[i] / service;

        for (let j = startTime; j < finish && j < lastInstant; j++)
            timeline[j][i] = '*';
        for (let j = arrival; j < startTime && j < lastInstant; j++)
            timeline[j][i] = '.';

        currentTime = finish;
    }

    return { timeline, finishTime, turnAroundTime, normTurn };
}

// ─── 2. Round Robin ────────────────────────────────────────

function roundRobin(processes, lastInstant, originalQuantum) {
    const n = processes.length;
    const timeline = createTimeline(lastInstant, n);
    const finishTime = new Array(n).fill(0);
    const turnAroundTime = new Array(n).fill(0);
    const normTurn = new Array(n).fill(0);

    // Queue entries: { index, remaining }
    const queue = [];
    let j = 0;

    if (j < n && processes[j].arrival === 0) {
        queue.push({ index: j, remaining: processes[j].service });
        j++;
    }

    let currentQuantum = originalQuantum;

    for (let time = 0; time < lastInstant; time++) {
        if (queue.length > 0) {
            const front = queue[0];
            const processIndex = front.index;
            front.remaining--;
            const remainingServiceTime = front.remaining;
            const arrivalTime = processes[processIndex].arrival;
            const serviceTime = processes[processIndex].service;
            currentQuantum--;
            timeline[time][processIndex] = '*';

            // Add newly arrived processes
            while (j < n && processes[j].arrival === time + 1) {
                queue.push({ index: j, remaining: processes[j].service });
                j++;
            }

            if (currentQuantum === 0 && remainingServiceTime === 0) {
                finishTime[processIndex] = time + 1;
                turnAroundTime[processIndex] = finishTime[processIndex] - arrivalTime;
                normTurn[processIndex] = turnAroundTime[processIndex] / serviceTime;
                currentQuantum = originalQuantum;
                queue.shift();
            } else if (currentQuantum === 0 && remainingServiceTime !== 0) {
                queue.shift();
                queue.push({ index: processIndex, remaining: remainingServiceTime });
                currentQuantum = originalQuantum;
            } else if (currentQuantum !== 0 && remainingServiceTime === 0) {
                finishTime[processIndex] = time + 1;
                turnAroundTime[processIndex] = finishTime[processIndex] - arrivalTime;
                normTurn[processIndex] = turnAroundTime[processIndex] / serviceTime;
                queue.shift();
                currentQuantum = originalQuantum;
            }
        }
        // Also add arrivals when idle
        while (j < n && processes[j].arrival === time + 1) {
            queue.push({ index: j, remaining: processes[j].service });
            j++;
        }
    }

    fillInWaitTime(timeline, processes, finishTime, lastInstant);
    return { timeline, finishTime, turnAroundTime, normTurn };
}

// ─── 3. Shortest Process Next ──────────────────────────────

function shortestProcessNext(processes, lastInstant) {
    const n = processes.length;
    const timeline = createTimeline(lastInstant, n);
    const finishTime = new Array(n).fill(0);
    const turnAroundTime = new Array(n).fill(0);
    const normTurn = new Array(n).fill(0);

    // Min-heap by (serviceTime, index)
    const pq = []; // [{serviceTime, index}]
    let j = 0;
    let coreBusyUntil = 0;

    for (let i = 0; i < lastInstant; i++) {
        while (j < n && processes[j].arrival <= i) {
            pqPush(pq, { key: processes[j].service, index: j });
            j++;
        }

        if (i >= coreBusyUntil && pq.length > 0) {
            const top = pqPop(pq);
            const processIndex = top.index;
            const arrivalTime = processes[processIndex].arrival;
            const serviceTime = processes[processIndex].service;
            const startTime = i;
            const finish = startTime + serviceTime;

            finishTime[processIndex] = finish;
            turnAroundTime[processIndex] = finish - arrivalTime;
            normTurn[processIndex] = turnAroundTime[processIndex] / serviceTime;

            for (let k = arrivalTime; k < startTime && k < lastInstant; k++)
                timeline[k][processIndex] = '.';
            for (let k = startTime; k < finish && k < lastInstant; k++)
                timeline[k][processIndex] = '*';

            coreBusyUntil = finish;
        }
    }

    return { timeline, finishTime, turnAroundTime, normTurn };
}

// ─── 4. Shortest Remaining Time ────────────────────────────

function shortestRemainingTime(processes, lastInstant) {
    const n = processes.length;
    const timeline = createTimeline(lastInstant, n);
    const finishTime = new Array(n).fill(0);
    const turnAroundTime = new Array(n).fill(0);
    const normTurn = new Array(n).fill(0);

    const pq = [];
    let j = 0;

    for (let i = 0; i < lastInstant; i++) {
        while (j < n && processes[j].arrival === i) {
            pqPush(pq, { key: processes[j].service, index: j });
            j++;
        }

        if (pq.length > 0) {
            const top = pqPop(pq);
            const processIndex = top.index;
            const remainingTime = top.key;
            const serviceTime = processes[processIndex].service;
            const arrivalTime = processes[processIndex].arrival;
            timeline[i][processIndex] = '*';

            if (remainingTime === 1) {
                finishTime[processIndex] = i + 1;
                turnAroundTime[processIndex] = finishTime[processIndex] - arrivalTime;
                normTurn[processIndex] = turnAroundTime[processIndex] / serviceTime;
            } else {
                pqPush(pq, { key: remainingTime - 1, index: processIndex });
            }
        }
    }

    fillInWaitTime(timeline, processes, finishTime, lastInstant);
    return { timeline, finishTime, turnAroundTime, normTurn };
}

// ─── 5. Highest Response Ratio Next ────────────────────────

function highestResponseRatioNext(processes, lastInstant) {
    const n = processes.length;
    const timeline = createTimeline(lastInstant, n);
    const finishTime = new Array(n).fill(0);
    const turnAroundTime = new Array(n).fill(0);
    const normTurn = new Array(n).fill(0);

    // Each entry: { name, responseRatio, timeInService, index }
    let presentProcesses = [];
    let j = 0;

    for (let currentInstant = 0; currentInstant < lastInstant; currentInstant++) {
        while (j < n && processes[j].arrival <= currentInstant) {
            presentProcesses.push({
                index: j,
                responseRatio: 1.0,
                timeInService: 0,
            });
            j++;
        }

        // Calculate response ratio
        for (const proc of presentProcesses) {
            const waitTime = currentInstant - processes[proc.index].arrival;
            const serviceTime = processes[proc.index].service;
            proc.responseRatio = (waitTime + serviceTime) / serviceTime;
        }

        // Sort descending by response ratio
        presentProcesses.sort((a, b) => b.responseRatio - a.responseRatio);

        if (presentProcesses.length > 0) {
            const chosen = presentProcesses[0];
            const processIndex = chosen.index;
            const serviceTime = processes[processIndex].service;

            while (
                currentInstant < lastInstant &&
                chosen.timeInService !== serviceTime
            ) {
                timeline[currentInstant][processIndex] = '*';
                currentInstant++;
                chosen.timeInService++;
            }
            currentInstant--;

            presentProcesses.splice(0, 1);
            finishTime[processIndex] = currentInstant + 1;
            turnAroundTime[processIndex] =
                finishTime[processIndex] - processes[processIndex].arrival;
            normTurn[processIndex] = turnAroundTime[processIndex] / serviceTime;
        }
    }

    fillInWaitTime(timeline, processes, finishTime, lastInstant);
    return { timeline, finishTime, turnAroundTime, normTurn };
}

// ─── 6. Feedback q=1 ──────────────────────────────────────

function feedbackQ1(processes, lastInstant) {
    const n = processes.length;
    const timeline = createTimeline(lastInstant, n);
    const finishTime = new Array(n).fill(0);
    const turnAroundTime = new Array(n).fill(0);
    const normTurn = new Array(n).fill(0);

    const pq = []; // min-heap by priority level
    const remainingServiceTime = {};
    let j = 0;

    if (n > 0 && processes[0].arrival === 0) {
        pqPush(pq, { key: 0, index: j });
        remainingServiceTime[j] = processes[j].service;
        j++;
    }

    for (let time = 0; time < lastInstant; time++) {
        if (pq.length > 0) {
            const top = pqPop(pq);
            const priorityLevel = top.key;
            const processIndex = top.index;
            const arrivalTime = processes[processIndex].arrival;
            const serviceTime = processes[processIndex].service;

            while (j < n && processes[j].arrival === time + 1) {
                pqPush(pq, { key: 0, index: j });
                remainingServiceTime[j] = processes[j].service;
                j++;
            }

            remainingServiceTime[processIndex]--;
            timeline[time][processIndex] = '*';

            if (remainingServiceTime[processIndex] === 0) {
                finishTime[processIndex] = time + 1;
                turnAroundTime[processIndex] = finishTime[processIndex] - arrivalTime;
                normTurn[processIndex] = turnAroundTime[processIndex] / serviceTime;
            } else {
                if (pq.length >= 1)
                    pqPush(pq, { key: priorityLevel + 1, index: processIndex });
                else
                    pqPush(pq, { key: priorityLevel, index: processIndex });
            }
        }
        while (j < n && processes[j].arrival === time + 1) {
            pqPush(pq, { key: 0, index: j });
            remainingServiceTime[j] = processes[j].service;
            j++;
        }
    }

    fillInWaitTime(timeline, processes, finishTime, lastInstant);
    return { timeline, finishTime, turnAroundTime, normTurn };
}

// ─── 7. Feedback q=2^i ────────────────────────────────────

function feedbackQ2i(processes, lastInstant) {
    const n = processes.length;
    const timeline = createTimeline(lastInstant, n);
    const finishTime = new Array(n).fill(0);
    const turnAroundTime = new Array(n).fill(0);
    const normTurn = new Array(n).fill(0);

    const pq = [];
    const remainingServiceTime = {};
    let j = 0;

    if (n > 0 && processes[0].arrival === 0) {
        pqPush(pq, { key: 0, index: j });
        remainingServiceTime[j] = processes[j].service;
        j++;
    }

    for (let time = 0; time < lastInstant; time++) {
        if (pq.length > 0) {
            const top = pqPop(pq);
            const priorityLevel = top.key;
            const processIndex = top.index;
            const arrivalTime = processes[processIndex].arrival;
            const serviceTime = processes[processIndex].service;

            while (j < n && processes[j].arrival <= time + 1) {
                pqPush(pq, { key: 0, index: j });
                remainingServiceTime[j] = processes[j].service;
                j++;
            }

            let currentQuantum = Math.pow(2, priorityLevel);
            let temp = time;

            while (currentQuantum > 0 && remainingServiceTime[processIndex] > 0 && temp < lastInstant) {
                currentQuantum--;
                remainingServiceTime[processIndex]--;
                timeline[temp][processIndex] = '*';
                temp++;
            }

            if (remainingServiceTime[processIndex] === 0) {
                finishTime[processIndex] = temp;
                turnAroundTime[processIndex] = finishTime[processIndex] - arrivalTime;
                normTurn[processIndex] = turnAroundTime[processIndex] / serviceTime;
            } else {
                if (pq.length >= 1)
                    pqPush(pq, { key: priorityLevel + 1, index: processIndex });
                else
                    pqPush(pq, { key: priorityLevel, index: processIndex });
            }
            time = temp - 1;
        }
        while (j < n && processes[j].arrival <= time + 1) {
            pqPush(pq, { key: 0, index: j });
            remainingServiceTime[j] = processes[j].service;
            j++;
        }
    }

    fillInWaitTime(timeline, processes, finishTime, lastInstant);
    return { timeline, finishTime, turnAroundTime, normTurn };
}

// ─── 8. Aging ──────────────────────────────────────────────

function aging(processes, lastInstant, originalQuantum) {
    const n = processes.length;
    const timeline = createTimeline(lastInstant, n);
    const finishTime = new Array(n).fill(0);
    const turnAroundTime = new Array(n).fill(0);
    const normTurn = new Array(n).fill(0);

    // v entries: { priority, index, waitTime }
    let v = [];
    let j = 0;
    let currentProcess = -1;

    for (let time = 0; time < lastInstant; time++) {
        while (j < n && processes[j].arrival <= time) {
            v.push({ priority: processes[j].service, index: j, waitTime: 0 });
            j++;
        }

        for (let i = 0; i < v.length; i++) {
            if (v[i].index === currentProcess) {
                v[i].waitTime = 0;
                v[i].priority = processes[currentProcess].service;
            } else {
                v[i].priority++;
                v[i].waitTime++;
            }
        }

        // Sort by priority descending, then by waitTime descending
        v.sort((a, b) => {
            if (a.priority === b.priority) return b.waitTime - a.waitTime;
            return b.priority - a.priority;
        });

        if (v.length > 0) {
            currentProcess = v[0].index;
            let currentQuantum = originalQuantum;
            while (currentQuantum > 0 && time < lastInstant) {
                timeline[time][currentProcess] = '*';
                currentQuantum--;
                time++;
            }
            time--;
        }
    }

    fillInWaitTime(timeline, processes, finishTime, lastInstant);
    return { timeline, finishTime, turnAroundTime, normTurn };
}

// ─── Min-Heap helpers ──────────────────────────────────────
// Simple min-heap by `key`, with stable-ish ordering by `index`

function pqPush(heap, item) {
    heap.push(item);
    let i = heap.length - 1;
    while (i > 0) {
        const parent = Math.floor((i - 1) / 2);
        if (
            heap[parent].key > heap[i].key ||
            (heap[parent].key === heap[i].key && heap[parent].index > heap[i].index)
        ) {
            [heap[parent], heap[i]] = [heap[i], heap[parent]];
            i = parent;
        } else break;
    }
}

function pqPop(heap) {
    if (heap.length === 1) return heap.pop();
    const top = heap[0];
    heap[0] = heap.pop();
    let i = 0;
    while (true) {
        let smallest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        if (
            left < heap.length &&
            (heap[left].key < heap[smallest].key ||
                (heap[left].key === heap[smallest].key && heap[left].index < heap[smallest].index))
        )
            smallest = left;
        if (
            right < heap.length &&
            (heap[right].key < heap[smallest].key ||
                (heap[right].key === heap[smallest].key && heap[right].index < heap[smallest].index))
        )
            smallest = right;
        if (smallest !== i) {
            [heap[smallest], heap[i]] = [heap[i], heap[smallest]];
            i = smallest;
        } else break;
    }
    return top;
}

// ─── Main entry point ─────────────────────────────────────

function runScheduler(algorithmId, quantum, lastInstant, processList) {
    // Ensure numeric types
    quantum = parseInt(quantum) || 1;
    lastInstant = parseInt(lastInstant) || 20;

    const processes = processList.map((p) => ({
        name: p.name,
        arrival: parseInt(p.arrival) || 0,
        service: parseInt(p.service) || 1,
    }));

    let result;
    switch (algorithmId) {
        case '1':
            result = firstComeFirstServe(processes, lastInstant);
            break;
        case '2':
            result = roundRobin(processes, lastInstant, quantum);
            break;
        case '3':
            result = shortestProcessNext(processes, lastInstant);
            break;
        case '4':
            result = shortestRemainingTime(processes, lastInstant);
            break;
        case '5':
            result = highestResponseRatioNext(processes, lastInstant);
            break;
        case '6':
            result = feedbackQ1(processes, lastInstant);
            break;
        case '7':
            result = feedbackQ2i(processes, lastInstant);
            break;
        case '8':
            result = aging(processes, lastInstant, quantum);
            break;
        default:
            throw new Error('Unknown algorithm: ' + algorithmId);
    }

    // Build the algorithm name string
    let algoName = ALGORITHM_NAMES[algorithmId] || 'Unknown';
    if (algorithmId === '2') algoName += quantum;

    // Build output matching the C++ printJSON format
    return {
        algorithm: algoName,
        processes: processes.map((p, i) => ({
            name: p.name,
            arrival: p.arrival,
            service: p.service,
            finish: result.finishTime[i],
            turnaround: result.turnAroundTime[i],
            normTurn: result.normTurn[i],
        })),
        timeline: result.timeline,
    };
}
