<?php
switch($f) {
	case 'csrf' : 
		echo csrf();
		return;				//Trường hợp này trả csrf trực tiếp về hệ thống
		break;
	case 'init' : 
		$data = init();
		break;
	case 'contact' : 
		$data = contact();
		break;
	case 'loadCategory' : 
		$data = loadCategory();
		echo $data;
		return;
		break;
}

//Lấy uid từ session
if(isset($_SESSION['uid']) == false) $uid = "";
else $uid =$_SESSION['uid'];

//Khởi tạo giá trị trả về
$return = array();
$return['data'] = $data . "";
$return['uid'] = $uid . "";
$return['csrf'] = getCsrf();
$json = json_encode($return);
echo $json;

function csrf() {
	$csrf = getCsrf();
	
	return $csrf;
}

function init() {
	global $db;
	$configs = new MongoCollection($db, 'configs');
	
	$config = $configs->findOne();
	
	$near = getStrParaGet('near');
	$_lat = getStrParaGet('_lat');
	$_lng = getStrParaGet('_lng');
	$_SESSION['access_key'] = getStrParaGet('key');	//Lấy access_key
	
	$arr = array();
	if($near == 'y') {
		$points = new MongoCollection($db, 'points');
		$query = array(
			'_latitude' => array('$gte' => $_lat - 2, '$lte' => $_lat + 2 ),
			'_longitude' => array('$gte' => $_lng - 2, '$lte' => $_lng + 2 )
		);
		
		
		//Giới hạn các field trả về để kg tốn tài nguyên
		$fields = array(
						"_id" => 1, 
						"owner_id" => 2, 
						"category_id" => 3, 
						"category_name" => 4, 
						"title" => 5, 
						"address" => 6, 
						"latitude" => 7, 
						"longitude" => 8, 
						"type_id" => 9, 
						"type_name" => 10, 
						"type_icon" => 11, 
						"gallery" => 12, 
						"url" => 13
						);

		$result = $points->find($query, $fields);
							
		$result = $result->limit(5);
	 
		$arr = iterator_to_array($result);
		$arr = array_values($arr);
	}
	$config['nearPoints'] = $arr;
	
	return json_encode($config);
}

function contact() {
	global $db;
	
	$_csrf = getStrParaPost('csrf');
	$digit = getStrParaPost("digit");
	
	//Kiễm tra mã bảo vệ
	if($digit != $_SESSION['digit']) return -12;	//Mã bảo mật không chính xác
	
	//Kiễm tra csrf, nếu kết quả < 0 tức sai, trả về mã -10
	if(checkCsrfNoTime($_csrf) < 0) return -10;	

	$fullname =  	getStrParaPost("fullname");
	$email = 	getStrParaPost("email");
	$message = getStrParaPost("message");
	
	//Check input data lần nữa
	//Check fullname
	if(strlen($fullname) < 6) return -3;
	
	//Check email
	if(strlen($email) < 1) return -4;		//Không nhập email
	
	//Check email format
	if(!preg_match("^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$^",$email))
		return -1; //Email không đúng format
	
	//Check message
	if(strlen($message) < 6) return -5;		//Message quá ngắn hoặc không nhập
	
	$contacts = new MongoCollection($db, 'contact');
	$data = array(
		"fullname" =>  $fullname,
		"email" =>  $email,
		"message" =>  $message,
	  );
	$contacts->insert($data);
	
	return 1;
}

function loadCategory() {
	global $db;
	
	$categorys = new MongoCollection($db, 'categorys');
	$fields = array(
				"category_id" => 1, 
				"category_name" => 2);
	$query = array();
	$result = $categorys->find();
	
	$arr = iterator_to_array($result);
	$arr = array_values($arr);
	
	return json_encode($arr);
}
?>