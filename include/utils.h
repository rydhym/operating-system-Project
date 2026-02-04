#ifndef UTILS_H_INCLUDED
#define UTILS_H_INCLUDED

#include <tuple>
#include <string>
#include "parser.h"

bool sortByServiceTime(const std::tuple<std::string, int, int> &a, const std::tuple<std::string, int, int> &b);
bool sortByArrivalTime(const std::tuple<std::string, int, int> &a, const std::tuple<std::string, int, int> &b);
bool descendingly_by_response_ratio(std::tuple<std::string, double, int> a, std::tuple<std::string, double, int> b);
bool byPriorityLevel (const std::tuple<int,int,int>&a,const std::tuple<int,int,int>&b);

void clear_timeline();
std::string getProcessName(std::tuple<std::string, int, int> &a);
int getArrivalTime(std::tuple<std::string, int, int> &a);
int getServiceTime(std::tuple<std::string, int, int> &a);
int getPriorityLevel(std::tuple<std::string, int, int> &a);
double calculate_response_ratio(int wait_time, int service_time);
void fillInWaitTime();

#endif // UTILS_H_INCLUDED
