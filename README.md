# GoAnimate Wrapper
This is an API wrapper for GoAnimate's Legacy Video Maker, which had been retired on *19th December 2019, 03:10 UTC*.	Unlike other services that attempt to sole the same problem, this project allows the LVM to access data peristence and is very portable.  Please keep in mind that not all features designed to run on the original API work properly.
## How to Use
To access this service, install [Node.JS](https://nodejs.org/en/) then clone/download this project.	Once done, unzip the folder, copy the path, and execute the following commands in your command prompt (where `{PATH}` is the folder path you copied):
```console
cd "{PATH}\GoAnimate-Wrapper-master"
npm install
npm start
```
**When done, go to your web browser and navigate to `localhost`.**

# Host On Evennode
1. make a account
2. make a node.js evennode
3. open command prompt on your main pc (NOT EVENNODE) and run this command ``ssh-keygen -t rsa -C "your_email@example.com"``
4. go on the folder you saved it in and open the .PUB file
5. Copy everything inside the file
6. go on evennode, click account settings and paste the file on the public keys for git box and click save.
7. go back to your evennode app and go on the info tab
8. copy the Repository in Git deployment tab.
9. open cmd again and do cd desktop then git clone PASTEREPOHERE
10. get your lvm clone and copy all the files and paste it in the repo folder on your desktop with random letters.
11. go on cmd AGAIN and cd to the folder directory
12. download github desktop at https://desktop.github.com/
13. commit the changes and publish branch

# Host on VPS/ Own pc
if you want to host it on your own pc then simply clone or download this repo.
Then open cmd then cd to the folder 
then do npm install the npm start
