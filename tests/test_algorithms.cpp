#include <gtest/gtest.h>
#include <tuple>
#include <vector>
#include "../include/parser.h"
#include "../include/utils.h"
#include "../include/algorithms.h"

using namespace std;

// Test Fixture to reset state before each test
class SchedulerTest : public ::testing::Test {
protected:
    void SetUp() override {
        // Clear globals
        processes.clear();
        finishTime.clear();
        turnAroundTime.clear();
        normTurn.clear();
        timeline.clear();
        processToIndex.clear();
        
        // Default setup mimicking a parser
        process_count = 0;
        last_instant = 20;
        
        // Initialize simple timeline
        timeline.resize(last_instant);
        for(int i=0; i<last_instant; i++)
             timeline[i].resize(5, ' '); // arbitrary size
    }

    void AddProcess(string name, int arrival, int service) {
        processes.push_back(make_tuple(name, arrival, service));
        processToIndex[name] = process_count;
        process_count++;
    }

    void PrepareOutputVectors() {
        finishTime.resize(process_count);
        turnAroundTime.resize(process_count);
        normTurn.resize(process_count);
        // Resize timeline width to match process count
        for(int i=0; i<last_instant; i++) {
            timeline[i].resize(process_count, ' ');
        }
    }
};

TEST_F(SchedulerTest, FCFS_Basic) {
    // A: 0, 3
    // B: 2, 6
    AddProcess("A", 0, 3);
    AddProcess("B", 2, 6);
    PrepareOutputVectors();

    firstComeFirstServe();

    // A arrives 0, runs 0-3. Finish = 3.
    EXPECT_EQ(finishTime[0], 3);
    
    // B arrives 2, waits until 3. runs 3-9. Finish = 9.
    EXPECT_EQ(finishTime[1], 9);
}

TEST_F(SchedulerTest, SPN_Basic) {
    // A: 0, 8
    AddProcess("A", 0, 8);
    // B: 1, 4
    AddProcess("B", 1, 4);
    // C: 2, 9
    AddProcess("C", 2, 9);
    // D: 3, 5
    AddProcess("D", 3, 5);
    PrepareOutputVectors();

    shortestProcessNext();

    // A runs 0-8. Finish 8.
    EXPECT_EQ(finishTime[0], 8);

    // At 8: B(4), C(9), D(5) are waiting. B is shortest.
    // B runs 8-12. Finish 12.
    EXPECT_EQ(finishTime[1], 12);
    
    // At 12: C(9), D(5) waiting. D shortest.
    // D runs 12-17. Finish 17.
    EXPECT_EQ(finishTime[3], 17);

    // C runs 17-26. Finish 26.
    EXPECT_EQ(finishTime[2], 26);
}
