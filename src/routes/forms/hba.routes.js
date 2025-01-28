module.exports = (app) => {
    const value = require("../../controllers/forms/hba.controller");
   const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");
   const upload = require("../../middlewares/upload")
   const createUploadMiddleware = require("../../middlewares/multiUpload")
   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/addHba",
    [jwt.verifyToken],
    upload.fields([
      { name: 'orderFile', maxCount: 1 },
      { name: 'conductRulePermissionAttachment', maxCount: 1 },
  ]),
    value.addHba
  );

  app.get(
    "/getHba",
    [jwt.verifyToken],
    value.getHba
  );

  // app.put(
  //   "/updateHba",
  //   // [jwt.verifyToken],
  //   upload.single('orderFile'),
  //   value.updateHba
  // );

//   app.put(
//     "/updateHba",
//     createUploadMiddleware,
//     async (req, res) => {
//         try {
//             console.log('Files received:', req.files);
//             console.log('Body received:', req.body);
//             // ... rest of your controller code
//         } catch (error) {
//             console.error('Error:', error);
//             res.status(500).json({ error: error.message });
//         }
//     },
//     value.updateHba
// );


app.put(
  "/updateHba",
  [jwt.verifyToken],
  createUploadMiddleware,
  (req, res, next) => {
      // Debug logging
      // console.log('Files received:', req.files);
      // console.log('Body received:', req.body);
      next();
  },
  value.updateHba
);

}