efasApp.controller("homeController",["$scope", "$log", "$http", "charts", function($scope, $log, $http, charts){

    $scope.filters = {};
    $scope.selectedFilters ={};
    $scope.date_from = "";
    $scope.date_to = "";
    // $scope.search_term = ;

    $scope.charts = charts;
    $scope.$watch('charts.getFilters()', function(newVal) {
	    // console.log("Filters from Chart", newVal);
	    for(var key in newVal){
    		if(!$scope.selectedFilters[key])
    			$scope.selectedFilters[key] = [];
    		if($scope.selectedFilters[key].indexOf(newVal[key])<0)
				$scope.selectedFilters[key].push(newVal[key]);
			$log.log($scope.selectedFilters);
	    }
	    $scope.getReport();
  	}, true);

    $scope.today = new Date();
    $scope.dateFilterOptions = {"Day": 0, "Week": 7, "Month": 30, "Quarter": 90, "Year": 365, "Total": -1};

    $scope.count_vehicles = 0;
    $scope.count_checkins = 0;
    // $scope.isFilterChanged = false;
    // $log.log("requesting /overview, filters: " + $scope.filters);

    $scope.showFilterInfo = function(filter_name, event){
        // if($("#info-popup").css("visibility") === "visible" && 
        //         $("#info-popup").prop("showing-for") === filter_name)
        // {
        //     $("#info-popup").css("visibility", "none");
        //     return;
        // }
        // console.log("info event", event);
        $("#info-popup").text(filter_name);
        $("#info-popup").prop("showing-for", filter_name);
        $("#info-popup").css({"left": $(event.target).offset().left + $(event.target).width(), "top": $(event.target).offset().top, "visibility": "visible"});
    }

    $scope.hidePopup = function(){
        $("#info-popup").css({"visibility": "none"});
    }

    $scope.ignoreHourAndDate = function(filter_name){
    	return filter_name!='Hour' || filter_name!='Date'
    }

    $scope.clearFilters = function(){
    	for(var i in $scope.selectedFilters){
    		delete $scope.selectedFilters[i];
    		$scope.getReport();
    	}
    	$("[id*='-checkbox']").prop("checked", false);
    }
    //not used for now
    $scope.searchFilter = function(filter_name, event){
    	// console.log(filter_name, event);
    	// $("#" + filter_name + "_box div.filter-item-box")
    }

    $scope.toggleLeftPanel = function(){
    	// console.log($("#left-panel").css("left"));
    	if(parseInt($("#left-panel").css("left"))<0){
    		$("#left-panel").css({"left": "0px"});
    		$(".main-holder").css({"left": ($("#filters-container").width() + 3) + "px"});
    		$("#cover").css({"visibility": "visible"});
    		$("#show-filters-button div").html("APPLY");
    	}
    	else{
    		//$("#left-panel").css({"left": "-" + ((300 - $("#show-filters-button").width())  
    		//	+ parseInt($("#show-filters-button").css("margin"))) + "px" });
    		$("#left-panel").css({"left": "-" + ($("#filters-container").width() + 3) + "px" });
    		$(".main-holder").css({"left": "0"});
    		$("#show-filters-button div").html("FILTERS");
    		$("#loader").css({"visibility": "visible"});
    		setTimeout(function () {
			  	$scope.getReport();
			}, 1000);
    		
    	}
    }

    $scope.toggleTopPanel = function(){
    	// console.log($("#top-panel").css("top"));
    	if(parseInt($("#top-panel").css("top"))<0){
    		$("#top-panel").css({"top": "0px"});
    		$(".main-holder").css({"top": ($("#timeline-filter-container").height()) + "px"});
    		$("#cover").css({"visibility": "visible"});
    		$("#show-timeline-filter-button div").html("APPLY");
    	}
    	else{
    		//$("#left-panel").css({"left": "-" + ((300 - $("#show-filters-button").width())  
    		//	+ parseInt($("#show-filters-button").css("margin"))) + "px" });
    		$("#top-panel").css({"top": "-" + ($("#timeline-filter-container").height()) + "px" });
    		$(".main-holder").css({"top": "0"});
    		$("#show-timeline-filter-button div").html("Choose Date and Time");
    		$("#loader").css({"visibility": "visible"});
    		setTimeout(function () {
			  	$scope.getReport();
			}, 1000);
    		
    	}
    }

    $scope.handleDateOption = function(filter){
    	if(filter === "Total"){
    		$scope.selectedFilters["Date"] = [];
    		$scope.getReport();
    		return;
    	}
    	var days = $scope.dateFilterOptions[filter];
    	$scope.selectedFilters["Date"] = [(new Date($scope.today - (days * 24* 60 * 60 * 1000))).getFullYear() + "-" 
    		+ ((new Date($scope.today - (days * 24* 60 * 60 * 1000))).getMonth() + 1) + "-" 
    		+ (new Date($scope.today - (days * 24* 60 * 60 * 1000))).getDate(),
    		$scope.today.getFullYear() + "-" + ($scope.today.getMonth() + 1) + "-" + $scope.today.getDate(),
    		];

    	$scope.getReport();
    }

    $scope.dateOptionSelected = function(elt, event){
    	$scope.handleDateOption(elt.filter);
    	$(event.currentTarget).siblings().css({"background-color": "white", "color": "#3498db", "border-bottom": "none"});
    	$(event.currentTarget).css({"color": "#C2185B", "border-bottom": "3px solid #C2185B"});
    }

    

    $scope.filterChanged = function(elt, event){

    	if(event.target.checked){
    		if(!$scope.selectedFilters[elt.$parent.filter_name])
    			$scope.selectedFilters[elt.$parent.filter_name] = [];
			$scope.selectedFilters[elt.$parent.filter_name].push(elt.item);
			if($scope.selectedFilters[elt.$parent.filter_name].length == $scope.filters[elt.$parent.filter_name].length){
				$scope.selectedFilters[elt.$parent.filter_name] = [];
			}
			// $log.log($scope.selectedFilters);
			// $scope.isFilterChanged = true;
    	}
    	else {
    		if($scope.selectedFilters[elt.$parent.filter_name]){
				let i = $scope.selectedFilters[elt.$parent.filter_name].indexOf(elt.item);
				$scope.selectedFilters[elt.$parent.filter_name].splice(i,1);
                if($scope.selectedFilters[elt.$parent.filter_name].length === 0)
                    delete $scope.selectedFilters[elt.$parent.filter_name];
    		}
			$log.log($scope.selectedFilters);

			if(charts.filters[elt.$parent.filter_name]){
					// let i = charts.filters[elt.$parent.filter_name].indexOf(elt.item);
					// charts.filters[elt.$parent.filter_name].splice(i,1);
					// if(charts.filters[elt.$parent.filter_name].length === 0)
						delete charts.filters[elt.$parent.filter_name];
			}

			// for(let key in $scope.selectedFilters){
			// 	if(! $scope.selectedFilters[key].length == 0){
			// 		$scope.isFilterChanged = true;
			// 		break;
			// 	}
			// }
    	}

    	$scope.getReport();

    }

    $scope.filterRemoved = function(filter_name, filter_item_name){

    		if($scope.selectedFilters[filter_name]){
				let i = $scope.selectedFilters[filter_name].indexOf(filter_item_name);
				$scope.selectedFilters[filter_name].splice(i,1);
				if($scope.selectedFilters[filter_name].length === 0)
					delete $scope.selectedFilters[filter_name];
				$("[id='" + filter_name + "-" + filter_item_name + "-" + "checkbox']").prop("checked", false);

				if(charts.filters[filter_name]){
					// let i = charts.filters[filter_name].indexOf(filter_item_name);
					// charts.filters[filter_name].splice(i,1);
					// if(charts.filters[filter_name].length === 0)
						delete charts.filters[filter_name];
				}
    		}
    		else{
    			console.log("error removing filters");
    		}
			$log.log($scope.selectedFilters);
			$scope.getReport();

    }

    $scope.report_response = {};
    $scope.count = 0;
	$scope.charts_needed = ["chart1", "chart2", "chart3", "chart4", "chart5"];
	$scope.alreadyFilterReceived = 0;

    $scope.$watch('count', function(newVal){
    	console.log("count changed: ", newVal);
    	if(newVal == 5){
    		$("#cover").css({"visibility": "hidden"});
			$("#loader").css({"visibility": "hidden"});

			console.log("overall report response ", $scope.report_response);

			var selectedFiltersArray = [];
	        for(var i in $scope.selectedFilters){
	            if(i=='Hour' || i=='Date')
	                    continue;
	            selectedFiltersArray.push(i + ": " + $scope.selectedFilters[i].join(", "));
	        }

			for(let j in $scope.charts_needed){

				let chart_requested = $scope.charts_needed[j];
				let response = $scope.report_response[chart_requested];

				// console.log("report's response for", chart_requested, response);
				if(chart_requested==="chart2"){
					console.log("calling to create chart for ", chart_requested);
					charts.createChart("pie", {
			    		data: response.data.results[chart_requested],
			    		title: response.data.titles[chart_requested],
			            title_field: response.data.category_fields[chart_requested],
			            value_field: response.data.value_fields[chart_requested],
			            draw_height: .497,
		                selectedFilters: selectedFiltersArray.join("<br/>"),
					color: "#24B8FD"
			    	}, chart_requested);
				}
				else if(chart_requested==="chart5"){
					// console.log("calling to create chart for ", chart_requested);
					$scope.count_checkins = response.data.results.chart5[0].count_checkins;
					$scope.count_vehicles = response.data.results.chart5[0].count_vehicles;
					$scope.date_from = response.data.results.chart5[0].min_date ? response.data.results.chart5[0].min_date.split("T")[0].split("-").join(".") : $scope.selectedFilters["Date"][0];
					$scope.date_to = response.data.results.chart5[0].min_date ? response.data.results.chart5[0].max_date.split("T")[0].split("-").join(".") : $scope.selectedFilters["Date"][1];
				}
				else{
					// console.log("calling to create chart for ", chart_requested);
					charts.createChart("horizontal-bar", {
			    		data: response.data.results[chart_requested],
			            title: response.data.titles[chart_requested],
			            category_field: response.data.category_fields[chart_requested],
			            value_field: response.data.value_fields[chart_requested],
			            draw_height: chart_requested==="chart3" ? .497 : 1,
			            selectedFilters: selectedFiltersArray.join("<br/>"),
					color: "#24B8FD"
			    	}, chart_requested);
				}

			}

			$scope.count = 0;
			if(!$scope.alreadyFilterReceived){
				$scope.getFilters();
				$scope.alreadyFilterReceived = 1;
			}
			
    	}
    });


    $scope.getReport = function(){

  		$("#cover").css({"visibility": "visible"});
		$("#loader").css({"visibility": "visible"});

    	for(var i in $scope.charts_needed)
    	{
    		// console.log("making request for ", charts_needed[i]);
    		let chart_requested = $scope.charts_needed[i];

			$http({
				method: 'POST',
				url: '/report/' + chart_requested,
				data: {filters: $scope.selectedFilters}
			}).then(function(response){

				$scope.report_response[chart_requested] = response;
				$scope.count = $scope.count + 1;

			}).then(function(error){
				$log.log("error: " + error);
			});
    	}
    }

    //load filters
    $scope.getFilters = function(){
    	$("#cover").css({"visibility": "visible"});
		$("#loader").css({"visibility": "visible"});

    	$http({
			method: 'GET',
			url: '/filters'
		}).then(function(response) {
			console.log("filters' response", response);
			// $scope.filters = {
			// 	"SGBD-KIEFA": ["EA", "EF"],
			// 	"SGBD": ["foo1", "foo2"],
			// 	"Serie": ["foo1", "foo2"],
			// 	"VIN": ["foo1", "foo2"],
			// 	"FSP Hex Code": ["foo1", "foo2"],
			// 	"I Step": ["foo1", "foo2"],
			// 	"Building Phase": ["foo1", "foo2"],
			// 	"DTC Incident": ["foo1", "foo2"],
			// 	"IS DTC": ["foo1", "foo2"],
			// 	"CheckIn Flag": ["foo1", "foo2"],
			// 	"E/E Priority": ["foo1", "foo2"]
			// }
			$scope.filters = response.data.filters;

			$("#cover").css({"visibility": "hidden"});
			$("#loader").css({"visibility": "hidden"});

		}).then(function(error){
			$log.log("error: " + error);
		});
    }

    

    // $scope.$watch("selectedFilters['Hours']", function(newValue, oldValue){
    // 	console.log("Hours changed");
    // });

     $( function() {
	    $( "#slider-range" ).slider({
	      range: true,
	      min: 0,
	      max: 24,
	      values: [ 0, 24 ],
	      slide: function( event, ui ) {
	        $( "#hour-range" ).val( ui.values[ 0 ] + " to " + ui.values[ 1 ] );
	        $scope.selectedFilters["Hour"] = ui.values;
	        setTimeout(function(){
	        	$scope.getReport();
	        },750);
	      }
	    });
	    $( "#hour-range" ).val( $( "#slider-range" ).slider( "values", 0 ) +
	      " to " + $( "#slider-range" ).slider( "values", 1 ) );
	  } );


   //   $scope.setupLayout = function(){
   //   	$("#top-panel").css({"top": "-" + ( $("#timeline-filter-container").height() + 20) + "px" });
   //   	$("#left-panel").css({"left": "-" + ($("#filters-container").width() + 10) + "px" });
   //   	setTimeout(function(){
		 //    $("#cover").css({"visibility": "hidden", "z-index": "50" });
		 // 	$("#loader").css({"visibility": "hidden", "z-index": "50" });
	 	// }, 1000);
     	
   //   }

     // $scope.setupLayout();
     
     // setTimeout(function(){
     	// $scope.getFilters();
		// $scope.getReport();
     // }, 10000);
	

}]);