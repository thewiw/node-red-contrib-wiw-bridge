# node-red-contrib-wiw-bridge

```
To develop the MQTT nodes you will need :
- a MQTT broker and/or ,
- a What Is What (may be optional to just develop and debug),
- a Bridge Connector connected to both What Is What (if any) and MQTT Broker

To develop the HTTP nodes you will need :
- a What Is What
```


## Pre-requisites

node-red-contrib-wiw-bridge needs Node to be installed.

```
NodeJS LTS >= 16.0.0 (https://nodejs.org/en/download/)
Node-RED >= 2.0.0
```


## Installation without Node-RED palette (for development purposes for example)

Install Node-RED if it's not already done : 
```npm install node-red```

Clone node-red-contrib-wiw-bridge to your standard projects directory :
```
cd [your project directory]
git clone [git user]:thewiw/node-red-contrib-wiw-bridge.git
```

Go to your .node-red directory :
```
For Windows : cd c:/users/[user name]/.node-red
For Linux : cd ~/.node-red
```

Install node-red-contrib-wiw-bridge into node modules (Node-RED must be stopped):
```
npm i [your project directory]/node-red-contrib-wiw-bridge
```

In case of dependencies, make sure to install them at same time in :

  your .node-red directory (see above)

  the project's directory ([your project directory]/node-red-contrib-wiw-bridge)


## Update without Node-RED palette (for development purposes for example)

During development this is needed each time a change is made in a .js file, not so much when updating a .html file

The process is always the same :
```
1) stop Node-RED
2) Go to you .node-red directory and install node-red-contrib-bridge into node module (see above)
3) restart Node-RED
```


## Usage

Launch Node-RED with the command ```node-red```.

Open your web browser at http://localhost:1880. The Node-RED interface will appear.

You can find all What Is What nodes in the "What Is What" section on the left side or you can find them by writing "wiw" in the research bar at the top left corner.

Each node needs a configuration node, either MQTT or HTTP.
To setup the configuration node you may insert a wiw node into the Node-RED editor by dragging it from the list on the left hand side and drop it onto the editor window.
Then, double click on the node and the edit dialog will appear. You can open the Configuration node by clicking on the pencil button.

```
MQTT configuration node consists of 4 parts :
- the node name's as on every node.
- the Mqtt parameters which are already given but can be changed by users.
- the logs timeout.
- the messages buffer parameters wich are already given but can be changed by users.
```

```
HTTP configuration node consists of 2 parts :
- the node name's as on every node.
- the http parameters.
```


## Modify and debug

```
To debug you can use :
- Node-RED debug nodes,
- Node-RED "node.error()" method,
- console.log() directly in source files (logs end up in the console running Node-RED).
```

To apply changes in the source files, you have to reinstall node-red-contrib-wiw-bridge and re-start Node-RED (see "Installation" and "Usage" chapters above).