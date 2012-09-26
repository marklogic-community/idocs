/*
Copyright 2002-2012 MarkLogic Corporation.  All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/*********************/
/* Utility functions */ 
/*********************/
var ML = ML || {};

ML.console = function(method,message) {
	if (typeof console === 'undefined') {
		var nop = function () {};
		console = {};
		["log","info","warn","error","assert","dir","clear","profile","profileEnd"].forEach(function (method) {
			console[method] = nop;
		});
	}
	console[method](message);
};

ML.assert = function (exp, method, message) {
	"use strict";
	if (!exp) {
	  ML.console(method, message);   
	}
	return exp;
};


/*************************************************/
/* iDOCS - Doc visualizer & experimentation tool */ 
/*************************************************/
ML.IDOCS = function () {
	
	var that,
	
	// private vars
	docs,  // object references by container ID  

	// private methods
	_docExists,
	// public methods
	create,
	get;
	
	/***********************/
	/*** INITIALIZE VARS ***/
	/***********************/
	docs = [];

	/***********************/
	/*** PRIVATE METHODS ***/
	/***********************/
	// DOC - function for creating a new DOC instance, attached to a particular DIV on the page
	_docExists = function (containerID) {  
		var exists = false;
		if (typeof docs[containerID] === 'object')
			exists = true;
			
		return exists;
	}

	/**********************/
	/*** PUBLIC METHODS ***/
	/**********************/
	// creates a DOC object
	/* 	sample config object
		// Array of objects, each representing a tab
		config = {"tabs":[
			{
				name: 'REST API',					// REQUIRED: name -> name displayed on the tab
				request: {
					method:'GET',
					endpoint: 'http://sbrooks:8003/v1/',
					headers: {},
					params: {}						// object with paramaters to pass to endpoint
				},
				execute: true,						// execute -> whether or not to execute against server
			},
			
			// CURL object purely for display only, not executable
			{
				name: 'CURL',						// REQUIRED: name -> name displayed on the tab
				contents: "curl -X GET 'http://myhost/store?uri=/afternoon-drink.json'",  // REQUIRED: contents -> for display in container
				execute: false						// execute -> whether or not to execute against server
			}			
		]}
	*/

	// Creates a single IDOC object in the UI, wired to a valid container ID
	create = function (containerID,config) {    
		var doc;
		
		// ensure defaults required variable are defined
		if (!ML.assert((containerID !== undefined),'error','ERROR: ML.IDOCS (create) - required variable "containerID" is undefined')) return false; /* exits ML.IDOCS doc creation */
		if (!ML.assert((config !== undefined),'error','ERROR: ML.IDOCS (create) - required variable "config" is undefined')) return false; /* exits ML.IDOCS doc creation */
		if (!ML.assert((config.tabs !== undefined),'error','ERROR: ML.IDOCS (create) - the "tabs" array in "config" is undefined')) return false; /* exits ML.IDOCS doc creation */
		if (!ML.assert((config.tabs.length !== 0),'error','ERROR: ML.IDOCS (create) - the "tabs" array is empty')) return false; /* exits ML.IDOCS doc creation */
		if (!ML.assert(($(containerID).length !== 0),'error','ERROR: ML.IDOCS (create) - the passed "containerID" does not exist')) return false; /* exits ML.IDOCS doc creation */
		if (!ML.assert(($(containerID).length === 1),'error','ERROR: ML.IDOCS (create) - the passed "containerID" is defined more than once.  Ensure the identifier is unique.')) return false; /* exits ML.IDOCS doc creation */
		if (!ML.assert((!_docExists(containerID)),'error','ERROR: ML.IDOCS (create) - the doc you are attempting to create for "' + containerID + '" already exists.')) return false; /* exits ML.IDOCS doc creation */
		
		// create new doc object
		docs[containerID] = function () { 
			var doc,
				_getInputValuesAsJSON,
				_generateInputs,
				_saveFormValues,
				display,
				execute;
			
			// set defaults
			/* public variables */
			doc = {};			
			doc.containerID = containerID;
			doc.container = $(containerID);
			doc.config = config;
			/* public functions */
			doc.display = display;
			doc.execute = execute;
			
			/*** returns a JSON object with name value pairs based on form input values.  Used with params and headers input forms. ***/
			_getInputValuesAsJSON = function(container) {
				var inputJSON;
				
				inputJSON = {};
				$.each(container.find('input'), function(name, value) {
					inputJSON[$(this).attr("name")] = $(this).val();
				});
				
				return inputJSON;
			};
			
			/*** returns a table DOM object, generated from the JSON object passed in, with name value pair properties. ***/
			_generateInputs = function(formObj) {
				var table;
				
				table = $('<table><thead><tr><th>Name</th><th>Value</th></tr></thead><tbody></tbody></table>');
				
				$.each(formObj, function(name, value) {		
					table.find('tbody').append('<tr><td class="name">' + name + '</td><td class="parameter"><input value="' + value + '" name="' + name + '"></td></tr>');
				});
				
				return table;
			};
			
			
			_saveFormValues = function() {
				var currentTabConfig = doc.config.tabs[doc.currentTab];
				if (doc.container.find('.params').length > 0) {
					currentTabConfig.request.params = _getInputValuesAsJSON(doc.container.find('.params'));
				}
				
				if (doc.container.find('.headers').length > 0) {
					currentTabConfig.request.headers = _getInputValuesAsJSON(doc.container.find('.headers'));
				}
				
				if (doc.container.find('.body').length > 0) {
					currentTabConfig.request.body = doc.container.find('.body textarea').val();
				}			
				
			};
			
			/*** Public iDOC functions ***/
			display = function(currentTab) {
				var currentTabConfig;
				if (!ML.assert((containerID !== undefined),'error','ERROR: ML.IDOCS (displayTab) - required variable "containerID" is undefined')) return false; 
				if (!ML.assert((currentTab !== undefined),'error','ERROR: ML.IDOCS (displayTab) - required variable "currentTab" is undefined')) return false;
				if (!ML.assert((currentTab >= 0),'error','ERROR: ML.IDOCS (displayTab) - required variable "currentTab" is not a valid array location')) return false;
				
				if (!ML.assert((doc.config.tabs[currentTab] !== undefined),'error','ERROR: ML.IDOCS (displayTab) - "currentTab" ' + currentTab + ' is not valid array location')) return false; /* exits ML.IDOCS doc creation */
				
				doc.currentTab = currentTab;
				currentTabConfig = doc.config.tabs[currentTab];
				doc.container.find('.tabs li').removeClass('selected'); 			// deselect all tabs
				$(doc.container.find('.tabs li')[currentTab]).addClass('selected');	// select current tab
				
				// clear display container HTML
				doc.container.find('.input').html('');
				doc.container.find('.output').html('');
				
				// if there is a request object, display the request UI, otherwise, show 
				if (currentTabConfig.request !== undefined) {
					// request UI
					doc.container.find('.input').append('<div class="request"><div class="info"><p><span class="method">' + (currentTabConfig.request.method || "") + '</span> <span class="uri">' + (currentTabConfig.request.endpoint || "") + '</span></p><p class="description">' + (currentTabConfig.request.description || "") + '</p></div>');					
					
					// UI for request headers, if headers passed
					if (currentTabConfig.request.params !== undefined) {
						doc.container.find('.request').append('<form></form>');
						
						// UI for params, if params passed
						if (currentTabConfig.request.headers !== undefined && (Object.keys(currentTabConfig.request.headers).length > 0)) {
							doc.container.find('.request form').append('<div class="headers"></div>');
							doc.container.find('.headers').append('<h2 class="idoc-header">Headers</h2>');
							doc.container.find('.headers').append(_generateInputs(currentTabConfig.request.headers));
						}
						
						if (currentTabConfig.request.params !== undefined && (Object.keys(currentTabConfig.request.params).length > 0)) {
							doc.container.find('.request form').append('<div class="params"></div>');
							doc.container.find('.params').append('<h2 class="idoc-header">Params</h2>');
							doc.container.find('.params').append(_generateInputs(currentTabConfig.request.params));
						}
						
						if (currentTabConfig.request.body !== undefined) {
							doc.container.find('.request form').append('<div class="body"></div>');
							doc.container.find('.body').append('<h2 class="idoc-header">Body</h2>');
							doc.container.find('.body').append('<textarea>' + currentTabConfig.request.body + '</textarea>');
						}
						
						doc.container.find('.request form').append('<input type="submit" class="button execute" value="Execute">');
					}
					
					doc.container.find('.output').append('<h2 class="idoc-header">Request URI</h2><div class="request-uri output-info"></div>');
					doc.container.find('.output').append('<h2 class="idoc-header">Response Code</h2><div class="response-code output-info"></div>');
					doc.container.find('.output').append('<h2 class="idoc-header">Response Headers</h2><div class="response-headers output-info"></div>');
					doc.container.find('.output').append('<h2 class="idoc-header">Response Body</h2><div class="response-body output-info"></div>');
					
					doc.container.find('.execute').addClass('show');  				// displays execute button					
				} else {
					// simple sample content display UI
					doc.container.find('.input').append('<textarea class="content"></textarea>');
					doc.container.find('.execute').removeClass('show');  // displays execute button
					doc.container.find('textarea').val(currentTabConfig.contents);
					// TODO:  Add any CodeMirror related wiring here for highlighting
				}

			};

			execute = function () {
				var currentTabConfig = doc.config.tabs[doc.currentTab];				
				_saveFormValues();
				
				currentTabConfig.requestObj = ML.REQUEST(currentTabConfig.request.method, currentTabConfig.request.endpoint, 'json', currentTabConfig.request.headers, currentTabConfig.request.params, currentTabConfig.request.body);
				
				// clear previous output
				doc.container.find('.output .output-info').html('');
				// show output pane
				doc.container.find('.output').addClass('show');
				// reveal spinners
				doc.container.find('.output').addClass('loading');
		
				currentTabConfig.requestObj.execute( function(data,headers){	
					// hide spinners
					doc.container.find('.output').removeClass('loading');		

					// TODO:  Set HTML output with response information
					// TODO:  Add error handling
					alert('executeCallback');
				});
			};
			/*** END Public iDOC functions ***/
			
			/*** RENDER UI ***/

			// create UI for the tabs
			if (doc.config.tabs.length > 0) {
				doc.container.append('<ul class="tabs"></ul><div class="input"></div><div class="output"></div>');
				$.each(doc.config.tabs, function(key, value) {			
					if (!ML.assert((value.name !== undefined),'error','ERROR: ML.IDOCS (create) - the required property "name" in "config" tabs array location: ' + key + ' is undefined')) return false; /* exits ML.IDOCS doc creation */
					doc.container.find('.tabs').append('<li id="' + doc.container.attr('id') + key + '">' + value.name + '</li>');
				});
				
				// default display of first tab
				display(0);
			} else {
				doc.container.append("<p>ERROR: ML.DOC misconfigured.  No tabs to render");
			}
			/*** END RENDER UI ***/
			
			
			/******* iDOC INTERACTIONS ******/
			// TAB CLICK
			doc.container.delegate(".tabs li", "click", function(event){	
				var tabToDisplay = $(this).attr('id').replace(doc.container.attr('id'),'');
				_saveFormValues();
				doc.container.find('.output').removeClass('show');
				display(tabToDisplay);
			});
			
			// EXECUTE BUTTON CLICK
			doc.container.delegate(".execute", "click", function(event){	
				execute();
				return false; // don't submit form
			});
			/******* END iDOC INTERACTIONS ******/
			
			return doc;
		}();
		
		
	};

	// returns an existing DOC object
	get = function (containerID) {    
		var requestedDoc;
		if (docs[containerID] !== undefined)
			requestedDoc = docs[containerID];
		return requestedDoc;
	};

	that = {
		create: create,
		get: get
	};
	return that;

}();


ML.REQUEST = function (method, uri, dataType, headers, params, body) {
'use strict';
// method 			- (required) "GET","POST","PUT","DELETE"
// uri 				- (required) path to request endpoint  (cross-site requests not supported in v.1)
// dataType 		- (optional) expected response data type (default: 'json')
// params 			- (optional) object containing URL parameters
// headers 			- (optional) request headers - FORMAT: [{name: value1}, {name: value2}, {name2: valuefoo}]
// body 			- (optional) request body - used with PUT/POST
// callback 		- (optional) callback function executed when request completes successfully.  Response data passed back.

	// protected object for return
	var that,
	
	// private vars
	config,
	methodTypes,
	
	// public methods
	execute,  // execute server request
	set, 	  // set a configuration variable
	
	// private methods
	_getResponseHeaders,
	_serverRequest,
	_addParamsToQueryString,
	_countKeys;
	
	// initialize private variables
	that 					= null; 	// returned for debugging	
	config 					= {};		// REQUEST object configuration
	// request defaults 
	config.params			= {};		
	config.params.format	= 'json';
	config.params.view		= 'all';
	config.params.options	= 'all';
	
	methodTypes 			= ["GET","POST","PUT","DELETE"];
	
	// ensure defaults required variable are defined
	if (!ML.assert((method !== undefined),'error','ERROR: ML.REQUEST - required variable "method" is undefined')) return false; /* exits ML.REQUEST creation */
	if (!ML.assert((uri !== undefined),'error','ERROR: ML.REQUEST - required variable "uri" is undefined')) return false; /* exits ML.REQUEST creation */
	if (!ML.assert(($.inArray(method,methodTypes) !== -1),'error','ERROR: ML.REQUEST - variable "method" is not an acceptable type ("GET","POST","PUT","DELETE")')) return false; /* exits ML.REQUEST creation */
	
	// create configuration object & extend defaults
	config.method 			= method;
	config.uri 				= uri;	
	config.params 			= $.extend(true, config.params, params);
	config.params.cache 	= new Date().getTime();  // cache-buster	
	config.headers 			= headers;
	config.body 			= body;
	config.dataType 		= (dataType) ? dataType : 'json'; 
	config.callback 		= (typeof callback == "function") ? callback : undefined; 

	/************************************/
	/*** SERVER INTERACTION FUNCTIONS ***/
	/************************************/
	_getResponseHeaders = function (xhr) {
		var getAllResponseHeaders, allHeaders;
		
		getAllResponseHeaders = xhr.getAllResponseHeaders;

		xhr.getAllResponseHeaders = function () {
			if ( getAllResponseHeaders() ) {
				return getAllResponseHeaders();
			} else {
				allHeaders = "";
				$( ["Cache-Control", "Content-Language", "Content-Type",
						"Expires", "Last-Modified", "Pragma"] ).each(function (i, header_name) {

					if ( xhr.getResponseHeader( header_name ) ) {
						allHeaders += header_name + ": " + xhr.getResponseHeader( header_name ) + "\n";
					}
					return allHeaders;
				});
			}
		};
		return xhr;
	};

	_serverRequest = function (callback) {    
		var ajaxObj = {}, requestURI;
		
		config.params.cache 	= new Date().getTime();  // cache-buster	
		
		switch(config.method)
		{
		case 'GET':
			requestURI = config.uri;        
			break;
		case 'POST': 
			requestURI = _addParamsToQueryString(config.uri,config.params);        
			break;
		case 'PUT':
			if (config.body !== undefined) {
				ajaxObj.data = config.body;
			}
			requestURI = _addParamsToQueryString(config.uri,config.params);
			break;
		case 'DELETE':
			requestURI = _addParamsToQueryString(config.uri,config.params);
			break;
		default: 
			break;
		}
		
		// TODO:  Add setting of request headers
		
		$.ajax({
			type: config.method,
			contentType: "text/plain",
			url: requestURI,
			data: config.params,
			dataType: config.dataType,
			success:function(data, textStatus, jqXHR){
				if (callback !== undefined)
					callback(data,_getResponseHeaders(jqXHR));
			},
			error:function(jqXHR, textStatus, errorThrown){ 
				var data = {};
				data.error = {};
				data.error.textStatus = textStatus;
				data.error.errorThrown = errorThrown;					
				if (callback !== undefined)
					callback(data,_getResponseHeaders(jqXHR));
			}
		});    
	};

	_addParamsToQueryString = function (url, params) {
		if (_countKeys(params) > 0) {
			url += "?";
			for(var key in params) {
				if (params[key] !== undefined)
					url += key + "=" + encodeURIComponent(params[key]) + "&";
			}
			// remove final '&'
			url = url.substr(0,url.length - 1);
		}
		return url;
	};

	_countKeys = function (obj) {
		if (obj.__count__ !== undefined) {
			return obj.__count__;
		}

		var c = 0, p;
		for (p in obj) {
			if (obj.hasOwnProperty(p)) {
				c += 1;
			}
		}

		return c;
	};	
	/****************************************/
	/*** END SERVER INTERACTION FUNCTIONS ***/
	/****************************************/
	
	
	/**********************/
	/*** PUBLIC METHODS ***/
	/**********************/
	// execute server request
	set = function (configName,configValue) {    
		// no need for undefined check as the user may way to set to undefined
		config[configName] = configValue;  
	};
	
	// execute server request
	execute = function (callback) {    
		_serverRequest(function(data,headers) {
			if (callback !== undefined)
				callback(data,headers);
		});   
	};

	that = {
		set: set,
		execute:execute
	};
	return that;
};