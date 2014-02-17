<?php

	$rawData =  $_POST['userData']; // retreive the user data sent through from jQuery
	
	// parse the raw jQuery form data into an array we can use in php
	$userData = array(); // array shell
	parse_str($rawData, $userData); // convery info from $rawData into a readable array called $userData

	//print_r($userData);

    /*
     * __   __      _  _     _        _    _            
     * \ \ / /__ _ | |(_) __| | __ _ | |_ (_) ___  _ _  
     *  \ V // _` || || |/ _` |/ _` ||  _|| |/ _ \| ' \ 
     *   \_/ \__,_||_||_|\__,_|\__,_| \__||_|\___/|_||_|
     * 
     */

	$error = 'none'; // shell to hold the validation errors -> these will be returned to jQuery to illustrate to the user

	// run the matchPattern fnc for each of the "required" fields in the form that need to be checked again a REGEX...
	matchPattern(
		'userName',
		'/^[a-z ,.\'-]+$/i'
	);

	matchPattern(
		'userPhone',
		'/[0-9 -()]/'
	);

	matchPattern(
		'userEmail',
		'/[a-zA-Z0-9-]{1,}@([a-zA-Z\.])?[a-zA-Z]{1,}\.[a-zA-Z]{1,4}/i'
	);

	// check of the conditions input has been checked
	if($userData['conditions'] != 'on'){ addError('conditions'); } // end of if statement

	function matchPattern($name, $pattern){

		global $userData; // pull in the $error variable from the global scope

		$value = $userData[$name]; // get the form data for this input field...
		$match = preg_match($pattern, $value); // ...check against the correct REGEX...
		if(!$match || $value == ''){ addError($name); } // ...if the REGEX is false or the field is blank then run the addError fnc to add the current input field to the error log
		
	} // end of emailPattern fnc

	function addError($name){

		global $error; // pull in the $error variable from the global scope

		// we are creating a comma seperated string of ALL the errors in the form...
		if($error == 'none'){ $error = $name; } // if this is the first error entry then do not prepend with a comma...
		else{ $error .= ',' . $name; } // if this is not the first error entry than seperate if with a comma

	} // end of addError fnc

	if($error != 'none'){ // if there are any validation errors we must inform the user and NOT run the sanitize or SQL process...

		echo $error; // send the error log back to jQuery
		die(); // stop running this script as the data is not ready to be delt with any further

	} // end of if statement fnc

    /*
     *  ___              _  _    _          
     * / __| __ _  _ _  (_)| |_ (_) ___ ___ 
     * \__ \/ _` || ' \ | ||  _|| ||_ // -_)
     * |___/\__,_||_||_||_| \__||_|/__|\___|
     * 
     */

	// generic sanitize data function...
	function sanitizeData($data) {
		return addslashes(htmlspecialchars(strip_tags(trim($data))));
	} // end of sanitizeData fnc

	/* NAME:
	 * this is variable user input so run the sanitizeData fnc
	 */

	$userData['userName'] = sanitizeData($userData['userName']);

	/* PHONE:
	 * this is variable user input so run the sanitizeData fnc
	 */

	$userData['userPhone'] = sanitizeData($userData['userPhone']);

	/* EMAIL:
	 * this is variable user input so run the sanitizeData fnc
	 */

	$userData['userEmail'] = sanitizeData($userData['userEmail']);

	/* CODE:
	 * since we know the code value we can match it agains different permutations to verify its correct
	 */

	if(preg_match('/(sunday)/i', $userData['userCode'])){

		$userData['userCode'] = 'true';
	
	}else{

		$userData['userCode'] = 'false';

	} // end of if statement

    /*
	 * MORE INFORMATION:
	 * since we know the more information values we can test directly against them to make sure there is no SQL injection / XSS attack potential
	 */

    for($i = 0; $i < count($userData['moreInfo']); $i++){

    	if($userData['moreInfo'][$i] == 'tourismAustralia' || $userData['moreInfo'][$i] == 'untitedTravel' || $userData['moreInfo'][$i] == 'fairfaxMedia' || $userData['moreInfo'][$i] == 'qantas'){

    		// the supplied data was a match =)

		}else{

			$userData['moreInfo'][$i] = 'no-match'; // change the value to "no-match"

		} // end of if statement

	} // end of for loop

    $userData['moreInfo'] = implode(',', $userData['moreInfo']); // turn the moreInfo array into a comma seperated string for database storage

    /*
	 * USER PROFILE:
	 * since we know the profile values we can test directly against them to make sure there is no SQL injection / XSS attack potential
	 */

	if($userData['userProfile'] == 'Active Adventurer' || $userData['userProfile'] == 'Coastal Cruiser' || $userData['userProfile'] == 'Eco Induldger' || $userData['userProfile'] == 'Food Fanatic' || $userData['userProfile'] == 'Nature Lover'){

		// the supplied data was a match =)

	}else{

		$userData['userProfile'] = 'no-match';

	} // end of if statement

    /*
     *  ___   ___   _    
     * / __| / _ \ | |   
     * \__ \| (_) || |__ 
     * |___/ \__\_\|____|
     * 
     */

	$host = 'localhost';
	$username = 'root';
	$password = 'root';
	$dbname = 'tourismAustralia';

	// connect to the database
	try {

		$con = new PDO('mysql:host=localhost;dbname=tourismAustralia', $username, $password);
	    $con->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);  

		//$db = new PDO("mysql:host=$host;dbname=$dbname",$user,$pass);
		//$db = new PDO("mysql:host=localhost;dbname=tourismAustralia",root,root);
		//$db = new PDO("mysql:host=localhost;dbname=tourismAustralia,root,root");
		//$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		//$db = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);
		//$db->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );

	  
		// create statement handles...
		//$sh->bindParam(':userName', $userData['userName']);
		//$sh->bindParam(':userPhone', $userData['userPhone']);
		//$sh->bindParam(':userEmail', $userData['userEmail']);
		//$sh->bindParam(':userCode', $userData['userCode']);
		//$sh->bindParam(':moreInfo', $userData['moreInfo']);
		//$sh->bindParam(':social', '');
		$sqlData = array(
			':key' => NULL,
			':userName' => $userData['userName'],
			':userPhone' => $userData['userPhone'],
			':userEmail' => $userData['userEmail'],
			':userCode' => $userData['userCode'],
			':moreInfo' => $userData['moreInfo'],
			':userProfile' => $userData['userProfile'],
			':social' => ''
		);

		//$userName = $userData['userName'];
		//$userPhone = $userData['userPhone'];
		//$userEmail = $userData['userEmail'];
		//$userCode = $userData['userCode'];
		//$moreInfo = $userData['moreInfo'];

		//$sh = $con->prepare("INSERT INTO userData(key, userName, userPhone, userEmail, userCode, moreInfo, social) VALUES (:key, :userName, :userPhone, :userEmail, :userCode, :moreInfo, :social)");
		$sh = $con->prepare("INSERT INTO `userData`(`key`, `userName`, `userPhone`, `userEmail`, `userCode`, `moreInfo`, `userProfile`, `social`) VALUES (:key,:userName,:userPhone,:userEmail,:userCode,:moreInfo,:userProfile,:social)");
		//INSERT INTO `userData`(`key`, `userName`, `userPhone`, `userEmail`, `userCode`, `moreInfo`, `social`) VALUES ([value-1],[value-2],[value-3],[value-4],[value-5],[value-6],[value-7])
		$sh->execute($sqlData);

		// getthe last inserted id...
		//$insertId = $db->lastInsertId();

		// close the connection
		$con = null;

	}catch(PDOException $e) {

	    //echo "I'm sorry, Dave. I'm afraid I can't do that.";
	    //file_put_contents('PDOErrors.txt', $e->getMessage(), FILE_APPEND);

	} // end of try statement









/*
	(
	    [userName] => Devon Church
	    [userPhone] => 027 3337 337
	    [userEmail] => devon.church@fairfaxmedia.co.nz
	    [userCode] => 
	    [moreInfo] => Array
	        (
	            [0] => tourismAustralia
	            [1] => fairfaxMedia
	        )

	    [conditions] => on
	)
*/










	
/*
	$string = $userData['string']; // extract string data from javascript object
	$moreInfo = $userData['moreInfo']; // extract moreInfo data from javascript object
	$conditions = $userData['conditions']; // extract conditions data from javascript object

	$error = array(); // array shell to hold the validation errors

	foreach($string as $key => $val){

		$name = $val['inputName'];
		$value = $val['inputValue'];

		//array_push($error, $name);

		if($name == 'userName'){ namePattern($name, $value); }
		else if($name == 'userPhone'){ phonePattern($name, $value); }
		else if($name == 'userEmail'){ emailPattern($name, $value); }
		else if($name == 'userCode'){ codePattern($name, $value); }

	} // endof foreach loop

	function namePattern($name, $value){

		global $error;
		$pattern = '/^[a-z ,.\'-]+$/i';
		$match = preg_match($pattern, $value);

		//echo 'name match = ' . $match . ' | ';

		if(!$match){ array_push($error, $name); }
		
	} // end of emailPattern fnc

	function phonePattern($name, $value){

		global $error;
		$pattern = '/[0-9 -()]/';
		$match = preg_match($pattern, $value);

		//echo 'phone match = ' . $match . ' | ';

		if(!$match){ array_push($error, $name); }

	} // end of emailPattern fnc

	function emailPattern($name, $value){

		global $error;
		$pattern = '/[a-zA-Z0-9-]{1,}@([a-zA-Z\.])?[a-zA-Z]{1,}\.[a-zA-Z]{1,4}/i';
		$match = preg_match($pattern, $value);

		//echo 'email match = ' . $match . ' | ';

		if(!$match){ array_push($error, $name); }

	} // end of emailPattern fnc

	function codePattern($name, $value){

		global $error;
		$pattern = '/sunday/i';
		$match = preg_match($pattern, $value);

		//echo 'code match = ' . $match . ' | ';

		if(!$match){ array_push($error, $name); }

	} // end of emailPattern fnc


	echo($error);










	//print_r($userData);
	//echo $userData['string'][0]['inputName'];

	// make a connection of the mySQL database
	//$con = mysqli_connect('localhost', 'root', 'root', 'to-do-app');

	// check for connection errors...
	//if(mysqli_connect_errno()){

	//	echo '<p>connection error!</p>';

	//} // end of if statement


/*
	// select the entries database from the mySQL connection...
	$db = mysqli_query($con, "SELECT * FROM `entries` ORDER BY $filter DESC");

	// check how many rows currently exist in the entries dadabase
	$dbRows = mysqli_num_rows($db);

	// if there are one or more rows in the entries database then we have successfully obtained the data...
	if(!$dbRows){

		echo '<p>failed to obtain data!</p>';

	} // end of if statement

	// create an array that will hold the entries database rows and eventually be returned as json
	$json = [];

	// loop through each of the rows in the database and add it onto the array...
	for($i = 1; $i <= $dbRows; $i++){

		// change the retrived data into a php associative array
		$row = mysqli_fetch_assoc($db);

		// add the array data within this duration of the loop into the main json variable
		array_push($json, $row);

	} // end of for loop

	// send json back to jquery =)
	echo json_encode($json);

	// close the mySQL connection
	mysqli_close($con);

*/

