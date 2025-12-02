#include "game.h"
#include <iostream>

int main() {
	setlocale(LC_ALL, "Russian");
    GameOfLife game(40, 20);

    std::cout << "Выберите вариант:" << std::endl;
    std::cout << "1 - Случайное поле" << std::endl;
    std::cout << "2 - Движущиеся фигуры" << std::endl;

    int choice;
    std::cin >> choice;

    if (choice == 1) {
        game.generateRandomField();
    }
    else {
        game.addGlider(5, 5);
        game.addGlider(15, 8);
        game.addGlider(25, 3);
        game.addBlinker(10, 15);
        game.addBlinker(30, 10);
        game.generateRandomField();
    }

    game.runSimulation(100, 150);

    std::cout << "Симуляция завершена!" << std::endl;

    return 0;
}