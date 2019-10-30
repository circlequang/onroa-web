<?php
require_once('mailer/class.phpmailer.php');
require_once('mailer/class.smtp.php');

$users = new MongoCollection($db, 'users');

switch($f) {
	case 'fb_login' : 
		$data = fb_login();
		break;
	case 'signin' : 
		$data = login();
		break;
	case 'logout' : 
		$data = logout();
		echo  $data;				//Trường hợp đặc biết, xuất data tại đây
		return;
		break;
	case 'getloginUid' : 
		$data = getLoginUid();
		break;
	case 'register' :
		$data = register();
		break;
	case 'profile' :
		$data = profile();
		break;
		
	case 'changeProfile' :
		$data = changeProfile();
		break;
		
	case 'changePassword' :
		$data = changePassword();
		break;
		
	case 'uploadAvatar' :
		$data = uploadAvatar();
		break;
	case 'sendMail' :
		$data = sendMail();
		break;
	case 'testsendmail' :
		$data = testsendmail();
		break;
		
	case 'lostpass' :
		$data = lostpass();
		break;
		
	case 'resetpass' :
		$data = resetPass();
		break;
	//Xử lý BMap
	case 'BMap' :
		$data = BMap();
		break;
	case 'addMsg' :
		$data = addMsg();
		break;
	case 'editMsg' :
		$data = editMsg();
		break;
	case 'deleteMsg' :
		$data = deleteMsg();
		break;
	case 'loadMessage' :
		$data = loadMessage();
		break;

	case 'getMessageListTest' :
		getMessageListTest();
		return;
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

function mailer($to, $subject, $body) {
	$mail = new PHPMailer(); // create a new object
	$mail->IsSMTP(); // enable SMTP
	$mail->SMTPDebug = 1; // debugging: 1 = errors and messages, 2 = messages only
	//$mail->SMTPAuth = true; // authentication enabled
	//$mail->SMTPSecure = 'tls'; // secure transfer enabled REQUIRED for Gmail
	$mail->Host = "localhost";
	$mail->Port = 25; // or 587
	//$mail->IsHTML(true);
	$mail->Username = "onroasupport";
	$mail->Password = "AA351449";
	$mail->SetFrom("support@onroa.com");
	$mail->Subject = $subject;
	$mail->Body = $body;
	$mail->AddAddress($to);

	if(!$mail->Send()) {
		echo "Mailer Error: " . $mail->ErrorInfo;
		return false;
	} 
	
	return true;
	}

function send_mailgun($email, $subject, $body){
 
	$config = array();
 
	$config['api_key'] = "key-262be166f10896f666ed5208d981f888";
 
	$config['api_url'] = "https://api.mailgun.net/v3/onroa.com/messages";
 
	$message = array();
 
	$message['from'] = "postmaster@onroa.com";
 
	$message['to'] = $email;
 
	$message['h:Reply-To'] = "support@onroa.com";
 
	$message['subject'] = $subject;
 
	$message['html'] = $body;
 
	$ch = curl_init();
 
	curl_setopt($ch, CURLOPT_URL, $config['api_url']);
 
	curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
 
	curl_setopt($ch, CURLOPT_USERPWD, "api:{$config['api_key']}");
 
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
 
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
 
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
 
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
 
	curl_setopt($ch, CURLOPT_POST, true); 
 
	curl_setopt($ch, CURLOPT_POSTFIELDS,$message);
 
	$result = curl_exec($ch);
 
	curl_close($ch);
 
	$pos = strpos($result, "Queued. Thank you");
	if($pos === false) {
		return false;
	}
	
	return true;
 
}

function sendMail($fid, $full_name, $email, $content) {
	// Pear Mail Library
	$from = 'Onroa Support<support@onroa.com>'; //change this to your email address
	
	switch($fid) {
		case 'fbreg' :
			$to = $full_name . '<' . $email .'>'; // change to address
			$subject = 'Tài khoản Onroa'; // subject of mail
			$body = 
"Bạn ".$full_name . " thân mến, <br> \n
<br> \n
Bạn vừa đăng nhập vào hệ thống Onroa thông qua Facebook, cám ơn bạn đã tin dùng dịch vụ của chúng tôi. Bạn có thể tiếp tục đăng nhập bằng Facebook hoặc xử dụng thông tin dưới đây để đăng nhập, hai hình thức điều như nhau. Đây là tài khoản của bạn: <br> \n
- Email : ". $email ."<br> \n
- Passwork : " . $content ."<br> \n
<br> \n
Onroa đã phát triển dịch vụ tiện ích giúp các bạn tra cứu nhanh các điểm ăn uống/vui chơi/ du lịch/lưu trú/ tiện ích . .  dựa trên nguồn thông tin công cộng. Người dùng có thể dễ dàng tìm kiếm địa điểm, dịch vụ, nếu ý kiến, check-in . . . tại các địa điểm này <br> \n
<br> \n
Hiện nay, chúng tôi cung cấp dịch vụ bản đồ sử dụng trên các dòng sản phẩm mobile thông dụng hiện nay, bạn có thể tải và sử dụng các dịch vụ này mọi lúc mọi nơi.<br> \n
<br> \n
Trân trọng,";
			break;
	
		case 'reg' :
			$to = $full_name . '<' . $email .'>'; // change to address
			$subject = 'Tài khoản Onroa'; // subject of mail
			$body = 
"Bạn ".$full_name . " thân mến, <br> \n
<br> \n
Cám ơn bạn đã tin dùng dịch vụ của chúng tôi, đây là tài khoản của bạn: <br> \n
- Email : ". $email ."<br> \n
- Passwork : " . $content ."<br> \n
<br> \n
Onroa đã phát triển dịch vụ tiện ích giúp các bạn tra cứu nhanh các điểm ăn uống/vui chơi/ du lịch/lưu trú/ tiện ích . .  dựa trên nguồn thông tin công cộng. Người dùng có thể dễ dàng tìm kiếm địa điểm, dịch vụ, nếu ý kiến, check-in . . . tại các địa điểm này <br> \n
<br> \n
Hiện nay, chúng tôi cung cấp dịch vụ bản đồ sử dụng trên các dòng sản phẩm mobile thông dụng hiện nay, bạn có thể tải và sử dụng các dịch vụ này mọi lúc mọi nơi.<br> \n
<br> \n
Trân trọng,";
			break;
		
		case 'lostpass-confirm'	:
			$to = $full_name . '<' . $email .'>'; // change to address
			$subject = 'Tài khoản Onroa'; // subject of mail
			$link_get_pass = "https://onroa.com/signin.html?email=" . $email . "&token=" . $content;
			$body = 
"Bạn ".$full_name . " thân mến, <br> \n
<br> \n
Bạn vừa kích hoạt tính năng tạo lại mật khẩu, để đảm bảo việc này là mong muốn của bạn xin vui lòng click vào link dưới đây chúng tôi sẽ gởi lại mật khẩu mới cho bạn ngay lâp tức: <br> \n
Link tạo mật khẩu mới: <a  herf='" . $link_get_pass. "'>" . $link_get_pass . "</a> <br> \n
<br> \n
Onroa đã phát triển dịch vụ tiện ích giúp các bạn tra cứu nhanh các điểm ăn uống/vui chơi/ du lịch/lưu trú/ tiện ích . .  dựa trên nguồn thông tin công cộng. Người dùng có thể dễ dàng tìm kiếm địa điểm, dịch vụ, nếu ý kiến, check-in . . . tại các địa điểm này. <br> \n
<br> \n
Trân trọng, <br> \n
";
			break;
	
		case 'reset-pass'	:
			$to = $full_name . '<' . $email .'>'; // change to address
			$subject = 'Tài khoản Onroa'; // subject of mail
			$body = 
"Bạn ".$full_name . " thân mến, <br> \n
<br> \n
Bạn vừa kích hoạt tính năng tạo lại mật khẩu, Onroa xin gởi đến bạn mật khẩu mới: <br> \n
- Email : $email  <br> \n
- Passwork : $content  <br> \n
<br> \n
Nếu vẫn còn gặp vấn đề trong việc đăng nhập, xin vui lòng gởi email đến support@onroa chúng tôi sẽ xử lý giúp bạn sớm nhất có thể. <br> \n
<br> \n
Trân trọng, <br> \n
";
			break;
	}
	/*
	$headers = array(
		'From' => $from,
		'To' => $to,
		'Subject' => $subject
	);
	
	$smtp = Mail::factory('smtp', array(
			'host' => 'ssl://smtp.yandex.com',
			'port' => '465',
			'auth' => true,
			'username' => 'support@onroa.com', //your gmail account
			'password' => 'AA351449' // your password
		));
	*/
	

	$bool = true;
	// Send the mail
	try {
		$bool = send_mailgun($email, $subject, $body);
	} catch (Exception $ex) {
		$bool = false;
	}
	
	return $bool;
}


function getCountMessageList($uid) {
	global $users;
	//Lấy danh sách các message có active = 1
	$query = array(
					array(
						'$match' => array('_id' => new MongoId($uid))
					),
					array('$unwind' => '$message'),
					array(
						'$match' => array("message.active" =>  1 )
					),
					array('$group' => array( '_id' => '$_id', 'count' => array('$sum' => 1))),

					array('$sort' =>  array("message_id" => 1) ),
					
				);
	$resultUser = $users->aggregate($query);
	
	if(sizeOf($resultUser['result']) == 0) return 0;

	return $resultUser['result'][0]['count'];
}

function getMessageListTest() {
	global $users;
	$uid = "5881b57762c0db27548b4567";
	$total_message = getCountMessageList($uid);
	$skip = 10;
	$limit = 10;
	//Lấy danh sách các message có active = 1
	/*
	$query = array(
					array(
						'$match' => array('_id' => new MongoId($uid))
					),
					array('$unwind' => '$message'),
					array(
						'$match' => array("message.active" =>  1 )
					),
					array('$group' => array( '_id' => array( 'uid' => '$message'))),
					array('$sort' =>  array("message_id" => 1) ),
					array('$skip' => 0),
					array('$limit' => 10),
				);
	$resultUser = $users->aggregate($query);
	
	$arr = array();
	$l = sizeOf($resultUser);
	//Trường hợp kg có data, tra về mãng rỗng
	if($l ==0) return $resultUser;
	
	$resultUser = $resultUser["result"];

	//Chuyển giá trị từ kết quả lấy được vào arr
	$l = sizeOf($resultUser);
	for($i = 0;$i < $l; $i++) {
		$arr[$i] = $resultUser[$i]["_id"]["uid"];
		
	}
	var_dump($arr); echo "<br>";
	*/

	$query = array(
		"_id" => new MongoId($uid),
		'message' => array('$elemMatch' => array(
								"active" => 1
							)
						),
	);

	//Lấy danh sách message ngược từ những record cuối trở lên đầu
	$skip = $total_message - $limit - $skip;
	if($skip < 0) $skip = 0;
echo $skip . "\n";	
echo 		$total_message . "\n";
$arr = array();
	$resultUser = $users->findOne($query, array('message' => array('$slice' => [$skip,$limit])));
	//$resultUser = iterator_to_array($result);

	$l = sizeOf($resultUser['message']);
//echo $l . "<br> \n";
	for($i = 0;$i < $l; $i++) {
		$arr[$i] = $resultUser['message'][$i];
		$arrUserId[$i] = $resultUser['message'][$i]['uid'];
	}
//var_dump($arr); echo $l . "<br> \n";
	$arr = msort($arr,array('submit_date'));
//var_dump($arr);
	
}

function getMessageList($uid, &$arrUserId, $skip, $limit, $total) {
	global $users;
	

	$query = array(
		"_id" => new MongoId($uid),
		'message' => array('$elemMatch' => array(
								"active" => 1
							)
						),
	);

	//Lấy danh sách message ngược từ những record cuối trở lên đầu
	$skip = $total - $limit - $skip;
	
	//Trường hợp lấy về đến những recode đầu tiên, cần đặt lại skip và limit
	if($skip < 0) {
		$limit = $limit + $skip;
		$skip = 0;
	}

	if($limit ==0) $limit = 10;
//echo $skip . ", " . $limit . "<br>";

//var_dump($query); exit;
	$resultUser = $users->findOne($query, array('message' => array('$slice' => [$skip,$limit])));
	$arr = array();
	$l = sizeOf($resultUser['message']);
	for($i = 0;$i < $l; $i++) {
		$arr[$i] = $resultUser['message'][$i];
		$arrUserId[$i] = $resultUser['message'][$i]['uid'];
	}
	//Đảo thứ tự sắp xếp
	$arr = msort($arr,array('submit_date'));
	return $arr;
}

function logout() {
	$_SESSION['uid'] = "";
	
	return 1;
}

function fb_login() {
	global $users;
	global $db;
	
	$fb_id = getStrParaPost('fb_id');
	$token = getStrParaPost('token');
	$_csrf = getStrParaPost('csrf');
	
	//Kiễm tra csrf, nếu kết quả < 0 tức sai, trả về mã -10
	if(checkCsrfNoTime($_csrf) < 0) return -10;	
	
	//Sai dữ liệu
	if((strlen($fb_id) < 5) || (strlen($token) < 10)) return -11;
	
	include "Facebook/autoload.php";
	
	$fb = new Facebook\Facebook([
	  'app_id' => '1286728268051325',
	  'app_secret' => '61599f99f67e2cde6d15298850780a58',
	  'default_graph_version' => 'v2.2',
	 ]);

	try {
	  // Returns a `Facebook\FacebookResponse` object
	  $response = $fb->get('/me?fields=id,name,email,picture.type(large),gender', $token);
	} catch(Facebook\Exceptions\FacebookResponseException $e) {
	  //echo 'Graph returned an error: ' . $e->getMessage();
	  return -1;	//User không tồn tại
	} catch(Facebook\Exceptions\FacebookSDKException $e) {
	  //echo 'Facebook SDK returned an error: ' . $e->getMessage();
	  return -2;
	}

	$fb_user = $response->getGraphUser();
	
	if($fb_user == null) return -3; //Không lấy được data từ FB
	
	$email = $fb_user['email'];
	$full_name = $fb_user['name'];
	$avatar = $fb_user['picture']['url'];
	$gender = 1;
	if($fb_user['gender'] != 'male') $gender = 2;
	
	//Kiễm tra xem có lấy được email
	if(strlen($email) < 3) return -13;
	if(strlen($full_name) < 1) return -14;
	
	//Kiễm tra user này đã tồn tại chưa ?
	$query = array('email' => $email);
	$result = $users->findOne($query);
	//User này đã tồn tại trong database
	if($result != NULL) {
		$_SESSION['uid'] = $result['_id'];
		return $result['_id'];
	}
	
	
	//Nếu user chưa tồn tại, add user này vào DB
	$gender_name = "";
	if($gender == 1) $gender_name = "anh";
	if($gender == 2) $gender_name = "chị";
	
	//Tạo fodler cho user 
	$sconfigs = new MongoCollection($db, 'sconfigs');
	$result = $sconfigs->findOne();
	$sys_user_path = $result['user_folder'];			//Lấy folder gốc của tất cả các user 
	
	$Y = date("Y");
	$YM = date("Ym");
    $curr_user_path=md5(time());
	
	
	$user_folder = $sys_user_path . "/" . $Y . "/" . $YM . "/" . $curr_user_path;
	$user_url = $result['user_url'] . "/" . $Y . "/" . $YM . "/" . $curr_user_path;
	if(createFolderTree($user_folder) == false)
		return -6;
	
	$pss = substr( md5(rand()), 0, 7);
	$data = array(
					"email" =>  $email,
					"password" =>  md5($pss),
					"avatar" =>  $avatar,
					"gender_id " =>  $gender,
					"gender_name " =>  $gender_name,
					"display_name" =>  $full_name,
					"Y" => $Y,
					"YM" => $YM,
					"user_path" =>  $curr_user_path,
					"user_full_path" =>  $user_folder,
					"user_full_url" =>  $user_url,
					"action" => 0,					//0 : action, 1: pan
					"fnc" =>  '-1',
					"token" => '',
					"token_time" => 0,
					"reg_time" => time(),
					"last_login" => 0,
					"ip_login" => "",
					"_lat" => "",
					"_lng" => "",
					"fb_id" => $fb_user['id'],
					"fb_token" => $token,
					"description" => "",
					"message" => array(),
					"slug" => "",
					"update_time" => time()
				  );
	//Tạo acc trong db với fnc=-1 (chưa send mail)
	//Khi send mail thành công, sẽ đổi thành 1
	$users->insert($data);
				  
	
	$send = sendMail('fbreg', $full_name, $email, $pss);
	
	//Trường hợp gởi mail thành công, đặt fnc=0
	if($send == true) {
		$query = array("email" =>  $email);
		$update = array('$set' => array('fnc' => 0));
		$users->update($query, $update);
	}
	
	$query = array('email' => $email);
	$result = $users->findOne($query);
	$_SESSION['uid'] = $result['_id'];
	return $result['_id'];	
}

function login() {
	global $users;
	
	$email = getStrParaPost('email');
	$pass = getStrParaPost('pss');
	$_csrf = getStrParaPost('csrf');
	
	//Kiễm tra csrf, nếu kết quả < 0 tức sai, trả về mã -10
	if(checkCsrfNoTime($_csrf) < 0) return -10;		

	$query = array('email' => $email, 'password' => md5($pass));
	$result = $users->findOne($query);

	if($result == NULL) return "";
	$_SESSION['uid'] = $result['_id'];
	return $result['_id'];
}

function getLoginUid() {
	if(isset($_SESSION['uid']) == false) return "";
	return $_SESSION['uid'];
}



function register() {
	global $db;
	global $users;
	
	$sconfigs = new MongoCollection($db, 'sconfigs');
	$result = $sconfigs->findOne();
	
	//Lấy tham số đầu vào thông qua phương thức POST
	$full_name = getStrParaPost('full_name');
	$email = getStrParaPost('email');
	$gender = getStrParaPost('gender');
	$digit = getStrParaPost('digit');
	$_csrf = getStrParaPost('csrf');
	
	//Kiễm tra mã bảo vệ
	if($digit != $_SESSION['digit']) return -12;	//Mã bảo mật không chính xác
	
	//Kiễm tra csrf, nếu kết quả < 0 tức sai, trả về mã -10
	if(checkCsrfNoTime($_csrf) < 0) return -10;		
	
	//Check input data lần nữa
	//Check full_name
	if(strlen($full_name) < 6) return -3;
	
	//Check email
	if(strlen($email) < 1) return -4;		//Không nhập email
	
	//Check email format
	if(!preg_match("^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$^",$email))
		return -1; //Email không đúng format
	
	//Check gender
	if(($gender != 1) && ($gender != 2))return -5;		//Chưa nhập danh xưng
	
	$query = array('email' => $email);
	$result = $users->findOne($query);
	if($result != NULL) return -2;	//User này đã tồn tại
	
	$gender_name = "";
	if($gender == 1) $gender_name = "anh";
	if($gender == 2) $gender_name = "chị";
	
	//Tạo fodler cho user 
	$sconfigs = new MongoCollection($db, 'sconfigs');
	$result = $sconfigs->findOne();
	$sys_user_path = $result['user_folder'];			//Lấy folder gốc của tất cả các user 
	
	$Y = date("Y");
	$YM = date("Ym");
    $curr_user_path=md5(time());
	
	$user_folder = $sys_user_path . "/" . $Y . "/" . $YM . "/" . $curr_user_path;
	$user_url = $result['user_url'] . "/" . $Y . "/" . $YM . "/" . $curr_user_path;
	if(createFolderTree($user_folder) == false)
		return -6;
	
	$pss = substr( md5(rand()), 0, 7);
	$data = array(
					"email" =>  $email,
					"password" =>  md5($pss),
					"avatar" =>  'assets/img/default-avatar.png',
					"gender_id " =>  $gender,
					"gender_name " =>  $gender_name,
					"display_name" =>  $full_name,
					"Y" => $Y,
					"YM" => $YM,
					"user_path" =>  $curr_user_path,
					"user_full_path" =>  $user_folder,
					"user_full_url" =>  $user_url,
					"action" => 0,					//0 : action, 1: pan
					"fnc" =>  '-1',
					"token" => '',
					"token_time" => 0,
					"reg_time" => time(),
					"last_login" => 0,
					"ip_login" => "",
					"_lat" => "",
					"_lng" => "",
					"description" => "",
					"message" => array(),
					"slug" => "",
					"update_time" => time()
				  );
	//Tạo acc trong db với fnc=-1 (chưa send mail)
	//Khi send mail thành công, sẽ đổi thành 1
	$users->insert($data);
				  
	
	$send = sendMail('reg', $full_name, $email, $pss);
	
	//Trường hợp gởi mail thành công, đặt fnc=0
	if($send == true) {
		$query = array("email" =>  $email);
		$update = array('$set' => array('fnc' => 0));
		$users->update($query, $update);
	}
	
	return 0;
}

function profile() {
	global $db;
	global $users;
	
	
	$_uid = getStrParaGet('uid');
	
	//Lấy user_id từ parameter
	$_uid = getStrParaGet('uid');
	
	//Trường hợp nhận _uid nhưng _uid này không chính xác
	//vì ID của MongoDB là 24 ký tự, slug phải hơn 6 ký tự, nhập nhỏ hơn số ký tự này là sai
	if((strlen($_uid) <= 6) && (strlen($_uid) > 0))  return -2;
	
	//Nếu không nhập uid, lấy uid từ session
	if(strlen($_uid) <= 0) {
		//Cũng kg có session (user chưa login) => sai
		if(isset($_SESSION['uid']) == false) return -3;
		$_uid = $_SESSION['uid'] . ""; //Chuyển từ kiểu Object sang chuổi thường
	}
	
	//Nếu user url cá nhân (slug)
	$query = array("slug" => $_uid);
	if(MongoId::isValid($_uid)) {
		$query = array('_id' => new MongoId($_uid));
	} else {
		$query = array("slug" => $_uid);
	}
	
	//Lấy uid của target user 
	$resultUser = $users->findOne($query);
	
	
	//Không lấy được data => sai
	if(count($resultUser) <= 0) return -4;
	//Chuyển _id về dạng chuổi:
	$target_uid = $resultUser['_id'] . "";
	$target_name = $resultUser['display_name'];
	
	
	//Không lấy được data => sai
	if(count($resultUser) <= 0) return "";
	//Chuyển _id về dạng chuổi:
	$resultUser['_id'] = $resultUser['_id'] . "";
	
	//Lấy danh sách các review của member 
	$query = array(
				'review' => array('$elemMatch' => array(
								"uid" => $target_uid . "",
								"active" => 1
							)
						),
	);
	
	
	//Giới hạn các field trả về để kg tốn tài nguyên
	$fields = array(
					"_id" => 1, 
					"owner_id" => 2, 
					"category_id" => 3, 
					"category_name" => 4, 
					"title" => 5, 
					"description" => 6, 
					"address" => 7, 
					"latitude" => 8, 
					"longitude" => 9, 
					"type_id" => 10, 
					"type_name" => 11, 
					"type_icon" => 12, 
					"gallery" => 13, 
					"url" => 14
					);

	//Lấy danh sách tối đa 20 points được review gần đây nhất
	$points = new MongoCollection($db, 'points');
	$resultPointList = $points->find($query, $fields);
						
	$resultPointList = $resultPointList->limit(20);
	$arrPointList = array_values(iterator_to_array($resultPointList));
	$returnArr = array();
	$returnArr['profile'] = $resultUser;
	$returnArr['points'] = $arrPointList;
	
	$json = json_encode($returnArr);
	
	return $json;
}

function changeProfile() {
	global $db;
	global $users;
	
	
	//Lấy tham số đầu vào thông qua phương thức POST
	$full_name = getStrParaPost('full_name');
	$slug = getStrParaPost('burl');
	$description = getStrParaPost('description');
	$_id = getStrParaPost('_id');
	$_csrf = getStrParaPost('csrf');
	
	//Nếu không nhập full_name hoặc nhỏ hơn 6 ký tự, lỗi
	if(strlen($full_name) < 5) return -6;
	
	//Kiễm tra csrf, nếu kết quả < 0 tức sai, trả về mã -10
	if(checkCsrfNoTime($_csrf) < 0) return -10;	
	
	//Lấy uid từ session
	if(isset($_SESSION['uid']) == false) $uid = "";
	else $uid =$_SESSION['uid'];
	
	//User chưa login, trả về -11
	if(strlen($uid) <= 0) return -11;
	
	//Kiểm tra quyền update của user
	if($uid != $_id) return -12;

	//Kiễm tra URL cá nhân
	if((strlen($slug) > 0) && (strlen($slug) <= 5)) return -8; //slug quá ngắn

	//Kiễm tra slug có tồn tại chưa
	if(strlen($slug) > 6) {
		$query = array(
				"slug" => $slug
			);
			
		$arr = $users->findOne($query);

		//Trường hợp slug đã tồn tại, xem slug này có phải của _id này không,
		// nếu slug là của _id này : OK
		// nếu slug của _id khác: bị trùng
		if(sizeOf($arr) >= 1) {
			$arr['_id'] = $arr['_id'] . '';
			
			//slug của _id khác
			if($arr['_id'] != $_id) return -7; //slug đã tồn tại
		}
	}
	

	$query = array(
			'_id' => new MongoId($_id),
		);
	
	$update = array(
			'$set' => array('display_name' => $full_name, 'description' => $description, 'slug' => $slug)
	);
	
	$updateResult = $users->update($query, $update);
	
	//var_dump($resultPoint);
	$json = -6;	//Lỗi hệ thống
	if($updateResult["nModified"] == 1) {
		$result = $users->findOne($query);
		$json = json_encode($result);
	}
	
	return $json;
}

function changePassword() {
	global $db;
	global $users;
	
	
	//Lấy tham số đầu vào thông qua phương thức POST
	$pass = getStrParaPost('pass');
	$newpass = getStrParaPost('newpass');
	$confirmpass = getStrParaPost('confirmpass');
	$_id = getStrParaPost('_id');
	$_csrf = getStrParaPost('csrf');
	
	//Nếu không nhập pass/newpass/confirmpass hoặc nhỏ hơn 6 ký tự, lỗi
	if((strlen($pass) < 6) || (strlen($newpass) < 6) || (strlen($confirmpass) < 6)) return -6;
	
	//Trường hợp  newpass <> confirmpass => lỗi
	if($newpass != $confirmpass) return -6;
	
	//Kiễm tra csrf, nếu kết quả < 0 tức sai, trả về mã -10
	if(checkCsrfNoTime($_csrf) < 0) return -10;	
	
	//Lấy uid từ session
	if(isset($_SESSION['uid']) == false) $uid = "";
	else $uid =$_SESSION['uid'];
	
	//User chưa login, trả về -11
	if(strlen($uid) <= 0) return -11;
	
	//Kiểm tra quyền update của user
	if($uid != $_id) return -12;
	
	//Kiễm tra mật khẩu hiện tại có đúng
	$query = array('_id' => new MongoId($_id));
	$result = $users->findOne($query);
	if(md5($pass) != $result['password']) return -13;
	
	$update = array(
			'$set' => array('password' => md5($newpass))
	);
	
	$updateResult = $users->update($query, $update);
	
	$json = -6;	//Lỗi hệ thống
	if($updateResult["nModified"] == 1) {
		$result = $users->findOne($query);
		$json = json_encode($result);
	}
	
	return $json;
}

function uploadAvatar() {
	global $db;
	global $users;
	$hasFile = true;
	$hasBase64Img = true;
	
	$_id = getStrParaPost('_id');
	$_csrf = getStrParaPost('csrf');
	$img64 = getStrParaPost('img64');
	
	//Kiễm tra csrf, nếu kết quả < 0 tức sai, trả về mã -10
	if(checkCsrfNoTime($_csrf) < 0) return -10;	
	
	//Lấy uid từ session
	if(isset($_SESSION['uid']) == false) $uid = "";
	else $uid =$_SESSION['uid'];
	
	//User chưa login, trả về -11
	if(strlen($uid) <= 0) return -11;
	
	//Kiểm tra quyền update của user
	if($uid != $_id) return -12;
	
	//Lấy fodler cho user 
	$sconfigs = new MongoCollection($db, 'sconfigs');
	$resultSConfig = $sconfigs->findOne();
	$user_folder = $resultSConfig['user_folder'];			//Lấy folder gốc của tất cả các user 
	$user_url = $resultSConfig['user_url'];			//Lấy folder gốc của tất cả các user 
	
	//Upload file
	$query = array(
			'_id' => new MongoId($_id),
		);
	$update = "";
	$result = $users->findOne($query);
	if(count($result) <= 0) return -1;
	

	//Lấy thông tin về folder của user này
	$avatar_folder = $result['user_full_path'];
	$avatar_folder_url = $result['user_full_url'];
		
	//Trường hợp không tạo được folder ==> gởi báo lỗi về client
	if(!file_exists($avatar_folder)) return -2;
	$file_name = "";
	
	//Trường hợp user có upload 1 file lên server
	if(isset($_FILES['upload']['name']) > 0) {
		$file_name = $_FILES['upload']['name'];
		//Upload file
		move_uploaded_file($_FILES['upload']['tmp_name'], $avatar_folder . "/" . $file_name);
		
		//resize image
		resize_crop_image(200,200,$avatar_folder . "/" . $file_name, $avatar_folder . "/" . $file_name);
	} else {
		$hasFile = false;
	}
	
	//Trường hợp user có upload bằng chuổi Base64
	if(strlen($img64) > 10) {
		$file_name = md5(time()) . ".jpg";
		base64_to_jpeg($img64, $avatar_folder . "/" . $file_name);
		//resize image
		resize_crop_image(200,200,$avatar_folder . "/" . $file_name, $avatar_folder . "/" . $file_name);
	}  else {
		$hasBase64Img = false;
	}
	
	if(($hasFile == false) && ($hasBase64Img == false)) return -5;
	
	//Tạo  câu update
	$update = array(
		'$set' => array('avatar' =>$avatar_folder_url . "/" . $file_name)
	);
	
	
	//update lại data
	$updateResult = $users->update($query, $update);
	$json = -6;	//Lỗi hệ thống
	if($updateResult["nModified"] == 1) {		
		$json = $avatar_folder_url . "/" . $file_name;
	}
	/*
	//Đổi avatar trong users.message
	$query = array(
			'message' => array('$elemMatch' => array(
									"uid" => $uid . ""
								)
							),
		);
		
	$update = array(
			'$set' => array('message.$.avatar' => $avatar_folder_url . "/" . $file_name)
	);
	$updateMsgAvatar = $users->update($query, $update);
	
	//Đổi avatar trong points.message
	$points = new MongoCollection($db, 'points');
	$query = array(
			'review' => array('$elemMatch' => array(
									"uid" => $uid . ""
								)
							),
		);
		
	$update = array(
			'$set' => array('review.$.avatar' => $avatar_folder_url . "/" . $file_name)
	);
	$updateResult = $points->update($query, $update);
	*/
	
	
	return $json;
}

//Function này được gọi khi user kích hoạt tính năng reset pass
//lostpass() sẽ gởi đến user một email xác nhận, nếu user click vào link đươc gởi
//từ email này, một email khác sẽ gởi new-pass cho user
function lostpass() {
	global $db;
	global $users;
	
	$email = getStrParaPost('email');
	$_csrf = getStrParaPost('csrf');
	$digit = getStrParaPost('digit');
	
	//Kiễm tra mã bảo vệ
	if($digit != $_SESSION['digit']) return -12;	//Mã bảo mật không chính xác
	
	//Kiễm tra csrf, nếu kết quả < 0 tức sai, trả về mã -10
	if(checkCsrfNoTime($_csrf) < 0) return -10;	
	
	
	//Đặt token cho user muốn reset pass
	$token =  md5(rand()) . md5(time());
	
	//Kiễm tra user đã tồn tại chưa
	$query = array('email' => $email);
	$result = $users->findOne($query);
	if($result == NULL) return 2;	//User này chưa tồn tại
	
	$update = array('$set' => array(
										"fnc" =>  '-1',
										"token" => $token,
										"token_time" => time(),
									));
	$users->update($query, $update);
	//Gởi mail xác nhận
	$send = sendMail('lostpass-confirm', $result['display_name'], $email, $token);
	
	//Trường hợp gởi mail thành công, đặt fnc=0
	if($send == true) {
		$query = array("_id" =>  new MongoId($uid));
		$update = array('$set' => array(
										"fnc" =>  '0',
									));
		$users->update($query, $update);
	}
	
	return 1;	//Thành công
	
}

function resetPass() {
	global $db;
	global $users;
	
	$email = getStrParaPost('email');
	$_token = getStrParaPost('token');
	$_csrf = getStrParaPost('csrf');

	//Kiễm tra csrf, nếu kết quả < 0 tức sai, trả về mã -10
	if(checkCsrfNoTime($_csrf) < 0) return -10;	
	
	//Kiểm tra thông tin
	$query = array(
		"email" => $email,
		"token" => $_token
	);
	$result = $users->findOne($query);
	
	//Tìm không thấy, trả về mã lỗi
	if(count($result) <= 0) return -12;
	
	//Tạo mật khẩu mới
	$uid = $result['_id'] . "";
	$pss = substr( md5(rand()), 0, 7);
	$query = array("_id" =>  new MongoId($uid));
	$update = array('$set' => array(
						"fnc" =>  '-1',
						"token" => "",
						"token_time" => time(),
						"password" =>  md5($pss),
					));
	$users->update($query, $update);
	
	//Gởi mail xác nhận
	$send = sendMail('reset-pass', $full_name, $email, $pss);
	
	//Trường hợp gởi mail thành công, đặt fnc=0
	if($send == true) {
		$query = array("_id" =>  new MongoId($uid));
		$update = array('$set' => array(
										"fnc" =>  '0',
									));
		$users->update($query, $update);
	}
	
	return 1;
}

function BMap() {
	global $db;
	global $users;
	
	//Lấy user_id từ parameter
	$_uid = getStrParaGet('uid');
	$skip = getIntParaGet('sk');
	$limit = 10;
	
	//Trường hợp nhận _uid nhưng _uid này không chính xác
	//vì ID của MongoDB là 24 ký tự, slug phải hơn 6 ký tự, nhập nhỏ hơn số ký tự này là sai
	if((strlen($_uid) <= 6) && (strlen($_uid) > 0))  return -2;
//echo "1: " . $_uid . "<br>";
	//Nếu không nhập uid, lấy uid từ session
	if(strlen($_uid) <= 0) {
		//Cũng kg có session (user chưa login) => sai
		if(isset($_SESSION['uid']) == false) return -3;
		$_uid = $_SESSION['uid'] . ""; //Chuyển từ kiểu Object sang chuổi thường
	}
//echo "2: " . $_uid . "<br>";	
	//Nếu user url cá nhân (slug)
	$query = array("slug" => $_uid);
	if(MongoId::isValid($_uid)) {
		$query = array('_id' => new MongoId($_uid));
	} else {
		$query = array("slug" => $_uid);
	}
//var_dump($query); echo "<br>";
	//Lấy uid của target user 
	$resultUser = $users->findOne($query);
//var_dump($resultUser); echo "<br>";	
	
	//Không lấy được data => sai
	if(count($resultUser) <= 0) return -4;
	//Chuyển _id về dạng chuổi:
	$target_uid = $resultUser['_id'] . "";
	$target_name = $resultUser['display_name'];
	
	$arrUserId = array();
	$total_message = getCountMessageList($target_uid);
	$resultUser = getMessageList($target_uid, $arrUserId, $skip, $limit, $total_message);
	
	//Lấy danh sách các review của member ở Points
	$query = array(
				'review' => array('$elemMatch' => array(
								"uid" => $target_uid,
								"active" => 1
							)
						),
	);
	
	
	//Giới hạn các field trả về để kg tốn tài nguyên
	$fields = array(
					"_id" => 1, 
					"owner_id" => 2, 
					"category_id" => 3, 
					"category_name" => 4, 
					"title" => 5, 
					"description" => 6, 
					"address" => 7, 
					"latitude" => 8, 
					"longitude" => 9, 
					"type_id" => 10, 
					"type_name" => 11, 
					"type_icon" => 12, 
					"gallery" => 13, 
					"url" => 14
					);

	//Lấy danh sách tối đa 20 points được review gần đây nhất
	$points = new MongoCollection($db, 'points');
	$resultPointList = $points->find($query, $fields);
						
	$resultPointList = $resultPointList->limit(50);
	$arrPointList = array_values(iterator_to_array($resultPointList));
	$returnArr = array();
	$returnArr['_uid'] = $target_uid;
	$returnArr['target_name'] = $target_name;
	$returnArr['message'] = $resultUser;
	$returnArr['user_list'] = getUserFromList($arrUserId, null);
	$returnArr['points'] = $arrPointList;
	$returnArr['total_message'] = $total_message;
	
	$json = json_encode($returnArr);
	
	return $json;
}

function loadMessage() {
	$_csrf = getStrParaPost('csrf');
	$msg_uid = getStrParaPost('_uid');
	$skip = getIntParaPost('sp');
	$total_message = getCountMessageList($msg_uid);
	$arrUserId = array();
	$returnArr = array();
	$returnArr['message'] = getMessageList($msg_uid, $arrUserId, $skip, 10, $total_message);
	$returnArr['user_list'] = getUserFromList($arrUserId, null);
	$returnArr['total_message'] = $total_message;
	$json = json_encode($returnArr);
	
	return $json;
}

function addMsg() {
	global $db;
	global $users;
	$_csrf = getStrParaPost('csrf');
	$msg_uid = getStrParaPost('_uid');
	$msg = getStrParaPost('message');
	
	
	//Kiễm tra csrf, nếu kết quả < 0 tức sai, trả về mã -10
	if(checkCsrfNoTime($_csrf) < 0) return -10;	
	
	//Lấy uid từ session
	if(isset($_SESSION['uid']) == false) $uid = -2;
	else $uid =$_SESSION['uid'];
	
	//User chưa login, trả về -11
	if(strlen($uid) <= 0) return -11;
	$users = new MongoCollection($db, 'users');
	
	//Lấy user hiện tại
	$resultUser = $users->findOne(array('_id' => new MongoId($uid)));
	
	$msg_id = time();

	//Cập nhật Msg
	$data = array(
		"message_id" => $msg_id,
		"uid" => $resultUser['_id'] . "",
		"display_name" => $resultUser['display_name'],
		"avatar" => $resultUser['avatar'],
		"msg" => $msg,
		"submit_date" => $msg_id,
		"update_date" => 0,
		"active" => 1
	);
	
	
	//
	$updateResult = $users->update(array('_id' => new MongoId($msg_uid)), 
				array('$addToSet' => array('message' => $data))
				);
	
	$arrUserId = array();
	$total_message = getCountMessageList($msg_uid);
	$resultUser = getMessageList($msg_uid, $arrUserId, 0, 10, $total_message);
	
	$returnArr = array();
	$returnArr['user_list'] = getUserFromList($arrUserId, null);
	$returnArr['total_message'] = getCountMessageList($msg_uid);
	$returnArr['message'] = $resultUser;
	$json = json_encode($returnArr);
	
	return $json;
}


function editMsg() {
	global $db;
	global $users;

	$_csrf = getStrParaPost('csrf');
	$_uid = getStrParaPost('_uid');
	$message_id = getStrParaPost('message_id');
	$content = getStrParaPost('content');
	//echo $review_id; exit;
	//Kiễm tra csrf, nếu kết quả < 0 tức sai, trả về mã -10
	if(checkCsrfNoTime($_csrf) < 0) return -10;	
	
	//Lấy uid từ session
	if(isset($_SESSION['uid']) == false) $uid = "";
	else $uid =$_SESSION['uid'];
	
	//User chưa login, trả về -11
	if(strlen($uid) <= 0) return -11;
	
	$query = array(
			'_id' => new MongoId($_uid),
			'message' => array('$elemMatch' => array(
									"message_id" => intval($message_id),
									"active" => 1,
									"uid" => $uid . ""
								)
							),
		);
		
	$update = array(
			'$set' => array('message.$.msg' => $content, 'update_date' => time())
	);
			
	//var_dump($query); exit;
	//$resultPoint = $points->findOne($query);
	$updateResult = $users->update($query, $update);
	
	$arrUserId = array();
	$resultUser = getMessageList($_uid, $arrUserId, 0, 10);
	
	
	$returnArr = array();
	$returnArr['user_list'] = getUserFromList($arrUserId, null);
	$returnArr['message'] = $resultUser;
	$json = json_encode($returnArr);

	return $json;
}

function deleteMsg() {
	global $db;
	global $users;

	$_csrf = getStrParaPost('csrf');
	$_uid = getStrParaPost('_uid');
	$msg_id = getStrParaPost('msg_id');
	
	//echo $review_id; exit;
	//Kiễm tra csrf, nếu kết quả < 0 tức sai, trả về mã -10
	if(checkCsrfNoTime($_csrf) < 0) return -10;	
	
	//Lấy uid từ session
	if(isset($_SESSION['uid']) == false) $uid = "";
	else $uid =$_SESSION['uid'];
	
	//User chưa login, trả về -11
	if(strlen($uid) <= 0) return -11;
	
	$query = array(
			'_id' => new MongoId($_uid),
			'message' => array('$elemMatch' => array(
									"message_id" => intval($msg_id), 
									"active" => 1,
									"uid" => $uid . ""
								)
							),
		);
	
	//Trường hợp  cmt cần xóa nằm trong BMap của mình	
	if($uid == $_uid) {
		$query = array(
			'_id' => new MongoId($_uid),
			'message' => array('$elemMatch' => array(
									"message_id" => intval($msg_id), 
									"active" => 1,
								)
							),
		);
	}

	$update = array(
			'$set' => array('message.$.active' => 0, 'update_date' => time())
	);

	$updateResult = $users->update($query, $update);
	
	$arrUserId = array();
	$total_message = getCountMessageList($_uid);
	$resultUser = getMessageList($_uid, $arrUserId,0, 10, $total_message);
	
	$returnArr = array();
	$returnArr['user_list'] = getUserFromList($arrUserId, null);
	$returnArr['message'] = $resultUser;
	$returnArr['total_message'] = $total_message;
	$json = json_encode($returnArr);

	return $json;
}
?>