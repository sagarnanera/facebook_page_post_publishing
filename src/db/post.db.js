exports.insertPost = async (db, postData) => {
  const post = db.collection("posts").insertOne(postData);
  return post;
};

exports.findPost = async (db, searchQuery) => {
  const post = db.collection("posts").findOne(searchQuery);
  return post;
};

exports.updatePost = async (db, searchQuery, dataTUpdate) => {
  const post = db.collection("posts").findOneAndUpdate(
    searchQuery,
    {
      $set: dataTUpdate
    },
    { upsert: true, returnDocument: "after" }
  );

  return post;
};

