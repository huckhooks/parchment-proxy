"Hack_Hooks_Demo" by "Huck Hooks"

Part - Configure Code

Release along with the "Custom-Quixe" interpreter and the source text.

The little foo is a person. "A [item described]. It jumps around and sings: who whoa we woo.".
The description is "[initial appearance] First thing this Wizard drops in a new project. It is looking for a bar."


Part - Mini-exts

Chapter - Quixe switch

The hack_hooked is a truth state variable.
The hack_hooked is true.

Section - Ide only - not for release

when play begins: now the hack_hooked is false.

Chapter - Commenting

After reading a command (this is the ignore comments rule):
if the player's command matches the regular expression "^#",
reject the player's command;

Chapter - Quick linking

A link is a kind of door.
"A [if open]visited [end if]link leads [direction of the item described from the location]
to the [other side].".

Chapter - Hyperlinks

When play begins, if hack_hooked is true, now the left hand status line is "[location]inventory{}".

An object can be autolinked or selflinked. An object is usually autolinked.

Before printing the name of a thing which is autolinked when hack_hooked is true, say "[character number 1 in the printed name]+scroll{".
After printing the name of a thing which is autolinked  when hack_hooked is true, say "}".

Before printing the name of a direction  when hack_hooked is true, say "[character number 1 in the printed name]+scroll{".
After printing the name of a direction  when hack_hooked is true, say "}".

Before printing the name of a room which is autolinked  when hack_hooked is true, say "[character number 1 in the printed name]+scroll{".
After printing the name of a room which is autolinked  when hack_hooked is true, say "}".


Chapter - Scrolling

Scrolling is an action applying to one visible thing. 

Understand "scroll [any room]" as scrolling. 
Understand "scroll [any thing]" as scrolling. 
Understand "scroll [any direction]" as going. 

Understand "scroll to [any room]" as scrolling. 
Understand "scroll to [any thing]" as scrolling. 
Understand "scroll to [any direction]" as going. 

Carry out scrolling:
	let the destination be the noun;
	if the noun is a thing:
		let the destination be the location of the noun;
	otherwise if the location is the destination:
		say "[italic type]->Look[roman type].";
		try looking;
	let the way be the best route from the location to the destination, using doors;
	while the way is not nothing:
		let steps be the number of moves from location to destination, using doors;
		say "[italic type]->[way]. Scrolling from [location], [steps] pages left.[roman type]";
		try going the way;
		let the way be the best route from the location to the destination, using doors;
	if the location is the destination:
		if the noun is a thing:
			say "[italic type]->Examine the [noun][roman type].";
			try examining the noun;
	otherwise:
		say "No way to reach [the noun]."


Chapter - Exitlister

A room can be obscure or  obvious.

After looking:
	say "You can go ";
	repeat with direction running through directions:
		let over-there be the room direction from the location;
		if over-there is a room:
			if over-there is obvious or over-there is visited:
				say "[bold type][Direction][roman type] to the [bold type][over-there][roman type], ";
			otherwise:
				say "[bold type][Direction][roman type] somewhere, ";
		


Part - Overview Room

The Homepage is a room.
"It is early in the morning. You are on a website. A moment ago you checked a link from a forum. Something about a custom quixe. Suddenly you felt dizzy, and for a moment reality and browser mixed up. Probably the wrong amount of coffee. As a slight after-effect, when you scroll you think in compass directions. Regenerating you look at the screen."

The little foo is here.

The project homepage is here with description "[item described].
Popup: http://daqgit.appspot.com/".

The parts of a broom is here with description "The [item described] are mostly connected. There is ink on it. Like the one this page is written with. You can try it. Popup: ../../edit-i7-firefox.html". It is plural-named.

The bucket of ink is here with description "This [item described] seems to match the ink on the broom. Unfortionally there is still no puzzle connecting them."

The lab is east of the Homepage. "This is a webwizards laboratory. Here he tests and learns stuff."

The Tags is here. They are plural-named. The description is "You read quite fascinated:  <a href= and <hr> and -->".

the big senior spider is here with description "You see a really big spider in a corner of the room. You recognize it as googliensis spideriosis."

the big junior spider is here with description "You see a big spider busy eating in a corner of the room. You try to recognize it, but it permanently distracts you. With a loud hissing 'Bing bing bing bing !!1!'"

the colorfull spider is here with description "You see a colorfull spider in a corner of the room. Happy and noisily it slurps some webpages."

Part - Links

The References is south of the Homepage.
Understand "External links" as References. [Legacy]

The original quixe link is here. The description is
"[item described]. Popup: http://eblong.com/zarf/glulx/quixe/".

The custom quixe link is here. The description is
"The [item described]. Popup: https://github.com/huckhooks/quixe".

The inform7 link is here. The description is
"the [item described]. Popup: http://inform7.com/"

The original parchment-proxy link is here. The description is
"[item described]. Popup: http://zcode.appspot.com/".

The Hucks quixe-clone link is here. The description is
"the [item described]. Popup: https://github.com/huckhooks/quixe".

The Hucks proxy-clone link is here. The description is
"the [item described]. Popup: https://github.com/huckhooks/parchment-proxy".


Part - Features

The Features are west of the homepage. "This is a somewhat dusty page, listing features of an early version of this fork of the engine."


Chapter - Browser history

The Browser history is west of the Features. 

The url bar is here.
The description is "If you look carefully at the url in your real browser,
you see weird chars behind the '#'".

The back button is here.
The description is "If you press this button in your real browser,
you can go back one step."

The copy paste is here. The description is
"If you copy the url and paste it in another browser,
it will go to where you are now."

The title is here. The Description is
"The title now contains the last input and its input-number."



Chapter - Browsies

The Browsies are north of the Features and west of the Toolbox. "So is it written in the rules of IF: Basically the world consists of Stuff, Feelis and Browsies. Stuff is, well Stuff. Browsies are stuff which lives in weird places called the otherworld. Other tabs, other windows, you name it. Feelis are physical impossibilities. It is said you can touch them, but there is no way to move them through the web. They where quite liked in the olden days, which are also impossible because there was no web. Browsies are Feelis with more reality. But  theykeep lots of the olden spirituallity, if rightly done. Some Engines simply claim they dont exists, this does not."


The sourcecode is here with description
"The [item described] shows how this Infoventure is written.
Popup: ../Release/source.html".

The default homepage is here with description "[item described].
Popup: ../Release/index.html".

The browsie in an iframe is here. The description is
"A [item described]. IFrame: 10em, about_browsies.html"

The browsie in a popup is here. The description is
"A [item described]. Popup: about_browsies.html"

The browsie in this window is here. The Description is
"A [item described]. Browse: about_browsies.html"

The crazy compass is here. The description is
"A [item described]. Image: waiting.gif"

Part - Toolbox Room

The Toolbox is north of the Homepage and east of the Browsies.

The Foxy Broom Inform7 IDE is east of the Toolbox.

"The [item described] is a minimal inform7-ide running in the browser, but using local files."

The requirements doc is here with description "It is tested with firefox 4.0, cli-inform and maverick. Should run everywhere with a linux and cli-inform. Or with any cli-inform, with some path-adjusting."

The installation doc is here with description
"Installation: download, untar (nautilus knows how). run install_cli_inform_linux.sh to get the cli-inform7 in the expected place. run edit-i7-firefox.html in firefox."

The usage doc is here with description
"Usage: press save&run. This will ask 'A script from file:// bla bla...'. Check 'remember decision' and give ok. Now the compiling should work. The ok is required again each time you restart the browser. See [security doc]."

The security doc is here with description
"Security, about this question: A locally stored page can request the same privileges as an addon. Which this ide needs for fileaccess and calling the compiler. Which it could also use to install a virus. Which is why firefox asks. So give it a quick thought each time. 'Hu? Ok, its from my inform7-page'."

The newest foxy broom download is here with description "[item described]. Popup: http://huckhooks.github.com/quixe/shrinkwrapped/newest-edit.tar.gz"


The Otherworld tools are north of the Toolbox. "Here is a list of more or less usefull stuff. It is more like a placeholder with some lazily picked stuff. With time it may hold stuff the wizard needs when camping in other worlds."
Understand "External tools" as Otherworld tools

The inform7 extension list is here. The description is
"A [item described]. Scroll down there.
Popup: http://inform7.com/write/extensions/".

The firefox multibrowser extension is here. The description is
"A [item described] called 'Open With'. Usefull to test things in other browsers, going straight to the same page."

The translator de2en is here with description "[item described]. Popup: http://translate.google.de/?tab=mT#de|en|"







