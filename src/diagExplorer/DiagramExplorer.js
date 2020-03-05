import React, { Component } from 'react';
import 'storm-react-diagrams/dist/style.min.css';
import axios from 'axios';
//import * as beautify from "json-beautify";
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import ProgressBar from 'react-bootstrap/ProgressBar';
import SchemaAnalyzer from './SchemaAnalyzer';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Dropzone from 'react-dropzone';

import {
	DiagramEngine,
	DiagramModel,
	DefaultNodeModel,
	LinkModel,
  DefaultPortModel,
  DiagramWidget,
  DefaultLinkModel
} from "storm-react-diagrams";

class DiagramExplorer extends Component {
  constructor(props) {
    super(props);

    this.saveGraphViaSerialize = this.saveGraphViaSerialize.bind(this);
		this.restoreGraphViaSerialize = this.restoreGraphViaSerialize.bind(this);

    this.savedSerializedGraph = "";

    this.state = {
      analyzerContainer: null,
      username: "",
      password: "",
      configPanelLoaded: false
    };

    this.globalvars = {
      jsonData: [],
      jsonTargetMappings: [],
      columnsdepth: parseInt(this.props.columnsdepth),
      displayLinks: true,
      preset: this.props.preset,
      loggerLevel: this.props.loglevel, // 1=ERROR, 2=WARNING, 3=INFO, 4=DEBUG)
      API_MAPPINGS_ENDPOINT: this.props.baseURL + "/" + this.props.jsspns + "/diagramGetMappings.jssp?user=" + this.props.username+ "&password=" + this.props.password,
      API_SCHEMA_ENDPOINT: this.props.baseURL + "/" + this.props.jsspns + "/diagramExplorer.jssp?user=" + this.props.username + "&password=" + this.props.password + "&schema=",
      schemaDocURL: this.props.baseURL + "/xtk/schemaDocumentation.jssp?schema=",
      selectedSchema: this.props.rootSchema,
      loadingProgress: 0,
      maxtoload: parseInt(this.props.maxtoload),
      nodePosX: 100,
      nodePosY: 140,
      strSavedGraph: "",
      analyzedepth: this.props.analyzedepth,
      nocache: this.props.nocache,
      jsspns: this.props.jsspns
    };

    //http://localhost:3000/?config=config.json&columnsdepth=20&preset=custom&loglevel=0

    this.logger("Initialize Diagram", 3);
    this.logger("MAX columns per node : " + this.props.columnsdepth, 4);
    this.logger("preset :  " + this.props.preset, 4);
    this.logger("log level : " + this.props.loglevel, 4)
    this.logger("Max target mappings to load : " + this.props.maxtoload, 4);
    this.logger("Analyze depth for workflows (nb days) : " + this.props.analyzedepth, 4);
    this.logger("No Cache : " + this.props.nocache, 4);


  }


  componentDidMount() {

    this.logger("componentDidMount", 4);
    this.logger(this.globalvars.API_MAPPINGS_ENDPOINT, 4);

    if (this.props.username != "" && this.props.password != ""){

      this.setState({
        validated: true ,
        username: this.props.username,
        password: this.props.password
      });

      if (this.globalvars.selectedSchema){
        this.logger("loading schema : " + this.globalvars.selectedSchema, 3);
        this.loadJsonApi(this.globalvars.API_SCHEMA_ENDPOINT + this.globalvars.selectedSchema);
      } else {
        this.logger("loading all schemas with a target mapping : ", 3);
        this.loadMappingsApi(this.globalvars.API_MAPPINGS_ENDPOINT, this.globalvars.maxtoload);
      }
    }
  }

  loadSchemaAnalyzer(){

    if (model.getSelectedItems()[0]){

      var selectedItem = model.getSelectedItems()[0];

      this.logger("Analyzing the node : " + selectedItem.name, 3);

      //this.setState({analyzerOpened: true});
      document.getElementById("main-analyzer").style.display = "block";
      this.setState({analyzerContainer: <SchemaAnalyzer apiEndpoint={this.globalvars.API_SCHEMA_ENDPOINT} rootSchema={this.globalvars.selectedSchema} loglevel={this.globalvars.loggerLevel} analyzedepth={this.props.analyzedepth} sampling={this.props.sampling} nocache={this.props.nocache} />});
    }
  }

  loadConfigPanel(){

    if (this.state.configPanelLoaded) {

      this.logger("Hide the advanced config panel", 0);

      this.setState({
        configPanelLoaded: false
      });

      document.getElementById("main-configPanel").style.display = "none";
    } else {

      this.logger("Display the advanced config panel", 0);

      this.setState({
        configPanelLoaded: true
      });

      document.getElementById("main-configPanel").style.display = "block";
    }
  }

  saveGraphViaSerialize() {

    this.globalvars.strSavedGraph = JSON.stringify(model.serializeDiagram());
    this.logger("Diagram saved", 3);

  }

  downloadDiagramFile = () => {

    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(model.serializeDiagram())], {type: 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = "diagramAnalyserSaved.json";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }

  restoreGraphViaSerialize() {

    try {
      var model2 = new DiagramModel();
      model2.deSerializeDiagram(JSON.parse(this.globalvars.strSavedGraph), engine);
      model = model2;
      engine.setDiagramModel(model);
      this.forceUpdate();
      this.forceUpdate();
    } catch (error) {
      this.logger("Error while restoring the Diagram. No saved diagram to restore", 0);
    }

  }

  // Load Diagram from a File
  loadDiagramFromFile(pFiles){

    console.log("FILE READER");

    const reader = new FileReader()

    reader.onabort = () => this.logger("file reading was aborted", 3)
    reader.onerror = () => this.logger("file reading has failed", 3)
    reader.onload = () => {
      // Do whatever you want with the file contents
      try {
        const binaryStr = reader.result
        var model2 = new DiagramModel();
        model2.deSerializeDiagram(JSON.parse(binaryStr), engine);
        model = model2;
        engine.setDiagramModel(model);
        this.forceUpdate();
        this.forceUpdate();
      } catch (error) {
        this.logger("Error while parsing the Diagram. File not compatible. Loading aborted", 1);
      }

    }

    pFiles.forEach(file => reader.readAsBinaryString(file));

  }

  logger(pMessage, iLevel){

      if (iLevel <= this.globalvars.loggerLevel){
          console.log(pMessage);
      }
  }

  loadJsonApi (sApiURL){

    axios.get(sApiURL).then ((res) => {

      this.logger("loading schema from " + sApiURL, 3);

      /*this.setState({
        jsonData: res.data,
        startPosX: this.globalvars.startPosX + 100
      });*/

      this.globalvars.jsonData = res.data;
      this.globalvars.startPosX = this.globalvars.startPosX + 100;

      this.generateSchema();
      this.forceUpdate();

    });
  }

  loadMappingsApi (sApiURL, pMaxToLoad){

    axios.get(sApiURL).then ((res) => {

      this.logger("loading mappings from " + sApiURL, 3);
      this.logger(res.data.mappings,3);

      var nbMappings = Object.values(res.data.mappings).length;
      this.logger("Nb Mappings to load: " + nbMappings, 3);

      var i=0;

      // We store the mapping list to use custom RGB colors nodes afterwards
      this.globalvars.jsonTargetMappings = res.data.mappings;

      for (i in res.data.mappings)
      {

        var iAlreadyLoaded = false;

        // Limit the number of root schema to load
        if (i >= parseInt(pMaxToLoad)) {
          //console.log("STOP : " + i + " : " + pMaxToLoad);
          this.globalvars.loadingProgress = 100;
          break;
        }


        this.globalvars.loadingProgress = (parseInt(i)+1) * 100 / nbMappings;
        this.logger("Loading " + this.globalvars.loadingProgress + "%", 3);

        // Filtering schema according to selected Preset
        if (!this.parsePreset(res.data.mappings[i].namespace, res.data.mappings[i].schemaname)) {
          continue;
        }

        this.logger("Canditate mapping schemas : " + res.data.mappings[i].namespace + ":" + res.data.mappings[i].schemaname, 3);

        // Search Node
        var nodes = model.getNodes();
        var j = 0;

        // Are the nodes loaded already?
        for (j in Object.keys(nodes))
        {

          let tempNode = model.getNode(nodes[Object.keys(nodes)[j]]);

          if (tempNode.name == res.data.mappings[i].namespace + ":" + res.data.mappings[i].schemaname)
          {
            var nbPorts = Object.values(tempNode.getPorts()).length;
            this.logger("Node to load matches with existing node: " + tempNode.name, 3);
            this.logger("Existing node has " + nbPorts + " nodes", 3);

            // Prevent multiple loading of a schema
            if(nbPorts > 2) {
              iAlreadyLoaded = true;
              break;
            }
          }
        }

        // We load only once
        if (!iAlreadyLoaded){

          this.logger("loading mapping schema : " + res.data.mappings[i].namespace + ":" + res.data.mappings[i].schemaname, 3);
          this.loadJsonApi(this.globalvars.API_SCHEMA_ENDPOINT + res.data.mappings[i].namespace + ":" + res.data.mappings[i].schemaname);

        } else {
          this.logger("ABORTING loading mapping schema : " + res.data.mappings[i].namespace + ":" + res.data.mappings[i].schemaname, 3);
        }

      }

    });
  }


  loadSelectedSchema(){

    if (model.getSelectedItems()[0]){

      //this.saveGraphViaSerialize();

      var selectedItem = model.getSelectedItems()[0];

      //this.globalvars.nodePosX += 200;
      //this.globalvars.nodePosX = this.globalvars.nodePosY + 50;
      this.globalvars.nodePosX = selectedItem.x + 300;
      this.globalvars.nodePosY = selectedItem.y;

      //selectedItem.clearListeners();

      var nbPorts = Object.values(selectedItem.getPorts()).length;
      this.logger(nbPorts, 4);

      // Prevent multiple loading of a schema
      if(nbPorts <= 2) {

        this.logger("Loading the node : " + selectedItem.name, 3);
        this.loadJsonApi(this.globalvars.API_SCHEMA_ENDPOINT + selectedItem.name);
        //engine.setDiagramModel(model);
        //this.forceUpdate();

      } else {

        this.logger("ABORTING Loading the node : " + selectedItem.name, 3);

      }
    }
  }

  getDocumentationURL (){

    var sLinktoTheDoc = this.globalvars.schemaDocURL + this.globalvars.selectedSchema;
    this.logger(sLinktoTheDoc, 3);
    return sLinktoTheDoc;

  }


  createNodeIfNotExist (pModel, pNodeName, pNameSpace, pNodeType){

    // Search Node
    var nodes = pModel.getNodes();
    var i = 0;

    for (i in Object.keys(nodes))
    {
      let tempNode = pModel.getNode(nodes[Object.keys(nodes)[i]]);

      if (tempNode.name == pNodeName)
      {
        //this.logger("POSITION of " + pNodeName + '=' + pPosX, 4);
        if(this.globalvars.nodePosY > 120) {
          this.globalvars.nodePosY -= 10;
        }
        return tempNode;
      }

    };

    // Test is the node is a target mapping then it will have a specific color

    var iMapping = 0;
    var jsonMappingList = this.globalvars.jsonTargetMappings;
    var sMappingSchemaName = "";
    var isMapping = false;
    var sColorScheme = "";

    for (iMapping in jsonMappingList){

    /*
      console.log ("*** Target Mapping scanning ***");
      console.log ("#1 " + jsonMappingList[iMapping].namespace + ":" + jsonMappingList[iMapping].schemaname);
      console.log ("#2 " + pNameSpace + ":" + pNodeName);
    */

      sMappingSchemaName = jsonMappingList[iMapping].namespace + ":" + jsonMappingList[iMapping].schemaname;

      if (sMappingSchemaName == pNodeName){
        this.logger("Node " + pNameSpace + ":" + pNodeName + " is a target mapping", 3);
        isMapping = true;
        break;
      }

    }

    if (isMapping){
      sColorScheme = "rgb(245,91,91)";
    } else if (pNameSpace == "nms"){
      sColorScheme = "rgb(0,192,255)";
    } else if (pNameSpace == "xtk") {
      sColorScheme = "rgb(200,100,200)";
    } else {
      sColorScheme = "rgb(255,192,0)";
    }

    var newNode = new DefaultNodeModel(pNodeName, sColorScheme);
    this.globalvars.nodePosY += 50;
    newNode.x = this.globalvars.nodePosX;
    newNode.y = this.globalvars.nodePosY;
    pModel.addNode(newNode);

    this.logger("POSITION of " + pNodeName + ' X:' + this.globalvars.nodePosX + " Y:" + this.globalvars.nodePosY, 4);

    // add a selection listener to each
    newNode.addListener({
       selectionChanged: () => {
          this.globalvars.selectedSchema = newNode.name;
          this.logger("Selected item is : " + this.globalvars.selectedSchema, 4);
        }
      });

    if (pNodeType == "source"){
      this.globalvars.nodePosX += 400;
      this.globalvars.nodePosY = 120;
    }

    if (this.globalvars.nodePosY > 2500){
      this.globalvars.nodePosX += 400;
      this.globalvars.nodePosY = 120;
    }

    return newNode;
  }

  createPortIfNotExist(pNode, isInput){

    //console.log(pNode);

    var sPortName = "";
    if (isInput) {

      sPortName = "<";

    } else {

      sPortName = ">"

    }

    if (pNode.getPort(sPortName)) {

      //console.log(pNode);
      return pNode.getPort(sPortName);

    }
    else {

      return pNode.addPort(new DefaultPortModel(isInput, sPortName, sPortName));

    }

  }

  /*
      Displaying all schemas does not make sense everytime (there are too many !!!)
      Several presets help to display schemas according
      #1 : custom : All Custom schemas + tracking, broadlog & delivery
      #2 : Standard : All custom schemas + all nms schemas
      #3 : Any other value : All schemas
  */
  parsePreset(pNamespace, pSchemaname){

    if (this.globalvars.preset == "custom"
        && (pNamespace == "xtk")
        || (pNamespace == "nms" && !(pSchemaname == "trackingLogRcp"
                                  || pSchemaname == "broadLogRcp"
                                  || pSchemaname == "recipient"
                                  || pSchemaname == "delivery"
                                  || pSchemaname == "operation"
                                  || pSchemaname == "subscription")
            )
    ){
      this.logger("===> Filtered schema by preset : " + pNamespace + ":" + pSchemaname, 4);
      return false;
    } else if (this.globalvars.preset == "standard" && (pNamespace == "xtk")){
      return false;
    } else {
      return true;
    }

  }

  /*  ---------------------------------------------
      Explore Schema & links to set up diagram nodes
      --------------------------------------------- */
  generateSchema(){



    //var jsondata = require("./jsonfiles/" + pSchameName + ".json");
    var jsondata = this.globalvars.jsonData;

		this.logger("===> GenerateSchema jsondata : " +  jsondata, 4);

		this.logger("===> GenerateSchema for: " +  jsondata.schema_name, 4);

		if (!jsondata.schema_name) return false;

    //var iNodeSourcePosX=this.globalvars.startPosX;
    //var iNodeSourcePosY=200;

    var nodeSource = this.createNodeIfNotExist (model, jsondata.schema_namespace + ":" + jsondata.schema_name, jsondata.schema_namespace, "source");
    //nodeSource.clearListeners(); // no action on root node

    var nodeSourcePortIn = this.createPortIfNotExist(nodeSource, true);
    var nodeSourcePortOut = this.createPortIfNotExist(nodeSource, false);

    var iCountAttributes = 0;
    var iMaxAttributes = this.globalvars.columnsdepth;
    this.logger("MAX COLUMNS TO DISPLAY : " + iMaxAttributes, 3);


    for (i in jsondata.attributes)
    {

      iCountAttributes ++;

      //console.log(i);

      var sAttributeName = jsondata.attributes[i].fieldName;
      var sAttributeType = jsondata.attributes[i].fieldType;
      //nodeSource.addInPort(sAttributeName + " (" +sAttributeType + ")");

      if (i > iMaxAttributes) {
        nodeSource.addInPort("... (Limit to " + iMaxAttributes + ". Other fields filtered...)");
        break;
      } else {
        nodeSource.addInPort(sAttributeName + " (" +sAttributeType + ")");
      }

    }

    //engine.setDiagramModel(model);
    //return false;

    var i=0;
    var j=0;

    //var iNodeDestPosX=iNodeSourcePosX+600;
    //var iNodeDestPosY=170;

    var sListLoadSyntax = "";

    for (i in jsondata.links)
    {


      // Link on "Current ..." are ignored
      if (!jsondata.links[i].joinparts[0].source_name){
        continue;
      }

      this.logger(jsondata.links[i].link_target_namespace + ":" + jsondata.links[i].link_target + " => " + iCountAttributes, 4);

      // Filtering schema according to selected Preset
      if (!this.parsePreset(jsondata.links[i].link_target_namespace, jsondata.links[i].link_target)) {
        continue;
      }

      //sListLoadSyntax = sListLoadSyntax + 'this.loadJsonApi(API_SCHEMA_ENDPOINT + "' + jsondata.links[i].link_target_namespace + ':' + jsondata.links[i].link_target + '");\n';
      sListLoadSyntax = sListLoadSyntax + "{\n";
      sListLoadSyntax = sListLoadSyntax + '"namespace":"' + jsondata.links[i].link_target_namespace + '",\n';
      sListLoadSyntax = sListLoadSyntax + '"schema":"' + jsondata.links[i].link_target + '"\n';
      sListLoadSyntax = sListLoadSyntax + "},\n";

      var nodeDest = this.createNodeIfNotExist (model, jsondata.links[i].link_target_namespace + ":" + jsondata.links[i].link_target, jsondata.links[i].link_target_namespace, "dest");
      var nodeDestPortIn = this.createPortIfNotExist(nodeDest, true);
      var nodeDestPortOut = this.createPortIfNotExist(nodeDest, false);

      this.logger(nodeDestPortOut, 4);

      /* --------------------------
          Assign labels to links
        -------------------------- */
      var linkLabel = "";

      for (j in jsondata.links[i].joinparts)
      {
          this.logger("====>" + jsondata.links[i].joinparts[j].source_name, 3);

          if (jsondata.links[i].joinparts[j].source_name){
            var keySource = jsondata.links[i].joinparts[j].source_name;
          } else {
            var keySource = jsondata.links[i].joinparts[j].destination_name;
            this.logger("NO EXPLICIT SOURCE for " + jsondata.links[i].link_target, 3);
          }

          var keyDestination = jsondata.links[i].joinparts[j].destination_name;

          if (linkLabel != ""){
            linkLabel = linkLabel + " AND ";
          }
          linkLabel = linkLabel + keySource + "=" + keyDestination;

          //nodeSource.addPort(new DefaultPortModel(false, keySource, keySource));
          //nodeDest.addPort(new DefaultPortModel(true, keyDestination, keyDestination));
      }

      // Display Link Cardinality
      this.logger("+++++++++++++", 4);
      this.logger("LINK from " + jsondata.schema_name + " TO " + jsondata.links[i].link_target + " is Unbound : " + jsondata.links[i].link_unbound, 4);

      // IN PROGRESS

      var linkLabelCardinality = "";
      if(jsondata.links[i].link_unbound == "true"){
        linkLabelCardinality = linkLabelCardinality + " [1-N]";
      }
      else if (jsondata.links[i].link_external == "true") {
        linkLabelCardinality = linkLabelCardinality + " [0-1]";
      }
      else {
        linkLabelCardinality = linkLabelCardinality + " [1-1]";
      }

      if(jsondata.links[i].link_reverselink_unbound == "true"){
        linkLabelCardinality = linkLabelCardinality + " [1-N]";
      } else if(jsondata.links[i].link_reverselink_external == "true"){
        linkLabelCardinality = linkLabelCardinality + " [0-1]";
      } else {
        linkLabelCardinality = linkLabelCardinality + " [1-1]";
      }

      var linkLabel = linkLabel + linkLabelCardinality;
      var linkLabelRoot = linkLabel.substr(0, linkLabel.indexOf(" ["));

      //this.logger(linkLabel,0);

      var links = Object.values(nodeSource.getPort("<").getLinks());
      var p = 0;
      var linkAlreadyExists = false;

      //this.logger("1: "  +linkLabel, 0);

      for (p in links)
      {
        var tempLabel = links[p].labels[0].label;
        this.logger("OLD LABEL " + i + " : " + tempLabel, 4);
        var tempLabelRoot = tempLabel.substr(tempLabel.indexOf("=")+1, tempLabel.indexOf(" [")-2 - tempLabel.indexOf("=")+1)
                            + "=" + tempLabel.substr(0, tempLabel.indexOf("="));

        //this.logger(links[p].labels[0], 0);

        if (tempLabelRoot == linkLabelRoot){

          linkAlreadyExists = true;
          var oldLink = links[p];

          this.logger("====> LINK EXISTS ALREADY " + tempLabel + " " + linkLabel, 4);
          break;
          //this.logger(links[p].labels[0],2);
        }
      };

      if (linkAlreadyExists){
        //oldLink.labels[0].setLabel(tempLabel + linkLabelCardinality);
        this.logger("EDITION ANCIEN LIEN : " + tempLabel ,4);
      }
      else{
        var newlink= nodeSourcePortOut.link(nodeDestPortIn);
        newlink.addLabel(linkLabel);
        model.addLink(newlink);
        this.logger("CREATION NOUVEAU LIEN : " + linkLabel,4);
      }

    }

    // Display the loadJson calls syntax for linked schemas
    this.logger(sListLoadSyntax, 4);

    // Display all links of the schama
    if (!this.globalvars.displayLinks)
    {
      // ICI on scanne les nodes avec un port unique et on les vire
      var allNodes = model.getNodes()
      var n = 0;

      for (n in Object.keys(allNodes))
      {
        var tempNode = model.getNode(allNodes[Object.keys(allNodes)[n]]);
        //var allPorts = tempNode.getPorts();

        if (Object.keys(tempNode.ports).length == 1)
        {
            this.logger("to remove : " + tempNode.name, 4);
        }

      };
    }

    engine.setDiagramModel(model);
    this.forceUpdate();
  }

  handleSubmit(event) {
    //const form = event.target.values;
    var sUsername = document.getElementById("validationUsername").value;
    var sPassword = document.getElementById("validationPassword").value;

    if (sUsername && sPassword) {

      this.globalvars.API_MAPPINGS_ENDPOINT = this.props.baseURL + "/" + this.globalvars.jsspns + "/diagramGetMappings.jssp?user=" + sUsername + "&password=" + sPassword;
      this.globalvars.API_SCHEMA_ENDPOINT = this.props.baseURL + "/" + this.globalvars.jsspns + "/diagramExplorer.jssp?user=" + sUsername + "&password=" + sPassword + "&schema=";
      this.logger(this.globalvars.API_MAPPINGS_ENDPOINT, 4);
      this.setState({
        validated: true ,
        username: sUsername,
        password: sPassword
      });

      if (this.globalvars.selectedSchema){
        this.logger("Diagram loaded already, DO NOTHING ELSE AT LOGGING", 3);
        //this.loadSelectedSchema();
      } else {
        this.logger("loading all schemas with a target mapping : ", 3);
        this.loadMappingsApi(this.globalvars.API_MAPPINGS_ENDPOINT, this.globalvars.maxtoload);
      }

    } else {
      this.setState({ validated: false });
    }

    event.preventDefault();
    event.stopPropagation();
  }

  handleConfigSave(){

    this.logger("Saving config from Panel", 3);

    //const form = event.target.values;
    var sPresetList = document.getElementsByName("radioPreset");
    var sPreset = "";
    var iColumnsDepth = parseInt(document.getElementsByName("columnDepth")[0].value);
    var iNbMappings = parseInt(document.getElementsByName("nbmappings")[0].value);
    var iAnalyzeDepth = parseInt(document.getElementsByName("analyzedepth")[0].value);
    var sJsspNamespace = document.getElementsByName("jsspnamespace")[0].value;
    var iLoggerLevel = parseInt(document.getElementsByName("loggerlevel")[0].value);
    var bIsNoCache = document.getElementsByName("isnocache")[0].checked;

    for (var i = 0; i < sPresetList.length; ++i) {

      if (sPresetList[i].checked){

        sPreset = sPresetList[i].value;
        this.globalvars.preset = sPresetList[i].value;
        this.logger("New value for preset: " + sPresetList[i].value, 3);
        break;

      }

    }

    if (sJsspNamespace.length == 3){
      this.logger("New value for JSSP default namespace: " + sJsspNamespace, 3);
      this.globalvars.jsspns = sJsspNamespace;
    } else {
      this.logger("BAD value for JSSP default namespace: Requires a 3 letters string", 3);
    }

    if (Number.isInteger(iColumnsDepth)){
      this.logger("New value for Column Depth: " + iColumnsDepth, 3);
      this.globalvars.columnsdepth = iColumnsDepth;
    } else {
      this.logger("BAD value for Column Depth: Requires an Integer", 3);
    }

    if (Number.isInteger(iNbMappings)){
      this.logger("New value for Nb Mappings: " + iNbMappings, 3);
      this.globalvars.maxtoload = iNbMappings;
    } else {
      this.logger("BAD value for Nb Mappings: Requires an Integer", 3);
    }

    if (Number.isInteger(iAnalyzeDepth)){
      this.logger("New value for Analyze Depth: " + iAnalyzeDepth, 3);
      this.globalvars.analyzedepth = iAnalyzeDepth;
    } else {
      this.logger("BAD value for Analyze Depth: Requires an Integer", 3);
    }

    if (Number.isInteger(iLoggerLevel) && iLoggerLevel >= 0 && iLoggerLevel <= 4){
      this.logger("New value for Logger Level: " + iLoggerLevel, 3);
      this.globalvars.loggerLevel = iLoggerLevel;
    } else {
        this.logger("BAD value for Column Depth: Require an Integer between 0 and 4", 3);
    }

    if(bIsNoCache) {
      this.logger("New value for no cache: " + bIsNoCache, 3);
      this.globalvars.nocache = "true";
    } else {
      this.logger("New value for no cache: " + bIsNoCache, 3);
      this.globalvars.nocache = "false";
    }


    // We close the config panel
    document.getElementById("main-configPanel").style.display = "none";
    this.setState({
      configPanelLoaded: false
    });

  }

  zoomInSchema(){

    var sURL = window.location.pathname + "?baseurl=" + encodeURIComponent(this.props.baseURL) + "&rootschema=" + this.globalvars.selectedSchema + "&columnsdepth=" + this.globalvars.columnsdepth + "&preset=" + this.globalvars.preset + "&loglevel=" + this.globalvars.loggerLevel + "&nocache=" + this.globalvars.nocache + "&analyzedepth=" + this.globalvars.analyzedepth + "&username=" + this.state.username + "&password=" + this.state.password;
    console.log(sURL);
    window.open(sURL);

  }


  render() {

    this.logger("Rendering", 1);

    const { validated } = this.state;

    return (

      <div>
        <div className="main-menu-bar">
          <h5>&nbsp;Adobe Campaign Database Diagram Analyzer V1.6 (3rd of August)</h5>
          <div>
            <Form noValidate validated={validated} onSubmit={e => this.handleSubmit(e)}>
              <Form.Row>
                <Col>
                  <DropdownButton id="dropdown-basic-button" variant="outline-primary" title="Switch Instance" column sm={100}>
                    <Dropdown.Item href={window.location.pathname + "?baseurl=https%3A%2F%2Facpm10.adobedemo.com&jsspns=" + this.globalvars.jsspns + "&columnsdepth=10&preset=custom&loglevel=0&maxtoload=10&analyzedepth=30&nocache=false"}>ACPM10 demo instance</Dropdown.Item>
                    <Dropdown.Item href={window.location.pathname + "?baseurl=https%3A%2F%2Facpm13.adobedemo.com&jsspns=" + this.globalvars.jsspns + "&columnsdepth=10&preset=custom&loglevel=0&maxtoload=10&analyzedepth=30&nocache=false"}>ACPM13 demo instance</Dropdown.Item>
                    <Dropdown.Item href={window.location.pathname + "?baseurl=https%3A%2F%2Fdanonegroup-stage.neolane.net&jsspns=" + this.globalvars.jsspns + "&columnsdepth=10&preset=custom&loglevel=0&maxtoload=10&analyzedepth=30&nocache=false"}>DANONE Stage EMEA</Dropdown.Item>
                    <Dropdown.Item href={window.location.pathname + "?baseurl=https%3A%2F%2Foccitane-test.neolane.net&jsspns=" + this.globalvars.jsspns + "&columnsdepth=10&preset=custom&loglevel=0&maxtoload=10&analyzedepth=30&nocache=false"}>L'Occitane Test</Dropdown.Item>
                    <Dropdown.Item href={window.location.pathname + "?baseurl=https%3A%2F%2Foccitane-s.neolane.net&jsspns=" + this.globalvars.jsspns + "&columnsdepth=10&preset=custom&loglevel=0&maxtoload=10&analyzedepth=30&nocache=false"}>L'Occitane Prod (MKT)</Dropdown.Item>
                    <Dropdown.Item href={window.location.pathname + "?baseurl=https%3A%2F%2Florealsa-mkt-stage5.campaign.adobe.com&jsspns=" + this.globalvars.jsspns + "&columnsdepth=10&preset=custom&loglevel=0&maxtoload=10&analyzedepth=30&nocache=false"}>L'Oréal Stage 5</Dropdown.Item>
                    <Dropdown.Item href={window.location.pathname + "?baseurl=https%3A%2F%2Frenault-s.neolane.net&jsspns=" + this.globalvars.jsspns + "&columnsdepth=10&preset=custom&loglevel=0&maxtoload=10&analyzedepth=30&nocache=false"}>Renault Prod</Dropdown.Item>
                    <Dropdown.Item href={window.location.pathname + "?baseurl=https%3A%2F%2Fneweratickets61-s.neolane.net&jsspns=" + this.globalvars.jsspns + "&columnsdepth=10&preset=custom&loglevel=0&maxtoload=10&analyzedepth=30&nocache=false"}>Fanone Prod</Dropdown.Item>
                    <Dropdown.Item href={window.location.pathname + "?baseurl=https%3A%2F%2Fsouthwest-airlines.campaign.adobe.com&jsspns=" + this.globalvars.jsspns + "&columnsdepth=10&preset=custom&loglevel=0&maxtoload=10&analyzedepth=30&nocache=false"}>Southwest Airline Prod</Dropdown.Item>
                  </DropdownButton>
                </Col>
                <Col>
                  <Form.Label column sm={100}>
                    &nbsp;Instance:&nbsp;<a target="_blank" href={this.props.baseURL}>{this.props.baseURL}</a>&nbsp;&nbsp;
                  </Form.Label>
                </Col>
                <Col>
                  <Form.Group as={Col} md="3" controlId="validationUsername">
                    <Form.Control type="text" placeholder="username" defaultValue={this.state.username} required />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group as={Col} md="3" controlId="validationPassword">
                    <Form.Control type="password" placeholder="password" defaultValue={this.state.password} required />
                  </Form.Group>
                </Col>
                <Col sm={{ span: 10, offset: 2 }}>
                  <Button type="submit">Sign in</Button>
                </Col>
              </Form.Row>
            </Form>
          </div>
          <div id="main-analyzer" className="main-analyzer">{this.state.analyzerContainer}</div>
          <div id="main-configPanel" className="main-configPanel">
            <Table striped bordered hover variant="dark" size="sm">
              <tr>
                <td>
                  <Form>
                    <Form.Group as={Row} controlId="configMappings">
                      <Form.Row>
                        <Form.Label column xs={4}>Preset:</Form.Label>
                        <Col xs={4}>
                          <Form.Group as={Row}>
                            <Col sm={10}>
                              <Form.Check
                                type="radio"
                                label="Custom"
                                name="radioPreset"
                                id="radioPresetCustom"
                                value="custom"
                              />
                              <Form.Check
                                type="radio"
                                label="Standard"
                                name="radioPreset"
                                id="radioPresetStandard"
                                value="standard"
                              />
                              <Form.Check
                                type="radio"
                                label="ALL"
                                name="radioPreset"
                                id="radioPresetALL"
                                value="ALL"
                              />
                            </Col>
                          </Form.Group>
                        </Col>
                      </Form.Row>
                    </Form.Group>
                    <Form.Group as={Row} controlId="configColumnDepth">
                      <Form.Row>
                        <Form.Label column xs={4}>Max Colunms to load:</Form.Label>
                        <Col xs={4}>
                          <Form.Control name="columnDepth" type="text" defaultValue={this.globalvars.columnsdepth} required/>
                        </Col>
                      </Form.Row>
                    </Form.Group>
                    <Form.Group as={Row} controlId="configMappings">
                      <Form.Row>
                        <Form.Label column xs={4}>Max Mappings to load:</Form.Label>
                        <Col xs={4}>
                          <Form.Control name="nbmappings" type="text" defaultValue={this.globalvars.maxtoload} required/>
                        </Col>
                      </Form.Row>
                    </Form.Group>
                    <Form.Group as={Row} controlId="configAnalyze">
                      <Form.Row>
                        <Form.Label column xs={4}>Analyze depth (nb days):</Form.Label>
                        <Col xs={4}>
                          <Form.Control name="analyzedepth" type="text" defaultValue={this.globalvars.analyzedepth} required/>
                        </Col>
                      </Form.Row>
                    </Form.Group>
                    <Form.Group as={Row} controlId="configJsspNamespace">
                      <Form.Row>
                        <Form.Label column xs={4}>JSSP default namespace (ex: xtk):</Form.Label>
                        <Col xs={4}>
                          <Form.Control name="jsspnamespace" type="text" defaultValue={this.globalvars.jsspns} required/>
                        </Col>
                      </Form.Row>
                    </Form.Group>
                    <Form.Group as={Row} controlId="configLogger">
                      <Form.Row>
                        <Form.Label column xs={4}>logger lever (0,1,2,3 or 4):</Form.Label>
                        <Col xs={4}>
                          <Form.Control name="loggerlevel" type="text" defaultValue={this.globalvars.loggerLevel} required/>
                        </Col>
                      </Form.Row>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formNoCache">
                      <Col sm={{ span: 10, offset: 2 }}>
                        <Form.Check name="isnocache" label="No Cache" />
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row}>
                      <Col sm={{ span: 10, offset: 2 }}>
                        <Button type="button" onClick={() => this.handleConfigSave()}>Save</Button>
                      </Col>
                    </Form.Group>
                  </Form>
                </td>
              </tr>
            </Table>
          </div>
          <div>
            <ButtonToolbar aria-label="Actions">
              <ButtonGroup className="mr-2" aria-label="Actions group 1">
                  <Button variant="outline-secondary" onClick={() => engine.zoomToFit()}>Fit to Screen</Button>
                  <Button variant="outline-success"   onClick={() => this.loadSelectedSchema()}>Explore Selected Schema</Button>
                  <Button variant="outline-primary"   onClick={() => this.zoomInSchema()}>Zoom in selection</Button>
                  <Button variant="outline-dark"      onClick={() => this.loadSchemaAnalyzer()}>Analyze Schema</Button>
                  <Button variant="outline-success"   onClick={() => this.saveGraphViaSerialize()} >Save Diagram</Button>
                  <Button variant="outline-success"   onClick={() => this.restoreGraphViaSerialize()} >Undo action</Button>
                  <Button variant="outline-success"   onClick={this.downloadDiagramFile}>Export Diagram</Button>
                  <Button variant="outline-info"      onClick={() => window.open(this.getDocumentationURL(), "_blank")}>Schema Documentation</Button>
                  <Button variant="outline-danger"    onClick={() => window.open(window.location.pathname + "?baseurl=" + this.props.baseURL + "&jsspns=" + this.globalvars.jsspns + "&columnsdepth=" + this.globalvars.columnsdepth +  "&maxtoload=" + this.globalvars.maxtoload + "&preset=" + this.globalvars.preset + "&loglevel=" + this.globalvars.loggerLevel + "&analyzedepth=" + this.globalvars.analyzedepth + "&nocache=" + this.globalvars.nocache + "&username=" + this.state.username + "&password=" + this.state.password, "_self")}>Reset Diagram</Button>
                  <Button variant="outline-danger"    onClick={() => this.loadConfigPanel()} >Advanced Config</Button>
              </ButtonGroup>
            </ButtonToolbar>
            <ProgressBar now={this.globalvars.loadingProgress} />
          </div>
          <div className="main-dropzone">
              <Dropzone onDrop={acceptedFiles => this.loadDiagramFromFile(acceptedFiles)}>
              {({getRootProps, getInputProps}) => (
                <section>
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    LOAD A DIAGRAM => Drag a JSON file here, or click to select file ...
                  </div>
                </section>
              )}
            </Dropzone>
            </div>
        </div>
        <div><DiagramWidget diagramEngine={engine}/></div>
      </div>
    );
  }
}

//1) setup the diagram engine
var engine = new DiagramEngine();
engine.installDefaultFactories();

//2) setup the diagram model
var model = new DiagramModel();

export default DiagramExplorer;
