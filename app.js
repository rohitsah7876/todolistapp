const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://101112131415:6KW5yEDTs8Hg!vc@cluster0.nwnqxtm.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemsSchema = {
    name: String
    };
// 6KW5yEDTs8Hg!vc

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to todolist!"
});
const item2 = new Item({
    name: "Hit the button to add a new item!"
});
const item3 = new Item({
    name: "Hit this to delete an item!"
});

const defaultItems = [item1, item2, item3];


const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {

    Item.find({}, (err, foundItems) => {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                console.log("Successfully saved default items to DB")
            });
            res.redirect("/");
        } else {
            res.render("list", {
                ListTitle: "Today",
                newlistItems: foundItems
            });
        }
    });

});



app.post("/", (req, res) => {
    const itemName = req.body.newItem;
    const listName = req.body.list;


    const item = new Item({
        name: itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name:listName},(err,foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
   
});


app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                // Create a new list 
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            } else {
                // Show an existing list
                res.render("list",{
                    customListName:customListName,
                    ListTitle: foundList.name,
                    newlistItems: foundList.items
                })
            }
        }
    })

});

app.post("/delete", (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listname;

    if(listName === "Today"){

        Item.findByIdAndRemove({ _id: checkedItemId }, (err) => {
           if(!err){
            res.redirect("/");
           }
        });
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},(err,foundList) => {
            if(!err){
                res.redirect("/" + listName);
            }
        })
    }

})

app.get("/api", (req, res) => {
    Item.find({}, (err, items) => {
        if (err) {
            res.send(err)
        } else {
            res.send(items);
        }
    })
})


app.listen(port, () => {
    console.log(`app is listening on port ${port}`);
});

