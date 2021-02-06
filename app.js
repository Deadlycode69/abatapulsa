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
	var sess = req.session;
	if (typeof sess.status_log !== 'undefined') {
	  	res.render('login',{
	  		status_log: sess.status_log
	  	});
	} else {
	  	res.render('login',{
	  		status_log: ''
	  	});
	}
});

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
	    	req.session.status_log = "gagal";
	    	res.redirect('/');
	    }
	    // console.log(results);
	    
	    // res.render('profile',{
	    // 	results: results
	    // });
	});
});

app.get('/register',(req, res) => {
	res.render('register');
});
app.get('/regis_act',(req, res) => {
	res.redirect('/');
});
app.post('/regis_act',(req, res) => {
  	let sql = "INSERT INTO user VALUES (null, '"+req.body.f_nml+"', '"+req.body.f_user+"', '"+req.body.f_pass+"','')";
	let query = conn.query(sql, (err, results) => {
	    if(err) throw err;

    	res.redirect('/');
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
});

app.get('/edit',(req, res) => {
	var sess = req.session;

	if (sess.user > 0) {
		let sql = "SELECT * FROM user WHERE id_user='" + sess.user + "'";
		let query = conn.query(sql, (err, results) => {
			if(err) throw err;
				res.render('profile_edit',{
				nama_lengkap: results[0].nama_lengkap,
				username: results[0].username,
				biodata: results[0].biodata
			});
		});
	} else {
    	res.redirect('/');
	}
});

app.get('/update_profile',(req, res) => {
 	res.redirect('/');
});
app.post('/update_profile',(req, res) => {
	var sess = req.session;

	if (sess.user > 0) {
		var new_pass = req.body.f_pass;
		if (new_pass=="") {
			var sql = "UPDATE user SET nama_lengkap='"+req.body.f_nml+"', username='"+req.body.f_user+"', biodata='"+req.body.f_biodata+"' WHERE id_user="+sess.user;
		} else {
			var sql = "UPDATE user SET nama_lengkap='"+req.body.f_nml+"', username='"+req.body.f_user + 
					  "', biodata='"+req.body.f_biodata+"', password='"+req.body.f_pass+"' WHERE id_user="+sess.user;
		}
		let query = conn.query(sql, (err, results) => {
		    if(err) throw err;
		    res.redirect('/profile');
		});
		// let sql = "SELECT * FROM user WHERE id_user='" + sess.user + "'";
		// let query = conn.query(sql, (err, results) => {
		// 	if(err) throw err;
		// 		res.render('profile_edit',{
		// 		nama_lengkap: results[0].nama_lengkap,
		// 		username: results[0].username,
		// 		biodata: results[0].biodata
		// 	});
		// });
	} else {
    	res.redirect('/');
	}
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