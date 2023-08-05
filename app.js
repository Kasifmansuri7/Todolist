const express = require("express");
const app = express();
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

// mongoose.connect
mongoose.connect("mongodb+srv://Kashif:q1OAfK4tjFpgQxG8@cluster0.blcioq4.mongodb.net/TodoList").then(rslt=>{
  console.log("DB connected!");
})
const itemSchema = {
  name: String,
};
const listSchema = {
  name: String,
  item: [itemSchema],
};
const List = mongoose.model("list", listSchema);

//default items
const item1 = new List({
  name: "Welcome to your todolist!",
});
const item2 = new List({
  name: "Hit the + button to add new item.",
});
const item3 = new List({
  name: "<-- Hit this to delete an item.",
});
const defaultItem = [item1, item2, item3];

//static and ejs files
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

//****END POINTS****
app.get("/", (req, res) => {
  // let day = date.longDate();

  List.findOne({ name: "Home" }).then((results) => {
    if (results) {
      //Show existing list
      res.render("list", {
        listTitle: results.name,
        newListItems: results.item,
      });
    } else if (!results) {
      //Create new list
      const list = new List({
        name: "Home",
        item: defaultItem,
      });
      list.save();
      res.redirect("/");
    }
  });
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }).then((results) => {
    if (results) {
      //Show existing list
      res.render("list", {
        listTitle: results.name,
        newListItems: results.item,
      });
    } else if (!results) {
      //Create new list
      const list = new List({
        name: customListName,
        item: defaultItem,
      });
      list.save();
      res.redirect("/" + customListName);
    }
  });
});
app.post("/", (req, res) => {
  const newEntry = req.body.newItem;
  const listName = req.body.list;
  const addedItem = { name: newEntry };

  if (listName === "Home") {
    List.findOne({ name: "Home" }).then((results) => {
      results.item.push(addedItem);
      results.save();
    });

    res.redirect("/");
  } else {
    List.findOne({ name: listName }).then((results) => {
      results.item.push(addedItem);
      results.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", (req, res) => {
  const checkedId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName == "Home") {
    List.findOneAndUpdate(
      { name: "Home" },
      { $pull: { item: { _id: checkedId } } }
    ).then((rslt) => {
      if (rslt) {
        console.log(rslt);
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { item: { _id: checkedId } } }
    ).then((err) => {
      console.log(err);
    });
    res.redirect("/" + listName);
  }
});
//****LISTENING SERVER****
app.listen(3000, () => {
  console.log("Server has started on 3000");
});
