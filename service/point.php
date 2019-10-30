<?php
$points = new MongoCollection($db, 'points');

switch($f) {
	case 'search' : 
		$data = search();
		break;
	case 'bsearch' : 
		$data = bsearch();
		break;
	case 'nearPoints' : 
		$data = nearPoints();
		break;
	case 'listsearch' : 
		$data = listsearch();
		break;
	case 'detail' :
		$data = detail();
		break;
	case 'addPoint' :
		$data = addPoints();
		break;
	case 'addCmt' :
		$data = addCmt();
		break;
	case 'editCmt' :
		$data = editCmt();
		break;
	case 'deleteCmt' :
		$data = deleteCmt();
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

function getDetailPointsWithURL($url, &$arrUserIs) {
	global $points;
	
	$query = array('url' => $url);
	$result = $points->findOne($query);
	$k = 0;
	
	//trường hợp có data
	if(count($result) > 0) {
		//Trường hợp có comment
		if(count($result['review']) > 0) {
			$l = count($result['review']);
			for($i = 0; $i < $l; $i++) {
				//Trường hợp active khác 1 => record này bị xóa	hoặc vô hiệu
				if($result['review'][$i]['active'] != 1) {
					unset($result['review'][$i]);
				} else {
					$arrUserIs[$k] = $result['review'][$i]["uid"];
					$k++;
				}
			}
		}
		
		//Sắp xếp lại review theo thứ tự mới -> cũ
		ksort($result['review']);
	}
	$result['review'] = array_values($result['review']);
	return $result;
}


function getDetailPointsWithID($_id) {
	global $points;
	
	$query = array('_id' => new MongoId($_id));
	$result = $points->findOne($query);
	
	//trường hợp có data
	if(count($result) > 0) {
		//Convert _id sang kiểu string
		$result['_id'] = $result['_id']. ""; // convert to String
		
		//Trường hợp có comment
		if(count($result['review']) > 0) {
			$l = count($result['review']);
			for($i = 0; $i < $l; $i++) {
				//Trường hợp active khác 1 => record này bị xóa	hoặc vô hiệu
				if($result['review'][$i]['active'] != 1) {
					unset($result['review'][$i]);
				}
			}
		}
		
		//Sắp xếp lại review theo thứ tự mới -> cũ
		ksort($result['review']);
	}
	
	return $result;
}

//Trả về danh sách các point lân cận
function listsearch() {
	global $points;
	
	$_latitude =  	getStrParaGet("_lat");
	$_longitude = 	getStrParaGet("_lng");
	$_cata = 	getstrParaGet("cata");
	$_key = 	getstrParaGet("key");

	$query = array(
			'_latitude' => array('$gte' => $_latitude - 50, '$lte' => $_latitude + 50),
			'_longitude' => array('$gte' => $_longitude - 50, '$lte' => $_longitude + 50)
	);
	
	//Chưa cần tìm theo catalogy -======================== QV - sẽ thêm vào sau
	//Trường hợp có search theo catalogy
	/*
	if(strlen($_cata) > 0) {
		$arr_cata = explode(',', $_cata);
		$query['category_id'] = array('$in' => $arr_cata);
	}
	*/
	
	//Trường hợp search có keywork
	if(strlen($_key) > 0) {
		$keywork = unicode_str_filter($_key);
		$keywork = my_numeric2character($keywork);
		$keywork = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $keywork);		//Remove non-UTF-8
		$keywork = preg_replace("/[^A-Za-z0-9 ]/", '', $keywork);	//remove non-alphanumeric characters

		//$query['$text'] = array('$search'=> $keywork);
		$query['$text'] = array('$search'=> '"' . $keywork . '"');
	}

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
						
	$result = $result->limit(20);
 
	$arr = iterator_to_array($result);
	$arr = array_values($arr);
	$json = json_encode($arr);

	return $json;
	
}

//Trả về danh sách các point lân cận
function nearPoints($_latitude, $_longitude, $_cata) {
	global $points;
	
	//Trường hợp đối số kg cáo tọa độ lấy từ URL
	if($_latitude == 0 &&  $_longitude == 0) {
		$_latitude =  	getStrParaGet("_lat");
		$_longitude = 	getStrParaGet("_lng");
	}
	
	$query = array(
			'_latitude' => array('$gte' => $_latitude - 2, '$lte' => $_latitude + 2 ),
			'_longitude' => array('$gte' => $_longitude - 2, '$lte' => $_longitude + 2 )
	);
	
	//Search theo category	
	// ở các trang reg/contact . . . kg có catalogy nên kg cần search
	if(strlen($_cata) > 0) {
		$arr_cata = explode(',', $_cata);
		$query['category_id'] = array('$in' => $arr_cata);
	}
	
	
	
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
	$json = json_encode($arr);

	return $json;

}

//Trả về danh sách các point lân cận
function bsearch() {
	global $points;
	
	$_latitude =  	getStrParaGet("_lat");
	$_longitude = 	getStrParaGet("_lng");
	$_cata = 	getstrParaGet("cata");
	$_address = 	getStrParaGet("address");
	$_key = 	getstrParaGet("key");

	$query = array(
			'_latitude' => array('$gte' => $_latitude - 2, '$lte' => $_latitude + 2 ),
			'_longitude' => array('$gte' => $_longitude - 2, '$lte' => $_longitude + 2 )
	);
	
	//Trường hợp có search theo catalogy
	if(strlen($_cata) > 0) {
		$arr_cata = explode(',', $_cata);
		$query['category_id'] = array('$in' => $arr_cata);
	}
	
	//Trường hợp search có keywork
	if(strlen($_key) > 0) {
		$keywork = unicode_str_filter($_key);
		$keywork = my_numeric2character($keywork);
		$keywork = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $keywork);		//Remove non-UTF-8
		$keywork = preg_replace("/[^A-Za-z0-9 ]/", '', $keywork);	//remove non-alphanumeric characters

		$query['$text'] = array('$search'=> '"' . $keywork . '"');
	}

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
						
	$result = $result->limit(50);
 
	$arr = iterator_to_array($result);

	//Trường hợp dữ liệu hiện tại không có,
	if((count($arr) <= 0) && (strlen($_key) > 0)){
		//unset($query['_latitude']);
		//unset($query['_longitude']);
		$query['_latitude'] = array('$gte' => $_latitude - 50, '$lte' => $_latitude + 50);
		$query['_longitude'] = array('$gte' => $_longitude - 50, '$lte' => $_longitude + 50);
		$query['$text'] = array('$search'=> '"' . $keywork . '"');
		$result = $points->findOne($query, $fields);
		
		//$result = $result->limit(1);
		if(count($result) > 0) {
			$arr['new_search'] = 'y';
		}
	} 
	
	$arr = array_values($arr);
	$json = json_encode($arr);

	return $json;

}



//Trả về danh sách các point lân cận
function search() {
	global $points;
	
	$_latitude =  	getStrParaGet("_lat");
	$_longitude = 	getStrParaGet("_lng");
	$_cata = 	getstrParaGet("cata");
	$_address = 	getStrParaGet("address");
	$_key = 	getstrParaGet("key");

	$query = array(
			'_latitude' => array('$gte' => $_latitude - 2, '$lte' => $_latitude + 7 ),
			'_longitude' => array('$gte' => $_longitude - 5, '$lte' => $_longitude + 5 )
	);
	
	//Trường hợp có search theo catalogy
	if(strlen($_cata) > 0) {
		$arr_cata = explode(',', $_cata);
		$query['category_id'] = array('$in' => $arr_cata);
	}
	
	//Trường hợp search có keywork
	if(strlen($_key) > 0) {
		$keywork = unicode_str_filter($_key);
		$keywork = my_numeric2character($keywork);
		$keywork = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $keywork);		//Remove non-UTF-8
		$keywork = preg_replace("/[^A-Za-z0-9 ]/", '', $keywork);	//remove non-alphanumeric characters

		$query['$text'] = array('$search'=> '"' . $keywork . '"');
	}

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
						
	$result = $result->limit(200);
 
	$arr = iterator_to_array($result);

	//Trường hợp dữ liệu hiện tại không có,
	if((count($arr) <= 0) && (strlen($_key) > 0)){
		$query['_latitude'] = array('$gte' => $_latitude - 50, '$lte' => $_latitude + 50);
		$query['_longitude'] = array('$gte' => $_longitude - 50, '$lte' => $_longitude + 50);
		$query['$text'] = array('$search'=> '"' . $keywork . '"');
		
		$result = $points->findOne($query, $fields);
		
		//$result = $result->limit(1);
		if(count($result) > 0) {
			$arr['new_search'] = 'y';
		}
	} 
	
	$arr = array_values($arr);
	$json = json_encode($arr);

	return $json;

}

//Dựa vào input là url, trả về point tương ứng
function detail() {
	global $points;
	
	$url = "";
	if(isset($_GET['url'])) $url = $_GET['url'];

	if($url == '') return "";
	
	$arrUserId = array();
	$result = getDetailPointsWithURL($url, $arrUserId);
	//var_dump($result['_id']); exit;
	//Nêu số lượng review nhỏ hơn 5
	if(sizeOf($result["review"]) <= 5) {

		$cache_time = isset($result["gref"]['time']) ? $result["gref"]['time'] : 0;
		$gooRef = isset($result["gref"]['ref']) ? $result["gref"]['ref'] : NULL;
		$t2 = time(); 

		//Trường hợp đã query một lần, nhưng Google chưa có review thì xét
		//nếu lần này là sau lần query trước 30 ngày thì làm tiêp
		if(($cache_time > $t2) && ($gooRef == "")) $cache_time = 1;

		//Trường hợp lấy review từ Google khi
		// + cache_time quá hạng 30 ngày : $cache_time > $t2
		// + Chưa được tạo cache : $cache_time == 0
		if($cache_time != 1) {
			//Nếu đã tồn tại gooref (google referent string)
			if(isset($result["gref"]['ref'])) $gooRef = $result["gref"]['ref'];
			//Nếu chưa tồn tại, lấy chuỗi gooRef
			else $gooRef = getGooGetRef($result["latitude"], $result["longitude"], $result["title"], $cache_time);
		
			//Nếu đã tồn tại gooref (google referent string)
			if(isset($result["gref"]['review']) && ($cache_time > $t2)) $gooReviews = $result["gref"]['review'];
			//Nếu chưa tồn tại, lấy từ Google
			else $gooReviews = getGooRef($gooRef);

			
			
			$gooReviewsArr = addGooPoints($gooReviews, $result);
			
			//Nếu db chưa có data của Google Review hoặc đã có trong DB nhưng hết hạng cache , thì lưu lại
			if((isset($result["gref"]['review']) == false) || (($cache_time <= $t2) && ($cache_time > 1))){
				$gref = array(
						'ref' => $gooRef,
						'review' => $gooReviewsArr,
						'time' => time()
					);
					
				//time : là ngày hết hàng của cache, 30 ngày 60*60*24*30 = 2592000
				$updateResult = $points->update(array("_id" => $result['_id']), 
					array('$set' => array('gref' => array(
														'ref' => $gooRef,
														'review' => $gooReviewsArr,
														'time' => time()  + 2592000
													)
											)
					));
			}
		}

	}
	
	
	if(count($result) == 0) return "";
	$result['_id'] = $result['_id']. ""; // convert to String
	$returnArr = array();
	$returnArr['detail'] = $result;
	$returnArr['user_list'] = getUserFromList($arrUserId, null);
	$returnArr['near'] =  nearPoints($result['_latitude'], $result['_longitude'], $result['category_id'][0]);
	$json = json_encode($returnArr);
	
	return $json;
}

function addPoints() {
	global $db;
	global $points;

	$_csrf = getStrParaPost('csrf');
	$title = getStrParaPost('title');
	$des = getStrParaPost('des');
	$address = getStrParaPost('address');
	$city_id = getStrParaPost('city');
	$phone = getStrParaPost('phone-number');
	$email = getStrParaPost('email');
	$website = getStrParaPost('website');
	$lat = getStrParaPost('lat');
	$lng = getStrParaPost('lng');
	$catalogue = getStrParaPost('catalogue');
	$owner = getStrParaPost('owner');
	
	//Trường hợp tồn tại img64
	$img64 = null;
	if(isset($_POST['img64'])) $img64 = $_POST['img64'];
	
	//check input
	//Check title
	if(strlen($title) < 4 ) return -20;		//lỗi nhập từ title
	 
	 //Check des
	if(strlen($des) < 20 ) return -21;
	 	 
	 //Check address
	if(strlen($address) <= 0 ) return -22;
	
	 //Check city
	if(strlen($city_id) <= 0 ) return -23;
	if(getCityInfo($city_id, $city_key_id, $city_name) == false) return -23;
	 
	 //Check catalogue
	if(strlen($catalogue) <= 0 ) return -24;
	if(getCatagory($catalogue , $category_id, $category_name_en, $category_name_vn, $type_icon) == false) return -24;
	 
	 //Check owner
	if(strlen($owner) <= 0 ) return -25;
	
	 //Kiễm tra format của email
	 //Check email format
	if(strlen($email) > 0 && (!preg_match("^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$^",$email)))
		return -26; //Email không đúng format
	
	//Kiễm tra tọa độ
	if((strlen($lat) <= 0 ) || (strlen($lng) <= 0 )) return -27;
	if((is_numeric($lat) == false) || (is_numeric($lng) == false )) return -28;
	getGeolocationKey($lat, $lng, $_lat, $_lng);
	 
	//Kiễm tra input file
	if((isset($img64[0]) == false) && (isset($_FILES['upload']['name']) == false)) return -29;
	
	//Nếu upload nhiều hơn 8 file => lỗi
	if(isset($_FILES['upload']['name'])) {
		if(sizeOf($_FILES['upload']['name']) > 8) return -30;
	}
	
	//Nếu upload nhiều hơn 8 file => lỗi
	if(isset($img64[0])) {
		if(sizeOf($img64) > 8) return -31;
	}
	
	//Kiễm tra csrf, nếu kết quả < 0 tức sai, trả về mã -10
	if(checkCsrfNoTime($_csrf) < 0) return -10;	
	
	//Lấy uid từ session
	if(isset($_SESSION['uid']) == false) $uid = "";
	else $uid =$_SESSION['uid'];
	
	//User chưa login, trả về -11
	if(strlen($uid) <= 0) return -11;
	
	//Kiễm tra xem có upload file
	if((isset($img64[0]) == false) && (isset($_FILES['upload']['name']) == false)) return -12;
	
	//Tạo URL cho địa điểm
	$url = createURLformTitle($title);
	$keymap = createKeymap($url, 4);
	$url = $url  . "-" . time() . "-onroa";
	 
	//Tạo folder cho Địa điểm này
	$sconfigs = new MongoCollection($db, 'sconfigs');
	$resultSConfig = $sconfigs->findOne();
	$item_image_folder = $resultSConfig['item_image_folder'] . "/" . $resultSConfig['new_point'];			//Lấy folder gốc của tất cả các photos
	
	
	//Tạo folder cho 
	
	//Tạo folder cho keymap
	if(createFolder($item_image_folder . "/" . $city_key_id .  "/" . $keymap) == false) return -6;
	
	//Tạo folder cho points
	if(createFolder($item_image_folder . "/" . $city_key_id .  "/" . $keymap . "/" . $url) == false) return -6;
	
	$gallery_folder = $resultSConfig['new_point'] . "/" . $city_key_id .  "/" . $keymap . "/" . $url;
	$item_image_folder = $item_image_folder . "/" . $city_key_id .  "/" . $keymap . "/" . $url;		//Thư mục gốc vật lý của point, dùng copy image vào
	$image_url_root = $resultSConfig['item_image_url'] . "/" . $resultSConfig['new_point'] . "/" . $city_key_id .  "/" . $keymap . "/" . $url;			//Lấy url gốc của tất cả các photos 
	
	//Upload file 
	$urlImg = array();

	if(isset($_FILES['upload']['name'])) {
		$l = sizeOf($_FILES['upload']['name']);	
		
		//upload file
		for($i = 0; $i < $l; $i++) {
			$upload_path = $item_image_folder . "/" . $_FILES['upload']['name'][$i];
			move_uploaded_file($_FILES['upload']['tmp_name'][$i], $upload_path);
			resize_crop_image("1260,725", "725,1260",$upload_path, $upload_path);
			$urlImg[$i] = $image_url_root . "/" . $_FILES['upload']['name'][$i];
		}
	}
	
	//Trường hợp dùng base64
	if(isset($img64[0]) == true) {
		$file_name_src = md5(time());
		for($i = 0; $i < sizeOf($img64); $i++) {
			$file_name = $file_name_src  . "-" . $i. ".jpg";
			$upload_path = $item_image_folder  . "/" . $file_name;
			base64_to_jpeg($img64[$i], $upload_path);
			//resize image
			resize_crop_image("1260,725", "725,1260",$upload_path, $upload_path);
			$urlImg[$i] = $image_url_root . "/" . $file_name;
		}
	}
	
	$data = array(

		"owner_id" => $owner,
		"category_id" => $category_id,
		"category_name" => array(
			"en" => $category_name_en,
			"vi" => $category_name_vn
		),
		"title" => $title,
		"address" => $address,
		"city" => $city_name,
		"city_id" => $city_id,
		"zip" => "",
		"state" => "",
		"country_id" => "",
		"location" => trim($address . " " . $city_name) . " " . $country_name ,
		"contact_name" => "",
		"home_phone" => $phone,
		"mobile_phone" => "",
		"email" => $email,
		"website" => $website,
		"latitude" => $lat,
		"longitude" => $lng,
		"type_id" => $category_id[0],
		"type_name" => array(
			"en" => $category_name_en[0],
			"vi" => $category_name_vn[0]
		),
		"type_icon" => $type_icon[0],
		"type_icon_list" => $type_icon,
		"rating" => 4,
		"gallery_folder" => $gallery_folder,
		"gallery" => $urlImg,
		"features" => array(
		),
		
		"price" => "",
		"price_from" => 0,
		"price_to" => 0,
		"open_from" => 0,
		"open_to" => 0,
		"non_stop" => 0,
		"featured" => 0,
		"color" => "",
		"person_id" => 1,
		"year" => 0,
		"special_offer" => 0,
		"item_specific" => array(
		),
		"description" => array(
			"en" => "",
			"vi" => $des
		),
		
		"last_review_rating" => 0,
		"review" => array(),
		"_latitude" => $_lat,
		"_longitude" => $_lng,
		"source" => "onroa",
		"image_url_root" => $image_url_root,
		"source_url" => "onroa",
		"url" => $url,
		"q" => removeUnicode($title),
		"create_by" => $uid . ""
	);
	
	
	$newpoints = new MongoCollection($db, 'newpoints');
	$result = $newpoints->insert($data);

	return 1;
}


function addCmt() {
	global $db;
	global $points;
	$img64 = null;
	$_csrf = getStrParaPost('csrf');
	$checkin = getIntParaPost('checkin');
	$point_id = getStrParaPost('_id');
	$cmt = getStrParaPost('cmt');
	
	//Trường hợp tồn tại img64
	if(isset($_POST['img64'])) $img64 = $_POST['img64'];
	
	
	//Kiễm tra csrf, nếu kết quả < 0 tức sai, trả về mã -10
	if(checkCsrfNoTime($_csrf) < 0) return -10;	
	
	//Lấy uid từ session
	if(isset($_SESSION['uid']) == false) $uid = "";
	else $uid =$_SESSION['uid'];
	
	//User chưa login, trả về -11
	if(strlen($uid) <= 0) return -11;
	$users = new MongoCollection($db, 'users');
	$resultUser = $users->findOne(array('_id' => $uid));
	 
	//Lấy fodler cho user 
	$sconfigs = new MongoCollection($db, 'sconfigs');
	$resultSConfig = $sconfigs->findOne();
	$item_image_folder = $resultSConfig['item_image_folder'];			//Lấy folder gốc của tất cả các photos
	$item_image_url = $resultSConfig['item_image_url'];			//Lấy url gốc của tất cả các photos 
	$review_id = time();
	
	//Upload file 
	$urlImg = array();
	
	//Trường hợp có upload file, tạo folder
	if((isset($_FILES['upload']['name']) > 0) || (isset($img64[0]) == true)) {
		$resultPoint = $points->findOne(array('_id' => new MongoId($point_id)));
		//Tạo folder lưu image của review nay
		$review_folder = $item_image_folder . "/" . $resultPoint["gallery_folder"] . "/" . $review_id;
		$review_folder_url = $item_image_url . "/" . $resultPoint["gallery_folder"] . "/" . $review_id;
		
		if(!file_exists($review_folder)){
			mkdir($review_folder, 0775, true);
		}
		
		//Trường hợp không tạo được folder ==> gởi báo lỗi về client
		if(!file_exists($review_folder))
			return -6;
	}

	//Trường hợp upload file
	if(isset($_FILES['upload']['name']) > 0) {
		$l = sizeOf($_FILES['upload']['name']);	
		//Trường hợp có upload file, tạo folder
		if($l > 0) {
			
		}
		
		//upload file
		for($i = 0; $i < $l; $i++) {
			$upload_path = $review_folder . "/" . $_FILES['upload']['name'][$i];
			move_uploaded_file($_FILES['upload']['tmp_name'][$i], $upload_path);
			resize_crop_image("1260,725", "725,1260",$upload_path, $upload_path);
			$urlImg[$i] = $review_folder_url . "/" . $_FILES['upload']['name'][$i];
		}
	}
	
	//Trường hợp dùng base64
	if(isset($img64[0]) == true) {
		$file_name_src = md5(time());
		for($i = 0; $i < sizeOf($img64); $i++) {
			$file_name = $file_name_src  . "-" . $i. ".jpg";
			$upload_path = $review_folder  . "/" . $file_name;
			
			base64_to_jpeg($img64[$i], $upload_path);
			//resize image
			resize_crop_image("1260,725", "725,1260",$upload_path, $upload_path);
			$urlImg[$i] = $review_folder_url . "/" . $file_name;
		}
	}
	
	//file_put_contents("/usr/local/y/apps/onroa/logs.txt", print_r($_POST, true) . "\n", FILE_APPEND);
	
	//Cập nhật cmt
	$data = array(
		"review_id" => $review_id,
		"uid" => $resultUser['_id'] . "",
		"display_name" => $resultUser['display_name'],
		"language_id" => 1,
		"language" => "vi",
		"avatar" => $resultUser['avatar'],
		"image" => $urlImg,
		"cmt" => $cmt,
		"rating_value" => 0,
		"rating_service" => 0,
		"submit_date" => $review_id,
		"check-in" => $checkin,
		"active" => 1
	);
	//var_dump($data); exit;
	$updateResult = $points->update(array('_id' => new MongoId($point_id)), 
				array('$addToSet' => array('review' => $data))
				);
	
	$json = -6;	//Lỗi hệ thống
	if($updateResult["nModified"] == 1) {
		$resultPoint = getDetailPointsWithID($point_id); //$points->findOne(array('_id' => new MongoId($point_id)));
		$json = json_encode($resultPoint);
	}
	
	return $json;
}

function editCmt() {
	global $db;
	global $points;

	$_csrf = getStrParaPost('csrf');
	$point_id = getStrParaPost('_id');
	$review_id = getStrParaPost('review_id');
	$content = getStrParaPost('content');
	//echo $review_id; exit;
	//Kiễm tra csrf, nếu kết quả < 0 tức sai, trả về mã -10
	if(checkCsrfNoTime($_csrf) < 0) return -10;	
	
	//Lấy uid từ session
	if(isset($_SESSION['uid']) == false) $uid = "";
	else $uid =$_SESSION['uid'];
	
	//User chưa login, trả về -11
	if(strlen($uid) <= 0) return -11;
	//echo $uid; exit;
	$query = array(
			'_id' => new MongoId($point_id),
			'review' => array('$elemMatch' => array(
									"review_id" => intval($review_id), 
									"uid" => $uid . ""
								)
							),
		);
		
	$update = array(
			'$set' => array('review.$.cmt' => $content, 'submit_date' => time())
	);
			
	//var_dump($query); exit;
	//$resultPoint = $points->findOne($query);
	$updateResult = $points->update($query, $update);
	
	//var_dump($resultPoint);
	$json = -6;	//Lỗi hệ thống
	if($updateResult["nModified"] == 1) {
		$resultPoint = getDetailPointsWithID($point_id);//$points->findOne(array('_id' => new MongoId($point_id)));
		$json = json_encode($resultPoint);
	}
	
	return $json;
}

function deleteCmt() {
	global $db;
	global $points;

	$_csrf = getStrParaPost('csrf');
	$point_id = getStrParaPost('_id');
	$review_id = getStrParaPost('review_id');
	
	//echo $review_id; exit;
	//Kiễm tra csrf, nếu kết quả < 0 tức sai, trả về mã -10
	if(checkCsrfNoTime($_csrf) < 0) return -10;	
	
	//Lấy uid từ session
	if(isset($_SESSION['uid']) == false) $uid = "";
	else $uid =$_SESSION['uid'];
	
	//User chưa login, trả về -11
	if(strlen($uid) <= 0) return -11;
	
	$query = array(
			'_id' => new MongoId($point_id),
			'review' => array('$elemMatch' => array(
									"review_id" => intval($review_id), 
									"uid" => $uid . ""
								)
							),
		);
		
	//Xóa cmt nào thì đặt active là [-1]
	$update = array(
			'$set' => array('review.$.active' => -1, 'submit_date' => time())
	);
			
	//var_dump($update); exit;
	//$resultPoint = $points->findOne($query);
	$updateResult = $points->update($query, $update);
	
	$json = -6;	//Lỗi hệ thống
	if($updateResult["nModified"] == 1) {
		$resultPoint = getDetailPointsWithID($point_id);//$points->findOne(array('_id' => new MongoId($point_id)));
		$json = json_encode($resultPoint);
	}
	
	return $json;
}
?>