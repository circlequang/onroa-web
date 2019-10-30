<?php
$groups = new MongoCollection($db, 'groups');
	
switch($f) {
	case 'csrf' : 
		echo csrf();
		return;				//Trường hợp này trả csrf trực tiếp về hệ thống
		break;
	case 'searchGroup' : 
		$data = searchGroup();
		echo $data;
		return;
		break;
	case 'createGroup' : 
		$data = createGroup();
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


function searchGroup() {
	global $groups;
	
	$group_name = getStrParaGet('group_name');
	$group_code = getStrParaGet('group_code');
	$start_index = getIntParaGet('start_index');
	$limit = getIntParaGet('limit');
	
	if(($limit ==0) || ($limit > 20)) $limit = 20;
	
	//Trường hợp không nhập group_name hoặc group_code
	//if((strlen($group_name) <= 3) && (strlen($group_code) <= 4)) return -4;
	
	$query = array('status' => intval(1));
	if(strlen($group_code) >= 5)
		$query['$text'] = array('$search'=> '"' . $group_code . '"');
	else  if(strlen($group_code) >= 3)
		$query['$text'] = array('$search'=>  $group_name );

	//Giới hạn các field trả về để kg tốn tài nguyên
	$fields = array(
					"_id" => 1, 
					"group_icon" => 2, 
					"group_type" => 3, 
					"group_name" => 4, 
					"group_image" => 5, 
					"group_short_des" => 6, 
					"group_description" => 7, 
					);

	$result = $groups->find($query, $fields);
	
						
	//$result = $result->skip($start_index)->limit($limit);
 
	$arr = iterator_to_array($result); 
	$arr = array_values($arr); 
	
	$arrReturn = array();
	$arrReturn['data'] = $arr; 
	$arrReturn['cnt'] =  $groups->count($query);
	
	return json_encode($arrReturn);
}

function createGroup() {
	global $db;
	global $groups;

	$_csrf = getStrParaPost('csrf');
	$title = getStrParaPost('title');
	$des = getStrParaPost('des');
	$group_type_id = getStrParaPost('group_type_id');
	
	//Lấy dữ liệu config
	$sconfigs = new MongoCollection($db, 'sconfigs');
	$resultSConfig = $sconfigs->findOne();
	$group_data = $resultSConfig['group'];
	
	//var_dump($resultSConfig);
	//var_dump($resultSConfig['group']['group_type']);
	$group_type = getGroupType($group_type_id, $group_data);
	
	//Trường hợp tồn tại img64
	$img64 = null;
	if(isset($_POST['img64'])) $img64 = $_POST['img64'];
	
	//check input
	//Check title
	if(strlen($title) < 4 ) return -20;		//lỗi nhập từ title
	 
	 //Check des
	if(strlen($des) < 20 ) return -21;
	 	 
	 
	 
	 //Check catalogue
	if(strlen($group_type_id) <= 0 ) return -24;
	if(($group_type_id <= 0) || ($group_type_id > 3)) return -25;
	
	 
	//Kiễm tra input file
	if((isset($img64) == false) && (isset($_FILES['upload']['name']) == false)) return -29;
	
		
	//Kiễm tra csrf, nếu kết quả < 0 tức sai, trả về mã -10
	//if(checkCsrfNoTime($_csrf) < 0) return -10;	
	
	//Lấy uid từ session
	if(isset($_SESSION['uid']) == false) $uid = "";
	else $uid =$_SESSION['uid'];
	
	//User chưa login, trả về -11
	if(strlen($uid) <= 0) return -11;
	
	
	
	//Tạo URL cho địa điểm
	$url = time() . "";
	$keymap = createKeymap($url, 4);
	$Y = date("Y");
	$YM = date("Ym");
	$url = $url  . "-" . "-onroa";
	 
	//Tạo folder cho Group này
	$group_folder = $group_data['group_folder'] . "/" . $group_data['new_group'];			//Lấy folder gốc của tất cả các photos
	

	//Tạo folder cho keymap
	if(createFolderTree($group_folder . "/" . $Y . "/" . $YM .  "/" . $keymap) == false) return -6;
	
	//Tạo folder cho points
	if(createFolderTree($group_folder . "/" . $Y. "/" . $YM .  "/" . $keymap . "/" . $url) == false) return -6;
	
	$group_folder = $group_folder . "/" . $Y. "/" . $YM .  "/" . $keymap . "/" . $url;

	$group_url = $group_data['group_url'] . "/" . $group_data['new_group'] . "/" . $Y . "/" . $YM .  "/" . $keymap . "/" . $url;			//Lấy url gốc của tất cả các photos 
	
	//Upload file 
	$urlImg = "";

	if(isset($_FILES['upload']['name'])) {
		//upload file
		$upload_path = $group_folder . "/" . $_FILES['upload']['name'];
		move_uploaded_file($_FILES['upload']['tmp_name'], $upload_path);
		resize_crop_image("560,292", "240,320",$upload_path, $upload_path);
		$urlImg = $group_url . "/" . $_FILES['upload']['name'];
	}
	
	//Trường hợp dùng base64
	if(isset($img64) == true) {
		$file_name = md5(time()) . ".jpg";
		$upload_path = $group_folder  . "/" . $file_name;
		base64_to_jpeg($img64, $upload_path);
		//resize image
		resize_crop_image("560,292", "240,320",$upload_path, $upload_path);
		$urlImg = $group_url . "/" . $file_name;
	}
	
	//Tạo data cho user đầu tiên của Nhóm
	//cũng là quản trị viên của nhóm
	$users = new MongoCollection($db, 'users');
	$usersResult = $users->findOne(array("_id" => new MongoId($uid)));
	$group_member = array(
			"uid" => $uid,
			"display_name" => $usersResult["display_name"],
			"language_id" => intval(1),
			"language" => "vi",
			"avatar" => $usersResult["avatar"],
			"share_local" => intval(1),
			"_lat" => 1,
			"_lng" => 1,
			"role" => intval(1),
			"status" => intval(1),
			"flag" => intval(0)
	);
	
	$data = array(
		"group_name" => $title,
		"group_icon" => $group_type['icon'],
		"group_type" => $group_type['group_type_id'],
		"group_path" => $group_folder,
		"group_url" => $group_url,
		"group_image" => $urlImg,
		"group_short_des" => "",
		"group_description" => $des,
		"group_member" => array($group_member),
		"message" => array(),
		"group_code" => $group_code,
		"group_name_search" => removeUnicode($des),
		"status" => intval(1),
		"member_count" => intval(1),
		"create_by" => $uid . "",
		"create_time" => time(),
		"update_time" => time(),
	);
	
	
	$result = $groups->insert($data);

	return 1;
}


function editGroup() {
	global $db;
	global $groups;

	$_csrf = getStrParaPost('csrf');
	$gid = getStrParaPost('gid');
	$title = getStrParaPost('title');
	$des = getStrParaPost('des');
	$group_type_id = getStrParaPost('group_type_id');
	
	//Lấy dữ liệu config
	$sconfigs = new MongoCollection($db, 'sconfigs');
	$resultSConfig = $sconfigs->findOne();
	$group_data = $resultSConfig['group'];
	
	//var_dump($resultSConfig);
	//var_dump($resultSConfig['group']['group_type']);
	$group_type = getGroupType($group_type_id, $group_data);
	
	//Trường hợp tồn tại img64
	$img64 = null;
	if(isset($_POST['img64'])) $img64 = $_POST['img64'];
	
	//check input
	//Check title
	if(strlen($title) < 4 ) return -20;		//lỗi nhập từ title
	 
	 //Check des
	if(strlen($des) < 20 ) return -21;
	 	 
	 
	 
	 //Check catalogue
	if(strlen($group_type_id) <= 0 ) return -24;
	if(($group_type_id <= 0) || ($group_type_id > 3)) return -25;
	
	 
	//Kiễm tra input file
	if((isset($img64) == false) && (isset($_FILES['upload']['name']) == false)) return -29;
	
		
	//Kiễm tra csrf, nếu kết quả < 0 tức sai, trả về mã -10
	//if(checkCsrfNoTime($_csrf) < 0) return -10;	
	
	//Lấy uid từ session
	if(isset($_SESSION['uid']) == false) $uid = "";
	else $uid =$_SESSION['uid'];
	
	//User chưa login, trả về -11
	if(strlen($uid) <= 0) return -11;
	
		
	$resultGroup = $groups->findOne(array("_id" => new MongoId($gid)));
	if($resultGroup == null) return -1; 		//Nhóm này không tồn tại
	
	if($resultGroup['create_by'] != $uid) return -2; //Không có quyền thay đổi thông tin này
	
	$group_folder = $resultGroup['group_folder'];
	$group_url = $resultGroup['group_url'];
	
	//Upload file 
	$urlImg = "";

	if(isset($_FILES['upload']['name'])) {
		//upload file
		$upload_path = $group_folder . "/" . $_FILES['upload']['name'];
		move_uploaded_file($_FILES['upload']['tmp_name'], $upload_path);
		resize_crop_image("560,292", "240,320",$upload_path, $upload_path);
		$urlImg = $group_url . "/" . $_FILES['upload']['name'];
	}
	
	//Trường hợp dùng base64
	if(isset($img64) == true) {
		$file_name = md5(time()) . ".jpg";
		$upload_path = $item_image_folder  . "/" . $file_name;
		base64_to_jpeg($img64, $upload_path);
		//resize image
		resize_crop_image("560,292", "240,320",$upload_path, $upload_path);
		$urlImg = $group_url . "/" . $file_name;
	}
	
	
	$data = array(
		"group_name" => $title,
		"group_icon" => $group_type['icon'],
		"group_type" => $group_type['group_type_id'],
		"group_description" => $des,
		"group_name_search" => removeUnicode($des),
		"update_time" => time(),
	);
	
	if($urlImg != '') $data['group_image'] != $urlImg;
	
	
	$result = $groups->update(array('_id' => new MongoId($gid)),$data);

	return 1;
}

function joinGroup() {
	global $db;
	global $groups;

	$_csrf = getStrParaPost('csrf');
	$gid = getStrParaPost('gid');
	
	$query = array(
			'_id' => new MongoId($gid),
			'group_member' => array('$elemMatch' => array(
									"uid" => $uid . ""
								)
							),
		);
	
	$resultGroup = $groups->findOne($query);
	
	//Nếu đã tồn tại trong group, thì đặt lại status = -1
	if($resultGroup != null) {
		$query = array(
			'_id' => new MongoId($gid),
			'review' => array('$elemMatch' => array(
									"uid" => $uid . ""
								)
							),
		);
		
		$update = array(
				'$set' => array('group_member.$.status' => 1)
		);
		
		$updateResult = $points->update($query, $update);
		
		return 1;
	}
	
	$users = new MongoCollection($db, 'users');
	$usersResult = $users->findOne(array("_id" => new MongoId($uid)));
	
	$group_member = array(
			"uid" => $uid,
			"display_name" => $usersResult["display_name"],
			"language_id" => intval(1),
			"language" => "vi",
			"avatar" => $usersResult["avatar"],
			"share_local" => intval(1),
			"_lat" => 1,
			"_lng" => 1,
			"role" => intval(1),
			"status" => intval(1),
			"flag" => intval(0)
	);
	
	$updateResult = $groups->update(array('_id' => new MongoId($gid)), 
			array('$addToSet' => array('group_member' => $group_member))
			);
}

function leaveGroup() {
	global $db;
	global $groups;

	$_csrf = getStrParaPost('csrf');
	$gid = getStrParaPost('gid');
	
	$query = array(
			'_id' => new MongoId($gid),
			'group_member' => array('$elemMatch' => array(
									"uid" => $uid . ""
								)
							),
		);
	
	$resultGroup = $groups->findOne($query);
	
	//Nếu chưa join vào trong group, thì không thể leave được
	if($resultGroup == null) return -3;
	
	$query = array(
		'_id' => new MongoId($gid),
		'review' => array('$elemMatch' => array(
								"uid" => $uid . ""
							)
						),
	);
	
	$update = array(
			'$set' => array('group_member.$.status' => -1)
	);
	
	$updateResult = $points->update($query, $update);
	
	return 1;
}

?>