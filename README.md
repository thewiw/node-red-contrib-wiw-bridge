# node-red-contrib-wiw-bridge

Nodes dedicated to communication with What Is What system via The WiW's Bridge Connector

The technical documentation of each node is available in each node.

Some use cases are available in examples


## Examples

These examples are Node-RED flows created to show what can be done with The WiW Bridge nodes in terms of communication with a What Is What system.

```
To get examples working you will need :
  - a What Is What,
  - a MQTT broker,
  - a Bridge Connector connected to both What Is What and MQTT Broker,
  - a Siemens S7 simulator.
```


### Pre-requisites (installation without Docker container)
For Node-RED What is What bridge component:
```
NodeJS LTS >= 10.16.0
Node-RED >= 0.20.7
```
For Siemens S7 simulator:
```
Snap7 >= 1.4.1
```


### Install and start Snap7 PLC Simulator

Snap7 download link working on 2019/07/23 : https://freefr.dl.sourceforge.net/project/snap7/1.4.1/snap7-full-1.4.1.zip

Uncompress the file

Under Windows, the simplest way is to use the C# version with a user interface.
For this, execute file "examples/dot.net/WinForm/CSharp/Bin/x86/CServer.exe", and click "Start" butto when UI shows up. PLC Simulator is now running.


### Installation of example "100-fullDemo" using dedicated Docker container

#### Image creation
```
Go into this directory.
Launch ./build-docker-image.sh
```

#### Container creation
In the following instruction, replace `externalPort` with your local IP and your host port:
```
noderedImage="node-red-wiw:latest"

noderedContainer="s7-nodered"
externalPort="127.0.0.1:1880"

s7Volume=s7-data

if ! docker volume ls -q | grep -xq "${s7Volume}" ; then
  docker volume create "${s7Volume}"
fi
docker run -it -d -p "${externalPort}":1880 -v "${s7Volume}":/data --name "${noderedContainer}" "${noderedImage}"
```

#### Container test
In your web browser, simply type the Node-RED address. E.g.: 127.0.0.1:1880.

### Installation of Node-RED with What is What bridge nodes on local system
#### Prepare Node-RED

Before starting Node-RED, go to your .node-red folder which is supposed to be
```
For Windows : c:/users/[user name]/.node-red
For Linux : ~/.node-red
```


##### Prepare UI resources folder

If you're a Node-RED user and your httpStatic link is already pointing to a specific folder then just go to "Copy UI resources".

If not a Node-RED user or httpStatic is not set, then open "settings.js" file and update the "httpStatic" line by uncommenting it (remove '//' at the beginning) and change the link to
```
For Windows : c:/users/[username]/.node-red/httpStatic
For Linux : ~/.node-red/httpStatic
```
Save the file and create sub-folders in the .node-red folder to create those new sub-folders :
  - httpStatic
  - httpStatic/node-red-contrib-wiw-bridge.demo.


##### Copy UI resources

Paste the "resources" folder (the whole folder, NOT just its content) from node-red-contrib-wiw-bridge.demo cloned from repository into "httpStatic/node-red-contrib-wiw-bridge.demo" folder you have just created.


##### Run Node-RED and install dependencies nodes

Launch Node-RED with the commande ```node-red```.

Go to your web navigator and write http://localhost:1880 in the adress bar. The Node-RED interface will appear.

Before starting, make sure your current Nore-RED flow is empty and you don't have useless any configuration nodes ("Menu" -> "Configuration nodes" and delete all nodes).

From the Menu at the top left corner in Node-Red, click on "Manage palette". Then go to the "install" tab and install the following packages : 
```
node-red-contrib-s7
node-red-dashboard
node-red-contrib-uuid
node-red-contrib-wiw-bridge (for this one, if in development mode, see node-red-contrib-wiw-bridge README.md)
```


##### Load the demo

Back to the Menu, click "Import" -> "Clipboard", then in the pop-up window click "Select a file to import".

Select the "100 - fullDemo.json" from node-red-contrib-wiw-bridge.examples folder in the file explorer.

Import it and deploy.


### The demo

#### The tabs

Before running the demo, the right MQTT config must be selected.

By default the demo is saved with all MQTT nodes using "démo-intégration (dev)", which is a safety feature to make sure a running demo can not be modified/updated/broken by an unexpected run.
"démo-integration (dev)" points to the MQTT broker reserved for The WiW developments, it is reachable only bia The WiW VPN and is most likely connected to UAT.

So before running it, you must make sure that all MQTT nodes are using the right configuration for your demo.

See each tab to know how many MQTT nodes have to be changed. Deploy the flows once all MQTT nodes have been changed.

#### Demo-Integ PLC tab

This tab makes the link between What Is What and the local PLC simulator (see pre-requisites).

The chosen PLC is a Siemens S7, it's datatable structure is stored in "s7config.csv" (and is already setup in the flows).

"wiwCheck" and "wiwLogs" are optional but are recommended by The WiW to check if the communication is working well, and react on What Is What responses.
The CSV file generated on output of wiw2Logs will be created either in the .node-red folder or your personal folder, and will store all your logs which are not "RES".

This tab contains 3 MQTT nodes.

#### Demo-integ DB tab

The second tab is all about DB access.

The JSON files simulate the database of an ERP, and mainly stores products and fabrication orders into 2 different files.

Demo-integ JSON files will be created automaticaly in your .node-red folder (or eventual your personal folder) and 6 different products will be automatically added.

When fabrication orders are created from UI, they are written in the dbFabricationOrder.json file.

This tab contains 1 MQTT node.

#### Demo-Integ Simul tab

The third tab is called Demo-Integ Simul. It is the simulator of the on-site system. It contains all the UI part and the production simulation.

A few user actions are not available via the UI, and can be run via some "inject" nodes :
  - "on-demand : force products declaration" makes all products not declared to What Is What, and thus will trigger a new declaration of products (previous products must be deactivated on What Is What first)
  - "on-demand : force OFs cleanup" changes every OF in the database from unstarted to started, making them disappear from list of OF to run in UI

There must be no MQTT node in this tab.

### Run it

Open a new tab in your web nagivator and go to http://localhost:1880/ui

Once you have the UI you are able to create new fabrication orders and to start them.

The first form at the left is used to create FO. Make sure the description has never been used before and all fields all fill else it will not works. Then click on the button "créer". If every fields get cleared your FO has been successfully created in the database.

Once the FO has been created it will appear in the select-list under "Démarrage d'OF", select it and click on the START button.

Once the FO has started, the 2 graphs are supposed to be updated eveery seconds until the quantity needed has been produced. You can use the slider to modify the production speed.

You can stop the production by putting the maching on pause mode or by generating an error. To restart it, switch the pause button or push the "acquitter" button.

### Modify and save it

```
TO NOT "BREAK" A CUSTOMER/PARTNER DEMO :
  - WHEN MODIFYING THE DEMO, MAKE SURE ALL MQTT NODES ARE USING CONFIGURATION "demo-integration (dev)",
  - BEFORE SAVING THE DEMO, MAKE SURE ALL MQTT NODES ARE USING CONFIGURATION "demo-integration (dev)".
```

To save your flows, go in "menu -> Export -> Clipboard". Then chose "All flows" at the top and select "formatted", copy/paste the content into the wiwDemo.json file of the demo folder.


## The "on-the-fly" demo

This is a short version of "Demo-Integ PLC" and "Demo-Integ DB" tabs, it is the part that can be written in the front of a partner/customer to show how easy it is to build a Node-RED software connected to What Is What.

```
It demonstrates :
  - the regular load of products from the database and their declaration to What Is What
  - the declaration of a machine
  - the update of values from PLC to What Is What
  - the update of values from What Is What to PLC
```
