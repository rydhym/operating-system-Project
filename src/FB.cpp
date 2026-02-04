#include <iostream>
#include <queue>
#include <unordered_map>
#include <cmath>
#include "../include/algorithms.h"
#include "../include/parser.h"
#include "../include/utils.h"

using namespace std;

void feedbackQ1()
{
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq; //pair of priority level and process index
    unordered_map<int,int>remainingServiceTime; //map from process index to the remaining service time
    int j=0;
    if(getArrivalTime(processes[0])==0){
        pq.push(make_pair(0,j));
        remainingServiceTime[j]=getServiceTime(processes[j]);
        j++;
    }
    for(int time =0;time<last_instant;time++){
        if(!pq.empty()){
            int priorityLevel = pq.top().first;
            int processIndex =pq.top().second;
            int arrivalTime = getArrivalTime(processes[processIndex]);
            int serviceTime = getServiceTime(processes[processIndex]);
            pq.pop();
            while(j<process_count && getArrivalTime(processes[j])==time+1){
                    pq.push(make_pair(0,j));
                    remainingServiceTime[j]=getServiceTime(processes[j]);
                    j++;
            }
            remainingServiceTime[processIndex]--;
            timeline[time][processIndex]='*';
            if(remainingServiceTime[processIndex]==0){
                finishTime[processIndex]=time+1;
                turnAroundTime[processIndex] = (finishTime[processIndex] - arrivalTime);
                normTurn[processIndex] = (turnAroundTime[processIndex] * 1.0 / serviceTime);
            }else{
                if(pq.size()>=1)
                    pq.push(make_pair(priorityLevel+1,processIndex));
                else
                    pq.push(make_pair(priorityLevel,processIndex));
            }
        }
        while(j<process_count && getArrivalTime(processes[j])==time+1){
                pq.push(make_pair(0,j));
                remainingServiceTime[j]=getServiceTime(processes[j]);
                j++;
        }
    }
    fillInWaitTime();
}

void feedbackQ2i()
{
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq; //pair of priority level and process index
    unordered_map<int,int>remainingServiceTime; //map from process index to the remaining service time
    int j=0;
    if(getArrivalTime(processes[0])==0){
        pq.push(make_pair(0,j));
        remainingServiceTime[j]=getServiceTime(processes[j]);
        j++;
    }
    for(int time =0;time<last_instant;time++){
        if(!pq.empty()){
            int priorityLevel = pq.top().first;
            int processIndex =pq.top().second;
            int arrivalTime = getArrivalTime(processes[processIndex]);
            int serviceTime = getServiceTime(processes[processIndex]);
            pq.pop();
            while(j<process_count && getArrivalTime(processes[j])<=time+1){
                    pq.push(make_pair(0,j));
                    remainingServiceTime[j]=getServiceTime(processes[j]);
                    j++;
            }

            int currentQuantum = pow(2,priorityLevel);
            int temp = time;
            while(currentQuantum && remainingServiceTime[processIndex]){
                currentQuantum--;
                remainingServiceTime[processIndex]--;
                timeline[temp++][processIndex]='*';
            }

            if(remainingServiceTime[processIndex]==0){
                finishTime[processIndex]=temp;
                turnAroundTime[processIndex] = (finishTime[processIndex] - arrivalTime);
                normTurn[processIndex] = (turnAroundTime[processIndex] * 1.0 / serviceTime);
            }else{
                if(pq.size()>=1)
                    pq.push(make_pair(priorityLevel+1,processIndex));
                else
                    pq.push(make_pair(priorityLevel,processIndex));
            }
            time = temp-1;
        }
        while(j<process_count && getArrivalTime(processes[j])<=time+1){
                pq.push(make_pair(0,j));
                remainingServiceTime[j]=getServiceTime(processes[j]);
                j++;
        }
    }
    fillInWaitTime();
}
