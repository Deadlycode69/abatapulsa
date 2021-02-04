//use path module
const path = require('path');
var fs = require('fs');

//use express module
const express = require('express');


// Make sure this is defined before any of your routes
// that make use of the session.
var session = require('express-session');


//use hbs view engine
//const html = require('html');
//use bodyParser middleware
const bodyParser = require('body-parser');
//use mysql database
const mysql = require('mysql');
const app = express();


app.use(session({
	secret: 'keyboard cat', 
	cookie: { maxAge: 60000 },
	resave: false,
	saveUninitialized: false
}));

 
//konfigurasi koneksi
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'interview_abatapulsa'
});
 
//connect ke database
conn.connect((err) =>{
  if(err) throw err;
  console.log('Mysql Connected...');
});
 
//set views file
app.set('views',path.join(__dirname,'view'));
//set view engine
// app.set('view engine', 'html');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//set folder public sebagai static folder untuk static file
var engines = require('consolidate');
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', __dirname + '/view');
app.engine('html', engines.mustache);
app.set('view engine', 'html');
// app.use('/assets',express.static(__dirname + '/public'));
 
//route untuk homepage
app.get('/',(req, res) => {
  //res.render('login');
  	fs.readFile("view/login.html", (err, data) => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        if (err) throw err;
        res.end(data);
  	});
});

// app.get('/',(req, res) => {
//   let sql = "SELECT * FROM product";
//   let query = conn.query(sql, (err, results) => {
//     if(err) throw err;
//     res.render('product_view',{
//       results: results
//     });
//   });
// });
 
//route untuk insert data
app.post('/auth_login',(req, res) => {
  	let username = req.body.f_user;
	let password = req.body.f_pass;

	let sql = "SELECT * FROM user WHERE username='" + username + "' and password='" + password + "'";
	let query = conn.query(sql, (err, results) => {
	    if(err) throw err;

	    if (results.length > 0) {
	    	req.session.user = results[0].id_user;
		    res.redirect('/profile');	
	    } else {
	    	res.redirect('/');
	    }
	    // console.log(results);
	    
	    // res.render('profile',{
	    // 	results: results
	    // });
	});
});
 
app.get('/profile',(req, res) => {
	var sess = req.session;

	if (sess.user > 0) {
		let sql = "SELECT * FROM user WHERE id_user='" + sess.user + "'";
		let query = conn.query(sql, (err, results) => {
			if(err) throw err;
				res.render('profile',{
				nama_lengkap: results[0].nama_lengkap,
				username: results[0].username,
				biodata: results[0].biodata
			});
		});
	} else {
    	res.redirect('/');
	}

 //  	fs.readFile("view/profile.html", (err, data) => {
	//   	res.writeHead(200, { 'Content-Type': 'text/html' });
	//   	if (err) throw err;
	//   	res.end(data);
	// });
});

app.get('/logout',(req, res) => {
	var sess = req.session;

	sess.user = 0;
	res.redirect('/');
});


//route untuk update data
app.post('/update',(req, res) => {
  let sql = "UPDATE product SET product_name='"+req.body.product_name+"', product_price='"+req.body.product_price+"' WHERE product_id="+req.body.id;
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.redirect('/');
  });
});
 
//route untuk delete data
app.post('/delete',(req, res) => {
  let sql = "DELETE FROM product WHERE product_id="+req.body.product_id+"";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
      res.redirect('/');
  });
});
 
//server listening
app.listen(8000, () => {
  console.log('Server is running at port 8000');
});