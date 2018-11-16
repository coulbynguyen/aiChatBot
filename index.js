const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

let factsDBrawdata = fs.readFileSync('./knowledge/facts.json');
let factsDB = JSON.parse(factsDBrawdata);

let opinionsDBrawdata = fs.readFileSync('./knowledge/opinions.json');
let opinionsDB = JSON.parse(opinionsDBrawdata);

const app = express();
const port = 52222;
app.use(bodyParser.json());

function getQuestionResponse(req,res,sentiment){
  var topic = req.body.conversation.memory.questiontopic.value;
  var relevant = [];
  var relevantCount = 0;

  for(var i = 0; i < Object.keys(opinionsDB).length; i++){
    if(opinionsDB[i].body.search(topic) != -1){
      relevant.push(opinionsDB[i]);
      relevantCount += 1;
    }
  }

  if(relevantCount == 0){
    var randomOpinionIdx = Math.floor(Math.random() * Object.keys(opinionsDB).length);
    res.json({
		    replies: [
			       {type: 'text', content: 'I dont know anything about that but, ' + opinionsDB[randomOpinionIdx].body}
		         ]
	  });
  }
  else{
    var opinionIdx = Math.floor(Math.random() * relevantCount);
    res.json({
      replies: [
        {type: 'text', content: 'In regards to ' + topic + ', ' + relevant[opinionIdx].body}
      ]
    });
  }
}

function getFactResponse(req,res){
  var topic = req.body.conversation.memory.facttopic.value;
  var relevant = [];
  var relevantCount = 0;

  for(var i = 0; i < Object.keys(factsDB).length; i++){
    if(factsDB[i].body.search(topic) != -1){
      relevant.push(factsDB[i]);
      relevantCount += 1;
    }
  }
  if(relevantCount == 0){
    var randomFactIdx = Math.floor(Math.random() * Object.keys(factsDB).length);
    res.json({
		    replies: [
			       {type: 'text', content: 'I couldnt find anything on ' + topic + ' so here is this random fact, according to: ' + factsDB[randomFactIdx].source + ', ' + factsDB[randomFactIdx].body}
		         ]
	 });
  }
  else{
    var factIdx = Math.floor(Math.random() * relevantCount);
    res.json({
      replies: [
        {type: 'text', content: 'In regards to ' + topic + ', according to: ' + relevant[factIdx].source + ', ' + relevant[factIdx].body}
      ]
    });
  }
}

function addOpinion(req,res,sentiment){
  opinionsDB.push({"id":"opinion", "sentiment": sentiment, "body": req.body.conversation.memory.opinioncontent.value});
  let newOpinionDB = JSON.stringify(opinionsDB, null, 2);
  fs.writeFileSync('./knowledge/opinions.json', newOpinionDB);
  res.json({
		replies: [
			{type: 'text', content: 'Thank you for the opinion it will be stored, this is the server'}
		]
	});
}

function addFact(req,res){
  factsDB.push({"id":"fact", "source": "Reddit User", "body": req.body.conversation.memory.factcontent.value});
  let newFactDB = JSON.stringify(factsDB, null, 2);
  fs.writeFileSync('./knowledge/facts.json', newFactDB);
  res.json({
		replies: [
			{type: 'text', content: 'Thank you for the fact it will be store, this is the server'}
		]
	});
}

function addFactWithSource(req,res){
  factsDB.push({"id":"fact", "source": req.body.conversation.memory.source.value, "body": req.body.conversation.memory.factcontent.value});
  let newFactDB = JSON.stringify(factsDB, null, 2);
  fs.writeFileSync('./knowledge/facts.json', newFactDB);
  res.json({
		replies: [
			{type: 'text', content: 'Thank you for the fact it will be store, this is the server'}
		]
	});
}

//returns an response to a question about topic
app.post('/ask-vpos-question', function(req,res){
  getQuestionResponse(req,res,2);
});
app.post('/ask-pos-question', function(req,res){
  getQuestionResponse(req,res,1);
});
app.post('/ask-neutral-question', function(req,res){
  getQuestionResponse(req,res,0);
});
app.post('/ask-neg-question', function(req,res){
  getQuestionResponse(req,res,-1);
});
app.post('/ask-vneg-question', function(req,res){
  getQuestionResponse(req,res,-2);
});

//returns a fact about topic
app.post('/ask-fact', getFactResponse);

//adds opinions
app.post('/add-vpos-opinion', function(req,res){
  addOpinion(req,res,2);
});
app.post('/add-pos-opinion', function(req,res){
  addOpinion(req,res,1);
});
app.post('/add-neutral-opinion', function(req,res){
  addOpinion(req,res,0);
});
app.post('/add-neg-opinion', function(req,res){
  addOpinion(req,res,-1);
});
app.post('/add-vneg-opinion', function(req,res){
  addOpinion(req,res,-2);
});

//adds facts
app.post('/add-fact', addFact);

app.post('/add-fact-w-source', addFactWithSource);


app.post('/errors', (req, res) => {
  console.log(req.body)
  res.send()
});

app.listen(port, () => {
  console.log('Server is running on port 52222')
});
