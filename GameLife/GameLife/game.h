#ifndef GAME_OF_LIFE_H
#define GAME_OF_LIFE_H

#include <vector>

class GameOfLife {
private:
    std::vector<std::vector<bool>> grid;
    std::vector<std::vector<bool>> nextGrid;
    int width;
    int height;

public:
    GameOfLife(int w, int h);
    void generateRandomField();
    void addGlider(int startX, int startY);
    void addBlinker(int startX, int startY);
    void step();
    void render();
    void runSimulation(int steps, int delayMs);
};

#endif