from flask import Flask, Response, redirect, request
from flask.ext.mongoengine import MongoEngine
import datetime
from flask import url_for
from flask import json
from flask import render_template
import hashlib


app = Flask(__name__)
app.config["MONGODB_DB"] = "blogapp"


db = MongoEngine(app)


if __name__ == '__main__':
    app.run(debug=True)


@app.route('/')
def index():
	return render_template('index.html') 


@app.route('/blog/', methods = ['GET'])
def JsonView():
	posts = Blog.objects.limit(100)
	count = len(posts)
	js = "{" + json.dumps("blogs") + ":["
	for post in posts:
		js += "{" + json.dumps("name") + ":" + json.dumps(post.name) + ","
		js += json.dumps("subject") + ":" + json.dumps(post.title) + ","
		js += json.dumps("content") + ":" + json.dumps(post.body) + ","
		js += json.dumps("created") + ":" + json.dumps(post.created.strftime("%a %b %d %H:%M:%S %Y")) + "}"
		try:
			if count > 1:
				js += ","
				count -= 1
		except:
			pass
	js += "]}"
	res = Response(js, status=200, mimetype='application/json')
	return res

@app.route("/newpost/", methods = ['POST'])
def NewPost():
	subject = request.form["title"]
	content = request.form["content"]
	name = request.form["name"]
	post = Blog (title=subject,body=content,name=name)
	if post.save():
		js = "{" + json.dumps("success") + ":" + json.dumps("yes") + "}"
	else:
		js = "{" + json.dumps("success") + ":" + json.dumps("no") + "}"
	res = Response(js, status=200, mimetype='application/json')
	return res

@app.route("/signup/", methods = ['POST'])
def Signup():
	name = request.form["name"]
	password = request.form["password"]
	pword_enc = hashlib.sha256(password).hexdigest()
	email = request.form["email"]
	users = UserDetails (password=pword_enc,name=name)
	try:
		if users.save():
			js = "{" + json.dumps("hashedname") + ":" + json.dumps(hashlib.sha256(name).hexdigest()) + "}"
		else:
			js = "{" + json.dumps("hashedname") + ":" + json.dumps("") + "}"
		res = Response(js, status=200, mimetype='application/json')
	except:
		js = "{" + json.dumps("hashedname") + ":" + json.dumps("") + "}"
		res = Response(js, status=200, mimetype='application/json')
	return res	
	
def check_user(users,pword):
	pword_enc = hashlib.sha256(pword).hexdigest()
	try:
		user1 = UserDetails.objects.get(name=users,password=pword_enc)
		for u in user1:
			return 1
	except:
		return 0

@app.route("/login/", methods = ['POST'])
def Login():
	name = request.form["name"]
	password = request.form["password"]
	u = check_user(name,password)
	if u:
		js = "{" + json.dumps("hashedname") + ":" + json.dumps(hashlib.sha256(name).hexdigest()) + "}"
	else:
		js = "{" + json.dumps("hashedname") + ":" + json.dumps("") + "}"
	res = Response(js, status=200, mimetype='application/json')
	return res

	
	
class UserDetails(db.Document):
	name = db.StringField(max_length=255, required=True, unique=True)
	password = db.StringField(max_length=256, required=True)


	meta = {'allow_inheritance': True,
			'indexes': ['name', 'name']}

class Blog(db.Document):
	created = db.DateTimeField(default=datetime.datetime.now, required=True)
	title = db.StringField(max_length=255, required=True)
	name = db.StringField(max_length=255, required=True)
	body = db.StringField(required=True)


	meta = {'allow_inheritance': True,
			'indexes': ['-created', 'name'],
			'ordering': ['-created']}


