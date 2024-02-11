exports.findUser = async (db, searchQuery) => {
  const user = db.collection("users").findOne(searchQuery);
  return user;
};

exports.updateUser = async (db, searchQuery, dataTUpdate) => {
  const user = db.collection("users").findOneAndUpdate(
    searchQuery,
    {
      $set: dataTUpdate
    },
    { upsert: true, returnDocument: "after" }
  );

  return user;
};
