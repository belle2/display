# Belle II Event Display with Phoenix - GSoC 2023

This Angular CLI web app displays Belle II events using Phoenix, a TypeScript-based event display framework.
<br>
The web app has been deployed and can be accessed through [display.belle2.org](https://display.belle2.org)

In order to run the application on your local machine, please perform the following steps.
<br>
## Prerequisites

1. Install Node.js and NPM on your system. You can download the latest version of Node.js from the [official website](https://nodejs.org/en/download/).
2. Install Angular CLI globally by running the command `npm install -g @angular/cli@15.2.7`. This command will install the latest version of Angular CLI on your system.

## How to Run

1. Clone this repository to your local machine
```git clone git@github.com:belle2/display.git```
2. Change the current directory into the cloned folder
```cd display```
3. Run `npm install` to install the necessary dependencies
4. Run `npm start` or `ng serve` to start the development server
5. Navigate to `http://localhost:4200/` in your web browser to view the app

## About the App
![image](https://github.com/HieuLCM/GSoC2023_Belle2/assets/88785267/dc08313f-03a9-4832-9713-123b554b0a10)

The web application serves as a tool that allows scientists and physicists to import events from mdst `.root` files, which contain data, and then view them directly in a web browser. By leveraging the Phoenix framework and adding custom features, the application provides a user-friendly environment for event display, complete with intuitive user interface controls.

For more detailed instructions on how to use and develop the app, please refer to the [documentation](https://display.belle2.org/documentation).

*The documentation is created using Sphinx and its source file is located in the `docs/` folder.*

### Le Cong Minh Hieu - GSoC 2023
