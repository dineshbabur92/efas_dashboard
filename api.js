var bodyparser = require("body-parser");
var httpstatus = require("http-status");
var express = require("express");
var underscore = require("underscore");
var queries_base = require("./to_drive/data/queries");
module.exports = function(wagner){

	api = express.Router();


	api.get("/", function(req, res){
		res.sendFile("/client/index.html");
		// res.json({message: "hello world!"});
	});

	api.get("/testing", function(req, res){
		res.sendFile(__dirname + "/blur-admin/src/index.html");
		// res.json({message: "hello world!"});
	});

	// fehlerspeicher.steuergeraet_sgbd
	// fehlerspeicher.fehler_ort_hex
	// fehlerspeicher.flag_ereignis_dtc
	// fehlerspeicher.fehlerspeicher_art
	// fahrzeugdaten.baureihe
	// fahrzeugdaten.fgnr 
	// fahrzeugdaten.I_stufe_ho
	// fehlerspeicher.auslese_datum
	// hour(fehlerspeicher.auslese_datum)

	var filterFieldMapping = {

		"SGBD": "fehlerspeicher.steuergeraet_sgbd",
		"FSP Hex Code": "fehlerspeicher.fehler_ort_hex",
		"IS DTC": "fehlerspeicher.flag_ereignis_dtc",
		"DTC Incident": "fehlerspeicher.fehlerspeicher_art",
		"Serie": "fahrzeugdaten.baureihe",
		"VIN": "fahrzeugdaten.fgnr",
		"I Step": "fahrzeugdaten.I_stufe_ho",
		"Date": "fehlerspeicher.auslese_datum",
		"Hour": "hour(fehlerspeicher.auslese_datum)",
		"FSP_Entry": "fehlerspeicher.fehler_ort_text",
		"I_Step": "SUBSTRING_INDEX(SUBSTRING_INDEX(fahrzeugdaten.I_stufe_ho, '-', 3),'-',-2)",
		"VIN": "fahrzeugdaten.fgnr"
	}

	var filterFieldMapping_3 = {

		"SGBD": "steuergeraet_sgbd",
		"FSP Hex Code": "fehler_ort_hex",
		"IS DTC": "flag_ereignis_dtc",
		"DTC Incident": "fehlerspeicher_art",
		"Serie": "baureihe",
		"VIN": "fgnr",
		"I Step": "I_stufe_ho",
		"Date": "auslese_datum",
		"Hour": "hour(auslese_datum)",
		"FSP_Entry": "fehler_ort_text",
		"I_Step": "i_step",
		"VIN": "fgnr"
	}

	function appendConditions(query, filters, fieldMapping){
		for(var i in filters){
			if(filters[i].length===0)
				continue;
			if(i==="Date" || i==="Hour"){
				query = query + " and " + fieldMapping[i] + " between " + (i==="Date" ? "'" : "") + filters[i][0] + (i==="Date" ? "'" : "") + " and "  + (i==="Date" ? "'" : "") + filters[i][1] + (i==="Date" ? "'" : "");
				continue;
			}
			query_values = "";
			for(var j in filters[i]){
				if(j==0){
					query_values = "'" + filters[i][j] + "'";
					continue;
				}
				query_values += ",'" + filters[i][j] + "'";
			}
			query = query + " and " + fieldMapping[i] + " in (" + query_values + ")"
		}
		// console.log(query);
		return query;
	}
	
	api.post("/report",wagner.invoke(function(db){
		return function(req, res){
			var queries = {};
			for(var i in queries_base){
				queries[i] = queries_base[i];
			}
			for(var i in queries){
				if(i==="chart5")
				{
					queries[i] =  queries[i][0] + appendConditions(queries[i][1], {
							"Date": req.body.filters["Date"] ? req.body.filters["Date"] : [], 
							"Hour": req.body.filters["Hour"] ? req.body.filters["Hour"] : []
						}, filterFieldMapping);
					continue;
				}
				queries[i] = queries[i][0] + appendConditions(queries[i][1], req.body.filters, filterFieldMapping) + queries[i][2];
			}
			console.log(queries.chart1);
			var all_results = {};
			// console.log("Querying for chart 1: " + queries.chart1);
			db.query(queries.chart1, function (error, results, fields) {
				// console.log("chart1 error: "+ error + "chart1 results: " + results);
				if (error){
					res.json({message: "chart1 error"});
					return;
				}
				all_results.chart1 = results;
				res.json({
					results: all_results,
					titles: {
						chart1: "Top 20 FSP-Einträge pro 1000 KM"
					},
					category_fields: {
						chart1: "FSP_Entry"
					},
					value_fields: {
						chart1: "Occurences"
					}
				});
			}
		);
	}}));

	api.post("/report_2", wagner.invoke(function(db){
		return function(req, res){
			var queries = {};
			for(var i in queries_base){
				queries[i] = queries_base[i];
			}
			for(var i in queries){
				if(i==="chart5")
				{
					queries[i] =  queries[i][0] + appendConditions(queries[i][1], {
								"Date": req.body.filters["Date"] ? req.body.filters["Date"] : [],
								"Hour": req.body.filters["Hour"] ? req.body.filters["Hour"] : []
							}, filterFieldMapping);
					continue;
				}
				queries[i] = queries[i][0] + appendConditions(queries[i][1], req.body.filters, filterFieldMapping) + queries[i][2];
			}
			console.log(queries.chart2);
			var all_results = {};
			// console.log("Querying for chart 1: " + queries.chart1);
			db.query(queries.chart2, function (error, results, fields) {
				if (error){
					res.json({message: "chart2 error"});
					return;
				}
				all_results.chart2 = results;
				res.json({
					results: all_results,
					titles: {
						chart2: "Aktuelle I-Stufe Verteilung(KW 40)"
					},
					category_fields: {
						chart2: "I_Step",
					},
					value_fields: {
						chart2: "Checkins"
					}
				});
			});
		}}));

	api.post("/report_3", wagner.invoke(function(db){
		return function(req, res){
			var queries = {};
			for(var i in queries_base){
				queries[i] = queries_base[i];
			}
			for(var i in queries){
				if(i==="chart5")
				{
					queries[i] =  queries[i][0] + appendConditions(queries[i][1], {
								"Date": req.body.filters["Date"] ? req.body.filters["Date"] : [],
								"Hour": req.body.filters["Hour"] ? req.body.filters["Hour"] : []
							}, filterFieldMapping);
					continue;
				}
				queries[i] = queries[i][0] + appendConditions(queries[i][1], req.body.filters, filterFieldMapping_3) + queries[i][2];
			}
			console.log(queries.chart3);
			var all_results = {};
			// console.log("Querying for chart 1: " + queries.chart1);
			db.query(queries.chart3, function (error, results, fields) {
				if (error){
					res.json({error: error});
					console.log("error from chart3", error);
					return;
				}
				all_results.chart3 = results;
				res.json({
					results: all_results,
					titles: {
						chart3: "Top 10 gefahrene KM"
					},
					category_fields: {
						chart3: "VIN"
					},
					value_fields: {
						chart3: "KM_Driven"
					}
				});
			});
		}}));

	api.post("/report_4", wagner.invoke(function(db){
		return function(req, res){
			var queries = {};
			for(var i in queries_base){
				queries[i] = queries_base[i];
			}
			for(var i in queries){
				if(i==="chart5")
				{
					queries[i] =  queries[i][0] + appendConditions(queries[i][1], {
								"Date": req.body.filters["Date"] ? req.body.filters["Date"] : [],
								"Hour": req.body.filters["Hour"] ? req.body.filters["Hour"] : []
							}, filterFieldMapping);
					continue;
				}
				queries[i] = queries[i][0] + appendConditions(queries[i][1], req.body.filters, filterFieldMapping) + queries[i][2];
			}
			console.log(queries.chart4);
			var all_results = {};
			// console.log("Querying for chart 1: " + queries.chart1);
			db.query(queries.chart4, function (error, results, fields) {
				if (error){
					res.json({message: "chart4 error"});
					return;
				}
				all_results.chart4 = results;
				res.json({
					results: all_results,
					titles: {
						chart4: "Single Event Fehlerspeicher"
					},
					category_fields: {
						chart4: "FSP_Entry"
					},
					value_fields: {
						chart4: "Checkins",
					}
				});
			});
		}}));

	api.post("/report_5", wagner.invoke(function(db){
		return function(req, res){
			var queries = {};
			for(var i in queries_base){
				queries[i] = queries_base[i];
			}
			for(var i in queries){
				if(i==="chart5")
				{
					queries[i] =  queries[i][0] + appendConditions(queries[i][1], {
								"Date": req.body.filters["Date"] ? req.body.filters["Date"] : [],
								"Hour": req.body.filters["Hour"] ? req.body.filters["Hour"] : []
							}, filterFieldMapping);
					continue;
				}
				queries[i] = queries[i][0] + appendConditions(queries[i][1], req.body.filters, filterFieldMapping) + queries[i][2];
			}
			console.log(queries.chart5);
			var all_results = {};
			// console.log("Querying for chart 1: " + queries.chart1);
			db.query(queries.chart5, function (error, results, fields) {
				if (error){
					res.json({message: "chart4 error"});
					return;
				}
				all_results.chart5 = results;
				res.json({
					results: all_results
				});
			});
		}}));

	api.get("/filters", wagner.invoke(function(db){
		return function(req, res){
		db.query("select filter_json from filters", function (error, results, fields) {
			if (error) throw error;
			res.json({filters: JSON.parse(results[0].filter_json)});
		});
	}}));

	return api;
}
