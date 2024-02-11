const koa = require("koa");
const bodyParser = require("koa-bodyparser");

// koa app
const app = new koa();

// routes
const facebookRouter = require("./routes/facebook.route");
const { postToFacebook } = require("./services/facebook.service");
const dbClient = require("./db/db");

// logger
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get("X-Response-Time");
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// middlewares
app.use(bodyParser());

app.use(async (ctx, next) => {
  const postId = await postToFacebook(dbClient, "sk", {
    message: "hey from app.. 2"
  });
  console.log(postId);
  await next();
});

app.use(facebookRouter.routes());

app.on("error", (err, ctx) => {
  console.log(err);
  ctx.status = err.status || 500;
  ctx.body = { success: false, message: "error occurred.", err };
});

module.exports = app;
