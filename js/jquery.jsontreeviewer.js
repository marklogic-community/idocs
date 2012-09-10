/* 
 *
 */
;(function($)
{
	var ML = ML || {};
	ML.IDOCS = ML.IDOCS || {};
	
	// JSON VISUALIZATION
    ML.IDOCS.JSONVIEWER =
    {
        settings: {},
		
        init: function() { 
			var _this = this;	
		},
		
		/*Load the JSON file either by upload or example file and process tree*/
		processJSONTree: function(filename) {
			$('#loading').show();
			var data = '', branches = '';
			if (filename === 'copyandpastejson') {
				var copypastejson = $('#copyandpastejson').val();
				/*validate JSON*/
				if (ML.IDOCS.JSONVIEWER.isValidJSON(copypastejson)) { 
					data = copypastejson;
				} else { return false; }
				if (data === false) { return false; }
				/*Build JSON Tree*/
				ML.IDOCS.JSONVIEWER.buildTree(ML.IDOCS.JSONVIEWER.processNodes(jQuery.parseJSON(data),true), filename);
			} else {
				//get the JSON file from file upload
				$.ajax({
					type: 'GET',
					url: filename,
					async: false,
					beforeSend: function(x) {
						if(x && x.overrideMimeType) {
							x.overrideMimeType('application/j-son;charset=UTF-8');
						}
				 },
				 dataType: 'json',
				 success: function(data){
					/*Build JSON Tree*/
					ML.IDOCS.JSONVIEWER.buildTree(ML.IDOCS.JSONVIEWER.processNodes(data), filename);
				 },
				 error: function(e){
					/*Invalid JSON*/
					alert('Invalid JSON: ' + e.responseText);
					ML.IDOCS.JSONVIEWER.showErrorMsg();
					return false;
				 }
				});
			}
		},
		
		/*counts # of children in JSON obj*/
		numOfChildren: function(obj) {
			var num 	= 0, 
				count 	= 0;
			$.each(obj, function(){	count++; });
			return count;
		},
		
		/*Build JSON Tree*/
		buildTree: function(branches, filename) {
			//console.log('branches' + branches);
			if (typeof branches !== 'undefined' || branches !== '') {
				$('#browser').empty().html(branches);
				$('#browser').treeview({
					control: '#treecontrol',
					add: branches
				});
			} 
		},
		
		/*Process each node by its type (branch or leaf)*/
		processNodes: function(node,last) {
			var return_str 	= '',
				nodeLen 	= ML.IDOCS.JSONVIEWER.numOfChildren(node);
			switch(jQuery.type(node))
			{
			case 'string':
				return_str += '<ul><li><span class="file">"'+node+'"' + ((last) ? '':',') + '</span></li></ul>';
				break;
			case 'array':
				return_str += '<span class="array-bracket">[</span>';
				var arrayCount = 0;
				$.each(node, function(item,value){
					arrayCount = arrayCount + 1;
					return_str += ML.IDOCS.JSONVIEWER.processNodes(this,((arrayCount == nodeLen) ? true : false));
				});
				return_str += '<span class="array-bracket-close">]</span>';
			  break;
			default:
				/*object*/
				$.each(node, function(item,value){
					if ($('#hierarchy_chk').is(':checked')) {
						return_str += '<ul><span class="obj-bracket">{</span><li><span class="folder">"'+item+'":</span>';
						return_str += ML.IDOCS.JSONVIEWER.processNodes(this);
						return_str += '</li><span class="obj-bracket">}' + ((last) ? '':',') + '</span></ul>';
					} else {
						return_str += ML.IDOCS.JSONVIEWER.processNodes(this);
					}
				});
			}
			/*Clean up any undefined elements*/
			return_str = return_str.replace('undefined', '');
			return return_str;
		},
						
		/*Helper function to check if JSON is valid*/
		isValidJSON: function(jsonData) {
			try {
				jsonData = jQuery.parseJSON(jsonData);
				//console.log('valid json');
				return true;
			}
			catch(e) {
				//console.log('invalid json');
				alert(e);
				ML.IDOCS.JSONVIEWER.showErrorMsg();
				return false;
			}
		},
		
		/*Helper function to show error message*/
		showErrorMsg: function() {
			$('#selected_filename').html('<span style="color:red;">Please try again. <a target="_blank" href="http://www.jsonlint.com/">Validate your JSON</a></span>');
			$('#loading').hide();
			$('#browser').empty();
		}
	}
	
	
		
	/*load copy and paste json*/
	$('#loadcopyandpaste').live('click',function(){
		var pastedJson = $('#copyandpastejson').val();
		if (pastedJson !== '') {
			ML.IDOCS.JSONVIEWER.processJSONTree('copyandpastejson');
		} else {
			alert('Add JSON into the textarea');
		}
		ML.IDOCS.JSONVIEWER
	});
	
	ML.IDOCS.JSONVIEWER.init();

})(jQuery);