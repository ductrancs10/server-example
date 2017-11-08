
'use strict';

Parse.Cloud.define('hello', function(req, res) {
  let query = new Parse.Query(Parse.User);

  console.log(query);
  query.find().then((results) => {
    res.success(results);
  }).catch((err) => {
    res.error(err);
  });
});
