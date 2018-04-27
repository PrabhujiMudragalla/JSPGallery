const express = require('express');
const multiparty = require('connect-multiparty');
const multipartyMiddleware = multiparty();

const app = express();
const path = require('path');
const Q = require('q');
const fs = require('fs');
const async = require('async');
const MongoClient = require('mongodb').MongoClient;
const MongoQueryString = 'mongodb://localhost';

 


app.use(function (req, res, next) {
    next();
}, express.static(path.join(__dirname, './')));
 
app.post('/upload', multipartyMiddleware, function(req, res) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');
 if(req.files.file && req.files.file.length>0){
	 var files = [];
	 
	 async.eachSeries(req.files.file, function(file, callback){
		 
		 var tempPath = file.path,
        targetPath = __dirname + "\/uploads\/" + path.parse(file.originalFilename).name + '-' + Date.now() + path.extname(file.originalFilename);

    fs.rename(tempPath, targetPath, function (err) {
        if (err) { res.send({ status: "error", message: err }); }
        else {
            /*            fs.unlink(tempPath, function () {
                            if (err) throw err;
                        });*/
					files.push(targetPath);
				console.log("files length ", files.length);	
					
        }
    });
	callback();
	 }, function(err){
		 saveToDB({title: req.body.cname, images: files, created: new Date()});
		 setTimeout(function(){res.send({title:req.body.cname, files: files})},1000);
	 })
	 
 }else{
	 
  var tempPath = req.files.file.path,
        targetPath = __dirname + "\/uploads\/" + path.parse(req.files.file.originalFilename).name + '-' + Date.now() + path.extname(req.files.file.originalFilename);

    fs.rename(tempPath, targetPath, function (err) {
        if (err) { res.send({ status: "error", message: err }); }
        else {
            /*            fs.unlink(tempPath, function () {
                            if (err) throw err;
                        });*/
						
						saveToDB({title: req.body.cname, images: files, created: new Date()});
           setTimeout(function(){res.send({title:req.body.cname, files: files})},1000);
        }
    });
 }
});

app.post('/images', function(req, res){
	MongoClient.connect(MongoQueryString, function (err, client) {
        if (err) {
			
            res.send({status:"error", message:err});
        } else {
			var db = client.db('gallery');
			
			db.collection('gallery').find({}).toArray( function (error, success) {
                        if (error) {
							
                           res.send({status:"error", message:error});
                        } else {
							
                            res.send({status:"success", message:success});
                        }
        
                    })
		}
	})
})

function saveToDB(data){
	let deferred = Q.defer();
	MongoClient.connect(MongoQueryString, function (err, client) {
        if (err) {
			
            deferred.reject(err);
        } else {
			var db = client.db('gallery');
			
			db.collection('gallery').save(data, function (error, success) {
                        if (error) {
							
                            deferred.reject(error);
                        } else {
							
                            deferred.resolve(success);
                        }
        
                    })
		}
	})
	return deferred.promise;
}

app.listen(3002, function(err){
	if(err){
	console.log(err);
} else {
	console.log("server is running on 3002");
}
});
