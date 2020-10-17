var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var cors = require("cors");
var app = express();
var nodemailer = require("nodemailer");
var xoauth2 = require("xoauth2");
var smtpTransport = require("nodemailer-smtp-transport");
var session = require("express-session");
var bcrypt = require("bcrypt");

var project_id = 0;
var task_Id = 0;
/**connection string to db */
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/nodedemo");

//on error
mongoose.connection.on("error", err => {
  if (err) {
    console.log("Failed to established a connection " + err);
  }
});

const port = 3000;

//Adding middleware -cors
app.use(cors());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

/**body parser */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//use sessions for tracking logins
app.use(
  session({
    secret: "work hard",
    resave: true,
    saveUninitialized: false
  })
);

/**starting route */
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//port no

app.listen(port, () => {
  console.log("App is listening on" + port);
});

/**define our schema */
var nameSchema = new mongoose.Schema({
  topic_name: String,
  description: String,
  percentage_completion: Number,
  // completed_date: String,
  manager_name: String,
  date_created: String,
  project_name: String,
  statusId: Number
});

var projectSchema = new mongoose.Schema({
  project_name: String,
  member_email: String,
  manager_name: String,
  allTasks: Array
});

var loginSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  confpassword: {
    type: String,
    required: true
  }
});

var addProjectSchema = new mongoose.Schema({
  project_name:{
    type: String,
    required: true,
    unique: true
  },
  project_desc:{
    type: String
  },
  project_status:{
    type: String,
    required: true
  }
});

//hashing a password before saving it to the database
loginSchema.pre("save", function(next) {
  var user = this;
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
      // Store hash in your password DB.
      if (err) {
        return next(err);
      }
      user.password = hash;
      user.confpassword = hash;
      next();
    });
  });
});

//authenticate input against database
//authenticate input against database
loginSchema.statics.authenticate = function(email, password, callback) {
  LoginData.findOne({ email: email }).exec(function(err, user) {
    if (err) {
      return callback(err);
    } else if (!user) {
      var err = new Error("User not found.");
      err.status = 401;
      return callback(err);
    }
    bcrypt.compare(password, user.password, function(err, result) {
      if (result === true) {
        return callback(null, user);
      } else {
        return callback();
      }
    });
  });
};

var User = mongoose.model("DataInput", nameSchema);

var ProjectData = mongoose.model("projectdata", projectSchema, "projectdata");

var PostProjectData = mongoose.model(
  "projectdata",
  projectSchema,
  "projectdata"
);

var LoginData = mongoose.model("userdatas", loginSchema);

var AllProjectList = mongoose.model(
  "projectlists",
  addProjectSchema,
  "projectlists"
);

/**saving status data*/
function getTodayDate() {
  let newDate = new Date();
  let mm = newDate.getMonth() + 1;
  let dd = newDate.getDate();
  let yyyy = newDate.getFullYear();
  let date = mm + "/" + dd + "/" + yyyy;
  return date;
}

app.post("/addProject", (req, res) => {
  var newProjectDataPost = new AllProjectList(req.body);
  newProjectDataPost
    .save()
    .then(item => {
      res.status(200).json({ saved: true });
    })
    .catch(err => {
      res.status(400).json({ save: false });
    });
});

app.get("/getAllProjectLists", (req, res) => {
  AllProjectList.find({}, (err, items) => {
    //console.log(err);
    res.json(items);
  });
});

app.get("/getallUsers", (req, res) => {
  LoginData.find({}, (err, items) => {
    //console.log(err);
    res.json(items);
  });
});

app.put("/addStatus", (req, res) => {
  const bodyOBj = {
    statusID: req.body.statusID,
    statusDesc: req.body.statusDesc,
    percentage_completion: req.body.percentage_completion,
    date_updated: req.body.date_updated
  };
  ProjectData.findOneAndUpdate(
    {
      member_email: req.body.member_email,
      "allTasks.taskID": req.body.taskiD
    },
    { $push: { "allTasks.$.allStatus": bodyOBj } },
    { new: true },
    (err, documents) => {
      res.send({ error: err, affected: documents });
    }
  );
});


app.put("/updateprojectdata", (req,res) => {
  const bodyOBj = {
    taskID: req.body.taskID ,
    taskName: req.body.taskName,
    task_status: req.body.task_status,
    start_date: req.body.start_date,
    end_date:req.body.end_date,
    date_created:req.body.date_created,
    allStatus: req.body.statusArray
  };
  ProjectData.findOneAndUpdate(
    {
      member_email: req.body.member_email
    },
    { $push: { allTasks: bodyOBj } },
    { new: true },
    (err, documents) => {
     if(documents){
      res.status(200).json({ saved: true });
     } else {
      res.status(400).json({ saved: false });
     }
    }
  );
});
/**saving to db user signup credentials */
app.post("/signup", (req, res) => {
  if (
    req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.confpassword
  ) {
    var userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      confpassword: req.body.confpassword
    };
    LoginData.create(userData, (err, user) => {
      if (err) {
        res.status(200).json({ saved: false });
      } else {
        res.status(200).json({ saved: true });
      }
    });
  }
});
/**
 *      * axios call to validate sign in creds

 */
app.post("/signin", (req, res, next) => {
  if (req.body.email && req.body.password) {
    console.log("username", req.body.email);
    console.log("password", req.body.password);
    LoginData.authenticate(req.body.email, req.body.password, function(
      error,
      user
    ) {
      console.log("user", user);
      if (error || !user) {
        var err = new Error("Wrong email or password.");
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.send(200);
      }
    });
  } else {
    var err = new Error("All fields required.");
    err.status = 400;
    return next(err);
  }
});
// GET /login
app.get("/signin", function(req, res, next) {
  return res.render("signin", { title: "Log In" });
});
/** add task data */
app.post("/saveTaskDocument", (req, res) => {
  let newDataPost = new PostProjectData(req.body);
  newDataPost
    .save()
    .then(item => {
      res.status(200).json({ saved: true });
    })
    .catch(err => {
      res.status(400).json({ save: false });
    });
});

/** update task data */
app.put("/updateTaskNameByEmail/:id", (req, res) => {
  let taskID = req.params.id;
  ProjectData.findOneAndUpdate(
    {
      member_email: req.body.member_email,
      "allTasks.taskID": taskID
    },
    {
      $set: {
        "allTasks.$.taskName": req.body.taskName,
      }
    },
    (err, data) => {
      if (err) {
        console.log("Error in update" + err);
      } else {
        res.status(200).json({ save: true});
      }
      
    }
  );
});


/** delete task data */
app.delete("/deleteTask/:taskID/:member_email", (req, res) => {
  let taskidToRemove = req.params.taskID;
  console.log(req.params.member_email)
  ProjectData.updateOne(
    { member_email: req.params.member_email },
    { $pull :{
      allTasks:{
        taskID :taskidToRemove
      } 
    }}, 
    { multi : true } , 
    (err, data) => {
    if (!err) {
      res.status(200).send(data);
    } else {
      res.status(200).send(err);
    }
  });
});

/** delete task data */
app.delete("/deleteProject/:member_email", (req, res) => {
  ProjectData.findOneAndRemove(
    { member_email: req.params.member_email },
    (err, data) => {
    if (!err) {
      res.status(200).send(data);
    } else {
      res.status(200).send(err);
    }
  });
});



/**retrieving all status data by projectname*/

app.get("/getallData/:member_email", (req, res) => {
  let member_email = req.params.member_email;
  ProjectData.find({ member_email: member_email }, (err, items) => {
    //console.log(err);
    res.json(items);
  });
});


app.get("/getTasksbyEmail/:member_email" , (req,res) => {
  let member_email = req.params.member_email;
  ProjectData.find({ member_email: member_email }, (err,items) => {
    res.json(items);
  });
})
/**retrieving all status data by projectname*/

app.get("/getallData", (req, res) => {
  ProjectData.find({}, (err, items) => {
    //console.log(err);
    res.json(items);
  });
});

/**retrieving all tasks if exists for an email and project name*/

app.get("/getTasksByEmail/:member_email", (req, res) => {
  let member_email = req.params.member_email;

  ProjectData.find(
    {
      member_email: member_email
    },
    (err, items) => {
      if (items) {
        res.json(items);
      } else {
        res.send(err);
      }
    }
  );
});

/*** get all project data by date */
app.post("/getallStatusbyDate", (req, res) => {
  let date_created = req.body.date_created;
  User.find({ date_created: date_created }, (err, items) => {
    //console.log(err);
    res.json(items);
  });
});

/** get project details data */
app.get("/getprojectdata/:username", (req, res) => {
  let username = req.params.username;
  ProjectData.find({ member_email: username }, function(err, items) {
    // console.log(err);
    res.json(items);
  });
});

/** delete node */

// app.delete("/:_id/deleterecord", (req, res) => {
//   User.findByIdAndRemove(req.params._id, (err, data) => {
//     res.status(200).send(data);
//     if (!err) {
//       console.log("Deleted");
//     } else {
//       console.log("Error deleting" + err);
//     }
//   });
// });

/** update node with statusId */

// app.put("/:_id/updatestatus", (req, res) => {
//   let id = req.params._id;
//   User.findByIdAndUpdate(
//     id,
//     {
//       $set: {
//         description: req.body.description,
//         percentage_completion: req.body.percentage_completion,
//         completed_date: req.body.completed_date
//       }
//     },
//     (err, data) => {
//       if (err) {
//         console.log("Error in update" + id);
//       }
//       res.send("Status udpated.");
//     }
//   );
// });

/** update start task status by id */
app.put("/:_id/taskStartStatus", (req, res) => {
  const taskID = req.params._id;
  const newTaskStatus = req.body.task_status;
  const newStartDate = req.body.start_date;
  const member_email = req.body.member_email;
  ProjectData.findOneAndUpdate(
    {
      member_email: member_email,
      "allTasks.taskID": taskID
    },
    {
      $set: {
        "allTasks.$.task_status": newTaskStatus,
        "allTasks.$.start_date": newStartDate
      }
    },
    { new: true },
    (err, documents) => {
      res.send({ error: err, affected: documents });
    }
  );
});

/** update end task status by id */
app.put("/:_id/taskEndStatus", (req, res) => {
  const taskID = req.params._id;
  const newTaskStatus = req.body.task_status;
  const newEndDate = req.body.end_date;
  const member_email = req.body.member_email;
  ProjectData.findOneAndUpdate(
    {
      member_email: member_email,
      "allTasks.taskID": taskID
    },
    {
      $set: {
        "allTasks.$.task_status": newTaskStatus,
        "allTasks.$.end_date": newEndDate
      }
    },
    { new: true },
    (err, documents) => {
      res.send({ error: err, affected: documents });
    }
  );
});

/**send email */
app.post("/sendemail", (req, res) => {
  let to = req.body.to;
  let htmlbody = req.body.htmlbody;
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  nodemailer.createTestAccount((err, account) => {
    var transport = nodemailer.createTransport(
      smtpTransport({
        service: "Gmail",
        auth: {
          xoauth2: xoauth2.createXOAuth2Generator({
            user: process.env.USER, // Your gmail address.
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            access_token: process.env.ACCESS_TOKEN
          })
        }
      })
    );

    // setup email data with unicode symbols
    let mailOptions = {
      from: "hpedevelopers@gmail.com", // sender address
      to: to, // list of receivers
      subject: "Test email to send email", // Subject line
      text: "Hello world?", // plain text body
      html: htmlbody // html body
    };

    // send mail with defined transport object
    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("Message sent: %s", info.messageId);
      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      res.status(200).json({ sendemail: true });
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
  });
});
