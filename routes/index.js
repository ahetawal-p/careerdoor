var express = require('express');
var router = express.Router();
const scrapeIt = require("scrape-it");
var fs = require('fs');
var path = require('path');
var cheerio = require("cheerio");
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'careerDoor'});


/* GET home page. */
router.get('/', function(req, res, next) {


	var options = {
  		url: 'https://www.careercup.com/question?id=4827659935678464',
  		headers: {
    		'user-agent': 'Mozilla/5.0'
  		}
	};

		// Promise interface
	scrapeIt(options, {
	    commentCount: ".commentCount",
	    questionText: {
	    	selector: ".entry > a > p",
	    	how: "html"
	    },
	    questionAuthor: {
	    	selector: ".entry > .author > a",
	    	how: "text"
	    },
	    questionTime: {
	    	selector: ".entry > .author > .timeago",
	    	attr: 'title'
	    }
	}).then(page => {
	    console.log(page);
	    res.render('index', { title: 'Express' });

	});
});


/* GET home page. */
router.get('/local', function(req, res, next) {
	fs.readFile(path.join(__dirname, "..", 'sample.html'), 'utf8', function(err, contents) {
		var $ = cheerio.load(contents);

	    var scrapedData = scrapeIt.scrapeHTML($, {
					    commentCount: ".commentCount",
					    questionText: {
					    	selector: ".entry > a > p",
					    	how: "html"
					    },
					    questionAuthor: {
					    	selector: ".entry > .author > a:first-child",
					    	how: "text"
					    },
					    questionTime: {
					    	selector: ".entry > .author > .timeago",
					    	attr: 'title'
					    }
					});
	    log.info(scrapedData);
	   res.render('index', { title: scrapedData.questionText });
	});


});





module.exports = router;
