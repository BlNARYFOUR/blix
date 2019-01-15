<h1>Blix.io&emsp;(v5.0)</h1>
Blix.io is a schoolproject on Laravel, websockets, canvas and Vue.JS.
<br>This project is made by Brend Lambert (BinaryFour) in collaboration with Howest, Applied Informatics.

<h2>Status of the project</h2>
The latest Production version is available on the ***master*** branch.
<br>You can find the latest Development version on the ***dev*** branch.
<br>
<br>If you want to run this project on a virtual linux machine, that is linked with the network, 
<br>use the version on the ***dev-vm-linked*** branch.
<h3>root (/)</h3>
On / you can find a basic homepage.
<br>When you press 'PLAY' (and the websocket connection is open, you might have to wait a bit) the username is send to the server.
<br>If the connection was closed, it will retry to make a connection.
<br>Then the terminal of the server displays all the players whom are registered.
<br>When a player dies, he or she will be unregistered after 50 frame cycles.
<br>When a connection is lost or closed, the linked player automatically dies.
<br>Almost everything in the game works (except head on head collision detection).
<br>The Game Over screen shows the stats from just before you died.
<br>
<br>*I replaced all modules by normal Javascript, because it is not supported in Laravel on a public network.*
<br>
<br>For the messageHandling I made a custom Class for registering 'consumers', whom need an adress to listen to, and handler function.
<br>Consumers are added in Game::initConsumers().
<br>
<br>
<h4>Project Requirements</h4>
<h5>UX: complete prototype</h5>
* Unable to link 2 files at the same time, you can find the files in &#60;projectroot>/documentation

<h5>Server technology</h5> 
* Apache: see &#60;projectroot>/documentation
* Digest authentication: guest, Azerty123!
* PHP Laravel: backend framework
* Data store: JSON: All-time highscores are saved in <projectroot>/storage/app/data.json

<h5>Client technology</h5>
* JavaScript: frontend
* Vue.JS: Used for Leaderboard, stats and GameOver screen
* JS Higher-order functions: yes, even used promises
* HTML Canvas: used for playingField, map and overlay
* Responsiveness: applied: disable if mobile, resize window to screen

<h5>Communication</h5>
* Web Sockets: applied

<h3>client (/client)</h3>
On /client a client side version of the game can be found (without server authority).
<br>In terminal you can change the player you control by typing 'myId = &#60;some number under 4&#62;'.
<br>You can use WSAD or the arrow keys to move around. use P to stop moving. (key-bindings are auto translated to other Keyboard layouts e.g. WSAD in Qwerty will be ZQSD in Azerty)
<br>When leaving your field, a barrier is drawn. On re-entry the taken field is converted, provided that no other players are in the taken field. If so, only the barriers are converted.
<br>When you go thru the line of another player, they die. When you collide head on head, both players should die <strong>(NYI)</strong>.
<br>
<br>No settings button or capabilities have been added yet.

<h2>Cloning the project</h2>
<h3>Vagrant</h3>
What to do when cloning this repo:
<br>

***make sure you have a working version of vagrant up and running<br>***
***IMPORTANT: Make sure to disconnect any CiscoVPN-connection when using Vagrant***

* add 
	<br>&emsp;\- map: test.local
	<br>&emsp;&nbsp;&nbsp;to: /home/vagrant/code/test/public
  <br>to Homestead.yaml under 'sites:'

* add '192.168.10.10 blix.local' to 'C:\Windows\System32\drivers\etc\hosts'

* Open powershell

* navigate to your Homestead folder

* Enter 'vagrant reload --provision'

* connect to the VMbox using 'vagrant ssh'

* enter 'composer global require laravel/installer'

* enter 'cd code'

* enter 'laravel new blix'

* clone this repo in 'vagrant-code' under the name 'blix2'

* open the dev branch

* copy everything in blix2 to blix, when prompted, replace conflicting files

* enter 'cd code/blix'

* then enter 'composer update'

* the project should now be ready to use!

**use 'php artisan websocket:run' in your project directory to run the websocketHandler**

<h3>Apache2</h3>

* Setup Apache2 on your server. Make sure to install php7.3!

* Install Composer. Make sure to run "mv composer.phar /usr/bin/composer", so you can use composer anywhere
 on the commandline.
 
* Create a new laravel project using "composer create-project laravel/laravel &#60;project-location>".

* Make sure to make a .conf file in sites-available. You can enable the site using "a2ensite <filename.conf>" 
(root access required).

* Restart Apache2 to update your changes: "systemctl restart apache2".

* Set the permissions:
    <br>- "chown -R www-data:www-data /var/www/html/laravel"
    <br>- "chmod -R 777 /var/www/html/laravel/storage"

* Make a temp directory to clone this repo into.

* Use "rsync -a &#60;source/> &#60;destination/>" to copy every file into the created laravel project.
Files that already exist will be replaced.

* At last run "composer update".

* The project should now be ready to use!

**use 'php artisan websocket:run' in your project directory to run the websocketHandler**