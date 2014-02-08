<?php

	$rawData =  $_POST['userData']; // retreive the user data sent through from jQuery
	
	// parse the raw jQuery form data into an array we can use in php
	$userData = array(); // array shell
	parse_str($rawData, $userData); // convery info from $rawData into a readable array called $userData

	//print_r($userData);

	// validation...
	$error = 'none'; // shell to hold the validation errors

	matchPattern(
		'userName',
		$userData['userName'],
		'/^[a-z ,.\'-]+$/i'
	);

	matchPattern(
		'userPhone',
		$userData['userPhone'],
		'/[0-9 -()]/'
	);

	matchPattern(
		'userEmail',
		$userData['userEmail'],
		'/[a-zA-Z0-9-]{1,}@([a-zA-Z\.])?[a-zA-Z]{1,}\.[a-zA-Z]{1,4}/i'
	);

	if($userData['conditions'] != 'on'){ addError('conditions'); } // end of if statement

	function matchPattern($name, $value, $pattern){

		$match = preg_match($pattern, $value);

		if(!$match || $value == ''){ addError($name); }
		
	} // end of emailPattern fnc

	function addError($name){

		global $error;

		if($error == 'none'){ $error = $name; }
		else{ $error .= ',' . $name; }	
	}


	echo $error;
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

