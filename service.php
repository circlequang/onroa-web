<?php
require_once('service/fnc/common.php');
require_once('service/fnc/config.php');
require_once('service/fnc/security.php');

//header('Access-Control-Allow-Origin: *');
session_start();
$sv = getStrParaGet('sv');
$f = getStrParaGet('f');

//Kiểm tra xem đây là lần access thứ mấy
//Nếu lần access thứ nhất, mà lại muốn lấy những data khác như points, user, detail  . . .
// thì đây là access không chính thống.
if(checkAccessCNT($sv,$f) == false) return;

switch($sv) {
	case 'page' : 
				include('service/page.php');
				break;
				
	case 'point' : 
				include('service/point.php');
				break;
				
	case 'user' : 
				include('service/user.php');
				break;
	case 'group' : 
				include('service/group.php');
				break;
}
?>