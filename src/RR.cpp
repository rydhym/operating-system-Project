#include <iostream>
#include <queue>
#include "../include/algorithms.h"
#include "../include/parser.h"
#include "../include/utils.h"

using namespace std;

void roundRobin(int originalQuantum)
{
    queue<pair<int,int>>q;
    int j=0;
    if(getArrivalTime(processes[j])==0){
        q.push(make_pair(j,getServiceTime(processes[j])));
        j++;
    }
    int currentQuantum = originalQuantum;
    for(int time =0;time<last_instant;time++){
        if(!q.empty()){
            int processIndex = q.front().first;
            q.front().second = q.front().second-1;
            int remainingServiceTime = q.front().second;
            int arrivalTime = getArrivalTime(processes[processIndex]);
            int serviceTime = getServiceTime(processes[processIndex]);
            currentQuantum--;
            timeline[time][processIndex]='*';
            while(j<process_count && getArrivalTime(processes[j])==time+1){
                q.push(make_pair(j,getServiceTime(processes[j])));
                j++;
            }

            if(currentQuantum==0 && remainingServiceTime==0){
                finishTime[processIndex]=time+1;
                turnAroundTime[processIndex] = (finishTime[processIndex] - arrivalTime);
                normTurn[processIndex] = (turnAroundTime[processIndex] * 1.0 / serviceTime);
                currentQuantum=originalQuantum;
                q.pop();
            }else if(currentQuantum==0 && remainingServiceTime!=0){
                q.pop();
                q.push(make_pair(processIndex,remainingServiceTime));
                currentQuantum=originalQuantum;
            }else if(currentQuantum!=0 && remainingServiceTime==0){
                finishTime[processIndex]=time+1;
                turnAroundTime[processIndex] = (finishTime[processIndex] - arrivalTime);
                normTurn[processIndex] = (turnAroundTime[processIndex] * 1.0 / serviceTime);
                q.pop();
                currentQuantum=originalQuantum;
            }
        }
        while(j<process_count && getArrivalTime(processes[j])==time+1){
            q.push(make_pair(j,getServiceTime(processes[j])));
            j++;
        }
    }
    fillInWaitTime();
}
