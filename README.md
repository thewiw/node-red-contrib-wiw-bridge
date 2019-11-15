# node-red-contrib-wiw-bridge

This directory contains the sources of the wiw nodes.

```
To use them you will need :
- a MQTT broker,
- a What Is What (may be optional to just develop and debug),
- a Bridge Connector connected to both What Is What (if any) and MQTT Broker
```

## Pre-requisites

node-red-contrib-wiw-bridge needs Node to be installed.

```
NodeJS LTS >= 10.16.0 (https://nodejs.org/en/download/)
Node-RED >= 0.20.7
```

## Installation without Node-RED palette (for development purposes for example)

Install Node-RED if it's not already done : 
```npm install node-red```

Clone ivy to your standard projects directory :
```
cd [your project directory]
git clone git@bitbucket.org:thewiw/ivy.git
```

Go to your .node-red directory :
```
For Windows : cd c:/users/[user name]/.node-red
For Linux : cd ~/.node-red
```

Install node-red-contrib-wiw-bridge into node modules :
```
npm install [your project directory]/ivy/node-red-contrib-wiw-bridge
```

## Usage

Launch Node-RED with the command ```node-red```.

Open your web browser at http://localhost:1880. The Node-RED interface will appear.

You can find all What Is What nodes in the "What Is What" section on the left side or you can find them by writing "wiw" in the research bar at the top left corner.

Each nodes need a configuration node.
To setup the configuration node you have to insert a wiw node into the Node-RED editor by dragging it from the list on the left hand side and drop it onto the editor window.
Then, you double click on the node and the edit dialog will appear. You can open the Configuration node by clicking on the pencil button.

```
The configuration node consists of 4 parts :
- the node name's as on every node.
- the Mqtt parameters which are already given but can be changed by users.
- the logs timeout.
- the messages buffer parameters wich are already given but can be changed by users.
```

## Modify and debug

```
To debug you can use :
- Node-RED debug nodes,
- Node-RED "node.error()" method,
- console.log() directly in source files (logs end up in the console running Node-RED).
```

To apply changes in the source files, you have to reinstall node-red-contrib-wiw-bridge and re-start Node-RED (see "Installation" and "Usage" chapters above).
