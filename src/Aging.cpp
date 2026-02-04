#include <iostream>
#include <vector>
#include <tuple>
#include <algorithm>
#include "../include/algorithms.h"
#include "../include/parser.h"
#include "../include/utils.h"

using namespace std;

void aging(int originalQuantum)
{
    vector<tuple<int,int,int>>v; //tuple of priority level, process index and total waiting time
    int j=0,currentProcess=-1;
    for(int time =0;time<last_instant;time++){
        while(j<process_count && getArrivalTime(processes[j])<=time){
            v.push_back(make_tuple(getPriorityLevel(processes[j]),j,0));
            j++;
        }

        for(int i=0;i<v.size();i++){
            if(get<1>(v[i])==currentProcess){
                get<2>(v[i])=0;
                get<0>(v[i])=getPriorityLevel(processes[currentProcess]);
            }
            else{
                get<0>(v[i])++;
                get<2>(v[i])++;
            }
        }
        sort(v.begin(),v.end(),byPriorityLevel);
        currentProcess=get<1>(v[0]);
        int currentQuantum = originalQuantum;
        while(currentQuantum-- && time<last_instant){
            timeline[time][currentProcess]='*';
            time++;
        }
        time--;
    }
    fillInWaitTime();
}
