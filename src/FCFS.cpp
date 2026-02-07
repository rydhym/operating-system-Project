#include <iostream>
#include "../include/algorithms.h"
#include "../include/parser.h"
#include "../include/utils.h"

using namespace std;

void firstComeFirstServe()
{
    // Vector to track when each core will be free
    std::vector<int> core_busy_until(core_count, 0);

    for (int i = 0; i < process_count; i++)
    {
        int processIndex = i;
        int arrivalTime = getArrivalTime(processes[i]);
        int serviceTime = getServiceTime(processes[i]);

        // Find the core that becomes free earliest
        int best_core = 0;
        for (int c = 1; c < core_count; c++) {
            if (core_busy_until[c] < core_busy_until[best_core]) {
                best_core = c;
            }
        }

        // Start time is max(arrival, core_free_time)
        int startTime = std::max(arrivalTime, core_busy_until[best_core]);
        
        finishTime[processIndex] = startTime + serviceTime;
        turnAroundTime[processIndex] = finishTime[processIndex] - arrivalTime;
        normTurn[processIndex] = (float)turnAroundTime[processIndex] / serviceTime;

        // Update timeline
        for (int j = startTime; j < finishTime[processIndex]; j++)
            timeline[j][processIndex] = '*';
        for (int j = arrivalTime; j < startTime; j++)
            timeline[j][processIndex] = '.';

        // Update this core's busy time
        core_busy_until[best_core] = finishTime[processIndex];
    }
}
