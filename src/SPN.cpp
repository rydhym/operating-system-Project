#include <iostream>
#include <queue>
#include <vector>
#include "../include/algorithms.h"
#include "../include/parser.h"
#include "../include/utils.h"

using namespace std;

void shortestProcessNext()
{
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq; // pair of service time and index
    std::vector<int> core_busy_until(core_count, 0);
    int j = 0;

    for (int i = 0; i < last_instant; i++)
    {
        // Add newly arrived processes to the priority queue
        while(j < process_count && getArrivalTime(processes[j]) <= i){
            pq.push(make_pair(getServiceTime(processes[j]), j));
            j++;
        }

        // Check each core to see if it's free
        for(int c = 0; c < core_count; c++)
        {
            if (i >= core_busy_until[c]) 
            {
                if (!pq.empty())
                {
                    int processIndex = pq.top().second;
                    int arrivalTime = getArrivalTime(processes[processIndex]);
                    int serviceTime = getServiceTime(processes[processIndex]);
                    pq.pop();

                    // Process starts NOW (at time i)
                    int startTime = i;
                    int finish = startTime + serviceTime;

                    finishTime[processIndex] = finish;
                    turnAroundTime[processIndex] = (finish - arrivalTime);
                    normTurn[processIndex] = (turnAroundTime[processIndex] * 1.0 / serviceTime);

                    // Fill Waiting Time in timeline
                    for (int k = arrivalTime; k < startTime; k++)
                        timeline[k][processIndex] = '.';

                    // Fill Running Time in timeline
                    for (int k = startTime; k < finish; k++)
                        timeline[k][processIndex] = '*';

                    // Mark core as busy
                    core_busy_until[c] = finish;
                }
            }
        }
    }
}
