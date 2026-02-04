cmake_minimum_required(VERSION 3.14)
project(CPU_Scheduling LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/refs/tags/v1.14.0.zip
)
# For Windows: Prevent overriding the parent project's compiler/linker settings
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

# Library with all logic (everything except main.cpp)
file(GLOB SOURCE_FILES "src/*.cpp")
add_library(scheduler_lib ${SOURCE_FILES})
target_include_directories(scheduler_lib PUBLIC include)

# Main Executable
add_executable(lab4 main.cpp)
target_link_libraries(lab4 PRIVATE scheduler_lib)

# Tests
enable_testing()

add_executable(unit_tests
  tests/test_main.cpp
  tests/test_algorithms.cpp
)
target_link_libraries(unit_tests
  PRIVATE
  scheduler_lib
  GTest::gtest_main
)

include(GoogleTest)
gtest_discover_tests(unit_tests)
