"Custom_Quixe_Miniext" by "Huck Hooks" [begins here].

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

Before
 printing the name of a thing which is autolinked when hack_hooked is 
true, say "[character number 1 in the printed name]+scroll{".
After printing the name of a thing which is autolinked  when hack_hooked is true, say "}".

Before printing the name of a direction  when hack_hooked is true, say "[character number 1 in the printed name]+scroll{".
After printing the name of a direction  when hack_hooked is true, say "}".

Before
 printing the name of a room which is autolinked  when hack_hooked is 
true, say "[character number 1 in the printed name]+scroll{".
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
		

[Custom_Quixe_Miniext ends here.]

Release along with an interpreter and the source text.

The Testpage is a room.

The little foo is a person. It is here.

The baz is here.

The Scrollbar is east of the Testpage.






