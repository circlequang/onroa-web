<?php
/*
** Lấy giá trị là một Str từ phương thức POST
*/
function getStrParaPost($para_name) {
	return isset($_POST[$para_name]) ? $_POST[$para_name] : '';
}

/*
** Lấy giá trị là một Int từ phương thức POST
*/
function getIntParaPost($para_name) {
	return isset($_POST[$para_name]) ? intval($_POST[$para_name]) : 0;
}

/*
** Lấy giá trị là một Str từ phương thức POST
*/
function getStrParaGet($para_name) {
	return isset($_GET[$para_name]) ? $_GET[$para_name] : '';
}

/*
** Lấy giá trị là một Int từ phương thức POST
*/
function getIntParaGet($para_name) {
	return isset($_GET[$para_name]) ? intval($_GET[$para_name]) : 0;
}


function msort($array, $key, $sort_flags = SORT_REGULAR) {
    if (is_array($array) && count($array) > 0) {
        if (!empty($key)) {
            $mapping = array();
            foreach ($array as $k => $v) {
                $sort_key = '';
                if (!is_array($key)) {
                    $sort_key = $v[$key];
                } else {
                    // @TODO This should be fixed, now it will be sorted as string
                    foreach ($key as $key_key) {
                        $sort_key .= $v[$key_key];
                    }
                    $sort_flags = SORT_STRING;
                }
                $mapping[$k] = $sort_key;
            }
            arsort($mapping, $sort_flags);
            $sorted = array();
            foreach ($mapping as $k => $v) {
                $sorted[] = $array[$k];
            }
            return $sorted;
        }
    }
    return $array;
}

function unicode_str_filter ($str){
	$unicode = array(
		'a'=>'á|à|ả|ã|ạ|ă|ắ|ặ|ằ|ẳ|ẵ|â|ấ|ầ|ẩ|ẫ|ậ',
		'd'=>'đ',
		'e'=>'é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ',
		'i'=>'í|ì|ỉ|ĩ|ị',
		'o'=>'ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ',
		'u'=>'ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự',
		'y'=>'ý|ỳ|ỷ|ỹ|ỵ',
		'A'=>'Á|À|Ả|Ã|Ạ|Ă|Ắ|Ặ|Ằ|Ẳ|Ẵ|Â|Ấ|Ầ|Ẩ|Ẫ|Ậ',
		'D'=>'Đ',
		'E'=>'É|È|Ẻ|Ẽ|Ẹ|Ê|Ế|Ề|Ể|Ễ|Ệ',
		'I'=>'Í|Ì|Ỉ|Ĩ|Ị',
		'O'=>'Ó|Ò|Ỏ|Õ|Ọ|Ô|Ố|Ồ|Ổ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ở|Ỡ|Ợ',
		'U'=>'Ú|Ù|Ủ|Ũ|Ụ|Ư|Ứ|Ừ|Ử|Ữ|Ự',
		'Y'=>'Ý|Ỳ|Ỷ|Ỹ|Ỵ'
	);
	
	foreach($unicode as $nonUnicode=>$uni){
		$str = preg_replace("/($uni)/i", $nonUnicode, $str);
	}
	
	return $str;
}


function my_numeric2character($t)
{
    $convmap = array(0x0, 0x2FFFF, 0, 0xFFFF);
    return mb_decode_numericentity($t, $convmap, 'UTF-8');
}
/* Converts any characters into HTML-entities */
function my_character2numeric($t)
{
    $convmap = array(0x0, 0x2FFFF, 0, 0xFFFF);
    return mb_encode_numericentity($t, $convmap, 'UTF-8');
}

/*
	Convert Base64 string to an image file
*/
function base64_to_jpeg($base64_string, $output_file) {
    $ifp = fopen($output_file, "wb"); 

    $data = explode(',', $base64_string);

    fwrite($ifp, base64_decode($data[1])); 
    fclose($ifp); 

    return $output_file; 
}

//Resize image, với kích cở tối đa là sizeStr = $max_width, $max_height
function resizeImg($sizeStr, $source_file) {
	if(strlen(trim($sizeStr)) <= 1) return;
	$resizeArr = explode(",", $sizeStr);
	$max_width = $resizeArr[0];
	resize_crop_image($resizeArr[0], $resizeArr[1], $source_file, $source_file);
}
	
//Resize image, với kích cở tối đa là $max_width, $max_height
function resize_crop_image($landscape_size, $portrait_size, $source_file, $dst_dir, $quality = 80){
	$imgsize = getimagesize($source_file);
	
	//Set $max_width, $max_height theo kiểu landscape
	$resizeArr = explode(",", $landscape_size);
	$max_width = $resizeArr[0];
	$max_height = $resizeArr[1];
	
	//Lấy width x height của image
	$width = $imgsize[0];
	$height = $imgsize[1];
	
	//Trường hợp height > width, Set $max_width, $max_height theo kiểu portrait
	if($height > $width) {
		$resizeArr = explode(",", $portrait_size);
		$max_width = $resizeArr[0];
		$max_height = $resizeArr[1];
	}
	
	$mime = $imgsize['mime'];
 
	switch($mime){
		case 'image/gif':
			$image_create = "imagecreatefromgif";
			$image = "imagegif";
			break;
 
		case 'image/png':
			$image_create = "imagecreatefrompng";
			$image = "imagepng";
			$quality = 9;
			break;
 
		case 'image/jpeg':
			$image_create = "imagecreatefromjpeg";
			$image = "imagejpeg";
			$quality = 100;
			break;
 
		default:
			return false;
			break;
	}
	 
	$dst_img = imagecreatetruecolor($max_width, $max_height);
	imagealphablending($dst_img, false);
	
imagesavealpha($dst_img, true);
	$src_img = $image_create($source_file);
	 
	$width_new = $height * $max_width / $max_height;
	$height_new = $width * $max_height / $max_width;
	//if the new width is greater than the actual width of the image, then the height is too large and the rest cut off, or vice versa
	if($width_new > $width){
		//cut point by height
		$h_point = (($height - $height_new) / 2);
		//copy image
		imagecopyresampled($dst_img, $src_img, 0, 0, 0, $h_point, $max_width, $max_height, $width, $height_new);
	}else{
		//cut point by width
		$w_point = (($width - $width_new) / 2);
		imagecopyresampled($dst_img, $src_img, 0, 0, $w_point, 0, $max_width, $max_height, $width_new, $height);
	}
	 
	$image($dst_img, $dst_dir, $quality);
 
	if($dst_img)imagedestroy($dst_img);
	if($src_img)imagedestroy($src_img);
	
}

//Them khoan chan
function addLenght($str,$lenght) {
	$str = $str . '                                                                                         ';
	return substr($str, 0, $lenght);
}

//Tạo keymap dựa vào chuổi url có dang ten-san-pham-can-tao
function createKeymap($str, $keyLenght) {
	$arr = explode("-", $str);
	$str = "";
	$l = sizeof($arr);
	
	if($l >= 1) $str = $str . addLenght($arr[0], 2);
	if($l >= 2) $str = $str . addLenght($arr[1], 2);
	if($l >= 3) $str = $str . addLenght($arr[2], 2);
	
	$str = strtolower(trim($str));
	
	$str = str_replace(" ", "-", $str);
	
	if(strlen($str) <= $keyLenght) return $str;
	
	return substr($str, 0, $keyLenght);
}

function removeUnicode($q) {
	$q = my_numeric2character($q);
	$q = unicode_str_filter($q); 

	$q = strtolower($q);
	$q = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $q);	//Remove non-UTF-8
	$q = preg_replace("/[^A-Za-z0-9 ]/", '', $q);	//remove non-alphanumeric characters
	
	return $q;
}

//Tạo url dạng [Tên sản phẩm cần tạo] => ten-san-pham-can-tao
function createURLformTitle($title) {
	$q = removeUnicode($title);
	
	return str_replace(" ","-", $q);
}

//Tạo folder xong kiễm tra xem folder đã tồn tại hay chưa.
//Nếu kiễm tra kh thấy thì trả về [false], báo hiệu tạo folder thất bại
function createFolder($path) {
	if(!file_exists($item_image_folder)){
				mkdir($path, 0775, true);
			}
			
	//Trường hợp không tạo được folder ==> gởi báo lỗi về client
	if(!file_exists($path))
		return fasle;
	
	return true;
}

//Tạo một cây folder xong kiễm tra xem folder đã tồn tại hay chưa.
//Nếu kiễm tra kh thấy thì trả về [false], báo hiệu tạo folder thất bại
function createFolderTree($path) {
	$folder_tree = explode('/',$path);
	$l = sizeOf($folder_tree);
	
	//Bắt đầu duyệt từ folder thứ nhất trở đi (có index là 1 chưa kg phải 0)
	$folder_path = "";
	for($i = 1; $i < $l; $i++) {
		$folder_path = trim($folder_path . "/" . $folder_tree[$i]);
		if(!file_exists($folder_path)){
			mkdir($folder_path, 0775, true);
		}
	}
			
	//Trường hợp không tạo được folder ==> gởi báo lỗi về client
	if(!file_exists($path))
		return false;
	
	return true;
}

//Lấy tọa độ, trả về key của các tọa độ này
function getGeolocationKey($lat, $lng, &$_lat, &$_lng) {
	$_lat = intval($lat * 1000);
	$_lng = intval($lng * 1000);
}

//Dựa vào _category_id từ client, tạo các array dành cho category
function getCatagory($_category_id ,&$category_id, &$category_name_en, &$category_name_vn, &$type_icon) {
	global $db;
	$categorys = new MongoCollection($db, 'categorys');
	
	$category_id = array();
	$category_name_vn = array();
	$category_name_en = array();
	$type_icon = array();
	
	$result = $categorys->findOne(array('category_id' => intval($_category_id)));
	
	if($result == null) return false;
	
	array_push($category_id, $_category_id);
	array_push($category_name_en, $result['category_name']['en']);
	array_push($category_name_vn, $result['category_name']['vi']);
	array_push($type_icon, $result['icon']);
	
	return true;
}

//Trả về city_key_id và city_name dựa vào city_id
function getCityInfo($city_id, &$city_key_id, &$city_name) {
	switch($city_id) {
		case 217 : $city_key_id = "ho-chi-minh";
				$city_name = "TP. HCM";
				break;
		case 218 : $city_key_id = "ha-noi";
				$city_name = "Hà Nội";
				break;		
		case 219 : $city_key_id = "da-nang";
				$city_name = "Đà Nẵng";
				break;
		case 221 : $city_key_id = "can-tho";
				$city_name = "Cần Thơ";
				break;
		case 248 : $city_key_id = "khanh-hoa";
				$city_name = "Khánh Hoà";
				break;
		case 223 : $city_key_id = "vung-tau";
				$city_name = "Vũng Tàu";
				break;
		case 220 : $city_key_id = "hai-phong";
				$city_name = "Hải Phòng";
				break;
		case 233 : $city_key_id = "binh-thuan";
				$city_name = "Bình Thuận";
				break;
		case 254 : $city_key_id = "lam-dong";
				$city_name = "Lâm Đồng";
				break;
		case 222 : $city_key_id = "dong-nai";
				$city_name = "Đồng Nai";
				break;
		case 265 : $city_key_id = "quang-ninh";
				$city_name = "Quảng Ninh";
				break;
		case 273 : $city_key_id = "hue";
				$city_name = "Huế";
				break;
		case 230 : $city_key_id = "binh-duong";
				$city_name = "Bình Dương";
				break;
		case 244 : $city_key_id = "hai-duong";
				$city_name = "Hải Dương";
				break;
		case 259 : $city_key_id = "ninh-thuan";
				$city_name = "Ninh Thuận";
				break;
						
		case 256 : $city_key_id = "nam-dinh";
				$city_name = "Nam Định";
				break;
		case 274 : $city_key_id = "tien-giang";
				$city_name = "Tiền Giang";
				break;
		case 250 : $city_key_id = "kon-tum";
				$city_name = "Kon Tum";
				break;
		case 263 : $city_key_id = "quang-nam";
				$city_name = "Quảng Nam";
				break;
		case 253 : $city_key_id = "lao-cai";
				$city_name = "Lào Cai";
				break;
		case 257 : $city_key_id = "nghe-an";
				$city_name = "Nghệ An";
				break;
		case 255 : $city_key_id = "long-an";
				$city_name = "Long An";
				break;
		case 231 : $city_key_id = "binh-dinh";
				$city_name = "Bình Định";
				break;
		case 249 : $city_key_id = "kien-giang";
				$city_name = "Kiên Giang";
				break;
		case 224 : $city_key_id = "an-giang";
				$city_name = "An Giang";
				break;
		case 236 : $city_key_id = "dak-lak";
				$city_name = "Đắk Lắk";
				break;
		case 239 : $city_key_id = "dong-thap";
				$city_name = "Đồng Tháp";
				break;
		case 277 : $city_key_id = "vinh-long";
				$city_name = "Vĩnh Long";
				break;
		case 234 : $city_key_id = "ca-mau";
				$city_name = "Cà Mau";
				break;
		case 240 : $city_key_id = "gia-lai";
				$city_name = "Gia Lai";
				break;
		case 269 : $city_key_id = "tay-ninh";
				$city_name = "Tây Ninh";
				break;
		case 267 : $city_key_id = "soc-trang";
				$city_name = "Sóc Trăng";
				break;
		case 229 : $city_key_id = "ben-tre";
				$city_name = "Bến Tre";
				break;
		case 275 : $city_key_id = "tra-vinh";
				$city_name = "Trà Vinh";
				break;
		case 232 : $city_key_id = "binh-phuoc";
				$city_name = "Bình Phước";
				break;
		case 264 : $city_key_id = "quang-ngai";
				$city_name = "Quảng Ngãi";
				break;
		case 225 : $city_key_id = "bac-lieu";
				$city_name = "Bạc Liêu";
				break;
		case 228 : $city_key_id = "bac-ninh";
				$city_name = "Bắc Ninh";
				break;
		case 278 : $city_key_id = "vinh-phuc";
				$city_name = "Vĩnh Phúc";
				break;
		case 261 : $city_key_id = "phu-yen";
				$city_name = "Phú Yên";
				break;
		case 272 : $city_key_id = "thanh-hoa";
				$city_name = "Thanh Hoá";
				break;
		case 258 : $city_key_id = "ninh-binh";
				$city_name = "Ninh Bình";
				break;
		case 227 : $city_key_id = "bac-giang";
				$city_name = "Bắc Giang";
				break;
		case 245 : $city_key_id = "hau-giang";
				$city_name = "Hậu Giang";
				break;
		case 266 : $city_key_id = "quang-tri";
				$city_name = "Quảng Trị";
				break;
		case 243 : $city_key_id = "ha-tinh";
				$city_name = "Hà Tĩnh";
				break;
		case 271 : $city_key_id = "thai-nguyen";
				$city_name = "Thái Nguyên";
				break;
		case 262 : $city_key_id = "quang-binh";
				$city_name = "Quảng Bình";
				break;
		case 260 : $city_key_id = "phu-tho";
				$city_name = "Phú Thọ";
				break;
		case 270 : $city_key_id = "thai-binh";
				$city_name = "Thái Bình";
				break;
		case 252 : $city_key_id = "lang-son";
				$city_name = "Lạng Sơn";
				break;
		case 241 : $city_key_id = "ha-giang";
				$city_name = "Hà Giang";
				break;
		case 237 : $city_key_id = "dak-nong";
				$city_name = "Đắk Nông";
				break;
		case 247 : $city_key_id = "hung-yen";
				$city_name = "Hưng Yên";
				break;
		case 246 : $city_key_id = "hoa-binh";
				$city_name = "Hòa Bình";
				break;
		case 276 : $city_key_id = "tuyen-quang";
				$city_name = "Tuyên Quang";
				break;
		case 268 : $city_key_id = "son-la";
				$city_name = "Sơn La";
				break;
		case 242 : $city_key_id = "ha-nam";
				$city_name = "Hà Nam";
				break;
		case 279 : $city_key_id = "yen-bai";
				$city_name = "Yên Bái";
				break;
		case 235 : $city_key_id = "cao-bang";
				$city_name = "Cao Bằng";
				break;
		case 238 : $city_key_id = "dien-bien";
				$city_name = "Điện Biên";
				break;
		case 251 : $city_key_id = "lai-chau";
				$city_name = "Lai Châu";
				break;
		case 226 : $city_key_id = "bac-kan";
				$city_name = "Bắc Kạn";
				break;
	}
	
	if(strlen($city_key_id) <= 0) return false;
	
	return true;
}

function getGroupType($group_type_id, $group_data) {
	
	$group_type = null;
	$group_type_data = $group_data['group_type'];
	foreach ($group_type_data as $item) {
       if (intval($item['group_type_id']) == intval($group_type_id)) {
           $group_type = $item;
       }
   }

	return ($group_type);
}

function getUserFromList($arrUserID, $fieldList = null) {
	global $db;
	$users = new MongoCollection($db, 'users');
	
	$cirUserId = array();
	$l = count($arrUserID);
	for($i = 0; $i < $l; $i++) {
		$cirUserId[$i] = new MongoId($arrUserID[$i]);
	}

	//Trường hợp không yêu cầu field Lisst thì chỉ trả về _id, display_name, avatar
	$fieldList = array(
		"_id" => 1,
		"display_name" => 2,
		"avatar" => 3,
		"slug" => 4
	);
	
	$query = array(
			'_id' => array('$in' => $cirUserId)
		);
		
	$result = $users->find($query, $fieldList);
	$arr = iterator_to_array($result);
	$arr = array_values($arr);
	$l = count($arr);
	for($i = 0; $i < $l; $i++) {
		$arr[$i]["_id"] = $arr[$i]["_id"] . "";
	}
	return $arr;
}

function addGooPoints($gooReviews, &$points) {
	$gooReviewsArr = array();
	if($gooReviews != null) {
		$gItem = null;
		//Add google review vào Onroa
		for($i = 0; $i < sizeOf($gooReviews); $i++) {
			//Data từ google
			if(isset($gooReviews[$i]->time)) 
				$gItem = array(
					"review_id" => "g" . $gooReviews[$i]->time,
					"uid" => "g" . $gooReviews[$i]->time,
					"display_name" => $gooReviews[$i]->author_name,
					"burl" => "",
					"avatar" => $gooReviews[$i]->profile_photo_url,
					"submit_date" => $gooReviews[$i]->time,
					"cmt" => $gooReviews[$i]->text
				);
			else  //Data từ Onroa (cache)
				$gItem = array(
					"review_id" => $gooReviews[$i]["review_id"],
					"uid" => $gooReviews[$i]["uid"],
					"display_name" => $gooReviews[$i]["display_name"],
					"burl" => "",
					"avatar" => $gooReviews[$i]["avatar"],
					"submit_date" => $gooReviews[$i]["submit_date"],
					"cmt" => $gooReviews[$i]["cmt"]
				);
			array_push($points['review'], $gItem);
			array_push($gooReviewsArr,$gItem);
		}
	}
	
	return $gooReviewsArr;
}

function getGooRef($gooRef) {
	 $query = "https://maps.googleapis.com/maps/api/place/details/json?language=vi&reference=" . $gooRef . "&key=AIzaSyC6hGTAkD_Snhx1Aj0kATrn_Pd4t5QibhI";
	//echo "a"; exit;
	$gReviews = null;
	if(strlen($gooRef) <= 1) return $gReviews;
	$data = file_get_contents($query);
	$result = json_decode($data);
	
	//var_dump($result->result->reviews[0]);
	if(isset($result->result->reviews[0]))
		$gReviews = $result->result->reviews;
	
	return $gReviews;
}

function getGooGetRef($_lat, $_lng, $title, $cache_time) {
	//Bỏ dấu [-] trong title, nếu có
	$title = explode("-", $title);
	$title = trim(str_replace(" ", "+", $title[0]));
	$gReference = "";

	//Chỉ query khi 
	// 1. Chưa query trước đó
	// 2. Đã query và đã quá hàng cache 30 ngày
	$t2 = time(); 
	if(($cache_time > $t2) || ($cache_time == 0)) {
		$query = "https://maps.googleapis.com/maps/api/place/search/json?language=vi&location=" . $_lat . "," . $_lng . "&radius=500&name=" . $title . "&key=AIzaSyC6hGTAkD_Snhx1Aj0kATrn_Pd4t5QibhI";

		$data = file_get_contents($query);

		$result = json_decode($data);

		if(isset($result->results[0])) {
			$gReference = $result->results[0]->reference;
		}
	}

	
 
	return $gReference;
}
?>