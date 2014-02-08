/*jshint devel: true*/
/*global TweenMax: true*/
/*global Elastic: true*/

$(document).ready(function(){

	var $m = {

		/*
         ___       _    _    _                 
        / __| ___ | |_ | |_ (_) _ _   __ _  ___
		\__ \/ -_)|  _||  _|| || ' \ / _` |(_-<
        |___/\___| \__| \__||_||_||_|\__, |/__/
                                     |___/     
		*/

		s : {

			mod : $('body').children('.module'),

			questionWeight : [], // hold all of the weights gathered from each answered question to be sorted and presented at the restults stage

			badgeSelection : null, // store the user badge selection to offer up the correct content at the end of the quiz

			ani : 0.25, // the global speed that the all animations are referenced to

			col : {
				blue : '#00b4ff', // a reference to the main blue in the design
				blueD : '#005375' // a reference to the dark blue in the design
			},

			gen : function(){ // generate and initial dtnamic settings...

				console.log('--> generating settings...');

			} // end of gen fnc

		}, // end of settings obj











		/*
          ___                             _ 
         / __| ___  _ _   ___  _ _  __ _ | |
        | (_ |/ -_)| ' \ / -_)| '_|/ _` || |
         \___|\___||_||_|\___||_|  \__,_||_|
                                       
		*/

		g : { // general functions

			getJson : function(){

				$.getJSON('js/questionnaire-content.json', function($json){

					console.log('--> got JSON (length = ' + $json.length + ')...');

					$m.s.json = $json; // store the returned JSON in the settings obj
					$m.g.nextFrame(null); // run the next frame fnc with "null" as a reference so that the script know this is the first frame in the sequence that is being built

				}).error(function() {

					console.log('--> there was an error getting JSON!');

					//$m.jsonErr(); // run json error function...

				});

			}, // end of getJson fnc

			nextFrame : function($c){

				console.log('--> initialising...');

				var $ref = ($c !== null) ? $m.g.newRef($c) : 0, // get the new JSON reference to gather data from... if there is no source in which to update then this must be the first from so set reference on zero   
					$json = $m.s.json[$ref], // gett he JSON data corrorsponding to the reference number above
					$t = $json.containerType, // find out the type of HTML interface we are going to create
					$html = $m[$t].populate.init($json, $t, $ref), // populate the HTML with the JSON data
					$mod = $m.s.mod; // get a DOM reference to the module from the settings obj

				console.log('parsing JSON data...');
				console.log('   -> ref = ' + $ref);
				console.log('   -> type = ' + $t);

				if($c !== null){$m[$t].listeners.off($c);} // turn all event listeners off that were linked to the previous HTML structure

				$mod.html($html); // insert the new HTML into the DOM

				$c = $mod.children('.container-shadow'); // redefine $c now that is has been re-inserted into the DOM

				$m.g.transition.panIn($c); // transition the new HTML to view
				$m[$t].listeners.on($c, $t, $json); // generate the listeners for this new HTML structure

			}, // end of init fnc

			state : function($this, $state){

				$this.css({'display' : $state}); // chage the state of a specified DOM element

			}, // end of state fnc

			transition : {

				panIn : function($c){

					console.log('--> transition in new content...');

					TweenMax.set($c, {'opacity' : '0', 'transform' : 'translateX(50px)'}); // set the new content to over shoot to the right so taht it can be tweened into place...

					TweenMax.to($c, $m.s.ani * 3, { // fade and transform the content into frame...
						'opacity' : '1',
						'transform' : 'translateX(0)'
					});

				}, // end of scaleOut fnc

				panOut : function($c){

					console.log('--> transition out old content...');

					TweenMax.to($c, $m.s.ani * 3, { // fade and transform the content out of frame...
						'opacity' : '0',
						'transform' : 'translateX(-50px)',
						'onComplete' : $m.g.nextFrame,
						'onCompleteParams' : [$c]
					});

				} // end of scaleOut fnc

			}, // end of transition obj

			newRef : function($c, $ref){

				console.log('--> getting new json reference number...');

				$ref = $c.attr('data-ref'); // get the current reference
				$ref = parseInt($ref, 10); // parse to an interger

				return $ref + 1; // increment by 1 and return...

			}, // end of newRef fnc

			getWeight : function($this, $c){

				var $jRef = $c.attr('data-ref'), // JSON reference
					$qRef = $this.attr('data-ref'), // question reference
					$weight = $m.s.json[$jRef].contents[$qRef].weight; // pull the correct weight in from JSON

				$m.s.questionWeight.push($weight); // push this new array set into the questionWeight array held in the setting obj

			}, // end of get weight

			navBtn : { // generic navigation button "mouseenter" and "mouseleave" actions...

				mouseenter : function($this){

					//console.log('running "mouseenter" actions for welcome continue button...');

					var $icon = $this.children('.icon'),
						$ani = $m.s.ani;

					$this.attr({'data-state' : 'over'});

					TweenMax.to($icon, $ani * 3, {
						'left' : '-80px',
						'yoyo' : true,
						'repeat' : -1
					});

				}, // end of mouseenter fnc

				mouseleave : function($this){

					//console.log('running "mouseleave" actions for welcome continue button...');

					var $icon = $this.children('.icon'),
						$ani = $m.s.ani;

					$this.attr({'data-state' : 'up'});

					TweenMax.to($icon, $ani, {'left' : '-95px'});

				} // end of mouseenter fnc

			}, // end of navBtn obj

			questionFooter : function($ref){

				var $json = $m.s.json, // get entire JSON data set
					$jLen = $json.length,
					$qLen = 0, // number of questions inside the JSON
					$html = { // object to store the HTML taht will be returned and inserted into the DOM
						'qVisual' : '',
						'qText' : ''
					},
					$i, $t, $cur, $wth;

				for($i = 0; $i < $jLen; $i++){

					$t = $json[$i].containerType; // get the type of the current json obj

					if($t === 'questionText' || $t === 'questionImage'){$qLen++;} // if the current JSON data is a question type then increate the question counter by one
					if($i === $ref){$cur = $qLen;} // if the current JSON data is equal to the container reference then this is the current question showen to the user

				} // end of for loop

				$wth = 600 / $qLen;

				for($i = 0; $i < $qLen; $i++){

					$html.qVisual += '<li data-ref="' + $i + '" ';
					if($i + 1 === $cur){$html.qVisual += 'class="active"';}
					$html.qVisual += 'style="width:' + $wth + 'px;"></li><!---->';

				} // end of for loop

				$html.qText = 'Question ' + $cur + ' of ' + $qLen;

				return $html;

			} // end of questionFooter fnc

		}, // end of general obj











		/*
        __      __     _                      
        \ \    / /___ | | __  ___  _ __   ___ 
         \ \/\/ // -_)| |/ _|/ _ \| '  \ / -_)
          \_/\_/ \___||_|\__|\___/|_|_|_|\___|
                                      
		*/

		welcome : {

			populate : {

				init : function($json, $t, $ref){

					return '<div class="container-shadow" data-ref="' + $ref + '" data-type="' + $t + '">' +
							'<h2 class="main-heading">What kind of traveller are you?</h2>' +
							'<div class="main-content">' +
								'<div class="intro">' +
									'<p>For the best experiences in Australia, we have created travel styles to suit who you are. You might be a Nature Seeker? Eco Indulger? Food Fanatic? Active Adventurer? Or maybe a Coastal Cruiser? Our fun quiz will help you find what kind of traveller you are and reveal the best Australian experiences to you.</p>' +
									'<p>Take the quiz now to be in to win a $10,000 experience flying Qantas</p>' +
									'<p>Check out this weeks Sunday Star Times for a promo code that gets you an additional entry into the competition!</p>' +
								'</div>' +
								'<div class="btn nav continue">' +
									'<div class="icon"></div>' +
									'Continue' +
								'</div>' +
							'</div>' +
							'<div class="footer"></div>' +
						'</div>';

				} // end of init fnc

			}, // end of populate fnc

			listeners : {

				on : function($c){

					$c.find('.continue')
						.on('mouseenter.disposable', function(){ $m.g.navBtn.mouseenter($(this)); }) // use the generic nav button action from the general obj
						.on('mouseleave.disposable', function(){ $m.g.navBtn.mouseleave($(this)); }) // use the generic nav button action from the general obj
						.on('click.disposable', function(){ $m.g.transition.panOut($c); }); // transition out the welcome DOM elements...

				}, // end of on fnc

				off : function($c){

					$c.find('.continue').off('.disposable'); // remove event listeners from the continue button

				} // end of on fnc

			}, // end of listeners obj

			actions : {} // end of actions obj

		}, // end of welcome obj











		/*
          ___                  _    _              _____           _   
         / _ \  _  _  ___  ___| |_ (_) ___  _ _   |_   _|___ __ __| |_ 
        | (_) || || |/ -_)(_-<|  _|| |/ _ \| ' \    | | / -_)\ \ /|  _|
         \__\_\ \_,_|\___|/__/ \__||_|\___/|_||_|   |_| \___|/_\_\ \__|                                                               
                                      
		*/

		questionText : {

			populate : {

				init : function($json, $t, $ref){

					var $footer = $m.g.questionFooter($ref); // fetch the object containing the HTML for both the visual and text footer sections

					return '<div class="container-shadow" data-ref="' + $ref + '" data-type="' + $t + '">' +
								'<h2 class="main-heading">' +
									'<div class="icon"></div>' +
									$json.heading +
								'</h2>' +
									$m.questionText.populate.questions($json) + // generate the questions bansed on the content in the JSON file...
								'<div class="footer progress">' +
									'<ul class="visual">' +
										$footer.qVisual + // input the visual HTML from the footer obj
									'</ul>' +
									'<p class="text h4">' +
										$footer.qText +  // input the text HTML from the footer obj
									'</p>' +
								'</div>' +
							'</div>';

				}, // end of init fnc

				questions : function($json){

					var $len = $json.contents.length, // find the question amount
						$html = '<ul class="main-content" data-length="' + $len + '">', // set the amount of the questions that exist within the list
						$i;

					for($i = 0; $i < $len; $i++){

						$html += '<li class="btn answer" data-ref="' + $i + '" data-state="up">' +
									'<div class="icon"></div>' +
									$json.contents[$i].answer + // input the answer text from JSON
								'</li><!---->';

					} // end of for loop

					return $html += '</ul>'; // return the HTML object back to be inserted into the DOM

				} // end of questions fnc

			}, // end of populate obj

			listeners : {

				on : function($c, $t){

					$c.children('.main-content')
						.on('mouseenter.disposable', '.answer', function(){ $m[$t].actions.answer.mouseenter($(this)); })
						.on('mouseleave.disposable', '.answer', function(){ $m[$t].actions.answer.mouseleave($(this)); })
						.on('click.disposable', '.answer', function(){ $m[$t].actions.answer.onclick($(this), $c); });

				}, // end of on fnc

				off : function($c){

					$c.children('.main-content').children('.answer').off('.disposable'); // remove event listeners from the answer buttons

				} // end of on fnc

			}, // end of listeners obj

			actions : {

				answer : {

					mouseenter : function($this){

						var $icon = $this.children('.icon'),
							$ani = $m.s.ani;

						$this.attr({'data-state' : 'over'});

						TweenMax.set($icon, {'display' : 'block'}); // change display state before the animation begins
						TweenMax.to($icon, $ani, {'opacity' : '1'}); // tween the opacity to 100% (this seperate tween is NOT set to loop)
						TweenMax.to($icon, $ani * 3, { // set the continuous animation loop 
							'left' : '-90px',
							'yoyo' : true,
							'repeat' : -1
						});

					}, // end of mouseenter fnc

					mouseleave : function($this){

						var $icon = $this.children('.icon'),
							$ani = $m.s.ani;

						$this.attr({'data-state' : 'up'});

						TweenMax.to($icon, $ani, { // set all proporties to their dormant states...
							'left' : '-115px',
							'opacity' : '0',
							'onComplete' : $m.g.state,
							'onCompleteParams' : [$icon, 'none'] // change the icons display to none after the tween has been completed
						});

					}, // end of mouseenter fnc

					onclick : function($this, $c){

						$this.attr({'data-state' : 'active'});
						$m.g.getWeight($this, $c); // get the weight array from JSON for the chosen answer
						$m.g.transition.panOut($c); // transition this current module off stage to be replaced by the next JSON content

					} // end of onclick fnc

				} // end of answer obj

			} // end of actions obj

		}, // end of questionText obj











		/*
          ___                  _    _              ___                         
         / _ \  _  _  ___  ___| |_ (_) ___  _ _   |_ _| _ __   __ _  __ _  ___ 
        | (_) || || |/ -_)(_-<|  _|| |/ _ \| ' \   | | | '  \ / _` |/ _` |/ -_)
         \__\_\ \_,_|\___|/__/ \__||_|\___/|_||_| |___||_|_|_|\__,_|\__, |\___|
                                                                    |___/      
		*/

		questionImage : {

			populate : {

				init : function($json, $t, $ref){

					var $footer = $m.g.questionFooter($ref); // fetch the object containing the HTML for both the visual and text footer sections

					return '<div class="container-shadow" data-ref="' + $ref + '" data-type="' + $t + '">' +
								'<h2 class="main-heading">' +
									'<div class="icon"></div>' +
									$json.heading +
								'</h2>' +
									$m.questionImage.populate.questions($json, $ref) + // generate the questions bansed on the content in the JSON file...
								'<div class="footer progress">' +
									'<ul class="visual">' +
										$footer.qVisual + // input the visual HTML from the footer obj
									'</ul>' +
									'<p class="text h4">' + $footer.qText + '</p>' + // input the text HTML from the footer obj
								'</div>' +
							'</div>';

				}, // end of init fnc

				questions : function($json, $ref){

					var $len = $json.contents.length, // find the question amount
						$html = '<ul class="main-content" data-length="' + $len + '">', // set the amount of the questions that exist within the list
						$i;

					for($i = 0; $i < $len; $i++){

						$html += '<li class="btn answer" data-ref="2" data-state="up" style="background-image: url(img/module-' + $ref + '-answer-' + $i + '.jpg);">' + // set the image reference
									'<div class="icon"></div>' +
								'</li><!---->';

					} // end of for loop

					return $html += '</ul>'; // return the HTML object back to be inserted into the DOM

				} // end of questions fnc

			}, // end of populate obj

			listeners : {

				on : function($c, $t){

					$c.children('.main-content')
						.on('mouseenter.disposable', '.answer', function(){ $m[$t].actions.answer.mouseenter($(this)); })
						.on('mouseleave.disposable', '.answer', function(){ $m[$t].actions.answer.mouseleave($(this)); })
						.on('click.disposable', '.answer', function(){ $m[$t].actions.answer.onclick($(this), $c); });

				}, // end of on fnc

				off : function($c){

					$c.children('.main-content').children('.answer').off('.disposable'); // remove event listeners from the answer buttons

				} // end of on fnc

			}, // end of listeners obj

			actions : {

				answer : {

					mouseenter : function($this){

						var $icon = $this.children('.icon'),
							$sib = $this.siblings().not($this),
							$ani = $m.s.ani;

						$this.attr({'data-state' : 'over'});
						TweenMax.set($this, {'opacity' : '1'}); // set opacity to 100% via TweenMax to kill any current opacity tweens currently acting on this object (causing a weird error with the pseudo element)

						TweenMax.set($icon, {'display' : 'block'}); // change display state before the animation begins
						TweenMax.to($icon, $ani, {'opacity' : '1'}); // tween the opacity to 100% (this seperate tween is NOT set to loop)
						TweenMax.to($icon, $ani * 3, { // set the continuous animation loop 
							'left' : '-70px',
							'top' : '-70px',
							'yoyo' : true,
							'repeat' : -1
						});

						TweenMax.to($sib, $ani, {'opacity' : '0.5'}); // fade all other images that are not currently being interacted with

					}, // end of mouseenter fnc

					mouseleave : function($this){

						var $icon = $this.children('.icon'),
							$sib = $this.siblings(),
							$ani = $m.s.ani;

						$this.attr({'data-state' : 'up'});

						TweenMax.to($icon, $ani, { // set all proporties to their dormant states...
							'left' : '-90px',
							'opacity' : '0',
							'top' : '-90px',
							'onComplete' : $m.g.state,
							'onCompleteParams' : [$icon, 'none'] // change the icons display to none after the tween has been completed
						});

						TweenMax.to($sib, $ani, {'opacity' : '1'}); // bring all other images that are not currently being interacted with back to 100% opacity

					}, // end of mouseenter fnc

					onclick : function($this, $c){

						$this.attr({'data-state' : 'active'});
						$m.g.getWeight($this, $c); // get the weight array from JSON for the chosen answer
						$m.g.transition.panOut($c); // transition this current module off stage to be replaced by the next JSON content

					} // end of onclick fnc

				} // end of actions obj

			} // end of actions obj

		}, // end of questionImage obj











		/*
         ___                 _  _       
        | _ \ ___  ___ _  _ | || |_  ___
        |   // -_)(_-<| || || ||  _|(_-<
        |_|_\\___|/__/ \_,_||_| \__|/__/
                                    
		*/

		results : {

			populate : {

				init : function($json, $t, $ref){

					var $results = $m[$t].populate.results(); // parse the user results into a winner and loser object for insertion into the HTML

					return '<div class="container-shadow" data-ref="' + $ref + '" data-type="' + $t + '">' +
							'<h2 class="main-heading">Congratulations you are ' + $json.profiles[$results.winner].indefiniteArticle + ' ' + $json.profiles[$results.winner].kind + '</h2>' +
							'<div class="main-content" data-profile="' + $results.winner + '">' +
								'<img class="winner-image" src="img/profile-badge-' + $results.winner + '.png">' +
								'<div class="intro">' +
									'<span class="blurb">' + $json.profiles[$results.winner].blurb + '</span>' +
									'<div class="btn nav continue">' +
										'<div class="icon"></div>' +
										'Continue' +
									'</div>' +
								'</div>' +
							'</div>' +
							'<div class="footer">' +
								'<h3>' +
									'<p>Not quite the traveller profile you thought you\'d be?</p>' +
									'<p>Are you one of the following?</p>' +
								'</h3>' +
								$m[$t].populate.extraProfile($json, $results) + // create a list of the loser badges
							'</div>' +
						'</div>';

				}, // end of init fnc

				results : function(){

					var $tw = $m.s.questionWeight, // get the stored question weights
						$qLen = $tw.length, // how many questions have been answered?
						$wLen = $tw[0].length, // how many badge options are there?
						$cw = [], // compiled weight
						$results = { // results object to return back and populate into HTML content...
							'winner' : 0,
							'loser' : []
						},
						$i, $j;

					// create the "compiled weight" array base
					// loop each badge option in which to add the weights for each section onto later...
					for($j = 0; $j < $wLen; $j++){

						$cw.push(0); // ...each badge option will start out as zero and be built upon with each answers value e.g. [0, 0, 0, 0, 0]

					} // end of for loop

					// add up all the user chosen weights
					// loop though each of the questions...
					for($i = 0; $i < $qLen; $i++){

						// ...then loop though each questions individual weight values...
						for($j = 0; $j < $wLen; $j++){

							$cw[$j] += $tw[$i][$j]; // ...and add them onto their corrorsponding location in the "compiled weight" array

						} // end of for loop

					} // end of for loop

					// check for a winner
					// loop through each of the totaled weights inside the "compiled weight" aray...
					for($j = 0; $j < $wLen; $j++){

						console.log('is ' + $cw[$j] + ' > ' + $results.winner);

						if($cw[$j] > $cw[$results.winner]){ // ...if the current weight is greater than the current "winner" value...

							$results.winner = $j; // ...the replace the "winner" value with the JSON results arrray reference (not the total weight value as we will use this reference later to populate the HTML content with the correct badge image / blurb)

						} // end of if statement

					} // end of for loop

					// check for losers
					// loop each badge option...
					for($j = 0; $j < $wLen; $j++){

						if($j !== $results.winner){$results.loser.push($j);} // ...if this badge option is NOT the winner reference then add its JSON reference into the loser array

					} // end of for loop

					return $results; // return the "results" object to be populated into the HTML

				}, // end of results

				extraProfile : function($json, $results){

					var $len = $results.loser.length, // find the amount of loser badges
						$html = '<ul class="extra-profile-container" data-length="' + $len + '">', // set the amount of the badges that exist within the list
						$i;

					for($i = 0; $i < $len; $i++){

						$html += '<li class="profile-image btn" data-profile="' + $results.loser[$i] + '">' + // set the badge type
									'<div class="icon" style="background-position: ' + ($results.loser[$i] * -100) + 'px -410px"></div>' + // match the icon color in the transparent sprite
									'<img src="img/profile-badge-' + $results.loser[$i] + '.png">' + // reference the badge image
								'</li><!---->';

					} // end of for loop

					return $html += '</ul>'; // return the HTML object back to be inserted into the DOM

				} // end of extraProfile fnc

			}, // end of populate obj

			listeners : {

				on : function($c, $t, $json){

					$c.children('.footer').find('.extra-profile-container')
						.on('mouseenter.disposable', '.profile-image', function(){ $m[$t].actions.badge.mouseenter($(this)); })
						.on('mouseleave.disposable', '.profile-image', function(){ $m[$t].actions.badge.mouseleave($(this)); })
						.on('click.disposable', '.profile-image', function(){ $m[$t].actions.badge.onclick.init($(this), $c, $t, $json); });

					$c.find('.continue')
						.on('mouseenter.disposable', function(){ $m.g.navBtn.mouseenter($(this)); }) // use the generic nav button action from the general obj
						.on('mouseleave.disposable', function(){ $m.g.navBtn.mouseleave($(this)); }) // use the generic nav button action from the general obj
						.on('click.disposable', function(){
							$m.g.transition.panOut($c);
							$m[$t].actions.badge.badgeSelection($c, $json); // get the current user selected badge and store it in the global settings obj
						}); // transition out the results DOM elements...

				}, // end of on fnc

				off : function($c){

					$c.children('.footer').find('.extra-profile-container').off('.disposable'); // remove event listeners from the badge buttons

					$c.find('.continue').off('.disposable'); // remove event listeners from the continue button

				} // end of on fnc

			}, // end of listeners obj

			actions : {

				badge : {

					mouseenter : function($this){

						var $icon = $this.children('.icon'),
							$sib = $this.siblings().not($this),
							$ani = $m.s.ani;

						$this.attr({'data-state' : 'over'});
						TweenMax.set($this, {'opacity' : '1'}); // set opacity to 100% via TweenMax to kill any current opacity tweens currently acting on this object (causing a weird error with the pseudo element)

						TweenMax.set($icon, {'display' : 'block'});
						TweenMax.to($icon, $ani, {'opacity' : '1'});
						TweenMax.to($icon, $ani * 3, {
							'left' : '-45px',
							'top' : '-45px',
							'yoyo' : true,
							'repeat' : -1
						});

						TweenMax.to($sib, $ani, {'opacity' : '0.5'});

					}, // end of mouseenter fnc

					mouseleave : function($this){

						var $icon = $this.children('.icon'),
							$sib = $this.siblings(),
							$ani = $m.s.ani;

						$this.attr({'data-state' : 'up'});

						TweenMax.to($icon, $ani, {
							'left' : '-65px',
							'opacity' : '0',
							'top' : '-65px',
							'onComplete' : $m.g.state,
							'onCompleteParams' : [$icon, 'none']
						});

						TweenMax.to($sib, $ani, {'opacity' : '1'});

					}, // end of mouseenter fnc

					onclick : {

						init : function($this, $c, $t, $json){

						console.log('$t = ' + $t);

						var $mc = $c.find('.main-content'),
							$oldWin = $mc.attr('data-profile'), // old winner reference
							$newWin = $this.attr('data-profile'); // new winner reference
							

						// update the winner data...
						$c.find('.main-heading').text('Congratulations you are ' + $json.profiles[$newWin].indefiniteArticle + ' ' + $json.profiles[$newWin].kind);
						$mc.attr({'data-profile' : $newWin});
						$m[$t].actions.badge.onclick.scaleOut($mc.find('.winner-image'), $newWin, 'winner', $t);
						$mc.find('.blurb').text($json.profiles[$newWin].blurb);

						// update the loser data...
						$this.attr({'data-profile' : $oldWin});
						$m[$t].actions.badge.onclick.scaleOut($this, $oldWin, 'loser', $t);

						}, // end of init fnc

						winnerScaleIn : function($this, $ref){

							$this.attr({'src' : 'img/profile-badge-' + $ref + '.png'}); // update image
							
							TweenMax.set($this, {'transform' : 'scale(0.75)'}); // reset the scale to less than one so that it can spring up during animation
							TweenMax.to($this, $m.s.ani, { // scale opacity and scale back to 1...
								'opacity' : '1',
								'transform' : 'scale(1)'
							});

						}, // end of scaleIn fnc

						loserScaleIn : function($this, $ref){

							$this.find('img').attr({'src' : 'img/profile-badge-' + $ref + '.png'}); // update image

							$this.find('.icon').css({'background-position' : ($ref * -100) + 'px -410px'}); // update icon to correct color

							TweenMax.set($this, {'transform' : 'scale(1.25)'}); // reset the scale to more than one so that it can shrink down during animation
							TweenMax.to($this, $m.s.ani, { // scale opacity and scale back to 1...
								'opacity' : '1',
								'transform' : 'scale(1)'
							});

						}, // end of scaleIn fnc

						scaleOut : function($this, $ref, $kind, $t){

							console.log('$kind = ' + $kind);

							var $scale = ($kind === 'winner') ? 1.15 : 0.75; // set the scale of the "winner" and "loser" images to be opposites

							TweenMax.to($this, $m.s.ani, {
								'opacity' : '0',
								'transform' : 'scale(' + $scale + ')',
								'onComplete' : $m[$t].actions.badge.onclick[$kind + 'ScaleIn'], // send off to eithe the "winner" or "loser" scaleIn fnc
								'onCompleteParams' : [$this, $ref]
							});

						} // end of scaleOut fnc

					}, // end of onclick fnc

					badgeSelection : function($c, $json){

						var $badgeNum = $c.children('.main-content').attr('data-profile'); // get the current user selected badge and store it in the global settings obj
						$m.s.badgeSelection = $json.profiles[$badgeNum]; // store the chosen profile badge data in the global settings obj

					} // end of badgeSelection fnc

				} // end of badge obj

			} // end of actions obj

		}, // end of results obj











		/*
         _   _                 ___                 
        | | | | ___ ___  _ _  | __|___  _ _  _ __  
        | |_| |(_-</ -_)| '_| | _|/ _ \| '_|| '  \ 
         \___/ /__/\___||_|   |_| \___/|_|  |_|_|_|
                                    
		*/

		userForm : {

			populate : {

				/*
					create a hidden field with the type of badge!
					make sure to validate!
				*/

				init : function($json, $t, $ref){

					return '<div class="container-shadow" data-ref="' + $ref + '" data-type="' + $t + '">' +
							'<h2 class="main-heading">' +
								'Competition Form' +
								'<div class="icon"></div>' +
								'</h2>' +
							'<div class="main-content">' +
								'<h3 class="intro">Enter your details below to be in to win a $10,000 Australian experience.</h3>' +
								'<a class="btn nav prize" href="www.stuff.co.nz/prize" target="_blank">' +
									'<div class="icon"></div>' +
									'View your prize' +
								'</a>' +
								'<hr>' +
								'<form>' +
									'<ul class="string-elements">' +
										'<li class="padding">' +
											'<input id="userName" type="text" name="userName" placeholder="First Last" required>' +
											'<label for="userName">Name</label>' +
										'</li><!--' +
										'--><li>' +
											'<input id="userPhone" type="tel" name="userPhone" placeholder="88-888-8888" required>' +
											'<label for="userPhone">Daytime phone number</label>' +
										'</li><!--' +
										'--><li class="padding">' +
											'<input id="userEmail" type="email" name="userEmail" placeholder="youremail@gmail.com" required>' +
											'<label for="userEmail">Email</label>' +
										'</li><!--' +
										'--><li>' +
											'<input id="userCode" type="text" name="userCode" placeholder="8888">' +
											'<label for="userCode">Sunday Star Times Promo Code</label>' +
										'</li>' +
									'</ul>' +
									'<hr>' +
									'I would like to receive additional information from...' +
									'<ul class="check-elements">' +
										'<li class="padding">' +
											'<input id="tourismAustralia" type="checkbox" name="moreInfo[]" value="tourismAustralia">' +
											'<label for="tourismAustralia">Tourism Australia</label>' +
										'</li><!--' +
										'--><li class="padding">' +
											'<input id="untitedTravel" type="checkbox" name="moreInfo[]" value="untitedTravel">' +
											'<label for="untitedTravel">United Travel</label>' +
										'</li><!--' +
										'--><li class="padding">' +
											'<input id="fairfaxMedia" type="checkbox" name="moreInfo[]" value="fairfaxMedia">' +
											'<label for="fairfaxMedia">Fairfax Media</label>' +
										'</li><!--' +
										'--><li>' +
											'<input id="qantas" type="checkbox" name="moreInfo[]" value="qantas">' +
											'<label for="qantas">Qantas Red E-mail</label>' +
										'</li>' +
									'</ul>' +
									'<hr>' +
									'<ul class="condition-elements">' +
										'<li class="check">' +
											'<input id="conditions" type="checkbox" name="conditions" required>' +
											'<label for="conditions">I accept the Terms &#38; Conditions</label>' +
										'</li>' +
									'</ul>' +
									'<ul class="button-container">' +
										'<li class="btn nav submit">' +
											'<div class="icon"></div>' +
											'Submit' +
										'</li>' +
										'<li class="btn nav skip">' +
											'<div class="icon"></div>' +
											'Skip' +
										'</li>' +
									'</ul>' +
								'</form>' +
							'</div>' +
							'<div class="footer"></div>' +
						'</div>';

				} // end of init fnc

			}, // end of populate obj

			listeners : {

				on : function($c, $t){

					var $form = $c.children('.main-content').children('form');

					$form.children('.string-elements').find('input')
						.on('blur.disposable', function(){ $m[$t].actions.inputField.onblur($t, $(this)); });

					$c.find('.btn.nav')
						.on('mouseenter.disposable', function(){
							var $this = $(this);
							if($this.hasClass('prize')){ $m.g.navBtn.mouseenter($this); }
							if($this.hasClass('submit')){ $m.g.navBtn.mouseenter($this); }
							if($this.hasClass('skip')){ $m[$t].actions.navBtn.skip.mouseenter($this); }
						}).on('mouseleave.disposable', function(){
							var $this = $(this);
							if($this.hasClass('prize')){ $m.g.navBtn.mouseleave($this); }
							if($this.hasClass('submit')){ $m.g.navBtn.mouseleave($this); }
							if($this.hasClass('skip')){ $m[$t].actions.navBtn.skip.mouseleave($this); }
						}).on('click.disposable', function(){
							var $this = $(this);
							if($this.hasClass('submit')){ $m[$t].actions.sendData($t, $c, $form); } // ajax the form data over to php to be validated and sent to SQL
							if($this.hasClass('skip')){ $m.g.transition.panOut($c); }
						});

				}, // end of on fnc

				off : function($c){

					var $form = $c.children('.main-content').children('form');

					$form.children('.string-elements').find('input').off('.disposable'); // remove event listeners from the input fields
					$form.find('.btn.nav').off('.disposable'); // remove event listeners from the submit and skip buttons

				} // end of on fnc

			}, // end of listeners obj

			actions : {

				sendData : function($t, $c, $form){

					$.post('php/form-data.php', {'userData' : $form.serialize()}, function($error){

						console.dir('returned php error = ' + $error);

						if($error === 'none'){ $m.g.transition.panOut($c); }
						else{ $m[$t].actions.validate.init($t, $form, $error); }

					}); // end of post fnc

				}, // end of sendData fnc

				validate : {

					init : function($t, $form, $error){

						$error = $error.split(',');

						var $len = $error.length,
							$i;

						console.log('length = ' + $len);

						for($i = 0; $i < $len; $i++){

							console.log('error num ' + $i + ' error = ' + $error[$i]);

							$m[$t].actions.validate.change($form, $error[$i]);

						} // end of for loop

					}, // end of init fnc

					change : function($form, $name){

							var $this = $form.find($('input[name="' + $name + '"]'));

							$this.attr({'data-completed' : 'false'});
							$this.attr({'data-validate' : 'false'});

					} // end of change fnc

				}, // end of validate obj

				inputField : {

					onblur : function($t, $this){

						console.log('running "onblur" actions for inputText...');

						var $val = $this.val(),
							$completed;

						// if there is 
						if($val === ''){ $completed = 'false'; }
						else{ $completed = 'true'; }

						$this.attr({'data-completed' : $completed});

					} // end of onblur fnc

				}, // end of inputField obj

				navBtn : {

					skip : {

						mouseenter : function($this){

							$m.g.navBtn.mouseenter($this); // run the regular nav button mouseenter animation

							// since the skip button is part of a button group we need to hide the icon for the first button (continue btn) and show the icon for this button
							var $skipIcon = $this.children('.icon'),
								$submitIcon = $this.siblings('.submit').children('.icon'),
								$ani = $m.s.ani;

							TweenMax.set($skipIcon, {'display' : 'block'});
							TweenMax.to($skipIcon, $ani, {'opacity' : '1'});

							TweenMax.to($submitIcon, $ani, {'opacity' : '0'});

						}, // end of mouseenter fnc

						mouseleave : function($this){

							$m.g.navBtn.mouseleave($this); // run the regular nav button mouseleave animation

							// since the skip button is part of a button group we need to hide the icon for the first button (continue btn) and show the icon for this button
							var $skipIcon = $this.children('.icon'),
								$submitIcon = $this.siblings('.submit').children('.icon'),
								$ani = $m.s.ani;

							TweenMax.to($skipIcon, $ani, {
								'opacity' : '0',
								'onComplete' : $m.g.state,
								'onCompleteParams' : [$skipIcon, 'none'] // change the icons display to none after the tween has been completed
							});

							TweenMax.to($submitIcon, $ani, {'opacity' : '1'});

						} // end of mouseenter fnc

					} // end of skip obj

				} // end of navBtn

			} // end of actions obj

		}, // end of userForm obj









		/*
         ___           _        _   __  __          _  _       
        / __| ___  __ (_) __ _ | | |  \/  | ___  __| |(_) __ _ 
        \__ \/ _ \/ _|| |/ _` || | | |\/| |/ -_)/ _` || |/ _` |
        |___/\___/\__||_|\__,_||_| |_|  |_|\___|\__,_||_|\__,_|

		*/

		socialMedia : {

			populate : {

				init : function($json, $t, $ref){

					return '<div class="container-shadow" data-ref="' + $ref + '" data-type="' + $t + '">' +
							'<h2 class="main-heading">Share and get an extra entry into the competition</h2>' +
							'<div class="main-content">' +
								'<div class="intro">' +
								'Click on the social media icons below to get your friends and family involved and find out their traveller profile, plus by sharing you\'ll get an extra entry into the draw! The message below will be posted into your chosen social streams(s).' +
								'</div>' +
								'<a class="btn nav continue" href="' + $m.s.badgeSelection.url + '" target="_blank">' +
									'<div class="icon"></div>' +
									'Continue' +
								'</a>' +
							'</div>' +
							'<div class="footer">' +
								'<div class="social-message h3">' +
									'I just took the Traveller Profile Quiz and am ' + $m.s.badgeSelection.indefiniteArticle + ' ' + $m.s.badgeSelection.kind + '. Take the quiz, discover your travel personality and be in to win a $10,000 holiday!' +
								'</div>' +
								'<ul class="social-buttons">' +
									'<li class="btn" data-type="facebook">' +
										'<div class="icon"></div>' +
										'<img src="img/profile-badge-0.png">' +
									'</li><!--' +
									'--><li class="btn" data-type="twitter">' +
										'<div class="icon"></div>' +
										'<img src="img/profile-badge-1.png">' +
									'</li><!--' +
									'--><li class="btn" data-type="google">' +
										'<div class="icon"></div>' +
										'<img src="img/profile-badge-2.png">' +
									'</li><!---->' +
								'</ul>' +
							'</div>' +
						'</div>';

				} // end of init fnc

			}, // end of populate obj

			listeners : {

				on : function($c, $t){

					$c.find('.continue')
						.on('mouseenter.disposable', function(){ $m.g.navBtn.mouseenter($(this)); }) // use the generic nav button action from the general obj
						.on('mouseleave.disposable', function(){ $m.g.navBtn.mouseleave($(this)); }); // use the generic nav button action from the general obj

					$c.children('.footer').children('.social-buttons')
						.on('mouseenter.disposable', 'li', function(){ $m[$t].actions.social.mouseenter($(this)); })
						.on('mouseleave.disposable', 'li', function(){ $m[$t].actions.social.mouseleave($(this)); })
						.on('click.disposable', 'li', function(){ $m[$t].actions.social.onclick($(this)); });

				}, // end of on fnc

				off : function($c){

					$c.find('.continue').off('.disposable'); // remove event listeners from the continue button
					$c.children('footer').children('social-buttons').off('.disposable'); // remove event listeners from the social buttons

				} // end of on fnc

			}, // end of listeners obj

			actions : {

				social : {

					mouseenter : function($this){

						console.log('social enter...');

						var $icon = $this.children('.icon'),
							$sib = $this.siblings().not($this),
							$ani = $m.s.ani;

						$this.attr({'data-state' : 'over'});
						TweenMax.set($this, {'opacity' : '1'}); // set opacity to 100% via TweenMax to kill any current opacity tweens currently acting on this object (causing a weird error with the pseudo element)

						TweenMax.set($icon, {'display' : 'block'}); // change display state before the animation begins
						TweenMax.to($icon, $ani, {'opacity' : '1'}); // tween the opacity to 100% (this seperate tween is NOT set to loop)
						TweenMax.to($icon, $ani * 3, { // set the continuous animation loop 
							'left' : '-70px',
							'top' : '-70px',
							'yoyo' : true,
							'repeat' : -1
						});

						TweenMax.to($sib, $ani, {'opacity' : '0.5'}); // fade all other images that are not currently being interacted with

					}, // end of mouseenter fnc

					mouseleave : function($this){

						console.log('social leave...');

						var $icon = $this.children('.icon'),
							$sib = $this.siblings(),
							$ani = $m.s.ani;

						$this.attr({'data-state' : 'up'});

						TweenMax.to($icon, $ani, { // set all proporties to their dormant states...
							'left' : '-90px',
							'opacity' : '0',
							'top' : '-90px',
							'onComplete' : $m.g.state,
							'onCompleteParams' : [$icon, 'none'] // change the icons display to none after the tween has been completed
						});

						TweenMax.to($sib, $ani, {'opacity' : '1'}); // bring all other images that are not currently being interacted with back to 100% opacity

					}, // end of mouseenter fnc

					onclick : function($this, $c){

						console.log('---> pull up selected social prompt and add click to the user database');

					} // end of onclick fnc

				} // end of actions obj

			} // end of actions obj

		} // end of socialMedia obj











	}; // end of module obj

	(function(){

		$m.g.getJson();

	})();



}); // end of document.ready fnc











































/*


		interaction : {

			welcome : {

				init : function($c){ $m.interaction.welcome.continueBtn($c); }, // end of init fnc

				continueBtn : function($c){



				} // end of continueBtn fnc

			}, // end of welcome fnc

			questionText : {

				init : function($c, $t){ $m.interaction.questionAnswer($c, $t); } // end of init fnc

			},

			questionImage : {

				init : function($c, $t){ $m.interaction  .questionAnswer($c, $t); }

			},

			questionAnswer : function($c, $t){



			}, // end of allQuestions fnc

			results : {

				init : function($c){ $m.listeners.questionAnswer($c, $t); }

				profileImage : function(){

					$c.on('mouseenter.disposable', '.btn', function(){

						var $this = $(this);

						if($this.hasClass('nav')){$m.actions.navBtn.mouseenter($this);}
						if($this.hasClass('profile-image')){$m.actions.results.mouseenter($this);}

					}).on('mouseleave.disposable', '.btn', function(){

						var $this = $(this);

						if($this.hasClass('nav')){$m.actions.navBtn.mouseleave($this);}
						if($this.hasClass('profile-image')){$m.actions.results.mouseleave($this);}

					}).on('click.disposable', '.btn', function(){

						var $this = $(this);

						if($this.hasClass('nav')){
							$m.actions.navBtn.onclick($this, $c);
							$m.g.badgeSelection($c);
						}
						if($this.hasClass('profile-image')){$m.actions.results.onclick($this, $c);}

					});

				}

			}, // end of results obj

			function($c){

				console.log('--> generating "welcome" listeners...');

				$c.on('mouseenter.disposable', '.btn', function(){

					var $this = $(this);

					if($this.hasClass('nav')){$m.actions.navBtn.mouseenter($this);}
					if($this.hasClass('profile-image')){$m.actions.results.mouseenter($this);}

				}).on('mouseleave.disposable', '.btn', function(){

					var $this = $(this);

					if($this.hasClass('nav')){$m.actions.navBtn.mouseleave($this);}
					if($this.hasClass('profile-image')){$m.actions.results.mouseleave($this);}

				}).on('click.disposable', '.btn', function(){

					var $this = $(this);

					if($this.hasClass('nav')){
						$m.actions.navBtn.onclick($this, $c);
						$m.g.badgeSelection($c);
					}
					if($this.hasClass('profile-image')){$m.actions.results.onclick($this, $c);}

				});

			}, // end of welcome fnc

			userForm : function($c, $t){

				$c.on('mouseenter.disposable', '.main-content form .text-elements input', function(){

					$m.actions[$t].inputText.mouseenter($(this));

				}).on('mouseleave.disposable', '.main-content form .text-elements input', function(){

					$m.actions[$t].inputText.mouseleave($(this));

				}).on('focus.disposable', '.main-content form .text-elements input', function(){

					$m.actions[$t].inputText.onfocus($(this));

				}).on('blur.disposable', '.main-content form .text-elements input', function(){

					$m.actions[$t].inputText.onblur($(this));

				});

				$c.on('mouseenter.disposable', '.main-content form .button-container .btn', function(){

					$m.actions[$t].inputText.mouseenter($(this));

				}).on('mouseleave.disposable', '.main-content form .button-container .btn', function(){

					$m.actions[$t].inputText.mouseleave($(this));

				}).on('click.disposable', '.main-content form .button-container .btn', function(){

					var $this = $(this);

					if($this.hasClass('submit')){$m.actions[$t].validate($c);}

				});
			} // end of userForm fnc

		}, // end of listeners












































		actions : {


			userForm : {

				inputText : {

					mouseenter : function($this){

						//console.log('running "onmouseenter" actions for inputText...');

						var $li = $this.parent(),
							$val = $this.val(),
							$state = $li.attr('data-state');

						if($val === '' && $state !== 'focus'){$li.attr({'data-state' : 'over'});}

					},

					mouseleave : function($this){

						//console.log('running "onmouseleave" actions for inputText...');

						var $li = $this.parent(),
							$val = $this.val(),
							$state = $li.attr('data-state');

						if($val === '' && $state !== 'focus'){$li.attr({'data-state' : 'up'});}

					},

					onfocus : function($this){

						//console.log('running "onfocus" actions for inputText...');

						var $li = $this.parent();

						$li.attr({'data-state' : 'focus'});

					},

					onblur : function($this){

						//console.log('running "onblur" actions for inputText...');

						var $li = $this.parent(),
							$val = $this.val();

						if($val === ''){$li.attr({'data-state' : 'up'});}

					}

				}, // end of inputText fnc

				validate : function($c){

					console.log('running "submit" actions for user form...');

					//var $val = $c.children('.main-content').children('form').find('li[data-validate="true"]').children('input');
					var $form = $c.children('.main-content').children('form'),
						$name = $form.find('li.text').children('input[name="userName"]'),
						$email = $form.find('li.text').children('input[name="userEmail"]'),
						$phone = $form.find('li.text').children('input[name="userPhone"]'),
						$cond = $form.find('li.check').children('input[name="conditions"]'),
						$submit = true,
						$pat = {
							'name' : /[a-z ]/gi,
							'email' : /[a-zA-Z0-9-]{1,}@([a-zA-Z\.])?[a-zA-Z]{1,}\.[a-zA-Z]{1,4}/gi,
							'phone' : /[0-9- ]/gi
						};

					if($pat.name.test($name.val())){
						$name.parent().attr({'data-validate' : 'true'});
					}else{
						$name.parent().attr({'data-validate' : 'false'});
						$submit = false;
						console.log('name = false');
					} // end of if statement

					if($pat.email.test($email.val())){
						$email.parent().attr({'data-validate' : 'true'});
					}else{
						$email.parent().attr({'data-validate' : 'false'});
						$submit = false;
					} // end of if statement

					if($pat.phone.test($phone.val())){
						$phone.parent().attr({'data-validate' : 'true'});
					}else{
						$phone.parent().attr({'data-validate' : 'false'});
						$submit = false;
					} // end of if statement

					console.log('condition = ' + ($cond.prop('checked')));

					if($cond.prop('checked') === 'true'){
						$cond.parent().attr({'data-validate' : 'true'});
					}else{
						$cond.parent().attr({'data-validate' : 'false'});
						$submit = false;
					} // end of if statement

					if($submit){console.log('--> submit form....');}

				} // end of validate fnc

			} // end of userForm

		} // end of actions obj

*/

/*



            <div class="question-container container-shadow" data-type="question" data-style="text">
                <h2 class="main-heading"><div class="icon"></div>This is the heading</h2>
                <ul class="answers">
                    <li class="btn" data-ref="1" data-state="up">
                        <div class="icon"></div>
                        This is answer number one
                    </li><!--
                    --><li class="btn" data-ref="2" data-state="up">
                        <div class="icon"></div>
                        This is answer number one
                    </li><!--
                    --><li class="btn" data-ref="3" data-state="up">
                        <div class="icon"></div>
                        This is answer number one
                    </li><!--
                    --><li class="btn" data-ref="4" data-state="up">
                        <div class="icon"></div>
                        This is answer number one
                    </li><!--
                    --><li class="btn" data-ref="5" data-state="up">
                        <div class="icon"></div>
                        This is answer number one
                    </li>
                </ul>
                <div class="footer progress">
                    <ul class="visual">
                        <li data-ref="1"></li><!--
                        --><li data-ref="2"></li><!--
                        --><li class="active" data-ref="3"></li><!--
                        --><li data-ref="4"></li><!--
                        --><li data-ref="5"></li>
                    </ul>
                    <p class="text h4">Question <span class="current">3</span> of <span class="total">5</span> </p>
                </div>
            </div>

*/

/*

            <div class="question-container container-shadow" data-type="question" data-style="image">
                <h2 class="main-heading"><div class="icon"></div>This is the heading</h2>
                <ul class="answers">
                    <li class="btn" data-ref="1" data-state="up">
                        <div class="icon"></div>
                    </li><!--
                    --><li class="btn" data-ref="2" data-state="up">
                        <div class="icon"></div>
                    </li><!--
                    --><li class="btn" data-ref="3" data-state="up">
                        <div class="icon"></div>
                    </li><!--
                    --><li class="btn" data-ref="4" data-state="up">
                        <div class="icon"></div>
                    </li><!--
                    --><li class="btn" data-ref="5" data-state="up">
                        <div class="icon"></div>
                    </li>
                </ul>
                <div class="footer progress">
                    <ul class="visual">
                        <li data-ref="1"></li><!--
                        --><li data-ref="2"></li><!--
                        --><li class="active" data-ref="3"></li><!--
                        --><li data-ref="4"></li><!--
                        --><li data-ref="5"></li>
                    </ul>
                    <p class="text h4">Question <span class="current">3</span> of <span class="total">5</span> </p>
                </div>
            </div>

*/



/*
		userForm : {

			populate : {

				init : function($json, $t, $ref){

					return '<div class="container-shadow" data-ref="' + $ref + '" data-type="' + $t + '">' +
							'<h2 class="main-heading">' +
								'Enter your details below to be in to win a $10,000 Australian experience' +
								'<div class="icon"></div>' +
								'</h2>' +
							'<div class="main-content">' +
								'<div class="btn nav prize">' +
									'<div class="icon"></div>' +
									'View your prize' +
								'</div>' +
								'<hr>' +
								'<form>' +
									'<ul class="text-elements">' +
										'<li class="text padding" data-state="up" data-validate="true">' +
											'<label for="userName">Name</label>' +
											'<input id="userName" class="validate" type="text" name="userName" placeholder="First Last" required>' +
										'</li><!--' +
										'--><li class="text" data-state="up" data-validate="true">' +
											'<label for="userPhone">Daytime phone number</label>' +
											'<input id="userPhone" class="validate" type="tel" name="userPhone" placeholder="88-888-8888" required>' +
										'</li><!--' +
										'--><li class="text padding" data-state="up" data-validate="true">' +
											'<label for="userEmail">Email</label>' +
											'<input id="userEmail" class="validate" type="email" name="userEmail" placeholder="youremail@gmail.com" required>' +
										'</li><!--' +
										'--><li class="text" data-state="up">' +
											'<label for="userSST">Sunday Star Times Promo Code</label>' +
											'<input id="userSST" type="tel" name="userSST" placeholder="8888">' +
										'</li>' +
									'</ul>' +
									'<hr>' +
									'I would like to receive additional information from...' +
									'<ul class="check-elements">' +
										'<li class="check padding">' +
											'<input id="tourismAustralia" type="checkbox" name="tourismAustralia">' +
											'<label for="tourismAustralia">Tourism Australia</label>' +
										'</li><!--' +
										'--><li class="check padding">' +
											'<input id="untitedTravel" type="checkbox" name="untitedTravel">' +
											'<label for="untitedTravel">United Travel</label>' +
										'</li><!--' +
										'--><li class="check padding">' +
											'<input id="fairfaxMedia" type="checkbox" name="fairfaxMedia">' +
											'<label for="fairfaxMedia">Fairfax Media</label>' +
										'</li><!--' +
										'--><li class="check">' +
											'<input id="qantas" type="checkbox" name="qantas">' +
											'<label for="qantas">Qantas Red E-mail</label>' +
										'</li>' +
									'</ul>' +
									'<hr>' +
									'<ul class="condition-elements">' +
										'<li class="check" data-validate="true">' +
											'<input id="conditions" class="validate" type="checkbox" name="conditions" required>' +
											'<label for="conditions">I accept the Terms &#38; Conditions</label>' +
										'</li>' +
									'</ul>' +
									'<ul class="button-container">' +
										'<li class="btn nav submit">' +
											'<div class="icon"></div>' +
											'<input class="btn" type="submit" value="Submit">' +
										'</li>' +
										'<li class="btn nav skip">' +
											'<div class="icon"></div>' +
											'Skip' +
										'</li>' +
									'</ul>' +
								'</form>' +
							'</div>' +
							'<div class="footer"></div>' +
						'</div>';

				} // end of init fnc

			}, // end of populate obj

			listeners : {

				on : function($c, $t){

					var $form = $c.children('.main-content').children('form'),
						$te = $form.children('.text-elements');

					$te.find('input')
						.on('mouseenter.disposable', function(){ $m[$t].actions.inputField.mouseenter($(this)); })
						.on('mouseleave.disposable', function(){ $m[$t].actions.inputField.mouseleave($(this)); })
						.on('focus.disposable', function(){ $m[$t].actions.inputField.onfocus($(this)); })
						.on('blur.disposable', function(){  $m[$t].actions.inputField.onblur($t, $(this)); });

					$form.children('.button-container')
						.on('mouseenter.disposable', '.btn.nav', function(){
							var $this = $(this);
							if($this.hasClass('submit')){ $m.g.navBtn.mouseenter($(this)); }
							if($this.hasClass('skip')){ $m[$t].actions.navBtn.skip.mouseenter($this); }
						}).on('mouseleave.disposable', '.btn.nav', function(){
							var $this = $(this);
							if($this.hasClass('submit')){ $m.g.navBtn.mouseleave($(this)); }
							if($this.hasClass('skip')){ $m[$t].actions.navBtn.skip.mouseleave($this); }
						}).on('click.disposable', '.btn.nav', function(){
							var $this = $(this);
							if($this.hasClass('submit')){ $m[$t].actions.navBtn.submit.onclick($t, $form); }
							if($this.hasClass('skip')){ $m.g.transition.panOut($c); }
						});

				}, // end of on fnc

				off : function($c){

					var $form = $c.children('.main-content').children('form');

					$form.children('.text-elements').find('input').off('.disposable'); // remove event listeners from the input fields
					$form.children('.button-container').children('.btn.nav').off('.disposable'); // remove event listeners from the submit and skip buttons

				} // end of on fnc

			}, // end of listeners obj

			actions : {

				validate : {

					checkPattern : function($this, $val, $pat){

						console.log('--> checking pattern...');

						if($pat.test($val)){
							console.log('   ... pattern = match');
							$this.parent().attr({'data-validate' : 'true'});
							return 'true';
						}else{
							console.log('   ... pattern = miss-match');
							$this.parent().attr({'data-validate' : 'false'});
							return 'false';
						} // end of if statement

					}, // end of chackPattern fnc

					text : function($t, $this){

						var $val = $this.val(),
							$pat = /[a-z ]/gi;

						console.log('current text val = ' + $val);

						return $m[$t].actions.validate.checkPattern($this, $val, $pat);

					}, // end of text fnc

					tel : function($t, $this){

						var $val = $this.val(),
							$pat = /[0-9- ]/gi;

						console.log('current tel val = ' + $val);

						return $m[$t].actions.validate.checkPattern($this, $val, $pat);

					}, // end of text fnc

					email : function($t, $this){

						var $val = $this.val(),
							$pat = /[a-zA-Z0-9-]{1,}@([a-zA-Z\.])?[a-zA-Z]{1,}\.[a-zA-Z]{1,4}/gi;

						console.log('current email val = ' + $val);

						return $m[$t].actions.validate.checkPattern($this, $val, $pat);

					}, // end of text fnc

					checkbox : function($t, $this){

						var $val = $this.prop('checked');

						console.log('checking conditions...');

						if($val){
							console.log('   ... checked');
							$this.parent().attr({'data-validate' : 'true'});
							return 'true';
						}else{
							console.log('   ... not checked');
							$this.parent().attr({'data-validate' : 'false'});
							return 'false';
						} // end of if statement

					} // end of checkbox fnc

				}, // end of validate obj

				inputField : {

					mouseenter : function($this){

						// console.log('running "onmouseenter" actions for inputText...');

						var $li = $this.parent(),
							$val = $this.val(),
							$state = $li.attr('data-state');

						if($val === '' && $state !== 'focus'){$li.attr({'data-state' : 'over'});}

					},

					mouseleave : function($this){

						// console.log('running "onmouseleave" actions for inputText...');

						var $li = $this.parent(),
							$val = $this.val(),
							$state = $li.attr('data-state');

						if($val === '' && $state !== 'focus'){$li.attr({'data-state' : 'up'});}

					},

					onfocus : function($this){

						// console.log('running "onfocus" actions for inputText...');

						var $li = $this.parent();

						$li.attr({'data-state' : 'focus'});

					},

					onblur : function($t, $this){

						// console.log('running "onblur" actions for inputText...');

						var $li = $this.parent(),
							$val = $this.val(),
							$validate = 'true',
							$kind;

						if($this.hasClass('validate')){
							$kind = $this.attr('type');
							$validate = $m[$t].actions.validate[$kind]($t, $this);
						} // end of if statement

						if($val === '' || $validate === 'false'){$li.attr({'data-state' : 'up'});}

					} // end of onblur fnc

				}, // end of inputField obj

				navBtn : {

					submit : {

						onclick : function($t, $form){

							var $validate = 'true',
								$this, $kind;

							$form.find('input.validate').each(function(){

								$this = $(this);
								$kind = $this.attr('type');

								if($m[$t].actions.validate[$kind]($t, $this) === 'false'){ $validate = 'false'; }

							});

							console.log('validate submission = ' + $validate);

						} // end of onclick

					},

					skip : {

						mouseenter : function($this){


						}, // end of mouseenter

						mouseleave : function($this){


						} // rnd of mouseleave

					} // end of skip obj

				} // end of navBtn

			} // end of actions obj

		}, // end of userForm obj

		other : {

			init : function(){


			}, // end of init fnc

			listeners : {

				on : function(){


				}, // end of on fnc

				off : function(){


				} // end of on fnc

			}, // end of listeners obj

			actions : {


			} // end of actions obj

		}, // end of other obj
*/