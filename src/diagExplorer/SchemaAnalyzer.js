import React, { Component } from 'react';
import axios from 'axios';
import Card from 'react-bootstrap/Card';
import CardDeck from 'react-bootstrap/CardDeck';
import holderjs from 'holderjs';
import Navbar from 'react-bootstrap/Navbar';
import Spinner from 'react-bootstrap/Spinner'


class SchemaAnalyzer extends Component {
    constructor(props, context) {
      super(props, context);

        this.state = {
            jsonData: [],
            score: 10,
            currentStep: "Initializing ... It could take few minutes depending on number of columns.",
            scoreFinal: <Spinner animation="border" />,
            nbAttributes: <Spinner animation="border" size="sm" />,
            nbBigColumns: <Spinner animation="border" size="sm" />,
            nbLinks: <Spinner animation="border" size="sm" />,
            complexJoins: <Spinner animation="border" size="sm" />,
            stringJoins: <Spinner animation="border" size="sm" />,
            notUsedColumns: <Spinner animation="border" size="sm" />
        }; 

        this.globalvars = {
            loggerLevel: this.props.loglevel, // 1=ERROR, 2=WARNING, 3=INFO, 4=DEBUG)
            API_ENDPOINT: this.props.apiEndpoint + this.props.rootSchema + "&analyze=" + this.props.analyzedepth + "&sampling=" + this.props.sampling,
            loadingProgress: 0,
        };

        this.scoringWeight= {
            nbAttributes: 1,
            nbBigColumns: 1,
            nbLinks: 1,
            complexJoins: 3,
            notUsedColumns: 4
        }

        this.scoringThreshold= {
            nbAttributes: 200,
            nbBigColumns: 1,
            nbLinks: 10,
            complexJoins: 3,
            stringJoins: 1,
            notUsedColumns: 80 // % of not used columns 
        }
    }

    componentWillReceiveProps(nextProps){
        this.logger("componentWillReceiveProps", 3); 

        this.globalvars.API_ENDPOINT = this.props.apiEndpoint + nextProps.rootSchema + "&analyze=" + nextProps.analyzedepth + "&sampling=" + this.props.sampling;
        this.setState ({
            jsonData: [],
            score: 10,
            currentStep: "Initializing ... It could take few minutes depending on number of columns.",
            scoreFinal: <Spinner animation="border" size="sm" />,
            nbAttributes: <Spinner animation="border" size="sm" />,
            nbBigColumns: <Spinner animation="border" size="sm" />,
            nbLinks: <Spinner animation="border" size="sm" />,
            complexJoins: <Spinner animation="border" size="sm" />,
            stringJoins: <Spinner animation="border" size="sm" />,
            notUsedColumns: <Spinner animation="border" size="sm" />
        })

        this.loadJsonApi(this.globalvars.API_ENDPOINT);
        this.forceUpdate();
    }
    
    componentDidMount() {
    
        this.logger("componentDidMount", 3); 
        holderjs.run();
        //this.logger(this.globalvars.API_ENDPOINT, 0);
        this.loadJsonApi(this.globalvars.API_ENDPOINT);

    }

    logger(pMessage, iLevel){

        if (iLevel <= this.globalvars.loggerLevel){
            console.log(pMessage);
        }
    }

    loadJsonApi (sApiURL){

        axios.get(sApiURL).then ((res) => { 
         
          this.logger("loading schema from " + sApiURL, 3); 
    
          //this.globalvars.jsonData = res.data;

          this.setState({ 
            jsonData: res.data,
            currentStep: "Gathering Data..."
          });

          //this.logger (this.state.jsonData, 0);

          this.analyzeSchema ();
    
        }); 
    }

    analyzeSchema (){

        /* -------------------------------------------------------
           
            KPI list : 
                #1: More than [n] attributes Y/N
                #2: Number of BIG columns (memo)
                #3: More than [n] links 
                #4: Number of joins with more than 3 conditions
                #5: Number of joins that use String typed columns
                #6: Number of attributes that are not used (%)

            ------------------------------------------------------ */
        
        var jsondata = this.state.jsonData;

        if (!jsondata.schema_name){
            this.logger("Json not loaded yet !!!", 3);
        } 
        else {
            this.logger("Json loaded", 3);
        }  

        this.logger(jsondata, 3);
        this.logger("Schema Name: " + jsondata.schema_name, 3);

        var iCountMemoColumns = 0;
        var iCountNotUsedColumns = 0;
        var iCountComplexJoins = 0;
        var iCountRealLinks = 0;
        var iCountJoinparts = 0;
        var iCountComplexJoins = 0;
        var iCountStringJoins = 0;
        var ratioNotUsedColumns = 0;
        var i=0;
        var j=0;
        var k=0;
        var l=0;
        var m=0;

        // #1: More than [n] attributes Y/N
        if (jsondata.nbattributes > this.scoringThreshold.nbAttributes){
            
            this.logger("Many colmuns:" + jsondata.nbattributes, 3);
            this.setState ({
                score: this.state.score - (1 * this.scoringWeight.nbAttributes)
            })
        }

        // #2 Number of BIG columns (memo)
        // #6: Number of attributes that are not used (%)

        for (i in jsondata.attributes)
        {
            if (jsondata.attributes[i].fieldType == "memo" ){
                iCountMemoColumns ++;
            } 

            if (jsondata.attributes[i].usageKPI[0].Workflows == 0
                && jsondata.attributes[i].usageKPI[0].JS == 0
                && jsondata.attributes[i].usageKPI[0].JSSP == 0
                && jsondata.attributes[i].usageKPI[0].Webapp == 0
                && jsondata.attributes[i].usageKPI[0].SQL == 0
                ){
                this.logger( "Column not used: " +jsondata.attributes[i].fieldInternalName ,3);
                iCountNotUsedColumns ++;
            }  

        }

        if (iCountMemoColumns > this.scoringThreshold.nbBigColumns){
            this.logger("Big colmuns detected", 3);
            this.setState ({
                score: this.state.score - (1 * this.scoringWeight.nbBigColumns)
            })
        }
        
        this.logger(jsondata.nbattributes + " - " + iCountNotUsedColumns, 3);

        ratioNotUsedColumns = Math.round((jsondata.nbattributes - iCountNotUsedColumns) * 100 / jsondata.nbattributes, 0);

        if ((ratioNotUsedColumns) < this.scoringThreshold.notUsedColumns){
            this.logger("Not Used colmuns detected", 3);
            this.setState ({
                score: this.state.score - (1 * this.scoringWeight.notUsedColumns)
            })
        }

        // #3: Number of joins with more than 3 conditions
        // #4: More than [n] links 
        // #5: Number of joins that use String typed columns
        
        // for each links
        var iCountComplexJoinDetected = false; 

        for (j in jsondata.links)
        {
            
            iCountRealLinks ++;
            iCountJoinparts = 0;
            iCountComplexJoinDetected = false;

            // For each link conditions
            for (k in jsondata.links[j].joinparts)
            {
                
                // Link on "Current ..." are ignored
                if (!jsondata.links[j].joinparts[k].source_name){
                    
                    iCountRealLinks --;
                    continue;
                } else {
                    iCountJoinparts ++;

                    // if more than n join parts
                    if (iCountJoinparts >= this.scoringThreshold.complexJoins){
                        
                        // search the type of the attribute
                        for (l in jsondata.attributes)
                        {
                            if (jsondata.attributes[l].fieldInternalName == jsondata.links[j].joinparts[k].source_name)
                            {
                                
                                // that includes a string column
                                if (jsondata.attributes[l].fieldType.indexOf ("string") >= 0){
                                    iCountStringJoins++;
                                    this.logger("String Join found :" + jsondata.links[j].joinparts[k].source_name + "(" + jsondata.attributes[l].fieldType + ")", 3); 

                                    if (iCountStringJoins >= this.scoringThreshold.stringJoins){
                                        iCountComplexJoins ++;
                                        iCountComplexJoinDetected = true;
                                        break;
                                    }
                                    
                                }
                            }
                        }

                        // When link is identified as complex then we can stop and jump to the next link
                        if (iCountComplexJoinDetected) {
                            break;
                        }

                    }
                }
            }
        }


        if (iCountComplexJoins > 0) {
            this.logger("At least one Complex Join detected", 0);
            this.setState ({
                score: this.state.score - (1 * this.scoringWeight.complexJoins)
            })
        }

        if (iCountRealLinks > this.scoringThreshold.nbLinks){
    
            this.logger("Many links detected" , 3);
            this.setState ({
                score: this.state.score - (1 * this.scoringWeight.nbLinks)
            })
        }

        this.setState ({
            nbAttributes: jsondata.nbattributes,
            nbBigColumns: iCountMemoColumns,
            nbLinks: iCountRealLinks,
            complexJoins: iCountComplexJoins,
            notUsedColumns: ratioNotUsedColumns + " %",
            stringJoins: iCountStringJoins,
            scoreFinal: this.state.score + "/10"
        })
        
        //this.forceUpdate();

        this.setState({ 
            currentStep: "Analyze successful"
          });

        return true;


    }

    closeAnalyzer(){
        document.getElementById("main-analyzer").style.display = "none";
    }

    renderStackedChart(){
        window.open("columnDistributionChart.html?url=" + encodeURIComponent(this.globalvars.API_ENDPOINT), "_blank");
    }
  
    render() {

      return (
        <div id="main-analyzer-container" className="main-container">
            <Navbar bg="dark" variant="dark">
                <Navbar.Brand href="#" onClick={()=>this.closeAnalyzer()}>
                <img
                    alt=""
                    src="close.png"
                    width="30"
                    height="30"
                    className="d-inline-block align-top"
                />
                {" " + this.props.rootSchema + " (" +  this.state.currentStep + ")"}
                </Navbar.Brand>
            </Navbar>
            <CardDeck>
                <Card border="secondary" style={{ width: '25rem' }}>
                    <Card.Img variant="top" src="holder.js/100px160?theme=sky&amp;text=Attributes&amp;size=24" />
                    <Card.Body>
                    <Card.Title>Indicators</Card.Title>
                    <Card.Text>
                    <div>Number of attributes: <b>{this.state.nbAttributes}</b></div>
                    <div>Number of Large attributes: <b>{this.state.nbBigColumns}</b></div>
                    <div>Attributes overall usage propensity: <b>{this.state.notUsedColumns}</b></div>
                    </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                    <a href="#" onClick={()=>this.renderStackedChart()}><small className="text-muted">Display Data Distribution</small></a>
                    </Card.Footer>
                </Card>
                <Card border="secondary" style={{ width: '25rem' }}>
                    <Card.Img variant="top" src="holder.js/100px160?theme=sky&amp;text=Links&amp;size=24" />
                    <Card.Body>
                    <Card.Title>Indicators</Card.Title>
                    <Card.Text>
                    <div>Total number of joins: <b>{this.state.nbLinks}</b></div>
                    <div>Number of complex joins: <b>{this.state.complexJoins}</b></div>
                    </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                    <small className="text-muted">More details here</small>
                    </Card.Footer>
                </Card>
                <Card border="secondary" style={{ width: '25rem' }}>
                    <Card.Img variant="top" src="holder.js/100px160?theme=sky&amp;text=Design Scoring&amp;size=24" />
                    <Card.Body>
                    <Card.Title><div className="text-center">Overall Score</div></Card.Title>
                    <Card.Text>
                    <div className="text-center"><font size="30">{this.state.scoreFinal}</font></div>
                    </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                    <small className="text-muted">More details here</small>
                    </Card.Footer>
                </Card>
            </CardDeck>

        </div>
      );

     
    }
  }
  
export default SchemaAnalyzer;