const { Promise } = require("bluebird");
const { findUser } = require("../db/user.db");

const FACEBOOK_BASE_URL = process.env.FACEBOOK_BASE_URL;

exports.postToFacebook = async (dbClient, userName, postData) => {
  // const { message, media } = postData;

  const { pages } = await findUser(dbClient, { name: userName });

  return Promise.map(pages, async (page) => {
    try {
      const res = await fetch(
        `${FACEBOOK_BASE_URL}/${page.id}/feed?access_token=${page.access_token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(postData)
        }
      );

      const post = await res.json();

      console.log(post);

      return { postId: post.id, pageId: page.id };
    } catch (error) {
      console.error(`Error while creating post :`, error);
      throw error;
    }
  });
};

exports.deleteFacebookPost = async (dbClient, facebookPostIds) => {
  // console.log("delete post");

  const { pages } = await findUser(dbClient, { name: userName });

  return Promise.map(facebookPostIds, async (postId) => {
    try {
      const res = await fetch(
        `${FACEBOOK_BASE_URL}/${postId}?access_token=${access_token}`,
        {
          method: "DELETE"
        }
      );

      const postId = await res.json();

      console.log(postId);

      return postId;
    } catch (error) {
      console.error(`Error while creating post :`, error);
      throw error;
    }
  });
};

exports.getPageAccessTokens = (pageIds, userAccessToken) => {
  return Promise.map(pageIds, async (pageId) => {
    try {
      const response = await fetch(
        `${FACEBOOK_BASE_URL}/${pageId}?fields=access_token,name&access_token=${userAccessToken}`
      );
      const pageData = await response.json();
      return pageData;
    } catch (error) {
      console.error(`Error fetching page ${pageId} access token:`, error);
      throw error;
    }
  });
};
