import React from 'react';
import DiagramExplorer from './diagExplorer/DiagramExplorer';

function AppDiagramExplorer() {
  
  const queryString = require('query-string');
  //console.log(window.location.search);

  const parsed = queryString.parse(window.location.search);
  var baseURL = "";

  if (!parsed.baseurl == true){

    baseURL = window.location.origin;
  } else {
    baseURL = parsed.baseurl;
  }

  const rootSchema = parsed.rootschema;  // The root schema to start a Diagram exploration from
  const columnsdepth = parsed.columnsdepth; // Nb of columns per schema to display
  const preset = parsed.preset; // Custom, Standard, ALL
  const loglevel = parsed.loglevel; // 0, 1, 2, 3 or 4
  const maxtoload = parsed.maxtoload; // Nb of targeting dimension (aka mapping) to load while Diagram initializes
  const analyzedepth = parsed.analyzedepth; // Ex: 30 means How many workflows that run over the last 30 days refenreces the atteibute
  const sampling = parsed.sampling; // Sampling ratio (ex: 30 means the analyzer only compute 70% of the attributes. Other are random values)
  const username = parsed.username; // AC instance login
  const password = parsed.password; // AC Instance password (AqszDmmP8dedfr214xWoO0)
  const nocache = parsed.nocache; // Force the analyzer to recompute all KPI 
  var jsspns = "";
  if (parsed.jsspns) {
    jsspns = parsed.jsspns; // namespace from where JSSP files are deployed from the AC instance (ex: acx, xtk, etc. ...)
  } else {
    jsspns = "acx"; // default value
  }    

  return (
    <DiagramExplorer baseURL={baseURL}  jsspns={jsspns} rootSchema={rootSchema} columnsdepth={columnsdepth} preset={preset} loglevel={loglevel} maxtoload={maxtoload} analyzedepth={analyzedepth} sampling={sampling} username={username} password={password} nocache={nocache} />  
  );
}

export default AppDiagramExplorer;
