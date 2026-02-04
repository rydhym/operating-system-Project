#include <iostream>
#include <vector>
#include <tuple>
#include <algorithm>
#include "../include/algorithms.h"
#include "../include/parser.h"
#include "../include/utils.h"

using namespace std;

#define all(v) v.begin(), v.end()

void highestResponseRatioNext()
{

    // Vector of tuple <process_name, process_response_ratio, time_in_service> for processes that are in the ready queue
    vector<tuple<string, double, int>> present_processes;
    int j=0;
    for (int current_instant = 0; current_instant < last_instant; current_instant++)
    {
        while(j<process_count && getArrivalTime(processes[j])<=current_instant){
            present_processes.push_back(make_tuple(getProcessName(processes[j]), 1.0, 0));
            j++;
        }
        // Calculate response ratio for every process
        for (auto &proc : present_processes)
        {
            string process_name = get<0>(proc);
            int process_index = processToIndex[process_name];
            int wait_time = current_instant - getArrivalTime(processes[process_index]);
            int service_time = getServiceTime(processes[process_index]);
            get<1>(proc) = calculate_response_ratio(wait_time, service_time);
        }

        // Sort present processes by highest to lowest response ratio
        sort(all(present_processes), descendingly_by_response_ratio);

        if (!present_processes.empty())
        {
            int process_index = processToIndex[get<0>(present_processes[0])];
            while(current_instant<last_instant && get<2>(present_processes[0]) != getServiceTime(processes[process_index])){
                timeline[current_instant][process_index]='*';
                current_instant++;
                get<2>(present_processes[0])++;
            }
            current_instant--;
            present_processes.erase(present_processes.begin());
            finishTime[process_index] = current_instant + 1;
            turnAroundTime[process_index] = finishTime[process_index] - getArrivalTime(processes[process_index]);
            normTurn[process_index] = (turnAroundTime[process_index] * 1.0 / getServiceTime(processes[process_index]));
        }
    }
    fillInWaitTime();
}
