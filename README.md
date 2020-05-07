name of the application: invention-gallery
link to the application: https://invention-gallery.herokuapp.com/

to run the application under the 495-hw2 folder:
npm install
npm start

!!!!!!	After adding a new invention, user home page is directly openning. However, sometimes you should refresh the page to see the newly added invention.    !!!!!!!!

View folder has the .pug files these are used to produce html.
Routes folder contains index.js and user.js. index.js file handles the post and get requests. Some of the pages are created by using html insted of pug, these can be also seen under routes folder.

In database there are two collectins named users and invention. Users collection contains user name and rating of the user. Invention collection contains the necessary information about the inventions.

---Home Page---
If an unregistered users wants to use the application, he/she should register by using the "Add User" button. After they are registered, Login page is opened directly. By logging in, users can reach to the user home page. 

--User Home Page--
This page shows user's rating, and a gallery thet shows all of the inventions even if they are exhibited by someone else. The gallery contains inventions' name, rating, inventor's name, cost, materials that are used etc. A user can rate any invention and invention's rating is updated directly.

--Add(Exhibit) Invention--
By clicking the "Add Invention" button, users can add new invention by filling up the coming form. In this form there is an optional elements part. This part is not necessary and can be left empty. If a user wants to fill this part, he/she first must indicate the optional element's type and then give the optional information.

--Drop Invention--
Users can only drop their inventions. The dropped invention is only deleted from gallery. It is still in the database.

