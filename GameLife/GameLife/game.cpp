#include "game.h"
#include <iostream>
#include <random>
#include <thread>
#include <chrono>

GameOfLife::GameOfLife(int w, int h) : width(w), height(h) {
    grid.resize(height, std::vector<bool>(width, false));
    nextGrid.resize(height, std::vector<bool>(width, false));
}

void GameOfLife::generateRandomField() {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_real_distribution<> dis(0.0, 1.0);

    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            grid[y][x] = (dis(gen) < 0.35);
        }
    }
}

void GameOfLife::addGlider(int startX, int startY) {
    grid[startY][startX + 1] = true;
    grid[startY + 1][startX + 2] = true;
    grid[startY + 2][startX] = true;
    grid[startY + 2][startX + 1] = true;
    grid[startY + 2][startX + 2] = true;
}

void GameOfLife::addBlinker(int startX, int startY) {
    grid[startY][startX] = true;
    grid[startY][startX + 1] = true;
    grid[startY][startX + 2] = true;
}

void GameOfLife::step() {
    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            int liveNeighbors = 0;

            for (int dx = -1; dx <= 1; ++dx) {
                for (int dy = -1; dy <= 1; ++dy) {
                    if (dx == 0 && dy == 0) continue;

                    int nx = (x + dx + width) % width;
                    int ny = (y + dy + height) % height;

                    if (grid[ny][nx]) {
                        liveNeighbors++;
                    }
                }
            }

            bool currentState = grid[y][x];

            if (currentState) {
                nextGrid[y][x] = (liveNeighbors == 2 || liveNeighbors == 3);
            }
            else {
                nextGrid[y][x] = (liveNeighbors == 3);
            }
        }
    }

    grid = nextGrid;
}

void GameOfLife::render() {
    for (int i = 0; i < 30; i++) {
        std::cout << std::endl;
    }

    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            std::cout << (grid[y][x] ? "?" : " ");
        }
        std::cout << std::endl;
    }
}

void GameOfLife::runSimulation(int steps, int delayMs) {
    for (int step_i = 0; step_i < steps; ++step_i) {
        render();
        std::cout << "иру: " << step_i + 1 << "/" << steps << std::endl;
        step();
        std::this_thread::sleep_for(std::chrono::milliseconds(delayMs));
    }
}