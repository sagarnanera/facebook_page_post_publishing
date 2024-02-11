const KoaRouter = require("koa-router");
const {
  facebookConnect,
  facebookCallback,
  facebookPages,
  AddFacebookPagesToPublishList
} = require("../controllers/facebook.controller");
const router = new KoaRouter({ prefix: "/api/facebook" });

router.get("/connect", facebookConnect);
router.get("/callback", facebookCallback);

router.get("/pages", facebookPages);

router.post("/pages", AddFacebookPagesToPublishList);

// router.post("/logout", authenticate(AllRoles), logoutController);

module.exports = router;
