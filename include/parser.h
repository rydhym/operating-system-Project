#ifndef PARSER_H_INCLUDED
#define PARSER_H_INCLUDED

#include <vector>
#include <string>
#include <tuple>
#include <unordered_map>
#include <iostream>
#include <sstream>

using namespace std;

/** Global Variables Declaration **/
extern string operation;
extern int process_count;
extern int last_instant;
extern int core_count;
extern vector<pair<char, int>> algorithms;
extern vector<tuple<string,int,int>> processes;
extern vector<vector<char>> timeline;
extern unordered_map<string,int> processToIndex;

//Results
extern vector<int> finishTime;
extern vector<int> turnAroundTime;
extern vector<float> normTurn;

void parse(int argc, char* argv[]);

#endif // PARSER_H_INCLUDED
