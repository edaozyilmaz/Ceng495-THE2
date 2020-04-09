var express = require('express');
var router = express.Router();
var mongoClient = require('mongodb').MongoClient;

var userInfo = {};
var url = "mongodb+srv://eda:edaeda@mycluster-crlll.gcp.mongodb.net/test?retryWrites=true&w=majority";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(__dirname+ '/index.html');
});

router.get('/addUser', function(req, res, next) {
  res.sendFile(__dirname+ '/addUserPage.html');
});


router.get('/deleteUser', function(req, res, next) {
  res.sendFile(__dirname+ '/deleteUserPage.html');
});

router.get('/exhibit', function(req, res, next) {
  res.render( 'exhibit');
});

router.get('/drop', function(req, res, next) {
  res.render( 'drop');
});

router.get('/loginUser', function(req, res, next) {
  res.sendFile(__dirname+ '/loginUserPage.html');
});

router.get('/userHomePage', function(req, res, next) {
  var sum=0;
  var tempRatings=[];
  var tempProducts=[];
  mongoClient.connect(url, async function (err, client) {
    if (err) throw err;
    var db = client.db('InventionGallery');
    await db.collection('invention').find({}).toArray(function (err,response) {
      if (err) throw err;
        for(let i in response) {
          if(response[i].dropped === false){
            var invSum=0;
            if(response[i].user_name === userInfo.user_name){
              for(let j in response[i].rating){
                tempRatings.push(response[i].rating[j][1]);
              }
            }
            tempProducts.push(response[i]);
            for(let m in tempProducts[i].rating){
              invSum = parseFloat(invSum) + parseFloat(tempProducts[i].rating[m][1]);
            }
            console.log(invSum);
            tempProducts[i].avgRating = (invSum/tempProducts[i].rating.length).toFixed(2);
            db.collection('invention').updateOne({name: tempProducts[i].name}, {$set:tempProducts[i]}).then(function (res) {
              console.log('Invention Rating is Updated!')
            });
          }
        }
        sum = tempRatings.reduce(function(a, b){
          return parseFloat(a) + parseFloat(b);
        }, 0);
        sum = sum/tempRatings.length;
        Object.assign(userInfo, {avg_rating: sum.toFixed(2)});
        db.collection('users').updateOne({user_name: userInfo.user_name}, {$set:userInfo}).then(function (res) {
          console.log('User Rating is Updated!')
        });

        res.render('userHomePage',{user_name: userInfo.user_name, rating: userInfo.avg_rating, allInventions: JSON.stringify(tempProducts)});
    });
  });
});

router.post('/drop',function (req, res, next) {
  var product_name = req.body.product_name;
  var user_name = userInfo.user_name;

  mongoClient.connect(url, async function (err, client) {

    if (err) throw err;
    var db = client.db('InventionGallery');

    await db.collection('invention').findOne({name: product_name, user_name: user_name}).then(async function (res) {
      if (res){
        res.dropped = true;
        db.collection('invention').updateOne({name: res.name}, {$set:res}).then(function (res) {
          console.log('Invention is Dropped!');
        });
      } else {
        console.log('There is no invention as ' + product_name + '!');
      }
    });


    client.close();

  });

  res.redirect('/userHomePage')

});

router.post('/exhibit', function (req, res, next){
  var product_name = req.body.product_name;
  var cost = req.body.cost;
  var user = req.body.inventors_name;
  var materials = req.body.materials_used;
  var photo = req.body.photo;
  var type1 = req.body.type1;
  var type2 = req.body.type2;
  var op1 = req.body.optional1;
  var op2 = req.body.optional2;

  type1 = (type1==null) ? "empty" : type1;
  type2 = (type2==null) ? "empty" : type2;
  op1 = (op1==null) ? "empty" : op1;
  op2 = (op2==null) ? "empty" : op2;

  var invention = {
    name: product_name,
    photo: photo,
    cost: cost,
    materials: materials,
    user_name: user,
    rating: [],
    avgRating: 0,
    dropped: false,
    optional1: [type1, op1],
    optional2: [type2, op2]
  };

  mongoClient.connect(url, async function (err, client) {

    if (err) throw err;
    var db = client.db('InventionGallery');
    await db.collection('invention').findOne({name: product_name}).then(async function (res) {
      if (!res){
        await db.collection('invention').insertOne(invention, function (err, res) {
          if (err) throw err;
          console.log('Invention inserted!');
        });
      } else {
        console.log('Invention Already Exist!');
      }
    });


    client.close();

  });
  res.redirect('/userHomePage');

});

router.post('/rate', function (req, res, next) {
  var product_name = req.body.product_name;
  var current_rate = parseFloat(req.body.rating);
  var rating_user = userInfo.user_name;
  var temp = 0;

  mongoClient.connect(url, async function (err, client) {
    if (err) throw err;
    var db = client.db('InventionGallery');
    await db.collection('invention').find({}).toArray(function (err,response) {
      if (err) throw err;
      for(let i in response) {
        if (response[i].name === product_name) {
          for (let j in response[i].rating) {
            if (response[i].rating[j][0] === rating_user) {
              response[i].avgRating = ((response[i].avgRating*response[i].rating.length) - response[i].rating[j][1] + current_rate)/response[i].rating.length;
              response[i].rating[j][1] = current_rate;
              db.collection('invention').updateOne({name: product_name}, {$set: response[i]}).then(function (res) {
                console.log('Invention Rating is Updated, Old User!')
              });
              temp = 1;
            }
          }
          if(temp === 0){
            console.log(response[i].avgRating*response[i].rating.length + current_rate);
            response[i].avgRating = ((response[i].avgRating*response[i].rating.length) + current_rate)/(response[i].rating.length+1);
            response[i].rating.push([rating_user, current_rate]);
            console.log(response[i].avgRating);
            db.collection('invention').updateOne({name: product_name}, {$set: response[i]}).then(function (res) {
              console.log('Invention Rating is Updated, New User!')
            });
        }
      }

      }

      res.redirect('/userHomePage');
    });
  });
});

router.post('/addUser', function(req, res, next) {
  var user_name = req.body.input;
  console.log(user_name);

  var user = {
    user_name: user_name,
    avg_rating: 0
  };

  mongoClient.connect(url, async function (err, client) {

    if (err) throw err;
    var db = client.db('InventionGallery');
    await db.collection('users').findOne({user_name: user_name}).then(async function (res) {
      if (!res){
        await db.collection('users').insertOne(user, function (err, res) {
          if (err) throw err;
          console.log('User inserted!');
        });
      } else {
        console.log('User Already Exist!');
      }
    });


    client.close();

  });
  res.redirect('/loginUser');

});


router.post('/deleteUser', function(req, res, next) {

  var user_name = req.body.input;
  console.log(user_name);

  mongoClient.connect(url, async function (err, client) {

    if (err) throw err;
    var db = client.db('InventionGallery');

    await db.collection('users').findOne({user_name: user_name}).then(async function (res) {
      if (res){
        await db.collection('users').deleteOne({user_name: user_name}, function (err, res) {
          if (err) throw err;
          console.log('User Deleted!');
        });
      } else {
        console.log('There is no user as ' + user_name + '!');
      }
    });


    client.close();

  });


  res.redirect('/')
});


router.post('/loginUser', function (req, res, next) {
  var user_name = req.body.input;
  Object.assign(user_name, {user_name: user_name});

  var temp_res = res;
  mongoClient.connect(url, async function (err, client) {

    if (err) throw err;
    var db = client.db('InventionGallery');

    await db.collection('users').findOne({user_name: user_name}).then(async function (res) {

      if (res){
        console.log(res);
        userInfo = {
          user_name : res.user_name,
          avg_rating: 0
        };
        temp_res.redirect('/userHomePage');
        // res2.render('layout', {user_name : res.user_name,wallet : res.wallet,rating : res.rating,store : res.store,history : res.history})
        // res2.sendFile(__dirname+ '/store.html', userInfo)

      } else {



        console.log('User Doesnt Exist!');
        temp_res.redirect('/loginUser');
      }
    });


    client.close();

  });
});


module.exports = router;
