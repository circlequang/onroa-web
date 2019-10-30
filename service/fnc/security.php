<?php
define("TIME_OUT", 3600);
/*
** Tạo csrf và trả về 
*/
function getNewCsrf() {
	//Tạo token csrf
	$csrf = md5(uniqid(rand(), TRUE)) . md5(uniqid(time(), TRUE));
	$_SESSION['csrf'] = $csrf;
	$_SESSION['csrf_time'] = time();
	
	return $csrf;
}

/*
** Kiễm tra xem đã có csrf chưa, 
** - nếu chưa thì tạo csrf và trả về 
** - đã có: trả csrf hiện tại về
*/
function getCsrf() {
	//Tạo token csrf
	$csrf = "";
	if (!isset($_SESSION['csrf'])) {
		$csrf = md5(uniqid(rand(), TRUE)) . md5(uniqid(time(), TRUE));
		$_SESSION['csrf'] = $csrf;
		$_SESSION['csrf_time'] = time();
	} 
	else if((isset($_SESSION['csrf'])) && (time() - $_SESSION['csrf_time']  > 3600)) {
		$csrf = md5(uniqid(rand(), TRUE)) . md5(uniqid(time(), TRUE));
		$_SESSION['csrf'] = $csrf;
		$_SESSION['csrf_time'] = time(); 
	} else 	{
		$csrf = $_SESSION['csrf'];
	}
	
	return $csrf;
}
	
/*
** Tạo csrf và add token đó vào data
** Trường hợp csrf đã tồn tại thì dùng lại csrf đó
*/
function addCsrf($data) {
	//Tạo token csrf
	$csrf = getCsrf();
	
	$arr = array();
	$arr['data'] = $data;
	$arr['csrf'] = $csrf;
}

/*
** Tạo mới csrf và add token đó vào data
** Trường hợp csrf đã tồn tại thì bỏ đi và tạo csrf mới
*/
function addNewCsrf($data) {
	//Tạo token csrf
	$csrf = getNewCsrf();
	
	$arr = array();
	$arr['data'] = $data;
	$arr['csrf'] = $csrf;
}

/*
** Kiểm tra xem dữ liệu csrf này có đúng kg 
** Nguyên tắc kiểm tra 
** _csrf = _SESSION['csrf']
** csrf_time : trong vòng 5 phút (300 giây)
*/
function checkCsrf($_csrf) {
	//Trường hợp chưa có csrf, trả về mã -1
	if (!isset($_SESSION['csrf'])) return -1;
	$csrf = $_SESSION['csrf'];
	$csrf_time = $_SESSION['csrf_time'];
	
	//Trường hợp csrf không khớp, trả về mã -2
	if($csrf != $_csrf) return -2;
	
	//Trường hợp csrf hết hạn, trả về -3
	//Thời hạn là 5 phút => 300 giây
	$t = time();
	if($csrf_time - $t > TIME_OUT) return -3;
	
	//Không có lỗi => trả về 0
	return 0;
}

/*
** Kiểm tra xem dữ liệu csrf này có đúng kg 
** Nguyên tắc kiểm tra 
** _csrf = _SESSION['csrf']
** csrf_time : trong vòng 5 phút (300 giây)
*/
function checkCsrfNoTime($_csrf) {
	//Trường hợp chưa có csrf, trả về mã -1
	if (!isset($_SESSION['csrf'])) return -1;
	$csrf = $_SESSION['csrf'];
	
	//Trường hợp csrf không khớp, trả về mã -2
	if($csrf != $_csrf) return -2;
	
	
	//Không có lỗi => trả về 0
	return 0;
}

//Kiểm tra xem đây là lần access thứ mấy
//Nếu lần access thứ nhất, mà lại muốn lấy những data khác như points, user, detail  . . .
// thì đây là access không chính thống.
function checkAccessCNT($sv,$f) {
	if(isset($_SESSION['access_cnt']) == false) $_SESSION['access_cnt'] = 0;
	if(isset($_SESSION['access_key']) == false) $_SESSION['access_key'] = "";
	$_SESSION['access_cnt'] = $_SESSION['access_cnt'] + 1;

	//Trường hợp access_cnt <= 1 : access lần đầu tiên
	if($_SESSION['access_cnt'] <= 1) {
		//Nếu access lần đầu tiên, mà đó là được gọi từ function init thì OK
		//Ngược lại, không trả lời
		if(!($sv == 'page' && $f == 'init')) return false;
	}
	
	//access_key là đoạn code dùng xác định client có phải là người nhà hay không ?
	//Nếu kg phải => không trả lời
	//Trường hợp access_key = rỗng (được set tại init), tức đối tượng access mà không có key
	if($_SESSION['access_key'] == "") {
		//Nếu access_key lần đầu tiên mà được gọi từ function init thì OK
		//Ngược lại không trả lời
		if(!($sv == 'page' && $f == 'init')) return false;
	} 
	//Ngược lại, check xem access_key có đúng không
	else {
		//Trường hợp là init thì kg cần kiểm tra
		if(!($sv == 'page' && $f == 'init')) {
			$key = "bdhs92dfGY30s9M2" . md5("bdlas") . "r3uSoR9uHbdnde3";
			//Nếu access_key sai => kg trả lời
			if($key != $_SESSION['access_key']) return false;
		}		
	}
	return true;
}

?>