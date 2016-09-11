var express = require('express');
var router = express.Router();
const scrapeIt = require("scrape-it");
var fs = require('fs');
var path = require('path');
var cheerio = require("cheerio");
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'careerDoor'});
var _ = require("underscore");
var util = require('util');


/* GET home page. */
router.get('/', function(req, res, next) {

var link1 = 'https://www.careercup.com/question?id=4827659935678464';
var link2 = 'https://www.careercup.com/question?id=5679897813975040';
var link3 = 'https://www.careercup.com/question?id=5713658404405248';

	var options = {
  		url: link3,
  		headers: {
    		'user-agent': 'Mozilla/5.0'
  		}
	};

		// Promise interface
	scrapeIt(options, {
			    commentCount: ".commentCount",
			    questionText: {
			    	selector: ".entry > a",
			    	how: ansExtractor
			    },
			    questionAuthor: {
			    	selector: ".entry > .author > a:first-child",
			    	how: "text"
			    },
			    questionTime: {
			    	selector: ".entry > .author > .timeago",
			    	attr: 'title'
			    },
			    answers: {
		            listItem: ".comment",
		            data: {
		                votesNet: ".votesNet",
		                votesCount: ".votesCount > span",
		                answerBody: {
		                    selector: "div.commentMain > div.commentBody > *:not(.author)",
		                   	how: ansExtractor
		                },
		                answerTime: {
		                	selector: ".commentBody > .author > .timeago",
			    			attr: 'title'
		                }
		            }
		        }
		}).then(page => {
		    log.info(page);
		    res.render('index', { title: 'Express' });

		});
});


var ansExtractor = function(answerBody){
	var fullHtml = "";
	var tester = cheerio.load(answerBody);

	answerBody.each(function(){
		//console.log(tester(this).wrap('<p>').parent().html())
		fullHtml += tester(this).wrap('<p>').parent().html();
	});
	return fullHtml;
};

router.get('/qload', function(req, res, next) {
	fs.readFile(path.join(__dirname, "..", 'sample.json'), 'utf8', function(err, contents) {
		  if (err) throw err;
		  var questionData = JSON.parse(contents);
		  var questionImageUrl = "https://www.careercup.com/attributeimages/%s-interview-questions.png"
		  _.each(questionData, function(questionPage){
		  		_.each(questionPage.result.extractorData.data, function(question){
		  			_.each(question.group, function(questionDetail){
		  				var questionModel = {};
		  				questionModel["Tags"] = [];
		  				questionModel["Company Name"] = questionDetail["Tags links"][0].text;
		  				questionModel["PostTime"] = questionDetail["Timeago value"][0].text;
		  				questionModel["AnswersCount"] = questionDetail["Answers"][0].text;
		  				questionModel["NetVotesCount"] = questionDetail["Votesnetquestion number"][0].text;
		  				questionModel["TotalVotesCount"] = questionDetail["total votes"][0].text;

		  				_.each(questionDetail["Entry link"], function(questionLink){
		  					var qurl = questionLink.href;
			  				var questionQuery = require('url').parse(qurl,true).query;
			  				questionModel["Url"] = qurl;
			  				questionModel["Text"] = questionLink.text;
			  				questionModel["Id"] =  questionQuery.id;
		  				});
		  				_.each(questionDetail["Tags links"], function(tag, index){
		  					if (index === 0){
		  						// skip first index as it contains exact company name
		  						questionModel["Company Logo"] = util.format(questionImageUrl, tag.text).toLowerCase();
		  					} else {
		  						questionModel["Tags"].push(tag.text);
		  					}
		  				});
		  				log.info(questionModel);
		  			});
		  		});
		  });
		  res.send(questionData[0].url);
	});
});	


/* GET home page. */
router.get('/local', function(req, res, next) {
	fs.readFile(path.join(__dirname, "..", 'sample2.html'), 'utf8', function(err, contents) {
		var $ = cheerio.load(contents, {
  				decodeEntities: false
  		});

		var scrapedData = scrapeIt.scrapeHTML($, {
					    commentCount: ".commentCount",
					    questionText: {
					    	selector: ".entry > a",
					    	how: ansExtractor
					    },
					    questionAuthor: {
					    	selector: ".entry > .author > a:first-child",
					    	how: "text"
					    },
					    questionTime: {
					    	selector: ".entry > .author > .timeago",
					    	attr: 'title'
					    },
					    answers: {
                            listItem: ".comment",
                            data: {
                                votesNet: ".votesNet",
                                votesCount: ".votesCount > span",
                                answerBody: {
                                    selector: "div.commentMain > div.commentBody > *:not(.author)",
                                    how: ansExtractor
                                },
                                answerTime: {
                                	selector: ".commentBody > .author > .timeago",
					    			attr: 'title'
                                }
                            }
                        }
					});
	   log.info(scrapedData.questionText);
	   res.render('index', { title: scrapedData.questionText });
	});


});
module.exports = router;
