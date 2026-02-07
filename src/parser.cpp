#include "../include/parser.h"

/** Global Variables Definition **/
std::string operation;
int last_instant, process_count;
std::vector<std::pair<char, int>> algorithms;
std::vector<std::tuple<std::string,int,int>> processes;
std::vector<std::vector<char>> timeline;
std::unordered_map<std::string,int> processToIndex;
std::vector<int> finishTime;
std::vector<int> turnAroundTime;
std::vector<float> normTurn;

void parse_algorithms(std::string algorithm_chunk)
{
    std::stringstream stream(algorithm_chunk);
    while (stream.good())
    {
        std::string temp_str;
        getline(stream, temp_str, ',');
        std::stringstream ss(temp_str);
        getline(ss, temp_str, '-');
        char algorithm_id = temp_str[0];
        getline(ss, temp_str, '-');
        int quantum = temp_str.size() >= 1 ? stoi(temp_str) : -1;
        algorithms.push_back( make_pair(algorithm_id, quantum) );
    }
}

void parse_processes()
{
    std::string process_chunk, process_name;
    int process_arrival_time, process_service_time;
    for(int i=0; i<process_count; i++)
    {
        std::cin >> process_chunk;

        std::stringstream stream(process_chunk);
        std::string temp_str;
        getline(stream, temp_str, ',');
        process_name = temp_str;
        getline(stream, temp_str, ',');
        process_arrival_time = stoi(temp_str);
        getline(stream, temp_str, ',');
        process_service_time = stoi(temp_str);

        processes.push_back( make_tuple(process_name, process_arrival_time, process_service_time) );
        processToIndex[process_name] = i;
    }
}

extern int process_count;
int core_count = 1; 

// ... (other globals)

void parse(int argc, char* argv[])
{
    if (argc > 1) {
        try {
            core_count = std::stoi(argv[1]);
            if (core_count < 1) core_count = 1;
        } catch (...) {
            core_count = 1;
        }
    }
    std::string algorithm_chunk;
    std::cin >> operation >> algorithm_chunk >> last_instant >> process_count;
    parse_algorithms(algorithm_chunk);
    parse_processes();
    finishTime.resize(process_count);
    turnAroundTime.resize(process_count);
    normTurn.resize(process_count);
    timeline.resize(last_instant);
    for(int i=0; i<last_instant; i++)
        for(int j=0; j<process_count; j++)
            timeline[i].push_back(' ');
}
