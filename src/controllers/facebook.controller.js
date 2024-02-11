const dbClient = require("../db/db");
const { v4: uuid } = require("uuid");
const { getPageAccessTokens } = require("../services/facebook.service");
const { updateUser, findUser } = require("../db/user.db");

const REDIRECT_URI = "http://localhost:8080/api/facebook/callback";
const FACEBOOK_BASE_URL = process.env.FACEBOOK_BASE_URL;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_Id;
const stateId = uuid();

exports.facebookConnect = async (ctx) => {
  //   https://www.facebook.com/v19.0/dialog/oauth?
  //   client_id={app-id}
  //   &redirect_uri={redirect-uri}
  //   &state={state-param}

  const scope = [
    "public_profile",
    "email",
    "read_insights",
    "pages_show_list",
    "pages_read_engagement",
    "pages_read_user_content",
    "pages_manage_posts"
  ];

  console.log(scope.join(","));
  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${REDIRECT_URI}&scope=${scope}&state=${stateId}`;

  ctx.redirect(authUrl);
  return;

  //   ctx.status = 200;
  //   ctx.body = {
  //     success: true,
  //     message: "Facebook oauth successful.",
  //     oauthUrl: authUrl
  //   };
  //   return;
};

exports.facebookCallback = async (ctx) => {
  const { code, state, error, error_description, error_reason } = ctx.query;

  if (state !== stateId) {
    ctx.status = 401;
    ctx.body = {
      success: false,
      message: "Not authorized"
    };
    return;
  }

  //   error: 'access_denied',
  //   error_code: '200',
  //   error_description: 'Permissions error',
  //   error_reason: 'user_denied',

  if (error) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: error_description,
      error_reason
    };
    return;
  }

  if (!code) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: "Error while connecting to facebook."
    };
    return;
  }

  console.log(ctx.query);

  // code : AQAmceaK_5UotsvxCfhrn_uf4ocjgfvwemcaKjfYBu_JU0L2u1Z45DIev5RTZV6LvLcmLWIS9_SX3qI2Uo84alypkzgk76c20ILApqeKWqaxXscQGuthtWsI-Pz92aIyLMOH-hjrGG-KktQJEHcgayn8HunylXrKvGapSGwzTggEh8OMlKQzYtDQyEj4Lmgap7gVuj0v0pxL8xGuKFXpK-541YQyGF1_GoN8nT5zqomZskySbYsYWA_a3DrmS2fjHjZ2qYk6DvnD8-gSy8PkJU19nE1Y6atEumwGXl_13n-xpr9qfrIro2YWFPoWl909M13RcMS_vEGxvxVvat9s3kwdXTFkAjUmYZLbF0VkCPtJk1vzAI_qqQkuuASgxMr8wJA

  //   https://graph.facebook.com/v19.0/oauth/access_token?
  //    client_id={app-id}
  //    &redirect_uri={redirect-uri}
  //    &client_secret={app-secret}
  //    &code={code-parameter

  const facebookAccessTokenURL = `${FACEBOOK_BASE_URL}/oauth/access_token?client_id=${FACEBOOK_APP_ID}&redirect_uri=${REDIRECT_URI}&client_secret=${FACEBOOK_APP_SECRET}&code=${code}`;

  try {
    const response = await fetch(facebookAccessTokenURL);
    const resJson = await response.json();

    console.log(resJson);

    // TODO : save the access token to the db for subsequent request, i.e. to access their pages

    // const user = await dbClient.collection("users").findOneAndUpdate(
    //   { name: "sk" },
    //   {
    //     $set: {
    //       facebook_access_token: resJson.access_token
    //       //   pages: pages[0]
    //     }
    //   },
    //   { upsert: true, returnDocument: "after" }
    // );
    const user = await updateUser(
      dbClient,
      { name: "sk" },
      {
        facebook_access_token: resJson.access_token
      }
    );

    console.log("response Json...\n", user);

    ctx.status = 200;
    ctx.body = {
      success: true,
      message: "Successfully connected to facebook."
    };
    return;
  } catch (error) {
    console.log("error getting access token...\n", error);
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: "Error while connecting to facebook."
    };
    return;
  }
};

exports.facebookPages = async (ctx) => {
  const { facebook_access_token } = await findUser(dbClient, { name: "sk" });

  const facebookPagesURL = `https://graph.facebook.com/v19.0/me/accounts?access_token=${facebook_access_token}`;

  try {
    const response = await fetch(facebookPagesURL);
    const pages = await response.json();

    console.log("pages :", pages);

    const pageToSend = pages.data.map((page) => ({
      pageId: page.id,
      pageName: page.name
    }));

    ctx.status = 200;
    ctx.body = {
      success: true,
      message: "Successfully fetched facebook pages.",
      pages: pageToSend
    };
    return;
  } catch (error) {
    console.log("error getting pages...\n", error);
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: "Error while getting facebook pages."
    };
    return;
  }
};

exports.AddFacebookPagesToPublishList = async (ctx) => {
  const { pageIds } = ctx.request.body;

  try {
    const { facebook_access_token: userAccessToken } = await findUser(
      dbClient,
      { name: "sk" }
    );

    const pageWithAccessToken = await getPageAccessTokens(
      pageIds,
      userAccessToken
    );

    const pageToSend = pageWithAccessToken.map((page) => ({
      pageId: page.id,
      pageName: page.name
    }));

    // await dbClient
    //   .collection("users")
    //   .updateOne({ name: "sk" }, { $set: { pages: pageWithAccessToken } });

    await updateUser(dbClient, { name: "sk" }, { pages: pageWithAccessToken });

    ctx.status = 200;
    ctx.body = {
      success: true,
      message: "Successfully added facebook pages to the publishing list.",
      pages: pageToSend
    };
    return;
  } catch (error) {
    console.log("error getting pages...\n", error);
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: "Error while adding facebook pages to publishing list."
    };
    return;
  }
};
