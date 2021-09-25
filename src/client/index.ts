// import express from "express"
// import path from "path"
// import client from "./client"

// const app = express()

// app.use(express.json());

// app.get("/",(req,res)=>{
//     client.getAllMenu(null,(err,data)=>{
//         if(!err){
//             res.render("menu",{
//                 results: data.menu
//             });
//         }
//     });
// });

// app.post("/save",(req,res)=>{
//     let newMenuItem={
//         name:req.body.name,
//         price: req.body.price
//     };

//     client.insert(newMenuItem,(err,data)=>{
//         if(err) throw err;

//         console.log("New Menu created successfully", data);
//         res.redirect("/");
//     });
// });


// app.post("/update", (req, res) => {
// 	const updateMenuItem = {
// 		id: req.body.id,
// 		name: req.body.name,
// 		price: req.body.price,
// 	};
//     console.log("update Item %s %s %d",updateMenuItem.id, req.body.name, req.body.price);

// 	client.update(updateMenuItem, (err, data) => {
// 		if (err) throw err;

// 		console.log("Menu Item updated successfully", data);
// 		res.redirect("/");
// 	});
// });



// app.post("/remove",(req,res)=>{
//     client.remove({id: req.body.menuItem_id},(err,_)=>{
//         if(err) throw err;
//         console.log("Menu Item removed successfully");
//         res.redirect("/");
//     });
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT,()=>{
//     console.log("Server running at port %d",PORT);
// });